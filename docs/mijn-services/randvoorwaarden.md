---
sidebar_position: 4
---

# Randvoorwaarden

Om de bouwstenen te kunnen gebruiken zijn een aantal diensten nodig. Deze pagina
beschrijft de generieke randvoorwaarden. Elke randvoorwaarde verdient op termijn
een eigen pagina.

## Profielservice

Via een profielservice worden persoonlijke voorkeuren voor contact met
overheidsorganisaties beheerd — bijvoorbeeld of iemand digitaal of per brief op
de hoogte wil worden gehouden. De profielservice is een dependency van de
notificatieservice: zonder kanaalvoorkeur weet een notificatie niet waar naartoe
te sturen.

Er zijn meerdere implementaties beschikbaar of in ontwikkeling:

- [moza-profiel-service](https://github.com/MinBZK/moza-profiel-service) — wordt
  doorontwikkeld met de intentie een landelijke voorziening te worden.
- [Open Klant](https://github.com/maykinmedia/open-klant) — open source
  implementatie van de klantinteractie-API's.

## Notificaties

Een notificatieservice zorgt ervoor dat inwoners en ondernemers een melding
ontvangen als er iets voor ze klaarstaat of als de status van hun aanvraag
verandert. Zonder notificaties is de kans klein dat gebruikers actief terugkeren
naar een MijnOmgeving. De notificatieservice integreert daarmee ook de vereisten
van de Wet modernisering elektronisch bestuurlijk verkeer (Wmebv).

In theorie kan elke bouwsteen notificaties triggeren — of dat zinvol is, is per
bouwsteen een inhoudelijke keuze.

**Effectieve notificaties**

Het openen van een bericht staat of valt met de relevantie en herkenbaarheid.

- Wees specifiek: vermijd vage onderwerpen zoals "Tip". Gebruik concrete
  onderwerpregels zoals "Tip: u heeft recht op subsidie".
- Actionable content: als een inwoner iets moet doen, beschrijf dit dan
  stapsgewijs (Stap 1, Stap 2, Stap 3).
- Phishing-bewustzijn: gebruikers zijn alert op phishing. Leg in e-mails uit
  waarom er géén klikbare link in staat en verwijs naar het portaal.

**Zekerheid en bevestiging**

- Bevestigingsmails zijn essentieel: na het afronden van een taak (zoals
  betalen) wordt een e-mailbevestiging gezien als noodzakelijk bewijsmateriaal.
- Duidelijke feedback: toon direct na een actie een duidelijke bevestiging
  (bijv. "Gelukt. U heeft betaald") en vermeld expliciet dat er ook een e-mail
  volgt.
- Verwachtingsmanagement: vermeld de reactietermijn duidelijk (bijv. "U krijgt
  binnen 5 werkdagen antwoord").
