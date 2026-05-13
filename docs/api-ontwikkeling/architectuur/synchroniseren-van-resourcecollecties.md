---
content_type: architectuur
tags:
  - api
  - rest
  - eda
---

# Synchroniseren van resourcecollecties

Dit artikel beschrijft het **snapshots-en-delta's**-patroon waarmee een consumer
een continu veranderende resourcecollectie kan opvragen en bijhouden. Het
patroon is transport-onafhankelijk en werkt in REST-, SSE- en event-driven
opstellingen. Het kan daarmee volledig **in-band** (via hetzelfde API endpoint)
lopen — zonder extra infrastructuur zoals een message broker.

```mermaid
graph RL
  subgraph Consumer
    mirror["`Resourcecollectie
             (consistente view)`"]
  end
  subgraph Provider
    rc["`Resourcecollectie`"]
  end
  rc --"`Synchronisatie
        (HTTP)`"--> mirror
```

Een consumer kan op een recent moment inspringen — niet per se bij het begin.
Omdat het patroon geen volledige historische replay vereist, is het ook geschikt
voor resourcecollecties die persoonsgegevens kunnen bevatten: een volledige
geschiedenis van wijzigingen is niet
[AVG-conform](https://www.autoriteitpersoonsgegevens.nl/themas/basis-avg/privacyrechten-avg/recht-op-gegevens-verwijderen).

## Het probleem

Bestaande aanpakken schieten tekort:

- **Gepagineerde `GET`s en polling** geven page skew: bij een veranderende
  collectie kunnen items ontbreken of dubbel voorkomen. Zie
  [Paginering van resourcecollecties](./paginering-van-resourcecollecties.md)
  voor een uitleg van dit probleem.
- Patronen zonder snapshot-mechanisme lossen het inspringprobleem niet op: een
  nieuwe consumer weet niet hoe hij de begintoestand opbouwt.

## Garanties

Dit patroon biedt de volgende garanties:

- **[Snapshot isolation](https://en.wikipedia.org/wiki/Snapshot_isolation)**:
  het snapshot beschrijft de collectie zoals die bestond op één logisch moment,
  ongeacht wijzigingen daarna.
- **Sterke consistentie**: dit patroon biedt
  [sequentiële consistentie](https://en.wikipedia.org/wiki/Consistency_model#Sequential_consistency)
  per collectie — alle consumers zien wijzigingen in dezelfde totale volgorde.
  Wie twee collecties combineert — elk met eigen id's — heeft
  [causale consistentie](https://en.wikipedia.org/wiki/Consistency_model#Causal_consistency)
  tussen de streams: de volgorde binnen elke collectie is gegarandeerd, maar er
  is geen totale volgorde over de twee streams heen.
- **Inhaalbaarheid en inspringen**: via de cursor kan een consumer op elk moment
  inspringen — zowel een nieuwe consumer die nog geen lokale toestand heeft als
  een consumer die na een onderbreking gemiste wijzigingen bijwerkt.

Deze garanties hebben een prijs: een consumer loopt altijd enigszins achter op
de werkelijkheid. Bij REST polling zit er een venster tussen het moment van een
wijziging en het moment van opvragen. Bij SSE en event-driven varianten is de
latentie kleiner, maar nooit nul. De toestand die een consumer ziet is altijd
intern consistent — ze beschrijft een werkelijke vroegere toestand van de
collectie — maar ze kan verouderd zijn.

## Het patroon

Het patroon werkt met drie begrippen:

- **Snapshot**: een consistente momentopname van de volledige resourcecollectie
  op één moment. Een snapshot heeft een uniek `id` — dit kan een getal, een
  tijdstempel of een hash zijn; de provider bepaalt de vorm. Een snapshot is het
  startpunt voor een consumer die nog geen lokale toestand heeft. De
  begintoestand van het systeem is een snapshot (eventueel leeg) met een door de
  provider toegewezen initieel `id`.
- **Delta**: een atomaire stap in de wijzigingsreeks — één of meer toevoegingen,
  aanpassingen of verwijderingen die de provider als één geheel heeft
  doorgevoerd. De consumer past een delta volledig toe of helemaal niet. Elke
  delta heeft een `id` en een `prev_id`; een delta is toepasbaar als diens
  `prev_id` overeenkomt met de cursor, waarna de cursor het `id` van de delta
  wordt.
- **Cursor**: het `id` van de laatste verwerkte snapshot of delta, lokaal
  bijgehouden door de consumer. Een consumer zonder cursor heeft nog geen
  snapshot opgehaald.

De consumer doorloopt continu een cursorcheck die bepaalt wat de volgende stap
is:

```mermaid
flowchart TD
    Start((●)) --> C{Cursorcheck}

    C -->|Delta<br>beschikbaar| A[Delta toepassen]
    A --> C

    C -->|Te ver achter| S[Snapshot laden]
    S --> C

    C -->|Geen nieuwere<br>delta| U[Up-to-date]
    U -->|Nieuwere delta<br>ontvangen| C
```

- **Delta toepassen**: er is een delta beschikbaar voor de cursor. De consumer
  past de delta toe en schuift de cursor op.
- **Snapshot laden**: de consumer is te ver achter; de provider heeft geen delta
  voor de huidige cursor. De consumer haalt een nieuw snapshot op om in te
  springen.
- **Up-to-date**: er zijn geen nieuwere delta's. De consumer wacht op de
  volgende delta (via SSE of polling).

## REST API

### Snapshot ophalen

De provider biedt een lijst van beschikbare snapshots. De consumer vraagt deze
op en kiest het meest recente:

```http
GET /resources/snapshots
→ 200 OK
  {
    "items": [
      {"id": 42, "created_at": "2026-05-13T10:00:00Z", "total": 850}
    ]
  }
```

Vervolgens haalt de consumer de inhoud op via het id. Grote snapshots worden
gepagineerd geserveerd met offset-paginering; alle chunks hebben hetzelfde `id`.
Via `total` berekent de consumer alle offsets vooraf en haalt de chunks op —
sequentieel of parallel:

```http
GET /resources/snapshots/42?limit=100             → {"id": 42, "items": [...]}
GET /resources/snapshots/42?offset=100&limit=100  → {"id": 42, "items": [...]}
GET /resources/snapshots/42?offset=200&limit=100  → {"id": 42, "items": [...]}
…
```

Omdat snapshots statisch zijn, treedt er geen page skew op. Na de laatste chunk
stelt de consumer de cursor in op `42`. De provider houdt snapshots beschikbaar
gedurende een vaste retentieperiode zodat consumers de tijd hebben om ze
volledig te downloaden.

### Delta's ophalen

#### Polling

De consumer vraagt periodiek nieuwe delta's op via zijn cursor:

```http
GET /resources/deltas?after=42&limit=10
→ 200 OK
  {
    "items": [
      {"id": 57, "prev_id": 42, "type": "updated", "resource_id": "item-abc", "resource": {...}},
      {"id": 63, "prev_id": 57, "type": "deleted", "resource_id": "item-xyz"}
    ]
  }
```

De consumer past elke delta toe en zet de cursor naar het `id` van de laatste
verwerkte delta. Een lege itemslijst betekent dat de consumer actueel is.

Als de cursor niet meer bekend is bij de provider, antwoordt de provider met
`410 Gone`:

```http
GET /resources/deltas?after=99
→ 410 Gone
```

De consumer weet dan dat hij opnieuw een snapshot moet ophalen.

#### Streaming (SSE)

De consumer opent een langdurige verbinding; de provider pusht delta's zodra ze
beschikbaar zijn:

```http
GET /resources/deltas?after=42
Accept: text/event-stream

→ 200 OK (text/event-stream)

id: 57
data: {"id": 57, "prev_id": 42, "type": "updated", "resource_id": "item-abc", ...}

id: 63
data: {"id": 63, "prev_id": 57, "type": "deleted", "resource_id": "item-xyz"}
```

Na een verbroken verbinding hervat de consumer via `?after={cursor}`. De
consumer valideert bij elke ontvangen delta dat `prev_id` overeenkomt met de
huidige cursor; een mismatch signaleert een hiaat.

## Event-driven (via broker)

De provider publiceert delta's op een topic; de consumer verwerkt ze op eigen
tempo:

```
topic: nl.example.resources.changes
message: {"id": 57, "prev_id": 42, "type": "updated", "resource_id": "item-abc", ...}
```

Geschikt wanneer consumer en provider ontkoppeld moeten zijn qua timing. De
consumer beheert zelf de cursor in de broker. Het snapshot wordt doorgaans nog
steeds via REST opgehaald.

## Implementatie-aandachtspunten

### Geen wijzigingen verliezen tijdens snapshotten

Een cruciale verantwoordelijkheid van de provider is dat er geen wijzigingen
verloren gaan die optreden terwijl een snapshot wordt verstuurd. Zorg dat de
bron van delta's — bijvoorbeeld een transactionele outbox — niet wordt geleegd
terwijl het snapshot nog actief is.

### Retentie van snapshots en delta's

De provider moet snapshots en delta's beschikbaar houden voor een
retentieperiode die groot genoeg is voor een consumer om ze te verwerken. Daarna
mag de provider ze verwijderen. Ontvangt de consumer een `410 Gone`, dan is de
cursor verlopen en moet opnieuw een snapshot worden opgehaald.

### Geen volledige geschiedenis

Dit patroon biedt nadrukkelijk geen complete geschiedenis van alle wijzigingen.
Systemen die een complete wijzigingshistorie nodig hebben, vereisen een ander
patroon.

## Gerelateerde patronen

- Voor navigatie door de snapshot-pagina's (en een vergelijking van
pagineerstrategieën), zie
[Paginering van resourcecollecties](./paginering-van-resourcecollecties.md).
<!-- - Voor betrouwbare publicatie van wijzigingen aan de providerzijde, zie
  [Transactionele outbox](./transactionele-outbox.md). -->
- Voor een bredere introductie op event-driven communicatiepatronen, zie
  [Event Driven Architecture](./eda.md).
