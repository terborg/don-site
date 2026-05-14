---
content_type: architectuur
tags:
  - api
  - rest
---

# Paginering van resourcecollecties

Vrijwel elke API die een collectie van resources aanbiedt, gebruikt paginering.
Er zijn twee veelgebruikte aanpakken: offset-paginering en keyset-paginering.

| Eigenschap                | Offset/page                   | Keyset/cursor                    |
| ------------------------- | ----------------------------- | -------------------------------- |
| Willekeurige toegang      | Ja                            | Nee                              |
| Schaalbaarheid            | Beperkt (volledige tabelscan) | Goed (index seek)                |
| Databasevereiste          | Geen extra                    | Index op de cursorkolom(men)     |
| Sorteervolgorde           | Vrij kiesbaar                 | Vaste, stabiele sleutel vereist  |
| Implementatiecomplexiteit | Laag                          | Hoger (cursor coderen/decoderen) |

## Offset- en paginanummering

De eenvoudigste aanpak: een consumer geeft een vast startpunt (`offset` of
`page`) in de collectie mee.

```http
GET /items?page=2
GET /items?offset=20&limit=10
```

- **Voordelen**: eenvoudig te begrijpen en te implementeren; willekeurige
  toegang tot een pagina is mogelijk.
- **Nadelen**: gevoelig voor page skew bij veranderende data; inefficiënt op
  grote datasets omdat de database tot aan de offset moet lezen.

Geschikte toepassingen: statische of zelden veranderende datasets, of situaties
waarbij een incidenteel gemist item acceptabel is.

## Keyset-paginering (cursor-based)

In plaats van een positie geeft de consumer de waarde van de laatste geziene rij
mee als cursor, doorgaans de `id` of een combinatie van velden:

```http
GET /items?after=item-id-42
```

De provider haalt daarna alle items op waarvan de sleutel groter is dan de
opgegeven waarde. Geef de cursor terug als een ondoorzichtige string in plaats
van een ruwe veldwaarde, zodat de interne sorteerstrategie los staat van het
gedrag van consumers:

```json
{
  "items": [...],
  "next": "eyJpZCI6NDJ9"
}
```

- **Voordelen**: efficiënt op grote datasets; geen last van page skew door
  invoegingen of verwijderingen buiten het huidige venster.
- **Nadelen**: willekeurige toegang is niet mogelijk; de collectie moet
  gesorteerd zijn op een stabiele, oplopende sleutel; items die _binnen het
  huidige venster_ worden verwijderd of bijgewerkt kunnen alsnog gemist of
  dubbel gezien worden.

Geschikte toepassingen: tijdgeordende feeds en feeds die oneindig doorscrolbaar
zijn. Dit is de aanpak die partijen als Zalando, GitHub en Stripe hanteren als
standaard voor feeds. Voor collecties waarbij ook wijzigingen binnen het venster
betrouwbaar verwerkt moeten worden, zie
[Synchroniseren van resourcecollecties](./synchroniseren-van-resourcecollecties.md).

## Gerelateerde patronen

- Voor het ophalen én daarna actueel houden van een collectie via delta's, zie
  [Synchroniseren van resourcecollecties](./synchroniseren-van-resourcecollecties.md).
- Voor betrouwbare publicatie van wijzigingen aan de providerzijde, zie
  <!-- [Transactionele outbox](./transactionele-outbox.md). -->
