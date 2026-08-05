# Analyse en verbeterplan — Home Assistant default dashboard → `juiced-dashboard`

> Status: **onderzoeks- en planningsfase**. Er is **geen** dashboard gebouwd of gemigreerd.
> Datum onderzoek: 2026-07-31.
> Dit document is de referentie voor vervolgwerk.

---

## Legenda en conventies

- **Prioriteiten:** `P0` (kritiek / blokkeert) · `P1` (hoog) · `P2` (middel) · `P3` (laag / nice-to-have).
- **Performancebevindingen:** telkens met **impact** en **zekerheid** — elk `hoog` / `middel` / `laag`.
- **Bewijsklassen:** `[FEIT]` = vastgesteld uit configuratie/tools · `[INTERPRETATIE]` = onderbouwde gevolgtrekking · `[HYPOTHESE]` = nog te meten.
- **Privacy:** apparaat-serienummers en interne ID's zijn in dit rapport gegeneraliseerd (bv. `sensor.sn_<serial>_...`). Er staan geen tokens, secrets of interne URL's in dit document.

---

## 1. Executive summary

Het huidige default dashboard (`lovelace`, titel **"Overview"**, storage-mode) is een groot, organisch gegroeid dashboard: **27 views, ± 1.072 kaarten, 522 unieke entities, ± 453 KB configuratie** in één storage-object. `[FEIT]` De structuur is functioneel rijk (per kamer een view + domeinviews voor energie, water, auto, 3D-printer, zwembad, tuin), maar leunt zwaar op custom cards en templating: **± 30 custom card-types**, **card-mod 279×**, **Jinja-templates `{%` 926× / `{{` 369×**, plus een globale bundel van **51 frontend-resources**. `[FEIT]`

De belangrijkste bevindingen:

1. **Global first-load is de grootste gedeelde kost:** 51 resources (50 JS-modules + 1 inline CSS) + globaal `card-mod` (via `configuration.yaml`) + `browser_mod` + `kiosk-mode` laden bij élke view. `[FEIT]` HA laadt de kaarten van een view lazy, dus de 1.072 kaarten zijn géén single-page-kost — maar de resourcebundel en de navigatiebadges wél. `[INTERPRETATIE]`
2. **Zware individuele views:** Home (137 kaarten), terras (79), energy (73), serverroom (71), keuken/garage (57). `[FEIT]` Dit zijn de eerste kandidaten voor herstructurering.
3. **Sterke duplicatie in de 12 kamerviews:** identiek patroon (entities + grid + `mushroom-light`/`mushroom-entity` + `mini-graph-card` + `card-mod`), grotendeels gekopieerd i.p.v. via één gedeeld template. `[INTERPRETATIE]`
4. **De referentieprojecten bieden een bewezen weg vooruit:** views 20 (EV6) en 26 (garden) embedden nú al `custom:kia-dashboard-card` en `custom:garden-dashboard-card` — één gecontroleerde, render-gated component per domein. `[FEIT]`
5. **Graphify dekt het default dashboard niet.** Graphify heeft de YAML-config geïndexeerd (custom_components, www, de Kia-YAML-dashboard, root-YAML's), maar het storage-mode default dashboard leeft in `.storage/` en is niet geparsed. Voor het default dashboard is **live Home Assistant MCP de enige betrouwbare bron.** `[FEIT]`

**Aanbevolen doelarchitectuur (samengevat):** een **modulair YAML-mode dashboard** in `juiced-dashboard` (composition root + `!include` per view + gedeelde decluttering-/thema-/mappingbestanden), naar het patroon van het Kia-dashboard, met **behoud van functionele pariteit als harde eis**, en met de mogelijkheid om de zwaarste bespoke views (Home-hub, energy) later te vervangen door render-gated custom cards naar het Garden-model. Zie hoofdstuk 11 voor de motivatie en 10 voor de objectieve optievergelijking.

---

## 2. Scope en veiligheidsgrenzen

**In scope (deze fase):** read-only inventarisatie, technische en performance-analyse, architectuurvergelijking, en een gefaseerd migratieplan. Uitsluitend onderzoek en planning.

**Buiten scope (deze fase):** bouwen of migreren van het nieuwe dashboard; wijzigen van automations, scripts, scenes, helpers, integrations, devices of entities.

**Toegepaste veiligheidsregels:**

| Regel | Toepassing in dit onderzoek |
| --- | --- |
| Default dashboard nooit wijzigen | Alleen `ha_config_get_dashboard(url_path="lovelace")` (read). **Geen** schrijfactie uitgevoerd. `[FEIT]` |
| Testen alleen in **MCP Test** | Geen test nodig gebleken; er is **niets** geschreven naar MCP Test of enig ander dashboard. |
| Snapshot vóór wijziging | N.v.t. — geen wijziging. MCP Test is bovendien een exacte kopie van default (zie hfdst. 3). |
| Geen secrets in Git/rapport | Serienummers/entity-ID's gegeneraliseerd; geen tokens/URL's opgenomen. |
| Bij twijfel stoppen | Onzekerheden expliciet gemarkeerd als `[HYPOTHESE]` met meetmethode. |

**Bevestiging:** het default dashboard is **niet gewijzigd**; config-hash bij lezen: `bbd397db37302fb9`. `[FEIT]`

---

## 3. Onderzochte bronnen en betrouwbaarheid

| Bron | Locatie / tool | Gebruik | Betrouwbaarheid |
| --- | --- | --- | --- |
| Default dashboard | HA MCP `ha_config_get_dashboard(url_path="lovelace")` | Volledige config uitgelezen (453 KB), read-only | **Hoog** — live bron van waarheid |
| MCP Test dashboard | HA MCP `ha_config_get_dashboard(url_path="mcp-test-dashboard")` | Vergelijking met default | **Hoog** — identiek aan default |
| Frontend-resources | HA MCP `ha_config_list_dashboard_resources` | 51 resources geïnventariseerd | **Hoog** |
| Dashboardlijst | HA MCP `ha_config_get_dashboard(list_only=True)` | Default vs MCP Test geïdentificeerd | **Hoog** |
| Graphify | `/projects/HomeAssistant/graphify-out/` (manifest.json) | Coverage-check | **Hoog voor YAML-config, niet van toepassing op default dashboard** |
| Kia-dashboard (referentie) | `/projects/ha-kia-connect-dashboard/` + `/projects/HomeAssistant/dashboards/kia/` | Patronen: modulariteit, includes, thema, CI, HACS | **Hoog** — repo lokaal aanwezig |
| Garden-dashboard (referentie) | `/projects/garden-dashboard/` | Patronen: single-file card, render-gating, privacy | **Hoog** — repo lokaal aanwezig |
| `juiced-dashboard` repo | `/projects/juiced-dashboard/` | Doelrepo | **Hoog** — leeg (alleen prompt + 1 commit `start`) |

**Beperkingen / niet vastgesteld:**

- Er zijn **geen echte performancemetingen** gedaan (geen browserprofiling beschikbaar in deze omgeving). Alle performance-uitspraken zijn `[FEIT]` over structuur of `[HYPOTHESE]` over runtime-effect — zie hfdst. 7 voor de meetmethode.
- De 12 kamerviews zijn structureel geïnventariseerd (kaarttypes, aantallen); niet elke individuele entity-binding is regel voor regel gevalideerd tegen de entity-registry.
- Van de "niet-gebruikte" resources is vastgesteld dat ze **niet in het default dashboard** voorkomen; of ze elders (map, dashboard-test, Kia-YAML) gebruikt worden is niet uitputtend gecontroleerd (zie hfdst. 8).

---

## 4. Huidige dashboardarchitectuur

`[FEIT]` De Home Assistant-instantie kent **5 dashboards**:

| url_path | Titel | Mode | Rol |
| --- | --- | --- | --- |
| `lovelace` | Overview | storage | **Het default dashboard** (analyseobject) |
| `mcp-test-dashboard` | MCP Test Dashboard | storage | **Exacte kopie** van default — veilige testomgeving |
| `map` | Kaart | storage | Kaartweergave |
| `dashboard-test` | Test | storage | Admin-only testdashboard |
| `kia-ev6` | Nebula | **yaml** | Kia-dashboard (`dashboards/kia/dashboard.yaml`) — referentiepatroon, in productie |

**Kopie-verificatie default vs MCP Test** `[FEIT]`: identieke `config_hash` (`bbd397db37302fb9`), identieke grootte (452.914 bytes), **27 views**, **1.072 kaarten**, identieke view-titels en identiek kaarttype-histogram. → MCP Test is byte-identiek en dus een correcte, veilige testkopie.

**Structuur van het default dashboard** `[FEIT]`:

- `config` bevat: `kiosk_mode`, `decluttering_templates` (1: `global_navigation_badges`), `button_card_templates` (4: `vacuum_service`, `vacuum_room`, `ac_charge_speed`, `soc_target`), en `views` (27).
- `kiosk_mode.hide_header` = JS-template `[[[ is_state("input_boolean.kiosk_hide_header_sidebar", "on") ]]]` — header/sidebar worden verborgen via een input_boolean (kiosk-gebruik). `[FEIT]`
- **Navigatie:** elke view heeft één badge: `custom:decluttering-card` met template `global_navigation_badges`. Die template is een `mushroom-chips-card` met chips voor Back/Home + energie-KPI's (batterij-SoC, laad/ontlaadvermogen, zonneopbrengst, netverbruik, piekvermogen) met `navigate`-acties. Dit is dé gedeelde navigatiebalk. `[FEIT]`
- **View 0 "Home"** is hybride: bevat zowel `sections` als `cards` én een `header` (geen `path` → fragiele render-URL `lovelace/0`). Het is de zwaarste view (137 kaarten). `[FEIT]`
- **Views 1–26** zijn overwegend `type: sections` (moderne grid-layout). `[FEIT]`
- **Waarschuwing uit HA zelf:** 2 views hebben geen stabiel `path` (view 0 "Home" en view 12 "logeerkamer") → render-paths gebruiken fragiele numerieke indexen (`lovelace/0`, `lovelace/12`). `[FEIT]`

---

## 5. Functionele inventaris en behoudmatrix

`[FEIT]` per-view metingen (kaarten = totaal recursief geteld; custom = aantal `custom:`-kaarten; entities = unieke referenties in die view). "Belangrijkste kaarten" = top kaarttypes. **Behouden = Ja** voor alle views (functionele pariteit is harde eis).

| # | View (path) | Doel | Belangrijkste kaarten | Entities/acties | Afhankelijkheden (custom) | Behouden? | Opmerkingen |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | Home (—) | Landings-/navigatiehub | mushroom-chips 44, button-card 19, mushroom-template 14, gauge 12, conditional 9 | 36 | mushroom, button-card, decluttering, card-mod | Ja | **Zwaarst (137)**; hybride sections+cards+header; **fragiel pad `lovelace/0`** (P1) |
| 1 | oprit | Oprit/entree buiten | vertical-stack 6, entities 5, grid 4, expander 4, mini-graph 2, picture 2 | 24 | expander, mini-graph, (camera) | Ja | Bevat camera-context |
| 2 | inkomhal | Hal | entities 10, grid 3, vertical-stack 3, mushroom-light 3 | 9 | mushroom | Ja | Lichte view |
| 3 | toilet & berging | Toilet/berging | entities 9, grid 6, mushroom-entity 4, mod-card 3, stack-in 3 | 9 | mushroom, mod-card, stack-in-card | Ja | Kamerpatroon |
| 4 | woonkamer | Woonkamer | entities 10, vertical-stack 6, mushroom-light 6, grid 5 | 22 | mushroom, card-mod | Ja | Kamerpatroon |
| 5 | keuken | Keuken | vertical-stack 17, entities 14, grid 5, mushroom-light 4, image 3 | 40 | mushroom, card-mod | Ja | Veel entities; images |
| 6 | garage | Garage | entities 21, vertical-stack 11, mini-graph 6, mod-card 3 | 44 | mini-graph, mod-card | Ja | Camera garage; veel sensors |
| 7 | bureau | Kantoor | vertical-stack 6, mushroom-light 4, conditional 4, mushroom-cover 4, grid 3 | 20 | mushroom, linak-desk-card | Ja | Zit/sta-bureau (linak) |
| 8 | serverroom | Serverruimte | vertical-stack 18, entities 16, mushroom-entity 9, grid 7 | 37 | mushroom | Ja | **Zwaar (71)**; camera serverroom |
| 9 | slaapkamer | Slaapkamer | entities 11, grid 5, vertical-stack 4, mushroom-light 3, mini-graph 3 | 19 | mushroom, mini-graph | Ja | Kamerpatroon |
| 10 | kinderkamer | Kinderkamer | entities 11, grid 6, vertical-stack 5, mushroom-entity 3, mini-graph 3 | 16 | mushroom, mini-graph | Ja | Camera kinderkamer |
| 11 | badkamer | Badkamer | entities 10, vertical-stack 6, grid 3, mini-graph 3 | 20 | mushroom, mini-graph | Ja | Kamerpatroon |
| 12 | logeerkamer (—) | Logeerkamer | entities 9, vertical-stack 5, grid 4, mini-graph 3, stack-in 2 | 14 | mushroom, mini-graph, stack-in-card | Ja | **Fragiel pad `lovelace/12`** (P1) |
| 13 | terras | Terras | entities 11, grid 8, mushroom-entity 8, vertical-stack 7, mushroom-light 6 | 30 | mushroom, card-mod | Ja | **Zwaar (79)**; camera tuin/tuinhuis |
| 14 | huis (house) | Klimaat-/huisoverzicht | mushroom-template 14, mushroom-entity 7, expander 7, simple-thermostat 7, grid 5 | 26 | mushroom, expander, simple-thermostat | Ja | Klimaathub; 7× thermostaat |
| 15 | net | Elektriciteitsnet | vertical-stack 4, entities 4, grid 2, vertical-stack-in-card 2, markdown 2 | 22 | vertical-stack-in-card | Ja | Netmeting |
| 16 | valliant | Vaillant warmtepomp | vertical-stack 6, entities 4, markdown 3, simple-thermostat 2, mini-graph 1 | 20 | simple-thermostat, mini-graph | Ja | Warmtepomp |
| 17 | System and update info (hainfo) | HA-systeem/updates | tile 12, vertical-stack 7, mini-graph 5, horizontal-stack 4, bar-card 4 | 28 | mini-graph, bar-card, mushroom | Ja | Systeemmonitor |
| 18 | water | Waterverbruik | entity 4, vertical-stack 3, entities 3, gauge 2, apexcharts 2 | 19 | apexcharts | Ja | Grafieken |
| 19 | person | Aanwezigheid personen | grid 1, horizontal-stack 1, vertical-stack 1, state-switch 1, decluttering 1 | 7 | state-switch, decluttering | Ja | Licht |
| 20 | EV6 (car) | Auto (Kia) | grid 1, **kia-dashboard-card 1**, decluttering 1 | 0* | **kia-dashboard-card** | Ja | **Embedt referentie-card** (bewijs van patroon) |
| 21 | energy | Energieoverzicht | mini-graph 11, stack-in 10, mushroom-entity 10, grid 9, canvas-gauge 8 | 25 | mini-graph, stack-in-card, canvas-gauge, mushroom | Ja | **Zwaar (73), zeer custom-heavy (44/73)** |
| 22 | batteries1 | Batterijmonitor | auto-entities 4, vertical-stack 3, entities 3, battery-state-card 1 | 0* | auto-entities, battery-state-card | Ja | `auto-entities` dynamische lijsten |
| 23 | ecopower | EcoPower/laden | button-card 6, entity 5, vertical-stack 3, mushroom-chips 2 | 32 | button-card, mushroom | Ja | Laadsturing |
| 24 | anycubic | 3D-printer | grid 11, mushroom-entity 7, expander 4, auto-entities 4, anycubic-card 2 | 15 | anycubic-card, auto-entities, expander | Ja | Printerstatus + camera |
| 25 | zwembad | Zwembad | vertical-stack 7, entities 6, mini-graph 3, sensor-monitor 1 | 47 | mini-graph, sensor-monitor-card | Ja | Veel entities (47) |
| 26 | garden | Tuin | grid 1, **garden-dashboard-card 1**, decluttering 1 | 0* | **garden-dashboard-card** | Ja | **Embedt referentie-card** (bewijs van patroon) |

\* Entities = 0 in de scan omdat de card ze intern via config-velden ontvangt (niet via `entity`/`entities`), niet omdat de view leeg is. `[INTERPRETATIE]`

**Functionaliteit die absoluut behouden moet blijven** (harde eis): alle 27 views; de gedeelde navigatiebadge met energie-KPI's; kiosk-mode header-toggle; de 4 `button_card_templates` (vacuum + laden); camera-integraties; `auto-entities` dynamische lijsten (batteries1, anycubic); de ingebedde EV6- en Garden-cards; energie-/water-grafieken.

**Gedeelde/globale elementen (kandidaten voor centrale componenten):**

- `decluttering_templates.global_navigation_badges` (nav op alle views) — **P1 gedeelde component**.
- `button_card_templates` (4) — **P2 gedeelde component**.
- Kamerpatroon (12× vrijwel identiek) — **P1 kandidaat voor één decluttering-/room-template**.

---

## 6. Navigatie- en afhankelijkhedenoverzicht

**Navigatiemodel** `[FEIT]`: platte structuur — 27 views naast elkaar in de sidebar/tabbar van één dashboard. Navigatie tussen views via `navigate`-acties in de gedeelde chips-badge (Home + energie-KPI's) en via HA's eigen view-tabs. Geen subviews/popup-hiërarchie in het default dashboard (in tegenstelling tot Kia, dat wél een hub-en-detail-model met back-navigatie heeft).

**Afhankelijkheden — geverifieerd gebruik in het default dashboard** (grep op werkelijk kaart-/element-token in de config; aantal = voorkomens) `[FEIT]`:

| Resource / feature | Voorkomens | Klasse |
| --- | --- | --- |
| card-mod / `custom:mod-card` | 279 | Zwaar gebruikt (globaal geladen via `configuration.yaml`) |
| lovelace-mushroom (`custom:mushroom-*`) | 227 | Zwaar gebruikt |
| paper-buttons-row | 152 | Zwaar gebruikt |
| mini-graph-card | 74 | Zwaar gebruikt |
| button-card | 63 | Zwaar gebruikt |
| layout-card | 62 | Gebruikt (`custom:layout-card` + `layout:`/`grid-template`) |
| restriction-card | 52 | Gebruikt |
| hass-hue-icons (`hue:`/`phu:`) | 46 | Gebruikt (iconenset) |
| bar-card | 33 | Gebruikt |
| stack-in-card | 32 | Gebruikt |
| decluttering-card | 27 | Gebruikt (nav-badge + enkele views) |
| fold-entity-row | 26 | Gebruikt (in `entities:`) |
| template-entity-row | 25 | Gebruikt (in `entities:`) |
| battery-entity-row | 22 | Gebruikt (in `entities:`) |
| expander-card | 23 | Gebruikt |
| simple-thermostat | 16 | Gebruikt (huis, valliant) |
| mini-media-player | 16 | Gebruikt |
| browser_mod | 16 | Gebruikt (auto-geladen) |
| auto-entities | 11 | Gebruikt (batteries1, anycubic) |
| apexcharts-card | 10 | Gebruikt (water) |
| canvas-gauge-card | 8 | Gebruikt (energy) |
| hass-bha-icons (`bha:`) | 7 | Gebruikt (iconenset) |
| multiple-entity-row | 5 | Gebruikt |
| kiosk-mode | 4 | Gebruikt (header-toggle) |
| vertical-stack-in-card | 2 | Gebruikt |
| anycubic-card, battery-state-card, flex-horseshoe-card, linak-desk-card, power-flow-card-plus, power-distribution-card, rain-gauge-card, sensor-monitor-card, state-switch, windrose-card, advanced-camera-card, kia-dashboard-card, garden-dashboard-card | 1–2 elk | Gebruikt (domeinspecifiek) |

**HACS-afhankelijkheden:** alle bovenstaande zijn HACS frontend-plugins (behalve de kern-HA-kaarten). De custom_components (integraties) leveren de entities (o.a. `kia_uvo`, `anycubic_cloud`, `bluetti`, `solcast_solar`, `daikin_onecta`, `mypyllant`/Vaillant, `fluidra_pool`, `spoolman`, `alarmo`, `xsense`, `govee`, `smartthinq_sensors`). `[FEIT]` — deze blijven ongewijzigd (buiten scope).

---

## 7. Performancebevindingen

**Meetstatus:** structurele feiten zijn uit de config gehaald; runtime-effecten zijn `[HYPOTHESE]` totdat gemeten (methode onderaan). Er zijn **geen benchmarks verzonnen.**

### Global first-load (gedeelde kost bij élke view)

| # | Bevinding | Bewijs | Impact | Zekerheid | Prio |
| --- | --- | --- | --- | --- | --- |
| G1 | **51 frontend-resources** (50 JS-modules + 1 inline CSS) laden globaal, ongeacht de actieve view | `ha_config_list_dashboard_resources` = 51 `[FEIT]` | hoog | hoog | P1 |
| G2 | **card-mod globaal geladen** via `configuration.yaml` én 279× toegepast → veel post-render DOM-styling | `configuration.yaml` regel 33 + 279 hits `[FEIT]` | hoog | middel | P1 |
| G3 | Gedeelde nav-badge (`mushroom-chips`, ± 12 chips met live energie-entities) rendert op **elke** view | `global_navigation_badges` `[FEIT]` | middel | middel | P2 |
| G4 | `browser_mod` (16×) + `kiosk-mode` globaal actief | resources + config `[FEIT]` | laag | middel | P3 |

### Per-view render (kost bij openen van die view; HA lazy-mount)

| # | View(s) | Bevinding | Impact | Zekerheid | Prio |
| --- | --- | --- | --- | --- | --- |
| V1 | Home (137), terras (79), energy (73), serverroom (71) | Grote kaartaantallen + diepe geneste stacks → grote DOM per view | hoog | hoog (structuur) / middel (runtime) | P1 |
| V2 | Alle views met templates | **Jinja `{%` 926× / `{{` 369×**, `is_state(` 278×, `state_attr(` 157× → veel template-abonnementen die her-renderen bij state-changes | hoog | middel | P1 |
| V3 | Home + kamerviews | **card-mod 279×** → extra styling-passes en shadow-DOM-manipulatie na render | middel | middel | P2 |
| V4 | Views met camera's (oprit, garage, serverroom, kinderkamer, terras, anycubic) | **7 camera-entities**, deels `*_high_resolution_channel` → zware live-streams | hoog | middel | P1 |
| V5 | energy (mini-graph 11 + canvas-gauge 8 + stack-in 10), water (apexcharts), garage/slaapkamer (mini-graph) | Grafiekkaarten doen historievragen; `mini-graph-card` 74× totaal | middel | middel | P2 |
| V6 | batteries1, anycubic | `auto-entities` (11×) evalueert filters/templates bij elke update | middel | laag | P2 |

### Interpretatie

- `[INTERPRETATIE]` De grootste *gedeelde* winst zit in **G1/G2** (resourcebundel + globale card-mod), niet in "1.072 kaarten" — die laden niet tegelijk. De vraag "hoe voorkomen we dat alles tegelijk laadt" is voor de views grotendeels al opgelost door HA's lazy-mount; het echte gedeelde probleem is de globale bundel en de nav-badge.
- `[INTERPRETATIE]` De grootste *per-view* winst zit in **V2 (templating)** en **V1/V4** (Home + camera-views).

### Meetmethode voor volgende fase (geen metingen verzonnen)

1. **Baseline op MCP Test** (kopie): Chrome DevTools → Performance/Lighthouse per view; noteer *scripting time*, *layout/recalc*, *# DOM-nodes*, *time-to-interactive* voor Home, terras, energy, serverroom vs. een lichte view (person).
2. **Netwerk:** meet totale JS-payload van de 51 resources (Coverage-tab: % ongebruikte code).
3. **Template-load:** HA → Developer Tools → template-render-tijden; tel actieve `template`-listeners.
4. **Vergelijk** na elke migratiefase op MCP Test tegen deze baseline (zie hfdst. 14/15). Voer alle metingen op MCP Test uit, nooit op default.

---

## 8. Onderhoudbaarheidsproblemen en technische schuld

| # | Probleem | Bewijs | Klasse | Prio |
| --- | --- | --- | --- | --- |
| T1 | **Alles in één 453 KB storage-object**, UI-bewerkt, niet in Git, geen review/rollback | storage-mode, geen `.storage` in repo `[FEIT]` | Onhoudbaar/gekoppeld | P0 |
| T2 | **12 kamerviews grotendeels gedupliceerd** (zelfde patroon, gekopieerd) | per-view histogram `[FEIT]` | Duplicatie | P1 |
| T3 | **Zware inline templating & card-mod** verspreid over views (moeilijk te onderhouden, foutgevoelig) | 926×`{%`, 279×card-mod `[FEIT]` | Complexiteit | P1 |
| T4 | **2 views zonder stabiel `path`** → fragiele numerieke render-URL's (`lovelace/0`, `lovelace/12`); navigatie/deeplinks breken bij herordening | HA-warning `[FEIT]` | Fragiliteit | P1 |
| T5 | **Resources niet in default gebruikt** (kandidaat-dood, mits elders ook ongebruikt): Bubble-Card, config-template-card, energy-flow-card-plus, energy-period-selector-plus, flower-card, pool-monitor-card, vehicle-status-card, dual_gauge, cover-icon-element, hassio-trash-card | grep = 0 in default `[FEIT]`; elders = onbevestigd `[HYPOTHESE]` | Mogelijke dead weight | P2 |
| T6 | **Iconensets** (custom-brand-icons, thermal_comfort_icons, ha-knx-uf-iconset) — prefix onzeker | grep = 0 op **verkeerde** prefixes `[HYPOTHESE]` | **Gecorrigeerd — zie [`resource-audit.md`](resource-audit.md): echte prefixes `kuf:`/`phu:`; beide grote sets zijn IN GEBRUIK, niet verwijderbaar** | P2 |
| T7 | Home-view mengt `sections` + legacy `cards` + `header` | view 0 keys `[FEIT]` | Inconsistentie | P2 |
| T8 | Entity-ID's (incl. serienummers, bv. `sensor.sn_<serial>_*`) hard in config | config `[FEIT]` | Koppeling/privacy | P1 (voor repo) |

> **Belangrijk t.a.v. T5/T6:** classificatie is *"niet gebruikt in het default dashboard"*, niet *"veilig verwijderbaar"*. Vóór verwijdering moet elk item ook tegen de andere dashboards (map, dashboard-test, Kia-YAML) gecontroleerd worden. **Geen schijnzekerheid.**

---

## 9. Analyse van Kia Connect- en Garden-dashboardpatronen

### 9.1 Kia Connect-dashboard (`/projects/ha-kia-connect-dashboard`, YAML-mode)

`[FEIT]` Herbruikbare patronen:

- **Composition root + includes:** `dashboard.yaml` bevat enkel `title`, `decluttering_templates: !include ...` en `views: - !include views/<x>.yaml`. Geen grote inline kaarten in de root.
- **Mappenverantwoordelijkheid** (uit `docs/include-conventions.md`): `views/` (top-level), `cards/` (herbruikbare fragmenten), `popups/` (detail), `templates/` (contracten: `colors.yaml`, `icons.yaml`, `decluttering_templates.yaml`, `entities.yaml`), `themes/`.
- **Include-regels:** views → cards/popups/templates; cards → templates; templates includen géén views/popups. Kleine, review-bare bestanden.
- **Entity-mapping-contract:** alle entity-ID's in één `entities.yaml`; **CI weigert directe entity-refs daarbuiten** → secret-/omgevingsveiligheid.
- **Thema als semantische tokens:** `themes/kia-horizon.yaml` met kern-HA-variabelen + semantische `kia-*`-tokens (surface/text/brand/status-kleuren, radius, shadow).
- **Overview-shell als custom card:** `custom:kia-dashboard-card` (één gecontroleerde component) voor de zware landingsview; detailviews blijven YAML.
- **Distributie/CI:** `hacs.json` (Lovelace-plugin, één JS-bestand), GitHub Actions `ci.yaml` met prettier `--check`, markdownlint, `node --check`, structuurvalidatie.

### 9.2 Garden-dashboard (`/projects/garden-dashboard`, single-file custom card)

`[FEIT]` Herbruikbare patronen:

- **Één dependency-vrije JS-module** (Shadow DOM, `ha-card`, thema-variabelen met fallbacks). Geen Mushroom/card-mod/layout-card/decluttering nodig → drop-in in een bestaande view.
- **Render-gating (zeer relevant voor perf):** `hasRelevantChange(prevHass, nextHass, entityIds)` — rendert alleen opnieuw als een *geconfigureerde* entity's `state`/`last_updated` wijzigt; skipt anders volledig. Rendering wordt bovendien uitgesteld terwijl een slider focus heeft.
- **List-driven config, géén hardcoded entity-ID's:** `zones[]`/`irrigation[]`; elke niet-primaire entity optioneel → graceful bij ontbrekende entities.
- **Robuuste statusafhandeling:** `isUnavailable`/`parseNumeric` → toont "Niet beschikbaar"/"Onbekend"/verbergt rijen; `escapeHtml` op alle tekst; units uit `unit_of_measurement`.
- **Privacy:** geen echte entity-ID's in de repo; echte mapping in gitignored `*.local.yaml`. Publieke voorbeelden met fictieve ID's.
- **CI:** `node --test` op pure helpers, `node --check`, markdownlint, prettier.

### 9.3 Toepasbaarheid op `juiced-dashboard`

| Patroon | Bron | Toepassing op default dashboard |
| --- | --- | --- |
| Composition root + `!include` per view | Kia | Kernstructuur van de YAML-migratie (hfdst. 11–12) |
| Gedeelde `templates/` (colors/icons/decluttering) | Kia | Elimineert kamer-duplicatie (T2) en centraliseert styling (T3) |
| Entity-mapping + CI-guard tegen entity-refs | Kia + Garden | Lost T8 (secrets/privacy) op |
| Semantische thema-tokens | Kia | Centraal thema/responsiviteit (UX, hfdst. 13) |
| Custom card met **render-gating** | Garden | Optie voor zwaarste views (Home-hub, energy) om V1/V2 aan te pakken |
| `*.local.yaml` gitignore | Garden | Omgevingsspecifieke entity-ID's zonder commit |
| HACS `hacs.json` + Actions-CI | beide | Distributie/validatie (hfdst. 14–15) |

---

## 10. Vergelijking van architectuuropties

| Optie | Performance | Onderhoudbaarheid | Hergebruik | Installatie/update | Mobiel | Migratierisico |
| --- | --- | --- | --- | --- | --- | --- |
| **A. Modulair YAML-mode dashboard** (root + includes per view + gedeelde templates) — *Kia YAML-model* | + Zelfde runtime als nu, maar templating/duplicatie centraal reduceerbaar; geen extra JS | ++ Kleine review-bare bestanden, Git, rollback | ++ Decluttering/anchors voor kamer- en KPI-patronen | ++ Git-based; HA `lovelace.dashboards` YAML-mode | + Erft HA sections-responsiviteit | **Laag–middel** — 1:1 om te zetten, incrementeel per view |
| **B. Per-domein/-subpagina custom cards** (één JS-card per view) — *Garden/Kia-card-model* | ++ Render-gating, minimale deps, kleine DOM | + Component-code i.p.v. YAML, maar meer bouw-/testwerk | + Sterk per card, zwak tussen cards | + HACS-plugin(s) | ++ Volledig zelf te controleren | **Hoog** — 27 views herschrijven in JS; grote pariteitsrisico's |
| **C. Hybride** — lichte YAML-hub + modulaire YAML-domeinpagina's, custom cards **alleen** voor de zwaarste bespoke views (Home-hub, energy) | ++ Combineert A-gemak met B-winst waar het telt | ++ Meeste views eenvoudig YAML; complexiteit geïsoleerd in enkele cards | ++ Gedeelde templates + herbruikbare cards | ++ Git + HACS voor de cards | ++ | **Middel** — gefaseerd; risico geconcentreerd in weinig cards |
| **D. Storage-mode behouden, alleen opschonen** (resources snoeien, dubbele views dedupliceren via UI) | +/- Kleine winst (G1/T5) | -- Blijft UI-bewerkt, niet in Git, geen review | - | - Niet Git-gedistribueerd | +/- | **Laag** maar lost T1 niet op |

**Observatie:** de prompt waarschuwt expliciet om **niet** aan te nemen dat elke subpagina een eigen card wordt. De data ondersteunt dat: de meeste views (kamers) zijn licht en zeer uniform → YAML + gedeeld template is efficiënter dan 12 losse JS-cards. Alleen Home en energy zijn bespoke en zwaar genoeg om een custom card te rechtvaardigen.

---

## 11. Aanbevolen doelarchitectuur en motivatie

**Keuze: Optie C (Hybride), met Optie A als fundament.** `[INTERPRETATIE]`

**Motivatie (traceerbaar naar bevindingen):**

- Lost **T1** (P0) op: alles naar Git, YAML-mode, review + rollback.
- Lost **T2/T3** op via gedeelde `templates/` + decluttering voor het kamerpatroon (12 views → 1 template + 12 dunne includes).
- Respecteert **functionele pariteit**: YAML-migratie is 1:1 en incrementeel per view (laag risico), i.t.t. een volledige JS-herbouw (Optie B, hoog risico).
- Pakt de zwaarste **per-view** kosten (V1/V2: Home 137, energy 73) gericht aan met een **render-gated custom card** naar Garden-model — precies waar de winst het grootst is, zonder alle 27 views te herschrijven.
- Views 20 (EV6) en 26 (garden) **bewijzen** dat de card-embed-aanpak in deze instantie al werkt.

**Wat wordt gedeelde component:**

- `templates/decluttering_templates.yaml`: `global_navigation_badges` (bestaat al) + nieuw `room_view` / `room_light_row` / `sensor_graph_row`.
- `templates/colors.yaml` + `templates/icons.yaml`: semantische tokens (naar Kia-model).
- `themes/juiced-horizon.yaml`: centraal thema (Kia-stijl doortrekken).
- `button_card_templates` (4): centraal bestand.

**Wat blijft domein-/paginaspecifiek:** de bespoke domeinviews (energy, water, net, valliant, hainfo, anycubic, zwembad, ecopower, batteries1) en de camera-/apparaatspecifieke kaarten.

**Navigatie/thema/responsiviteit centraal:** één `global_navigation_badges`-template + één thema + `type: sections` overal (incl. Home) voor consistente responsive grid-layout.

**Distributie:** Git-based YAML-mode (`lovelace.dashboards` met `mode: yaml`, `filename: ...`) is voldoende en eenvoudiger dan HACS voor het *dashboard zelf*. Custom cards (Home-hub, energy) worden **wél** HACS-plugins (zoals EV6/Garden nu). → hybride distributie.

**Omgevingsspecifieke entity-ID's zonder secrets:** entity-mapping in `templates/entities.yaml` (fictieve voorbeelden in repo) + echte mapping in gitignored `*.local.yaml`; CI-guard tegen directe entity-refs (Kia-patroon). Serienummers nooit committen.

**Voorkomen dat alles tegelijk laadt:** views laden lazy (HA-default); daarbovenop de globale resourcebundel snoeien (T5/G1) en de nav-badge licht houden.

---

## 12. Voorgestelde repositorystructuur

```text
juiced-dashboard/
  dashboard/
    dashboard.yaml                # composition root: title + decluttering + views (!include)
    views/
      home.yaml                   # eerst YAML; later evt. custom:juiced-home-card
      oprit.yaml ... zwembad.yaml # per view één bestand (27)
      energy.yaml                 # kandidaat voor custom card
    cards/
      room-header.yaml            # herbruikbare fragmenten
      room-lights.yaml
      sensor-graph.yaml
      camera-context.yaml
    templates/
      decluttering_templates.yaml # global_navigation_badges + room_* patronen
      colors.yaml                 # semantische kleur-tokens
      icons.yaml                  # icoonkeuzes
      entities.yaml               # GENERIEKE mapping (fictieve ID's) — nooit echte
      button_card_templates.yaml  # vacuum_service/room, ac_charge_speed, soc_target
    themes/
      juiced-horizon.yaml         # centraal thema (Kia-stijl)
  src/                            # optioneel, later: custom cards (Home-hub, energy)
    juiced-home-card.js
  dist/
    juiced-home-card.js
  docs/
    default-dashboard-analysis-and-plan.md   # dit rapport
    include-conventions.md
    entity-mapping.md
    migration-plan.md
  hacs.json                       # alleen als custom cards worden gedistribueerd
  .github/workflows/ci.yaml       # yamllint, prettier, markdownlint, entity-ref-guard
  .gitignore                      # *.local.yaml, node_modules, .storage
  README.md / ARCHITECTURE.md / CHANGELOG.md
```

HA-wiring (voorbeeld, YAML-mode):

```yaml
lovelace:
  dashboards:
    juiced-home:
      mode: yaml
      title: Juiced
      icon: mdi:home-assistant
      show_in_sidebar: true
      filename: dashboards/juiced/dashboard.yaml
```

---

## 13. UX-, stijl- en responsive-richtlijnen

`[INTERPRETATIE]`, afgeleid van Kia-stijl (`kia-horizon.yaml`) en Garden-statusafhandeling.

- **Thema/tokens:** donkere basis, semantische tokens: `surface-base/raised/elevated`, `text-primary/secondary/muted`, `brand-primary/secondary/accent`, `status-charging/ready/warning/critical`; `ha-card-border-radius ± 18px`, zachte shadow. Kleuren via tokens, niet hardcoded per kaart (vervangt de 279 card-mod-ingrepen stapsgewijs).
- **Hiërarchie & progressive disclosure:** bovenaan een compacte hero/KPI-rij (nav-badge blijft), detail achter `expander-card`/subview i.p.v. lange scrollpagina's (Home 137 → opsplitsen).
- **Statusweergave:** consistent "Niet beschikbaar"/"Onbekend"/verbergen bij `unavailable`/`unknown`/offline (Garden-`isUnavailable`-model); geen lege of misleidende waarden.
- **Iconografie:** één iconenset-strategie; onzekere sets (T6) valideren vóór behoud.
- **Responsiviteit:** `type: sections` overal (grid past zich aan desktop/tablet/mobiel aan); custom cards leveren `getGridOptions()`/`columns: full` (Garden-model) en zijn getest tot ± 360 px.
- **Toegankelijkheid:** contrast toetsen tegen tokens (Kia heeft `docs/contrast-validation.md` als voorbeeld); tap targets ≥ 40 px; status niet alleen via kleur (ook icoon/tekst).

---

## 14. Gefaseerd implementatie- en migratieplan

> Alle bouw/test gebeurt op **MCP Test** (kopie) of lokaal in Git; **nooit** op default. Eindomschakeling pas na expliciete goedkeuring (aparte opdracht).

| Fase | Doel | Belangrijkste stappen | Afhankelijkheden | Risico |
| --- | --- | --- | --- | --- |
| **0. Repo-fundament** (P0) | Structuur + CI + thema | Mappen (hfdst. 12), `.gitignore` (`*.local.yaml`, `.storage`), CI (yamllint/prettier/markdownlint + entity-ref-guard), `themes/juiced-horizon.yaml`, `templates/` skeletten | — | Laag |
| **1. Baseline & export** (P0) | Meetbare startsituatie + veilige bron | Export default-config als YAML-referentie (read-only); baseline-metingen op MCP Test (hfdst. 7); nav-badge-template overnemen | Fase 0 | Laag |
| **2. Gedeelde templates** (P1) | Duplicatie wegnemen | `global_navigation_badges` + nieuw `room_view`/`room_light_row`/`sensor_graph_row`; entity-mapping (`entities.yaml` + `*.local.yaml`) | Fase 0–1 | Laag |
| **3. Kamerviews migreren** (P1) | 12 kamers → dunne includes | Elke kamer als `views/<kamer>.yaml` via room-template; **stabiele `path` toevoegen** (lost T4 op voor logeerkamer) | Fase 2 | Middel (pariteit per kamer testen) |
| **4. Domeinviews migreren** (P1) | net, valliant, hainfo, water, person, ecopower, batteries1, anycubic, zwembad, map | 1:1 YAML-includes; grafiek-/auto-entities-kaarten behouden | Fase 2 | Middel |
| **5. Ingebedde cards** (P2) | EV6 + garden | Bestaande `kia-dashboard-card`/`garden-dashboard-card` includes overnemen | Fase 3–4 | Laag |
| **6. Zware bespoke views** (P2) | Home + energy | Eerst YAML-1:1; daarna optioneel `custom:juiced-home-card` met **render-gating** (Garden-model); Home stabiel `path` geven (lost T4 op voor Home) | Fase 3–5 | Middel–hoog (nieuwe code) |
| **7. Resource-sanering** (P2) | Bundel verkleinen (G1/T5) | Per kandidaat (T5/T6) verifiëren tegen álle dashboards; alleen dan resource verwijderen | Fase 1 | Middel (regressierisico) |
| **8. Thema/card-mod-reductie** (P3) | Styling centraliseren (T3/G2) | card-mod-ingrepen stapsgewijs vervangen door thema-tokens | Fase 3–6 | Laag–middel |

**Quick wins vs. ingrijpend:** zie hfdst. 17 (quick wins) en fases 6–8 (ingrijpend).

---

## 15. Teststrategie en acceptatiecriteria

**Statisch/CI:**

- `yamllint` + schema-/structuurvalidatie van alle dashboard-YAML.
- `prettier --check`, `markdownlint` (naar referentie-CI).
- **Entity-ref-guard:** CI faalt bij directe entity-ID's buiten `entities.yaml`/`*.local.yaml` (Kia-patroon).
- Ontbrekende-entity-check: script dat mapping-ID's tegen de HA-registry houdt (read-only, via MCP) — rapporteert missing/unknown/unavailable.

**Functioneel:**

- **Pariteitsvergelijking default ↔ MCP Test** per view: zelfde kaarten/entities/acties aanwezig (kaartinventaris-diff met hetzelfde script als dit onderzoek).
- Handmatige rooktest per gemigreerde view op MCP Test.

**Responsief:** elke view op desktop / tablet / ± 360 px mobiel (DevTools device-emulatie).

**Performance:** hertest tegen de baseline (hfdst. 7) na fases 3, 6, 7 — scripting time, DOM-nodes, JS-payload, template-listeners.

**Acceptatiecriteria per fase (voorbeeld Fase 3 — kamers):**

- [ ] Alle 12 kamers renderen op MCP Test zonder console-errors.
- [ ] Kaart-/entity-inventaris per kamer = default (pariteit).
- [ ] Elke kamer heeft een stabiel `path`.
- [ ] Duplicatie meetbaar gedaald (regels YAML per kamer ↓ t.o.v. inline).
- [ ] Responsief OK op 3 breedtes.

---

## 16. Risico's, mitigaties en rollback

| Risico | Impact | Mitigatie | Rollback |
| --- | --- | --- | --- |
| Functionaliteitsverlies bij migratie | Hoog | Pariteitsdiff per view; incrementeel; MCP Test eerst | Default blijft ongewijzigd; niet omschakelen tot goedgekeurd |
| Resource verwijderen die elders gebruikt wordt (T5/T6) | Middel | Verificatie tegen álle dashboards vóór verwijdering | Resource opnieuw registreren (id/url bewaard in dit rapport/Git) |
| Fragiele numerieke paden breken deeplinks | Middel | Stabiele `path` toevoegen in fase 3/6 | YAML terugdraaien via Git |
| Nieuwe custom card introduceert bugs | Middel–hoog | Render-gating + unit-tests (Garden-model); alleen Home/energy | Terug naar YAML-1:1-versie van die view |
| Entity-ID's/serials in Git | Hoog (privacy) | Mapping + `*.local.yaml` + CI-guard | Git-history schonen indien nodig |
| Storage default ↔ YAML-drift tijdens migratie | Middel | Default bevriezen; wijzigingen alleen in repo/MCP Test | N.v.t. (default read-only) |

**Kernprincipe:** het default dashboard blijft de productie-fallback tot de expliciete, goedgekeurde omschakeling. Rollback = simpelweg niet omschakelen / YAML-commit terugdraaien.

---

## 17. Quick wins

| # | Quick win | Bevinding | Prio | Risico |
| --- | --- | --- | --- | --- |
| Q1 | Repo-fundament + CI + thema opzetten (fase 0) | T1 | P1 | Laag |
| Q2 | Stabiele `path` geven aan "Home" en "logeerkamer" (op MCP Test testen) | T4 | P1 | Laag |
| Q3 | Kandidaat-ongebruikte resources verifiëren en (na check) snoeien | T5/G1 | P2 | Middel |
| Q4 | `global_navigation_badges` + `button_card_templates` als eerste gedeelde bestanden vastleggen | T2 | P2 | Laag |
| Q5 | Iconensets (T6) verifiëren: welke prefixes echt in gebruik | T6 | P2 | Laag |
| Q6 | Camera-views: high-res streams evalueren op mogelijke sub-stream/preview | V4 | P2 | Laag |

---

## 18. Open vragen en beslispunten (menselijke input nodig)

1. **Distributievorm:** dashboard zelf via YAML-mode Git (aanbevolen) — akkoord? Custom cards via HACS?
2. **Custom card ja/nee voor Home en energy** (fase 6): investeren in JS-componenten, of YAML-1:1 laten?
3. **Resource-sanering:** mag ik de kandidaat-ongebruikte resources ook tegen de andere dashboards (map, dashboard-test, Kia-YAML) controleren en een verwijderlijst opstellen?
4. **Nieuwe dashboard-`url_path`** (bv. `juiced-home`) naast default tijdens migratie, en pas omschakelen na goedkeuring — akkoord?
5. **Kiosk-mode/`browser_mod`:** blijven deze vereist (bepaalt of ze in de resourcebundel blijven)?
6. **Entity-mapping-diepte:** volledige mapping-laag (Kia-niveau, CI-guard) of lichter (alleen `*.local.yaml`)?
7. **MCP Test:** mag deze als doorlopende bouw-/testomgeving gebruikt worden (met snapshot vooraf)?

---

## 19. Concrete volgende stap

**Aanbevolen eerstvolgende stap (na goedkeuring):** **Fase 0 + Q2** — zet in `juiced-dashboard` het repo-fundament op (mappenstructuur uit hfdst. 12, `.gitignore`, CI met entity-ref-guard, `themes/juiced-horizon.yaml`, lege `templates/`), en migreer **één** kamerview (bv. `badkamer`, 32 kaarten) als proof-of-concept naar YAML met een stabiel `path`, **op MCP Test**. Vergelijk pariteit met default en meet een eerste baseline. Dit valideert de hele aanpak met minimaal risico voordat de 12 kamers en de zware views volgen.

---

## 20. Bijlagen

### Bijlage A — Dashboardlijst (live)

5 dashboards: `lovelace` (Overview, storage, **default**), `mcp-test-dashboard` (**kopie**), `map`, `dashboard-test` (admin), `kia-ev6` (Nebula, yaml). `[FEIT]`

### Bijlage B — Kerncijfers default dashboard

- Views: **27** · Kaarten: **1.072** · Unieke entities: **522** · Config: **452.914 bytes** · Hash: `bbd397db37302fb9`.
- View-types: 1 hybride masonry/sections (Home) + 26 `sections`.
- decluttering_templates: 1 (`global_navigation_badges`) · button_card_templates: 4.

### Bijlage C — Kaarttype-histogram (top) `[FEIT]`

entities 170 · vertical-stack 150 · grid 103 · mushroom-entity 72 · mushroom-chips 49 · horizontal-stack 48 · mini-graph 48 · mushroom-template 37 · mushroom-light 37 · stack-in-card 32 · button-card 31 · decluttering 27 · expander 23 · mod-card 21 · gauge 20 · conditional 19 · mushroom-cover 18 · simple-thermostat 16 · tile 14 · auto-entities 11 · apexcharts 10 · … (± 30 custom-types totaal).

### Bijlage D — Template-/feature-tellingen `[FEIT]`

`{%` 926 · `{{` 369 · card_mod 279 · is_state( 278 · state_attr( 157 · states( 117 · `[[[` (JS-templates) 17.

### Bijlage E — Camera-entities `[FEIT]`

deurbel, garage, serverroom, kamer_adriaan, tuin, tuinhuis (elk `*_high_resolution_channel`) + buienradar. (7 totaal.)

### Bijlage F — Frontend-resources: 51 totaal (50 module + 1 inline CSS). Gebruiksverificatie in hfdst. 6/8. `[FEIT]`

### Bijlage G — Graphify-coverage `[FEIT]`

Graphify (`/projects/HomeAssistant/graphify-out`) indexeert: custom_components (1218), www (264), dashboards/ (60 — **Kia-YAML**), blueprints (6), root-YAML's. **Bevat het storage-mode default dashboard niet.** Voor het default dashboard is live HA MCP de bron.

### Bijlage H — Referentie-repo's `[FEIT]`

Kia: `/projects/ha-kia-connect-dashboard` (+ `/projects/HomeAssistant/dashboards/kia`) — YAML-package + custom card, CI, thema-tokens, entity-mapping-contract.
Garden: `/projects/garden-dashboard` — single-file render-gated custom card, list-driven, privacy via `*.local.yaml`.
