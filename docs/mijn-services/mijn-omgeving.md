---
sidebar_position: 3
---

# MijnOmgeving

Een MijnOmgeving is een ingelogde digitale omgeving waar inwoners of ondernemers
hun zaken met de overheid kunnen overzien en afhandelen.
[MijnOverheid](https://mijn.overheid.nl) is daar een bekend voorbeeld van, maar
gemeenten en andere overheidsorganisaties kunnen ook een eigen MijnOmgeving
aanbieden — opgebouwd uit dezelfde bouwstenen.

De bouwstenen in deze kennisbank zijn generiek: ze werken in een gemeentelijk
portaal, in MijnOverheid, en ook via andere kanalen zoals een KCC-omgeving.

## Randvoorwaarden

Om een MijnOmgeving te kunnen aanbieden zijn een aantal zaken vereist.

### Identity provider

Een inwoner of ondernemer moet zich kunnen authenticeren voordat hij zijn zaken
kan inzien. Gangbare identity providers zijn DigiD, eHerkenning en itsme.

### Notificaties

Zonder notificaties heeft een MijnOmgeving beperkte waarde: inwoners en
ondernemers moeten weten dat er iets voor ze klaarstaat. Een notificatieservice
zorgt ervoor dat zij een melding ontvangen als er bijvoorbeeld een nieuw bericht
of een nieuwe taak voor ze is, of als de status van hun aanvraag is veranderd.
Dit integreert ook de vereisten van de Wet modernisering elektronisch
bestuurlijk verkeer (Wmebv).

**Zekerheid en bevestiging**

Gebruikers zoeken zekerheid in digitale processen. Een melding op het scherm is
vaak niet genoeg.

- Bevestigingsmails zijn essentieel: na het afronden van een taak (zoals
  betalen) wordt een e-mailbevestiging gezien als noodzakelijk bewijsmateriaal.
- Duidelijke feedback: toon direct na een actie een duidelijke bevestiging
  (bijv. "Gelukt. U heeft betaald") en vermeld expliciet dat er ook een e-mail
  volgt.

**Effectieve notificaties**

Het openen van een bericht staat of valt met de relevantie en herkenbaarheid.

- Wees specifiek: vermijd vage onderwerpen zoals "Tip". Gebruik concrete
  onderwerpregels zoals "Tip: u heeft recht op subsidie".
- Actionable content: als een inwoner iets moet doen, beschrijf dit dan
  stapsgewijs (Stap 1, Stap 2, Stap 3).
- Phishing-bewustzijn: gebruikers zijn alert op phishing. Leg in e-mails uit
  waarom er géén klikbare link in staat en verwijs naar het portaal.

**Contact en verwachtingen**

Digitaal contact moet drempels wegnemen, niet opwerpen.

- Verwachtingsmanagement: als gebruikers een vraagformulier invullen, willen ze
  weten waar ze aan toe zijn. Vermeld de reactietermijn duidelijk (bijv. "U
  krijgt binnen 5 werkdagen antwoord").
- Context: toon een gestelde vraag direct in de tijdlijn van contactmomenten als
  bevestiging dat deze is verstuurd.

### Profielen

Via een profielservice kunnen persoonlijke voorkeuren voor contact met de
overheidsorganisatie worden beheerd — bijvoorbeeld of iemand digitaal of per
brief op de hoogte wil worden gehouden.

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
Informatiebeveiliging Overheid (BIO), de AVG en het principe Security by Design.
