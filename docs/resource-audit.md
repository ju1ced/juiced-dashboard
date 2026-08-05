# Frontend-resource audit (bundle-sanering)

Verificatie van welke van de 50 geladen frontend-resources écht gebruikt worden, over **alle**
dashboards. Corrigeert de onzekere bevindingen T5/T6 uit
[`default-dashboard-analysis-and-plan.md`](default-dashboard-analysis-and-plan.md) met de
**werkelijke** icon-prefixes. Datum: 2026-08.

## Methode

- Gebruik-detectie per resource op de juiste token:
  - custom cards → `custom:<type>` (kan alleen in dashboards voorkomen);
  - iconensets → de **werkelijk geregistreerde prefix** (uit de JS: `customIconsets["<prefix>"]`),
    niet de mapnaam.
- Gecontroleerde bronnen: default (`lovelace`), `mcp-test-dashboard`, `map` (strategie, leeg),
  `dashboard-test`, en de Kia-YAML (`dashboards/kia/`). `map` is een strategy-dashboard zonder kaarten.

## Kernconclusie: de "icon-set win" bestaat niet — beide grote sets zijn in gebruik

De analyse (T6) markeerde de twee grote iconensets als *mogelijk ongebruikt*, maar dat berustte op
**verkeerd geraden prefixes**. Met de juiste prefix zijn beide **in gebruik**:

| Iconenset | Grootte | Registreert prefix | Bewijs |
| --- | ---: | --- | --- |
| `ha-knx-uf-iconset` | 5.5 MB | **`kuf:`** | Gebruikt op default (`kuf:light_ceiling_spots`, `kuf:temp_temperature`) |
| `custom-brand-icons` | 4.4 MB | **`phu:`** | Gebruikt in de navigatiebadge (`phu:charging-station`, `phu:garden`) |

→ Verwijderen van één van beide **breekt iconen op het default dashboard**. De veronderstelde
±10 MB besparing is niet beschikbaar. (De verificatie voorkwam een regressie.)

## Wél geverifieerd ongebruikt (0 referenties in álle dashboards)

| Resource | Grootte | Resource | Grootte |
| --- | ---: | --- | ---: |
| `vehicle-status-card` | 1294 KB | `pool-monitor-card` | 84 KB |
| `energy-flow-card-plus` | 311 KB | `config-template-card` | 66 KB |
| `hassio-trash-card` | 207 KB | `energy-period-selector-plus` | 54 KB |
| `dual-gauge-card` | 44 KB | `flower-card` | 39 KB |
| `thermal_comfort_icons` (`tc:`) | 28 KB | `cover-icon-element` | 6 KB |

**Totaal veilig verwijderbaar ≈ 2.1 MB** (~11% van de 18.4 MB-bundel). `vehicle-status-card` is
de enige grote. `tc:` is een icon-prefix; entity-icon-overrides (customize/registry) zijn niet
uitputtend gecontroleerd — vóór verwijdering nog verifiëren.

## Wél in gebruik (niet verwijderen) — eerder als kandidaat genoemd

| Resource | Waar gebruikt |
| --- | --- |
| `Bubble-Card` (`custom:bubble-card`) | `dashboard-test` (afval-knoppen) |
| `power-flow-card-plus` | default + `dashboard-test` |
| `advanced-camera-card` (`custom:frigate-card`) | default |
| `apexcharts-card` | default (water) |

## Advies

- **Geen live verwijdering nu.** `ha_config_delete_dashboard_resource` is een **globale**
  registry-wijziging die de omgeving van het **default dashboard** raakt (buiten de "alleen naar
  MCP Test schrijven"-grens). De besparing (~2.1 MB / 11%) is bescheiden.
- Deze lijst is de **opschoonlijst voor de cutover** (samen met de eind-omschakeling naar het
  nieuwe dashboard). Bij verwijdering per resource `id` + `url` bewaren voor one-command rollback.
- De grote winst zit in de migratie zelf (minder kaartmodules per view, ~36% ongebruikte JS —
  zie de baseline), niet in resource-sanering.
