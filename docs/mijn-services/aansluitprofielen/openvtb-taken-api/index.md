---
sidebar_label: OpenVTB Taken API
---

# Aansluitprofiel OpenVTB Taken API

:::info[Werkversie]

Dit aansluitprofiel is een eerste uitwerking voor taken. Het profiel beschrijft
hoe MijnServices kan aansluiten op de OpenVTB Taken API als bron voor taken in
de InteractieServices API.

:::

De OpenVTB Taken API kan worden gebruikt als bron voor taken die in MijnServices
worden getoond of afgehandeld. De bron-API blijft verantwoordelijk voor de
uitvoering en registratie van taken; de InteractieServices API biedt het
uniforme contract richting kanalen.

## Single source of truth

Voor versie `v0.1` zijn de artefacten:

- [`v0.1/openapi.yaml`](./v0.1/openapi.yaml): snapshot van de bron-API.
- [`v0.1/arazzo.yaml`](./v0.1/arazzo.yaml): workflowmapping tussen de bron-API
  en de InteractieServices API.
- [`v0.1/mapping.yaml`](./v0.1/mapping.yaml): JSONata-profielregels voor
  waardemapping en formaattransformaties.

Arazzo is de single source of truth voor de workflow: welke bronoperaties nodig
zijn en welke functionele flow wordt ondersteund. `mapping.yaml` beschrijft de
JSONata-regels die buiten Arazzo vallen, zoals enumwaardemapping en
formaattransformaties.

DTO's worden niet in het aansluitprofiel opnieuw gedefinieerd. De doelstructuur
staat in de InteractieServices API; de bronstructuur staat in de OpenVTB Taken
API.

## Workflowkeuze

Voor MijnServices is de generieke `externetaken`-resource het primaire
aansluitpunt. De detailresponse is polymorf: het veld `taakSoort` bepaalt of de
taak een betaaltaak, urltaak of formuliertaak is.

Daarom gebruikt de flow `mijnTaken.taakRaadplegen` in Arazzo één primaire
workflow: `openvtbTakenApi.raadpleegTaak`, gebaseerd op `externetakenRetrieve`.
De specifieke endpoints voor betaal-, formulier- en urltaken zijn daarmee geen
losse alternatieve workflows voor MijnServices, maar bron-specifieke varianten
die via de generieke response worden onderscheiden.

`isGerelateerdAan` bevat een lijst met contextrelaties. Elke relatie heeft een
`urn` naar bijvoorbeeld een zaak of product. In de mapping wordt daarom
`isGerelateerdAan[0].urn` gebruikt voor `taak.context.urn`.

## Cross-API stappen

Niet elke handeling die bij een taak hoort, hoeft door de OpenVTB Taken API zelf
te worden uitgevoerd. Als een taak bijvoorbeeld vraagt om een document te
uploaden of te registreren, kan de uitvoerende call bij een andere bron-API
liggen, zoals de ZGW Documenten API.

In dat geval blijft de OpenVTB Taken API de bron voor de taak en de context,
maar beschrijft Arazzo een workflow met meerdere `sourceDescriptions`:
bijvoorbeeld OpenVTB Taken API voor `externetakenRetrieve` en ZGW Documenten API
voor de documentoperatie. De workflow maakt dan expliciet welke gegevens uit de
taak nodig zijn om de vervolgstap bij de andere API uit te voeren.

## Tooling

De eerste workflows worden handmatig uitgewerkt in Arazzo, zodat de
mappingconventies zichtbaar kunnen groeien. Zodra de patronen stabiel zijn, ligt
de volgende tooling voor de hand:

- valideren dat elke `x-mijnservices-flowId` bestaat in het functioneel model;
- valideren dat elke `x-mijnservices-targetOperationId` bestaat in de
  InteractieServices API;
- valideren dat elke gebruikte `operationId` bestaat in de OpenVTB Taken API;
- genereren van een mappingoverzicht uit `arazzo.yaml` en `mapping.yaml` per
  flow, source operation en doeloperatie;
- tonen welke velden een transformatie nodig hebben, bijvoorbeeld van `date`
  naar `date-time`;
- later bundelen van meerdere Arazzo-bestanden tot een overkoepelend
  aansluitprofielenoverzicht.

Een generator of validator gebruikt `v0.1/arazzo.yaml` als workflowbasis en
verrijkt het mappingoverzicht met `v0.1/mapping.yaml`. Vanuit Arazzo volgt de
generator de `sourceDescriptions` naar het functioneel model, de
InteractieServices API en de bron-API.

## Mappingoverzicht

Het mappingoverzicht wordt gegenereerd uit Arazzo en `mapping.yaml`. Arazzo
levert per workflow de bronoperaties, step outputs en doelvelden. `mapping.yaml`
voegt daar de JSONata-regels aan toe voor velden die waardemapping of
formaattransformatie nodig hebben.

Step outputs halen de bronwaarden op; workflow outputs gebruiken dot-notatie
voor doelvelden, zoals `taak.titel.nl` en `taak.context.urn`.

Voorbeeld: bronveld `status` wordt step output `taakStatus` en vult doelveld
`taak.status`. Omdat OpenVTB fijnmaziger statuswaarden gebruikt, staat de
waardemapping in `v0.1/mapping.yaml`.

Voor `mijnTaken.taakRaadplegen` betekent dit dat alle `taak.*` outputs worden
vergeleken met het schema van `interactieservicesApi.retrieveTaak`.

Naast de expliciete mapping moet het overzicht ook verschillen zichtbaar maken:

- **Gemapte attributen:** bronattributen die via Arazzo worden gebruikt om een
  veld in de InteractieServices API te vullen.
- **Transformaties:** mappings waarbij type, formaat of betekenis niet
  een-op-een overeenkomt. Voor `deadline` levert OpenVTB bijvoorbeeld
  `einddatumHandelingsTermijn` als `date`, terwijl de InteractieServices API een
  `date-time` verwacht.
- **Ongebruikte bronattributen:** attributen die wel terugkomen uit de OpenVTB
  Taken API, maar niet in de InteractieServices API terechtkomen.
- **Niet-gevulde doelattributen:** attributen die de InteractieServices API wel
  kan vragen of teruggeven, maar waarvoor dit aansluitprofiel nog geen bronveld
  of transformatie aanwijst.

Zo wordt zichtbaar of een aansluitprofiel informatie verliest, waar de
InteractieServices API ruimer is dan de bron-API en welke mappings nog ontwerp-
of besluitwerk vragen.
