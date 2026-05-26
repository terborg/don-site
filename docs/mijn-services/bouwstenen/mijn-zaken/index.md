---
sidebar_position: 2
description: >
  De zaakdossier-bouwsteen van de MijnOmgeving: inzicht in lopende en afgeronde
  zaken én de context voor taken, acties en contactmomenten.
sidebar_custom_props:
  icon: /img/mijn-services/icons/mijn-zaken.svg
---

# MijnZaken

:::info[MijnZaken is in ontwikkeling]

Deze pagina beschrijft een standaard die nog in ontwikkeling is. De inhoud kan
veranderen.

:::

MijnZaken geeft inwoners en ondernemers inzicht in hun lopende en afgeronde
zaken — van een overzicht op hoofdlijnen tot een volledig dossier met status,
voortgang en documenten. Daarmee is het de track & trace voor lopende zaken én
het vertrekpunt voor vervolgstappen zoals taken, acties en contactmomenten.

## Stand van zaken en vervolgstappen

Een **zaak** is een lopend proces of dossier van een inwoner of ondernemer bij
een organisatie: een vergunningaanvraag, een bezwaar, een melding.
Eindgebruikers hebben uiteenlopende vragen over hun zaken — zoals: _welke zaken
heb ik lopen, wat is de status, welke documenten horen erbij, wat is de volgende
stap, en wat moet ik nog doen?_

### 1. Overzicht van zaken inzien

_UC-01_

Een inwoner of ondernemer opent de MijnOmgeving en wil in één oogopslag zien
welke zaken hij heeft lopen en welke zijn afgerond — en per zaak meteen
herkennen waar het over gaat.

### 2. Inhoud van een zaak inzien

_UC-02_

De inwoner of ondernemer kiest een zaak en wil het volledige dossier inzien: de
actuele status en doorlopen stappen, de bijbehorende documenten (ingediende
stukken, ontvangen brieven, besluiten) en — indien beschikbaar — de verwachte
doorlooptijd of volgende stap.

### 3. Vervolgstappen vanuit een zaak

_UC-03_

Een inwoner of ondernemer die een zaak bekijkt, wil ook weten wat er nog van hem
verwacht wordt of wat hij zelf nog kan doen: een document uploaden, een vraag
beantwoorden, een betaling afronden. Die vervolgstappen kunnen in de context van
de zaak verschijnen — zodat duidelijk is waar ze bij horen.

## Functionele flows

:::note[Nog uit te werken]

Deze sectie beschrijft straks hoe een inwoner of ondernemer de stappen
doorloopt: van het openen van het zakenoverzicht tot het bekijken van een
zaakdetail en het starten van een vervolgstap. Denk aan een schermflow-diagram
met de navigatie tussen de schermen, en per scherm een beschrijving van de
interacties en de bijbehorende API-aanroepen.

:::

### MijnOmgeving

De presentatie en interactie volgt de
[NL Design System](https://nldesignsystem.nl) richtlijnen.

Startpunt voor de visuele uitwerking:
[MijnZaken-overzicht in Figma](https://www.figma.com/proto/O3Wzm9ANIRHQTK98X0ljYs/VNG-mijn-services-prototype?node-id=9427-21196&starting-point-node-id=9448%3A758053).

## Hoe het patroon eruitziet en waarom

MijnZaken is ontworpen als een **inkijk- en contextlaag** bovenop de bestaande
zaaksystemen. Onderliggende zaaksystemen zijn complex en gericht op interne
registratie; de klant heeft juist behoefte aan een eenvoudig, begrijpelijk en
uniform overzicht van zijn dossier.

Door MijnZaken als een afgebakende subset van ZGW API's 1.6 te definiëren —
zonder nieuwe endpoints te ontwerpen — sluit het naadloos aan op bestaande
zaaksystemen. Leveranciers die ZGW 1.6 al aanbieden hoeven niets extra's te
bouwen. De zaak-context die MijnZaken blootlegt (`context.urn`) is tegelijk de
brug naar andere bouwstenen in de MijnOmgeving.

## Uitgangspunten

### Ontwerpaspecten

Drie aspecten zijn leidend bij het afbakenen van de subset (overgenomen uit de
issue):

- **Eenvoud van implementatie**. Voorkom dat leveranciers veel logica of
  boilerplate moeten schrijven. Door MijnZaken als subset van ZGW 1.6 te
  definiëren, hoeven leveranciers die ZGW 1.6 al aanbieden niets extra's te
  bouwen — de endpoints bestaan al.
- **Aansluiting bij andere patronen**. Door ZGW 1.6 te volgen sluit MijnZaken
  aan op de bestaande zaaksystemen, tooling en standaarden — hoe meer
  aansluiting, hoe makkelijker het is om erop aan te sluiten.

### Algemene uitgangspunten

- **Subset, geen herontwerp**: MijnZaken is een afbakening van ZGW 1.6.
  Endpoints behouden hun ZGW-vorm; er worden geen nieuwe endpoints ontworpen.
- **Common Ground**: gegevens blijven bij de bron; het portaal is een
  weergavelaag, geen register.
- **Identiteit buiten scope**: authenticatie/identificatie van de eindgebruiker
  verloopt via een externe IdP (DigiD/eHerkenning).
- **Inkijk-gericht**: MijnZaken richt zich op het _raadplegen_ van
  zaakinformatie. Mutaties (acties binnen een zaak) verlopen via [[mijntaken]]
  of bij de bron.

## Uitgangspunten voor "pilot / eerste implementaties"

- De **burger-flows bepalen de subset**: alleen ZGW-endpoints die in een
  gevalideerde flow worden gebruikt, vallen binnen scope.
- Het portaal toont minimaal: een zakenoverzicht en een zaakdetail met status en
  documenten.
- Leveranciers die al ZGW 1.6 aanbieden moeten zonder extra ontwikkelwerk kunnen
  aansluiten.

## Capabilities

| Capability                        | Toelichting                                                                              |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| **Zakenoverzicht bieden**         | Portaal toont de lopende en afgeronde zaken van de ingelogde gebruiker.                  |
| **Inzage in status en voortgang** | Portaal toont de actuele status, doorlopen stappen en (indien bekend) de volgende stap.  |
| **Inzage in zaakdocumenten**      | Portaal toont de documenten die bij een zaak horen.                                      |
| **Context bieden voor taken**     | Een zaak vormt de context waarbinnen taken ([[mijntaken]]) worden getoond en uitgevoerd. |

## Bedrijfsobjectenmodel (conceptueel)

De bedrijfsobjecten sluiten aan op de ZGW-begrippen.

| Bedrijfsobject           | Definitie                                                                    |
| ------------------------ | ---------------------------------------------------------------------------- |
| **ZAAK**                 | Een lopend proces of dossier van een inwoner/ondernemer bij een organisatie. |
| **ZAAKTYPE**             | De definitie van een soort zaak (doorlooptijd, fasen, verwachte documenten). |
| **STATUS**               | De actuele fase van een zaak binnen het zaaktype.                            |
| **ZAAKINFORMATIEOBJECT** | Een document dat bij een zaak hoort (ingediend stuk, brief, besluit).        |
| **RESULTAAT**            | De uitkomst van een afgeronde zaak.                                          |

## Informatiearchitectuur (hoog niveau)

- **MijnOmgeving (portaal)**: presenteert zaken, status en documenten aan de
  eindgebruiker.
- **MijnZaken**: de afgebakende subset van ZGW 1.6-endpoints die de MijnOmgeving
  consumeert.
- **ZGW-bron (zaaksysteem)**: het systeem waar zaken worden geregistreerd en
  beheerd, ontsloten via de ZGW API's 1.6.
- **Identity provider (IdP)**: levert geverifieerde identiteit aan het portaal
  (buiten scope van dit contract).

## Standaarden

- [ZGW API's 1.6](https://vng-realisatie.github.io/gemma-zaken/standaard/) — de
  systeem-standaard voor zaakgericht werken; MijnZaken is een subset hiervan
- Nederlandse API Strategie / REST API Design Rules (repo-linting via Spectral)
- OAuth 2.0 / Bearer tokens (deployment-specifiek)
- Foutafhandeling: RFC 7807 via
  [schemas/fout/v0.0.1.json](/?file=schemas/fout/v0.0.1.json)
- Afstemming met [[mijntaken]] — een zaak als context-URN

## API's & patronen

### MijnZaken als subset van ZGW 1.6

MijnZaken definieert **geen nieuwe endpoints**. Het is een selectie uit de ZGW
API's 1.6 — de endpoints en velden die de burger-flows nodig hebben. De
geselecteerde endpoints behouden hun ZGW-vorm, zodat een leverancier die ZGW 1.6
al implementeert direct aansluit.

### De selectie volgt de burger-flows

De use-cases bepalen welke ZGW-endpoints in de subset vallen, bijvoorbeeld: de
zaken van een klant ophalen, een zaakdetail opvragen, de status raadplegen, de
zaakinformatieobjecten (documenten) tonen, en het zaaktype ophalen voor labels
en doorlooptijd.

### Aansluiting op MijnTaken

Een zaak vormt de context van een taak. MijnZaken levert de zaak-context die
[[mijntaken]] gebruikt; waar mogelijk worden dezelfde identifiers (URN) en
patronen gehanteerd.

## Informatiebeveiliging en privacy (richtinggevend)

- **Doelbinding**: zaakinformatie wordt getoond voor dienstverlening aan de
  gebruiker zelf; geen hergebruik voor andere doelen.
- **Dataminimalisatie**: het overzicht bevat samenvattingen; detailgegevens
  volgen pas bij het openen van één zaak.
- **Geen identificerende gegevens in URL's**: het filteren op een klant gebeurt
  zonder identificerende gegevens in querystrings of access logs.
- **Logging**: voorkom het loggen van request bodies met identificerende
  gegevens; log minimaal en doelgericht.

## Beheer

- **Eigenaarschap**: de bron (zaaksysteem) is bronhouder van zaken; het portaal
  beheert presentatie en UX. De MijnZaken-subset wordt door VNG Realisatie
  beheerd, in afstemming met de ZGW-standaard.
- **Lifecycle**: zaken ontstaan, doorlopen statussen en worden afgerond op basis
  van bronprocessen; het portaal hoort robuust om te gaan met ontbrekende of
  nieuwe velden.

## Openstaande punten

- Welke ZGW 1.6-endpoints en -velden vallen precies in de subset? Dit volgt uit
  de gevalideerde burger-flows.
- Worden de ZGW-endpoints 1-op-1 doorgegeven, of is lichte compositie nodig om
  de performance- en eenvoud-doelen te halen?
- Hoe wordt op de klant gefilterd (BSN/eHerkenning) binnen ZGW 1.6?
- Hoe verhoudt het zakenoverzicht zich tot het context-model van [[mijntaken]]?
- Hoe wordt de verwachte doorlooptijd / volgende stap bepaald — uit het
  zaaktype, of per zaak?
