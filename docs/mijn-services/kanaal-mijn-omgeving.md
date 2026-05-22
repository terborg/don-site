---
sidebar_position: 3
---

# Kanaal: MijnOmgeving

Een MijnOmgeving is één van de kanalen waarbinnen MijnServices worden aangeboden
— naast kanalen als het KCC en de balie. Het is een ingelogde digitale omgeving
waar inwoners of ondernemers hun zaken met de overheid kunnen overzien en
afhandelen. [MijnOverheid](https://mijn.overheid.nl) is daar een bekend
voorbeeld van, maar gemeenten en andere overheidsorganisaties kunnen ook een
eigen MijnOmgeving aanbieden — opgebouwd uit dezelfde MijnServices.

## NL Design System

Een MijnOmgeving is een visueel product dat door inwoners en ondernemers direct
wordt gebruikt. Om herkenbaar en toegankelijk te zijn, wordt gebruik gemaakt van
het [NL Design System](/communities/nl-design-system). Dit zorgt voor een
consistente look & feel die aansluit bij de verwachtingen van gebruikers —
ongeacht welke gemeente of overheidsorganisatie de MijnOmgeving aanbiedt.

## Identity provider

Een inwoner of ondernemer moet zich kunnen authenticeren voordat hij zijn zaken
kan inzien. Gangbare identity providers zijn DigiD, eHerkenning en itsme.

## Architectuur en standaarden

### API Design Rules

De bouwstenen zijn gebaseerd op de Nederlandse API-strategie en het NL GOV REST
API-profiel.

### CloudEvents

Voor notificaties wordt het NL GOV profile for CloudEvents gebruikt. Dit
beschrijft hoe specifieke API's worden ontwikkeld voor het bevragen van
onderliggende registraties.

### Informatiemodellen

_Volgt._

### Veiligheid

Informatie en beveiliging worden ingericht volgens de Baseline
Informatiebeveiliging Overheid (BIO), de AVG en het principe Security by
Design).
