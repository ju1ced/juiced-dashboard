# POC — migratie `badkamer` naar YAML (Fase 0/1)

Status: **afgerond, parity bewezen.** Datum: 2026-07-31.
Scope: eerste kamerview als proof-of-concept voor de YAML-migratie uit
[`default-dashboard-analysis-and-plan.md`](default-dashboard-analysis-and-plan.md) (hfdst. 14, Fase 0/1 + Quick win Q2).

## Wat is gedaan

1. De view **`badkamer`** (default dashboard `lovelace`, view-index 11, `type: sections`, **32 kaarten**, 1 sectie, stabiel `path: badkamer`) is **read-only** uitgelezen en verbatim naar modulaire YAML omgezet:
   - `dashboard/views/badkamer.yaml` — de view (parity-behoudend).
   - `dashboard/templates/decluttering_templates.yaml` — de gedeelde `global_navigation_badges` (de navigatiebadge die deze view gebruikt).
   - `dashboard/dashboard.yaml` — composition root met `!include` (Kia-patroon).
   - `.gitignore` — `*.local.yaml`, `.storage/`, `node_modules/`.

2. **Validatie tegen MCP Test** (`mcp-test-dashboard`, de bevestigde exacte kopie van default):
   - Kopie-check: default `badkamer` == MCP Test `badkamer` → **True**.
   - Round-trip: `dashboard/views/badkamer.yaml` opnieuw ingeladen == live MCP Test `badkamer` → **True**.
   - End-to-end: composition root met opgeloste `!include` == live MCP Test `badkamer` → **True**.
   - Beide YAML-bestanden parsen standalone.

3. **Privacy:** de `badkamer`-view bevat **geen** serienummers of hex-tokens (gecontroleerd); 32 gewone entity-ID's. Abstractie naar een entity-mapping-laag volgt in Fase 2 (`entities.yaml` + `*.local.yaml`).

## Live herschreven op MCP Test

De view is op verzoek **live herschreven vanuit de repo-YAML** op `mcp-test-dashboard`
(surgical, uitsluitend `views[11]`):

- `ha_config_set_dashboard(url_path="mcp-test-dashboard", python_transform="config['views'][11] = <badkamer-dict uit dashboard/views/badkamer.yaml>", config_hash="bbd397db37302fb9")`.
- Resultaat: `write_committed: true`, `post_write_verified: true`.

**Onafhankelijke verificatie na de write** (herlezen `mcp-test-dashboard`):
- `badkamer` (view 11) op MCP Test == repo `dashboard/views/badkamer.yaml` → **True**.
- Alle 26 andere views ongewijzigd t.o.v. pre-write → **NONE changed** (chirurgisch, geen nevenschade).
- Dashboardstructuur intact: 27 views, `decluttering_templates`, alle 4 `button_card_templates`, `kiosk_mode`; grootte/hash identiek (`452914` / `bbd397db37302fb9`) → inhoudelijk-getrouwe write.

De write is parity-behoudend: MCP Test toonde `badkamer` al identiek (het is de exacte kopie
van default), dus visueel verandert er niets — de waarde is dat MCP Test nu aantoonbaar
door de versiebeheerde repo-YAML wordt gereproduceerd.

## Veiligheid

- Alleen **MCP Test** is beschreven; **uitsluitend `views[11]`**. Het **default dashboard is niet gewijzigd** (alleen read-calls).
- Er is vooraf een **snapshot** van de MCP Test `badkamer`-view gemaakt (restore point) in de sessie-scratchpad:
  `mcp-test_badkamer_snapshot.json` (incl. `source_config_hash`).
- Best-practices-skill vooraf geraadpleegd (strict mode: `BestPracticeKey` vereist en meegegeven).

## Terugdraaien (indien gewenst)

De view is inhoudelijk onveranderd, dus terugdraaien is normaal niet nodig. Mocht het toch
moeten: herhaal de `views[11]`-transform met de `view`-inhoud uit
`mcp-test_badkamer_snapshot.json` en een verse `config_hash`.

## Volgende stap

Fase 2: gedeelde templates uitbouwen (`room_view`/`room_light_row`/`sensor_graph_row`) + entity-mapping, daarna de resterende 11 kamerviews via hetzelfde patroon (Fase 3).
