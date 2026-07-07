---
sidebar_label: MijnTaken
---

# Functioneel model MijnTaken

Het functioneel model MijnTaken beschrijft de domeinbegrippen en flows voor
taken binnen MijnServices. Dit model is de inhoudelijke single source of truth
voor wat een taak betekent, welke toestanden een taak kan hebben en welke
gebruikersflows ondersteund worden.

API-specifieke DTO's staan niet in dit model. Request bodies, response bodies,
headers, security en foutmodellen horen bij de InteractieServices API of bij een
bron-API. API's kunnen wel verwijzen naar begrippen uit dit model.

## Artefacten

Voor versie `v0.1` is het publicatiebestand:

- [`v0.1/openapi.yaml`](./v0.1/openapi.yaml)

Dit is een OpenAPI 3.1-document met `paths: {}` en `components.schemas`. Het
bestand gebruikt OpenAPI dus als schemaformaat voor het functionele model, niet
als publicatie van een operationele API.

## Domeinobjecten

| Object                    | Betekenis                                                                         |
| :------------------------ | :-------------------------------------------------------------------------------- |
| `Taak`                    | Handeling die een inwoner, ondernemer of gemachtigde moet of kan uitvoeren.       |
| `TaakStatus`              | Functionele toestand van een taak, zoals open, afgerond of geannuleerd.           |
| `TaakContext`             | Context waaraan een taak is gekoppeld, bijvoorbeeld een zaak, product of dossier. |
| `Uitvoeringsmogelijkheid` | Manier waarop een gebruiker een taak kan uitvoeren of vervolgen.                  |
| `Uitvoeringstype`         | Open lijst van uitvoeringstypen, zoals upload, formulier of betaling.             |
| `Deadline`                | Laatste moment waarop de taak nog op tijd kan worden uitgevoerd.                  |
| `GelokaliseerdeTekst`     | Tekst in een of meer talen, met Nederlands als basisvariant.                      |

## Flows

| FlowId                     | Doel                                                                |
| :------------------------- | :------------------------------------------------------------------ |
| `mijnTaken.contextZoeken`  | Taken zoeken die relevant zijn voor een klant en optionele context. |
| `mijnTaken.taakRaadplegen` | Informatie ophalen die nodig is om een taak te begrijpen.           |
| `mijnTaken.taakUitvoeren`  | De handeling bij een taak starten of voltooien bij de bron.         |

Deze flowIds worden gebruikt door aansluitprofielen, bijvoorbeeld in Arazzo, om
bronworkflows te koppelen aan het functionele model.
