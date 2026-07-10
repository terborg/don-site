---
sidebar_position: 1
sidebar_label: Flows
---

# Flows in de mijnomgeving

Flows beschrijven het functionele verloop van een gebruiker door de
mijnomgeving. Ze maken duidelijk welke stappen, beslissingen, states en
kanaalspecifieke keuzes nodig zijn voordat dit wordt uitgewerkt in concrete
schermprofielen.

Een flow is daarmee de brug tussen de generieke bouwsteen en de concrete
schermuitwerking binnen het kanaal.

| Flow | Bouwsteen | Doel | Schermprofielen |
| :-- | :-- | :-- | :-- |
| Taken in context raadplegen | MijnTaken | Taken tonen en selecteren binnen een zaak, product of dossier. | [Taken in context](../schermprofielen/taken-in-context) |

## Relatie met schermprofielen

Schermprofielen leggen per scherm vast hoe het kanaal de flow vertaalt naar
zichtbare UI-states, interacties en InteractieServices API-operaties. De flow
beschrijft dus eerst het gebruikersverloop; het schermprofiel maakt daarna de
mapping naar scherm en API concreet.
