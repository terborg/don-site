---
content_type: architectuur
tags:
  - api
  - rest
  - eda
---

# Synchronisatie van collecties

In gedistribueerde systemen hebben consumers vaak een actuele, lokale en vooral
consistente kopie nodig van een _dynamische collectie_ binnen een REST API,
bijvoorbeeld `/taken`. Daarmee kunnen zij data snel bevragen, lokaal verrijken
of koppelen.

```mermaid
graph RL
  subgraph Consumer
    mirror["`Collectie
             (consistente kopie)`"]
  end
  subgraph Provider
    rc["`Collectie`"]
  end
  rc --"`Synchronisatie
        (HTTP)`"--> mirror
```

De uitdaging is niet het kopiëren zelf, maar het verkrijgen van de consistentie
in de kopie die hooguit een seconde achterloopt. Er zijn twee voor de hand
liggende benaderingen, elk met eigen beperkingen:

**Periodiek de gehele collectie opvragen** is eenvoudig, maar schaalt slecht.
Het veroorzaakt veel netwerk- en serverbelasting, terwijl omvangrijke collecties
vaak niet in één HTTP-respons via een regulier endpoint te leveren zijn.
Paginering biedt hierbij geen betrouwbaar antwoord: doordat mutaties tijdens het
uitlezen doorgaan, ontstaat _page skew_. Daardoor worden items ongemerkt
overgeslagen of juist dubbel verwerkt. Zie
[Paginering van collecties](./paginering-van-collecties.md).

**Een stroom van wijzigingen verwerken** is efficiënt om een lokale kopie
actueel te houden, maar zonder aanvullend mechanisme is het enige instappunt het
historische begin. Een consumer die wil inspringen — of herstellen na
dataverlies — zal (zonder aanvullend mechanisme) alle historische gebeurtenissen
moeten nalopen. Zo'n logboek is bovendien al snel vele malen groter dan de
actuele collectie zelf. Dat leidt tot grote verwerkingstijden bij een _cold
boot_ en schuurt met _privacy by design_, waaronder dataminimalisatie en het
[recht om vergeten te worden](https://nl.wikipedia.org/wiki/Recht_om_vergeten_te_worden)
als de collectie persoonsgegevens bevat.

Kortom: los van elkaar schieten beide methoden tekort. Alleen periodieke kopieën
ophalen is te zwaar en te kwetsbaar; alleen wijzigingen verwerken kent zonder
aanvullend mechanisme alleen het historische begin als instappunt. Geen van
beide voldoet daarmee goed aan de randvoorwaarden. Door beide te combineren,
ontstaat een patroon dat dat wel doet.

## Het snapshots-en-delta's-patroon

Het **snapshots-en-delta's** (of _snapshots en incrementele updates_) patroon
werkt met twee parallelle stromen:

1. **Snapshots (laagfrequent):** Een stroom van volledige momentopnames van de
   collectie. Deze grote, consistente weergaves op één specifiek moment zijn
   ideaal voor nieuwe consumers (bootstrapping) of na verlies van lokale status
   bij de consumer (herstel).
2. **Delta's (hoogfrequent):** Een continue stroom van incrementele wijzigingen.
   Deze kleine updates bevatten de individuele mutaties (aanmaken, wijzigen,
   verwijderen) die de collectie van de ene naar de andere toestand brengen.
   Snapshots en delta's gebruiken eenzelfde cursor, zodat beide reeksen
   samengevoegd kunnen worden.

De kern van het patroon is dat snapshots en delta's samen precies die twee
randvoorwaarden ondersteunen: een consumer kan bij een willekeurig snapshot
instappen, en wie daarna de delta-keten volledig volgt, eindigt gegarandeerd in
dezelfde toestand.

Samen vormen zij het synchronisatiemechanisme. Dit artikel werkt het patroon uit
voor HTTP — het enige transportmiddel dat federatieve serviceconnectiviteit
ondersteunt en op de
["pas toe, leg uit"-lijst van open standaarden](https://www.forumstandaardisatie.nl/open-standaarden/verplicht)
staat. Concreet: via polling of Server-Sent Events (SSE). Het patroon is
bovendien een extensie van een bestaande HTTP API, zonder extra modules of
diensten.

Wanneer interoperabiliteit een gestandaardiseerde event-envelop vereist, sluit
de structuur van delta's aan op het
[NLGov-profiel voor CloudEvents](https://gitdocumentatie.logius.nl/publicatie/notificatieservices/cloudevents-nl/1.1/)
(pas toe, leg uit). Het patroon werkt ook zonder deze extra afhankelijkheid.

### Consumer

#### Intern datamodel

Een consumer houdt minimaal twee dingen bij:

- **Cursor** — de positie in de gecombineerde reeks van snapshots en delta's. Is
  er nog geen snapshot geladen, dan is de cursor afwezig.
- **Mirror** — de lokale kopie van de resourcecollectie, opgebouwd uit het
  snapshot en de daarna toegepaste delta's.

#### Toestandsmachine

Door het verwerken van de reguliere delta's als de hoofdcyclus te zien (en niet
als een uitzondering), ontstaat een eenvoudige toestandsmachine. De consumer
bevindt zich in de basis in de toestand **Volgen**:

```mermaid
stateDiagram-v2
    [*] --> Herstellen: Geen cursor aanwezig

    Herstellen --> Volgen: Snapshot geladen

    Volgen --> Volgen: Delta toegepast
    Volgen --> Wachten: Actueel (geen nieuwe delta)
    Wachten --> Volgen: Nieuwe delta

    Volgen --> Herstellen: Cursor verlopen of hiaat
```

- **Herstellen (Snapshot laden)**: de cursor ontbreekt (eerste start) of is
  verlopen — de provider herkent de cursor niet meer, of er is een hiaat in de
  keten. De consumer laadt een nieuw snapshot en stelt de cursor in op de
  positie daarvan.
- **Volgen ↔ Wachten**: de consumer past delta's toe en schuift de cursor steeds
  op. Zijn er geen nieuwe delta's, dan wacht de consumer tot er een binnenkomt.
- **Volgen → Herstellen**: de provider signaleert dat de cursor niet meer geldig
  is. De consumer herstart vanuit een nieuw snapshot.

### Provider

De provider kent een vergelijkbare cyclus:

```mermaid
flowchart TD
    Start((●)) --> W{Wachten}

    W -->|Wijziging doorgevoerd| D[Delta publiceren]
    D --> W

    W -->|Snapshot-trigger| S[Snapshot aanmaken]
    S --> W

    W -->|Retentie verlopen| R[Verouderde data opruimen]
    R --> W
```

- **Delta publiceren**: bij elke wijziging of groep wijzigingen legt de provider
  een delta atomair vast. De delta-keten blijft zo aaneengesloten.
- **Snapshot aanmaken**: na een datamigratie, schemawijziging, complete reset of
  toepassing van het recht op verwijdering maakt de provider een nieuw snapshot
  aan. Consumers merken dit vanzelf: hun cursor sluit niet meer aan op de keten
  en ze starten opnieuw vanuit het nieuwe snapshot.
- **Verouderde data opruimen**: na het verstrijken van de retentieperiode
  verwijdert de provider snapshots en delta's. Consumers met een verlopen cursor
  worden vanzelf naar een nieuw snapshot gestuurd.

## REST API

In deze invulling identificeert een **state-id** de exacte toestand van de
collectie op een bepaald moment — bijvoorbeeld een oplopend transactienummer,
tijdstempel, UUID of hash. De provider bepaalt de exacte vorm; elk state-id moet
uniek zijn binnen de collectie.

De onderstaande invulling is een aanbeveling. Het patroon zelf — snapshot,
delta, state-id — is leidend; de URL-structuur en veldnamen zijn niet verplicht.
Wie de aanbeveling volgt, maakt zijn API direct bruikbaar voor consumers die het
patroon kennen en respecteert hierin zoveel mogelijk de HTTP-standaarden.

Het patroon voegt twee sub-resources toe aan een (eventueel bestaande)
collectie:

```text
GET /resources/             → de collectie zelf (ongewijzigd, met ETag-header)
GET /resources/snapshots/   → lijst van beschikbare snapshots
GET /resources/snapshots/42 → inhoud van snapshot 42 (offset + limit)
GET /resources/deltas/      → stroom van delta's (polling of SSE);
                              geen individuele delta's
```

### Reguliere collectie-endpoints en ETag

Wanneer een regulier collectie-endpoint (`GET /resources/`) één canonieke
representatie van de actuele toestand teruggeeft, is het een _good practice_ om
die toestand ook via een sterke HTTP `ETag`-header te ontsluiten:

```http
GET /resources/
→ 200 OK
  ETag: "57"
```

Consumers weten hiermee direct wat de allernieuwste `state-id` van de collectie
is, zonder dat ze per se de structuur voor grootschalige synchronisatie hoeven
te bevragen. Dit verbindt het snapshots-en-delta's-patroon naadloos met
standaard webfunctionaliteit en caching.

:::note Relatie tussen ETag en state-id Een `ETag` kan een bruikbare
representatie zijn van een `state-id`. Een `ETag` hoort bij een specifieke
HTTP-representatie; het `state-id` identificeert de logische toestand van de
collectie. Geeft een collectie-endpoint één canonieke representatie van de
actuele toestand terug, dan kan de provider het bijbehorende `state-id` als
sterke `ETag` meesturen. Zodra dezelfde collectie via meerdere representaties of
projecties beschikbaar is, is aanvullende afbakening nodig. Zie ook
[Veilige gelijktijdigheid met optimistic locking](./gelijktijdigheid-met-optimistic-locking.md)
voor het gebruik van `ETag` bij conditionele requests. :::

### Snapshot ophalen

De provider biedt een lijst van beschikbare snapshots. De consumer vraagt deze
op en kiest het snapshot met de meest recente `created_at`:

```http
GET /resources/snapshots
→ 200 OK
  {
    "items": [
      {"id": 42, "created_at": "2026-05-13T10:00:00Z", "total": 850}
    ]
  }
```

Vervolgens haalt de consumer de inhoud op via het id. De respons levert ook de
bijbehorende `ETag`:

```http
GET /resources/snapshots/42?limit=100
→ 200 OK
  ETag: "42"

  {"id": 42, "total": 850, "items": [...]}
```

```text
GET /resources/snapshots/42?offset=100&limit=100 → {"id": 42, "total": 850, "items": [...]}
GET /resources/snapshots/42?offset=200&limit=100 → {"id": 42, "total": 850, "items": [...]}
...
```

Omdat snapshots statisch zijn, treedt er geen page skew op. De consumer laadt
het nieuwe snapshot bij voorkeur in een aparte staging-area en schakelt pas over
naar de nieuwe toestand — en verwijdert de vorige — als alle chunks succesvol
zijn binnengekomen. Na de laatste chunk stelt de consumer het state-id in op
`42`. De provider houdt snapshots beschikbaar gedurende een vaste
retentieperiode zodat consumers de tijd hebben om ze volledig te downloaden.
Verloopt een snapshot voordat de download is voltooid — kenbaar via `410 Gone`
op een latere chunk — dan herhaalt de consumer het proces met het meest recente
beschikbare snapshot.

Snapshot-chunks zijn statische bestanden en kunnen potentieel groot zijn. Ze
lenen zich daardoor voor distributie via een CDN, wat een API gateway kan
ontlasten.

### Delta's ophalen

#### Formaat van delta's

Een delta is de concrete schakel tussen de garanties hierboven en de
implementatie hieronder: de consumer kan alleen veilig doorschuiven als elke
delta expliciet aangeeft op welke vorige toestand hij aansluit.

```json
{
  "id": 57,
  "prev_id": 42,
  "operations": [
    {
      "type": "update",
      "resource_id": "item-abc",
      "resource": {
        "id": "item-abc",
        "name": "Resource ABC - Gewijzigd",
        "status": "actief"
      }
    }
  ]
}
```

Een delta bevat altijd een array van operaties (`operations`), ook als er maar
één wijziging is. Zo kan de provider meerdere samenhangende mutaties in één keer
laten toepassen.

Elke operatie heeft minimaal een `type`:

- `create`: voeg een nieuwe resource toe.
- `update`: wijzig of vervang een bestaande resource.
- `delete`: verwijder een resource; het `resource`-veld ontbreekt dan bewust
  (tombstone).

In de aanbevolen vorm bevat `resource` steeds de volledige resulterende weergave
van het record (_Event-Carried State Transfer_). Dat is het meest robuust en
sterk aanbevolen: de consumer hoeft geen vorige toestand op te halen om de
wijziging te begrijpen, en retries blijven idempotent.

Het veld `resource_id` staat bewust ook buiten het `resource`-object. Bij een
`delete`-operatie is dat noodzakelijk, omdat er dan geen `resource` meer is.
Daarnaast kunnen consumers en tussenliggende brokers zo filteren en routeren op
ID en type zonder eerst een zwaardere payload te deserialiseren.

Alleen als resources extreem groot zijn en bandbreedte de doorslag geeft, kan de
provider in plaats van de volledige resource ook een
[JSON Merge Patch (RFC 7396)](https://datatracker.ietf.org/doc/html/rfc7396) of
[JSON Patch (RFC 6902)](https://datatracker.ietf.org/doc/html/rfc6902)
meesturen. Dat maakt de consumer-logica wel complexer, omdat patching pad- en
schema-afhankelijk is en correct herstel na _out-of-order_ events lastiger
wordt.

#### Polling

De consumer vraagt periodiek nieuwe delta's op via zijn state-id:

```http
GET /resources/deltas?after=42&limit=10
→ 200 OK
  {
    "items": [
      {
        "id": 57,
        "prev_id": 42,
        "operations": [
          {
            "type": "update",
            "resource_id": "item-abc",
            "resource": { "id": "item-abc", "name": "Resource ABC - Gewijzigd" }
          }
        ]
      }
    ]
  }
```

De consumer past elke delta toe en zet het state-id naar het `id` van de laatste
verwerkte delta. Ontvangt de consumer onverhoopt een delta waarvan het `id` al
gelijk is aan of ouder is dan het huidige state-id (bijvoorbeeld bij
netwerk-retries), dan negeert de consumer deze (idempotentie). Een lege
items-lijst betekent dat de consumer actueel is.

Als het state-id niet meer bekend is bij de provider, antwoordt de provider met
`410 Gone`:

```http
GET /resources/deltas?after=99
→ 410 Gone
```

De consumer weet dan dat hij opnieuw een snapshot moet ophalen.

#### Streaming (SSE)

De consumer opent een langdurige verbinding; de provider pusht delta's zodra ze
beschikbaar zijn. De consumer stuurt `Last-Event-ID` mee als state-id — zowel
bij de initiële verbinding als bij herverbinding na een onderbreking:

```http
GET /resources/deltas
Accept: text/event-stream
Last-Event-ID: 42

→ 200 OK (text/event-stream)

id: 57
data: {"id": 57, "prev_id": 42, "operations": [{"type": "update", "resource_id": "item-abc", ...}]}

id: 63
data: {"id": 63, "prev_id": 57, "operations": [{"type": "delete", "resource_id": "item-xyz"}]}
```

De consumer valideert bij elke ontvangen delta dat `prev_id` overeenkomt met het
huidige state-id. Een mismatch signaleert een hiaat: de consumer sluit de
verbinding en behandelt dit identiek aan een `410 Gone`.

Een open SSE-verbinding kan geen `410 Gone` ontvangen: de HTTP-statuscode ligt
vast op `200 OK` zodra de verbinding is opgezet. Raakt het state-id verlopen
terwijl de verbinding open staat, dan sluit de provider de verbinding:

```http
id: 57
data: {"id": 57, "prev_id": 42, ...}

← verbinding gesloten door provider
```

Bij herverbinding stuurt de consumer opnieuw `Last-Event-ID`; als dat state-id
inmiddels niet meer bekend is, antwoordt de provider met `410 Gone`:

```http
GET /resources/deltas
Accept: text/event-stream
Last-Event-ID: 99
→ 410 Gone
```

De consumer haalt dan een nieuw snapshot op en opent daarna een nieuwe
verbinding met het state-id van dat snapshot.

Een robuuste consumer behandelt beide situaties — mismatch en `410 Gone` — als
hetzelfde herstelpad: verbinding verbreken, nieuw snapshot ophalen, opnieuw
verbinden met het state-id van dat snapshot.

#### Webhooks

De provider pusht delta's naar een endpoint van de consumer zodra ze beschikbaar
zijn:

```http
POST https://consumer.example.nl/webhook/resources
Content-Type: application/json

{
  "id": 57,
  "prev_id": 42,
  "operations": [
    {
      "type": "update",
      "resource_id": "item-abc",
      "resource": {
        "id": "item-abc",
        "name": "Resource ABC - Gewijzigd"
      }
    }
  ]
}
```

De consumer valideert `prev_id` bij elk ontvangen bericht. Omdat webhooks
asynchroon zijn en berichten _out-of-order_ kunnen arriveren, signaleert een
mismatch met het state-id in eerste instantie een _gap_ in de correcte volgorde.
Een robuuste consumer buffert de onverwachte delta dan tijdelijk. Als de
ontbrekende voorgaande delta niet binnen een redelijke termijn arriveert, neemt
de consumer aan dat de delta-keten is gereset of het state-id verlopen is, en
haalt een nieuw snapshot op via de snapshot-API.

Bij polling en SSE initieert de consumer alle verbindingen, waardoor alleen
eenzijdige authenticatie nodig is. Webhooks — waarbij de provider actief naar de
consumer pusht — vereisen een publiek bereikbaar consumer-endpoint en
tweezijdige authenticatie. Bovendien moet de consumer de herkomst van elk
inkomend bericht verifiëren, bijvoorbeeld via een HMAC-handtekening over de
payload die de provider als request-header meestuurt. Zo kunnen alleen
geautoriseerde providers delta's aanleveren.

#### CloudEvents

Delta's kunnen in een [CloudEvents](https://cloudevents.io/)-envelop worden
verpakt, ongeacht het transportmechanisme (HTTP, SSE, broker):

```json
{
  "specversion": "1.0",
  "type": "nl.example.resources.update",
  "source": "/resources",
  "id": "57",
  "data": {
    "id": 57,
    "prev_id": 42,
    "operations": [
      {
        "type": "update",
        "resource_id": "item-abc",
        "resource": {...}
      }
    ]
  }
}
```

CloudEvents standaardiseert de envelop; de delta-velden in `data` blijven
ongewijzigd. Let op: het envelope-veld `id` is per CloudEvents-specificatie
altijd een string (`"57"`), terwijl het `id` in `data` de door de provider
bepaalde vorm behoudt (in de voorbeelden een getal).

## Event-driven (via broker)

De provider publiceert delta's op een topic; de consumer verwerkt ze op eigen
tempo:

```text
topic: nl.example.resources.changes
message: {"id": 57, "prev_id": 42, "operations": [{"type": "update", "resource_id": "item-abc", ...}]}
```

Geschikt wanneer consumer en provider ontkoppeld moeten zijn qua timing. De
consumer beheert zelf het state-id in de broker. Het snapshot wordt doorgaans
nog steeds via REST opgehaald. De consumer valideert ook hier `prev_id`; net als
bij webhooks kan een mismatch duiden op _out-of-order_ aflevering of een
daadwerkelijke breuk in de keten. In dat laatste geval is het signaal om een
nieuw snapshot op te halen.

## Implementatie-aandachtspunten

### Gegarandeerde atomiciteit (Transactionele Outbox)

Om operaties op de juiste manier te groeperen als provider zonder
dataconsistentie te verliezen, kan het beste het
[Transactionele outbox](https://microservices.io/patterns/data/transactional-outbox.html)-patroon
worden gebruikt. Daarbij worden de databasewijzigingen aan de resource(s) én de
logvermelding met de _operations_-array als één database-transactie opgeslagen.
Een asynchrone worker leest vervolgens de outbox-tabel uit en deelt deze als
gegarandeerd correcte berichten via polling, webhooks of de message broker.

### Geen wijzigingen verliezen tijdens snapshotten

Een cruciale verantwoordelijkheid van de provider is de overlap tussen
snapshot-retentie en delta-retentie. Het downloaden van een groot snapshot kost
tijd. Als een consumer pas daarna overschakelt op delta's, mogen de delta's die
in de tussentijd zijn ontstaan niet al zijn opgeruimd. De retentie van delta's
moet daarom ruimschoots langer zijn dan de langst plausibele download- en
verwerkingstijd van een snapshot.

### Retentie van snapshots en delta's

De provider moet snapshots en delta's beschikbaar houden voor een
retentieperiode die groot genoeg is voor een consumer om ze te verwerken. Daarna
mag de provider ze verwijderen. Bij polling en SSE-herverbinding ontvangt de
consumer dan `410 Gone`; bij webhooks en broker detecteert de consumer een
`prev_id`-mismatch. In beide gevallen is het state-id verlopen en moet opnieuw
een snapshot worden opgehaald.

### Geen volledige geschiedenis

Dit patroon is niet bedoeld om een complete geschiedenis van alle wijzigingen te
ontsluiten. Wie volledige historische replay of audit-trails nodig heeft, heeft
daar snapshots niet voor nodig maar bijvoorbeeld een event-sourcingpatroon.

## Gerelateerde patronen

- Voor navigatie door de snapshot-pagina's (en een vergelijking van
  pagineerstrategieën), zie
  [Paginering van collecties](./paginering-van-collecties.md).
- Voor een bredere introductie op event-driven communicatiepatronen, zie
  [Event Driven Architecture](./eda.md).
