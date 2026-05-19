---
content_type: architectuur
tags:
  - api
  - rest
---

# Paginering van collecties

Vrijwel elke API die een collectie aanbiedt, gebruikt paginering. Een collectie
is ontsloten op een endpoint, bijvoorbeeld `/documenten`. Een individueel item
uit die collectie kan daarnaast op een eigen endpoint ontsloten zijn,
bijvoorbeeld `/documenten/42`.

Paginering is een patroon om zo'n collectie in delen op te halen. Het is
geschikt voor het browsen, doorlopen of batchgewijs verwerken van een collectie.
Of paginering acceptabel is, hangt af van de garanties die een consumer nodig
heeft.

Er zijn grofweg twee smaken:

- **Offset-based**: de consumer vraagt een pagina op via een positie in de
  totale lijst, bijvoorbeeld met `offset` of `page`.
- **Cursor-based / keyset-based**: de consumer volgt een keten van pagina's via
  een cursor of `next`-verwijzing naar het volgende venster in een vaste
  sortering.

Met **page skew** bedoelen we dat de inhoud van pagina's tussen opeenvolgende
requests verschuift doordat records in de tussentijd worden toegevoegd,
verwijderd of aangepast. Daardoor kan een consumer ongemerkt items dubbel zien
of juist missen.

## Offset-based paginering

De eenvoudigste aanpak is dat een consumer een absoluut startpunt in de
collectie meegeeft, bijvoorbeeld via `page` of `offset`.

```http
GET /items?page=2
GET /items?offset=20&limit=10
```

- **Voordelen**: eenvoudig te begrijpen en te implementeren; willekeurige
  toegang tot een pagina is mogelijk; pagina's kunnen desgewenst parallel worden
  opgevraagd.
- **Nadelen**: gevoelig voor page skew bij veranderende data; inefficiënt op
  grote datasets omdat de database eerst de voorgaande rijen moet overslaan.

Gebruik dit patroon alleen als:

- de collectie klein is, of groot maar voldoende statisch en goed indexeerbaar;
- de sortering tijdens het uitlezen stabiel blijft;
- een consumer expliciet naar pagina 7 of offset 500 moet kunnen springen;
- incidenteel een dubbel of gemist item geen functioneel probleem is.

Gebruik dit patroon niet als:

- de collectie groot is en de performance ook bij hoge offsets voorspelbaar moet
  blijven;
- de collectie tijdens het uitlezen frequent muteert;
- de consumer een complete collectie zonder gaten of dubbelen moet verwerken.

## Cursor-based / keyset-based paginering

Bij deze aanpak verwijst elke pagina naar de volgende of vorige pagina. De
consumer navigeert dus niet op basis van een absolute positie, maar volgt een
cursor of `next`-link die verwijst naar het volgende venster in een vaste
sortering.

In query parameters zie je dit vaak terug als een cursor of ankerwaarde:

```http
GET /items?after=Q12afE81mx7kLp
```

De provider haalt daarna alle items op ná dat ankerpunt. In de response hoort de
provider de volgende stap terug te geven als een ondoorzichtige cursor of link,
zodat consumers geen kennis hoeven te hebben van de interne sorteersleutel:

```json
{
  "items": [...],
  "next": "A8762JBHW2i7us"
}
```

Met een ondoorzichtige cursor bedoelen we een cursor waarvan de interne opbouw
geen onderdeel is van het contract; consumers horen die alleen terug te sturen
om de volgende pagina op te vragen.

- **Voordelen**: efficiënt op grote datasets; stabieler bij invoegingen en
  verwijderingen tussen requests; sluit goed aan op oneindig scrollen of
  sequentieel batchgewijs uitlezen.
- **Nadelen**: willekeurige toegang is niet mogelijk; de collectie moet
  gesorteerd zijn op een stabiele, oplopende sleutel; items die _binnen het
  huidige venster_ worden verwijderd of bijgewerkt kunnen alsnog gemist of
  dubbel gezien worden.

Geschikte sleutels zijn bijvoorbeeld een oplopend sequentieel id, een
publicatiedatum in combinatie met een uniek id, of een andere stabiele,
indexeerbare sorteersleutel die de gewenste volgorde van de collectie volgt.

Gebruik dit patroon alleen als:

- de collectie gelezen wordt in een vaste, stabiele sortering;
- consumers de collectie vooral sequentieel doorlopen;
- de collectie groot is of frequent muteert;
- goede performance belangrijker is dan springen naar een willekeurige pagina.

Gebruik dit patroon niet als:

- consumers willekeurig naar pagina's moeten kunnen springen;
- er geen stabiele, unieke en indexeerbare sorteersleutel bestaat;
- de data tussen requests kan veranderen en de consumer een consistente,
  volledige uitlezing nodig heeft;
- de business verwacht dat een gepagineerde leesactie op zichzelf al een
  volledige en consistente momentopname oplevert.

Deze aanpak wordt breed toegepast in moderne API-richtlijnen. De
[RESTful API Guidelines van Zalando](https://opensource.zalando.com/restful-api-guidelines/#pagination)
adviseren bijvoorbeeld om cursor-based paginering te verkiezen boven
offset-based paginering voor grote of veranderlijke collecties.

## Wanneer welk patroon acceptabel is

De kernvraag is niet welk patroon moderner oogt, maar welke garanties een
consumer nodig heeft.

- Kies **offset-based paginering** alleen als gebruiksgemak en willekeurige
  toegang belangrijker zijn dan strikte stabiliteit en schaalbaarheid.
- Kies **cursor-based / keyset-based paginering** alleen als de collectie groot
  of veranderlijk is en consumers vooral vooruit of achteruit door de resultaten
  bewegen.
- Kies **geen van beide** als de data tussen requests kan veranderen en de
  consumer een consistente, volledige uitlezing nodig heeft.
- Kies **geen van beide als synchronisatiepatroon**. Gebruik paginering nooit
  voor het synchroniseren van data wanneer een consumer een complete,
  consistente kopie van een muterende collectie moet opbouwen of bijhouden.

Paginering is dus alleen geschikt voor het gefaseerd uitlezen van een collectie,
en niet als vervanging voor een synchronisatieprotocol. Zodra data tussen
requests kan veranderen, gebruik je paginering alleen als gemiste of dubbele
items binnen het gebruiksdoel acceptabel zijn. Voor synchronisatie is dat nooit
acceptabel. Voor collecties waarbij ook wijzigingen binnen het venster
betrouwbaar verwerkt moeten worden, zie
[Synchroniseren van resourcecollecties](./synchroniseren-van-resourcecollecties.md).

Samengevat:

| Eigenschap                | Offset-based             | Cursor-based / keyset-based     |
| ------------------------- | ------------------------ | ------------------------------- |
| Willekeurige toegang      | Ja                       | Nee                             |
| Schaalbaarheid            | Beperkt bij hoge offsets | Goed                            |
| Gedrag bij mutaties       | Gevoelig voor page skew  | Robuuster tussen pagina's       |
| Sorteervolgorde           | Vrij kiesbaar            | Vaste, stabiele sleutel vereist |
| Implementatiecomplexiteit | Laag                     | Hoger                           |

## Gerelateerde patronen

- Voor het ophalen én daarna actueel houden van een collectie via delta's, zie
  [Synchroniseren van resourcecollecties](./synchroniseren-van-resourcecollecties.md).
- Voor betrouwbare publicatie van wijzigingen aan de providerzijde, zie
  <!-- [Transactionele outbox](./transactionele-outbox.md). -->
