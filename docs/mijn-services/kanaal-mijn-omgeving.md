---
sidebar_position: 3
---

# Kanaal: mijnomgeving

Een mijnomgeving is één van de kanalen waarbinnen MijnServices worden aangeboden
— naast kanalen als het KCC en de balie. Het is een ingelogde digitale omgeving
waar inwoners of ondernemers hun zaken met de overheid kunnen overzien en
afhandelen. [MijnOverheid](https://mijn.overheid.nl) is daar een bekend
voorbeeld van, maar gemeenten en andere overheidsorganisaties kunnen ook een
eigen mijnomgeving aanbieden — opgebouwd uit dezelfde MijnServices.

## NL Design System

Een mijnomgeving is een visueel product dat door inwoners en ondernemers direct
wordt gebruikt. Om herkenbaar en toegankelijk te zijn, wordt gebruik gemaakt van
het [NL Design System](/communities/nl-design-system). Dit zorgt voor een
consistente look & feel die aansluit bij de verwachtingen van gebruikers —
ongeacht welke gemeente of overheidsorganisatie de mijnomgeving aanbiedt.

We hanteren hierbij ook de principes van
[Gebruiker Centraal](https://www.gebruikercentraal.nl/), zodat taal,
interface-elementen en schermopbouw herkenbaar blijven voor gebruikers.

Dat betekent concreet dat we dezelfde termen gebruiken voor dezelfde
handelingen, dat knoppen, formulieren en feedbackmeldingen herkenbaar werken en
dat navigatie, pagina-indeling en terugkoppeling aansluiten op bekende patronen,
ongeacht in welk portaal ze worden getoond. Documentatie is te vinden via onder
andere
[de discussies over mijnomgevingen binnen NL Design System](https://github.com/orgs/nl-design-system/discussions/categories/mijn-omgevingen).

### Scherminteractie en gebruikersonderzoek

Binnen het kanaal mijnomgeving toetsen we scherminteractie in de context waarin
inwoners en ondernemers hun zaken, berichten en taken terugvinden.
Gebruikersonderzoek helpt daarbij om te valideren of iemand direct begrijpt waar
diegene staat in het proces, welke actie nu nodig is en welke status of
terugkoppeling de overheid geeft.

Pas als dat in de mijnomgeving helder werkt, vertalen we het interactiepatroon
naar de technische specificaties van de onderliggende API's. Zo volgt de
techniek de interactie, en niet andersom.

### Visuele duidelijkheid

Gebruikers scannen informatie. Visuele elementen moeten direct begrijpbaar zijn
zonder uitleg. Een badge met de tekst "Nieuw" of "1 taak open" werkt daarbij
beter dan abstracte blauwe bolletjes of icoontjes. Bij naderende deadlines helpt
een oranje waarschuwingsicoon direct naast de datum om urgentie duidelijk te
maken. Belangrijke details zoals bedragen, datums of kentekens staan bij
voorkeur direct bovenaan een bericht, zodat men niet hoeft te scrollen.

Binnen de
[MijnServices Community Sprint](https://nldesignsystem.nl/community/community-sprints/mijn-services-community/)
van het NL Design System werken diverse overheidsorganisaties sinds september
2024 samen aan de ontwikkeling van toegankelijke, huisstijl-onafhankelijke
templates voor mijnomgevingen en formulieren. Door gebruik te maken van gedeelde
bouwblokken, gebruikersonderzoek en technische documentatie, wordt gewerkt aan
een eenduidige en intuïtieve digitale ervaring voor inwoners en ondernemers.

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
