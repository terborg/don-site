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

De Arazzo-specificatie is de single source of truth voor het aansluitprofiel.
Zij beschrijft welke bronoperaties nodig zijn om een InteractieServices-operatie
te vullen en legt daarbij expliciet vast welke functionele flow wordt
ondersteund.

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

## Tooling

De eerste workflows worden handmatig uitgewerkt in Arazzo, zodat de
mappingconventies zichtbaar kunnen groeien. Zodra de patronen stabiel zijn, ligt
de volgende tooling voor de hand:

- valideren dat elke `x-mijnservices-flowId` bestaat in het functioneel model;
- valideren dat elke `x-mijnservices-targetOperationId` bestaat in de
  InteractieServices API;
- valideren dat elke gebruikte `operationId` bestaat in de OpenVTB Taken API;
- genereren van een mappingoverzicht per flow, source operation en doeloperatie;
- later bundelen van meerdere Arazzo-bestanden tot een overkoepelend
  aansluitprofielenoverzicht.

Een generator of validator kan starten bij `v0.1/arazzo.yaml` en de
`sourceDescriptions` volgen naar het functioneel model, de InteractieServices
API en de bron-API.

## Mappingoverzicht

Het mappingoverzicht moet per workflow laten zien hoe bronvelden uit de OpenVTB
Taken API landen in de response van de InteractieServices API. Voor
`mijnTaken.taakRaadplegen` betekent dit bijvoorbeeld dat `outputs.result` wordt
vergeleken met het schema van `interactieservicesApi.retrieveTaak`.

Naast de expliciete mapping moet het overzicht ook verschillen zichtbaar maken:

- **Gemapte attributen:** bronattributen die via Arazzo worden gebruikt om een
  veld in de InteractieServices API te vullen.
- **Ongebruikte bronattributen:** attributen die wel terugkomen uit de OpenVTB
  Taken API, maar niet in de InteractieServices API terechtkomen.
- **Niet-gevulde doelattributen:** attributen die de InteractieServices API wel
  kan vragen of teruggeven, maar waarvoor dit aansluitprofiel nog geen bronveld
  of transformatie aanwijst.

Zo wordt zichtbaar of een aansluitprofiel informatie verliest, waar de
InteractieServices API ruimer is dan de bron-API en welke mappings nog ontwerp-
of besluitwerk vragen.
