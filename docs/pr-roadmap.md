# PR-roadmap — vernieuwing van het default dashboard in `juiced-dashboard`

> Bouwt voort op [`default-dashboard-analysis-and-plan.md`](default-dashboard-analysis-and-plan.md)
> en de bewezen pipeline uit [`poc-badkamer-migration.md`](poc-badkamer-migration.md).
> Doel: het default dashboard (`lovelace`, 27 views, ±1.072 kaarten) stap voor stap,
> via kleine reviewbare **pull requests**, opnieuw opbouwen als een modulair, sneller en
> onderhoudbaar YAML-dashboard — **zonder het default dashboard ooit te wijzigen** en met
> **MCP Test** als staging-/validatieomgeving.

Datum: 2026-07-31 · Repo: `github.com/ju1ced/juiced-dashboard` (default branch `main`).

---

## 0. Uitgangspunten (hard)

1. **Default dashboard blijft read-only** tot een expliciet goedgekeurde, aparte cutover.
2. **Alle validatie loopt via MCP Test** (`mcp-test-dashboard`), surgical per view, met snapshot vooraf.
3. **Kleine PR's** (één view of één afgebakend onderdeel per PR — Kia-conventie: reviewbaar houden).
4. **Functionele pariteit is een harde eis** bij elke migratie-PR.
5. **Geen secrets/serials in Git** — zie §1 (de repo is publiek).
6. Elke aanbeveling in dit plan is traceerbaar naar een bevinding uit het analyserapport (P0–P3 en impact/zekerheid daar).

---

## 1. Belangrijke vaststelling: de repo is **publiek** → privacy-model

`juiced-dashboard` is publiek (net als `garden-dashboard` en `ha-kia-connect-dashboard`).
De default-config bevat echte entity-ID's en apparaat-**serienummers** (bv. `sensor.sn_<serial>_...`).
Die mogen **niet** in Git.

**Gekozen model (privacy-safe, naar Kia/Garden):**

- **Committen we:** dashboardstructuur met **logische mapping-keys** (of generieke voorbeeld-ID's) in `dashboard/**`, plus een generiek `dashboard/templates/entities.yaml` als voorbeeldcontract.
- **Committen we NIET:** de echte mapping. Die staat in `dashboard/templates/entities.local.yaml` (`*.local.yaml` is al `.gitignore`d).
- **Render-stap:** `scripts/render_dashboard.py` vervangt de logische keys door echte entity-ID's uit `entities.local.yaml` en levert een deploybare dashboardconfig (naar HA yaml-mode of via MCP-push naar MCP Test). De gerenderde output wordt **niet** gecommit.
- **CI-guard:** faalt bij directe echte entity-ID's/serials buiten `entities.local.yaml`.

> ⚠️ **Waarschuwing — de werkmap bevat nu al ongesaniteerde bestanden.** De POC schreef
> `dashboard/templates/decluttering_templates.yaml` (bevat **serials**, o.a.
> `sensor.sn_<serial>_battery_soc_total` in `global_navigation_badges`) en
> `dashboard/views/badkamer.yaml` (echte entity-ID's). Deze staan **niet** in Git
> (niets is gecommit), maar mogen **nooit ongeparameteriseerd** gecommit worden. Ze worden
> in PR-04 (nav-badge) resp. PR-07 (badkamer) via de mapping-laag omgezet. PR-01 committeert
> ze **niet** (zie de PR-01-spec en de scoped `git add` in §11).

> **Alternatief (simpeler, minder veilig):** maak de repo **privé**. Dan vervalt de mapping/render-laag en committen we views 1:1 met echte ID's (zoals de badkamer-POC). Dit **collapse't** PR-04, PR-05 en de parameterisatiestap in elke view-PR. Dit is **open beslispunt #1** (§10). De rest van dit plan gaat uit van het publieke, privacy-safe model.

---

## 2. Werkwijze per PR — de MCP-Test-validatielus (uit de POC geleerd)

Elke **view-migratie-PR** volgt dezelfde lus:

1. **Extractie (read-only):** haal de doelview uit het default dashboard via `ha_config_get_dashboard` (bron van waarheid). Nooit schrijven naar default.
2. **Parameteriseer:** vervang echte entity-ID's door logische keys; voeg de echte mapping toe aan `entities.local.yaml`. (Privé-modus: sla deze stap over.)
3. **Refactor:** schrijf de view als `dashboard/views/<view>.yaml`; hergebruik gedeelde templates (`room_view`, decluttering, thema).
4. **Lokale CI:** compose-validatie (`!include` lost op), `yamllint`, `prettier`, entity-ref-guard, ontbrekende-entity-rapport.
5. **Render + stage op MCP Test:** render de view en schrijf **surgical** `config['views'][i] = <view>` naar `mcp-test-dashboard` (met `BestPracticeKey` + verse `config_hash`), **na** snapshot. Verifieer `post_write_verified` en dat de overige 26 views ongewijzigd zijn.
6. **Pariteit + visueel:** vergelijk tegen default (zie parity-modi hieronder) en controleer visueel/responsief op MCP Test.
7. **PR-review → merge (squash).** MCP Test fungeert als doorlopende staging.
8. **Rollback indien nodig:** `git revert` + MCP Test herstellen uit snapshot. Default blijft onaangeroerd.

**Twee pariteitsmodi (belangrijk onderscheid):**

| Modus | Wanneer | Primair criterium (scriptbaar, deterministisch) |
| --- | --- | --- |
| **Byte-pariteit** | 1:1 lift (domeinviews die we niet herstructureren) | Gerenderde view == live default view (exacte JSON-diff) |
| **Functionele pariteit** | Getemplatiseerde refactor (kamerviews via `room_view`) | **Entity+kaarttype+actie-set-diff**: extraheer de `(entity, card_type, action)`-tuples uit de originele view én uit `template+variables`, en toets op set-gelijkheid |

**Waarom de set-diff het primaire hek is (geleerd):** `custom:decluttering-card` expandeert **alleen in de frontend** — de opgeslagen config van een getemplatiseerde kamer bevat de expander-aanroep, niet de losse kaarten. Een byte-diff tegen de originele inline-versie is dus per definitie onmogelijk. De scriptbare tuple-set-diff is deterministisch, draait zonder HA-frontend en is daarmee het betrouwbare hek voor heel M3.

**Screenshots zijn optioneel/aanvullend.** De screenshot-route vereist de beta-feature *dashboard screenshot* + engine-sidecar; die beschikbaarheid is **nog niet geverifieerd** op deze instance. Gebruik screenshots alleen als visuele bevestiging **nadat** de capability is bevestigd — nooit als het primaire pariteitshek.

De badkamer-POC gebruikte byte-pariteit (verbatim lift). Vanaf de templating (PR-07) geldt voor kamers **functionele** pariteit via de set-diff.

---

## 3. Branch-, commit- en PR-conventies + GitHub-setup

- **Branches:** `feat/pr-NN-<slug>`, `chore/pr-NN-<slug>`, `ci/pr-NN-<slug>`. Basis = `main`.
- **Commits:** Conventional Commits (`feat(views): migrate badkamer to YAML`).
- **Merge:** squash; branch auto-delete (staat aan op de repo).
- **PR-template** (`.github/PULL_REQUEST_TEMPLATE.md`): scope, gekoppelde bevinding/issue, checklist (CI groen, MCP-Test-pariteit bewezen, snapshot gemaakt, default onaangeroerd, screenshots desktop/mobiel).
- **CODEOWNERS:** `* @ju1ced`.
- **Milestones (GitHub):** `M1 Foundation` … `M8 Cutover` (zie §5).
- **Labels (aanvullend op bestaande set):** `view-migration`, `templates`, `performance`, `ci`, `mcp-test-validated`, `needs-decision`, `cutover`.

> Uit te voeren bij PR-01 (commando's staan klaar in §11; **niet** uitgevoerd tot je akkoord geeft — er wordt niets gepusht zonder expliciete opdracht).

---

## 4. CI-gates (`.github/workflows/ci.yaml`)

| Gate | Tool | Faalt bij |
| --- | --- | --- |
| YAML-lint | `yamllint` | Syntaxis/stijlfouten |
| Format | `prettier --check` | Ongeformatteerde bestanden |
| Markdown | `markdownlint-cli2` | Docs-lintfouten |
| Compose-validatie | `scripts/validate_compose.py` | `!include` lost niet op / view mist `path`/`type` |
| Entity-ref-guard | `scripts/check_entity_refs.py` | Echte entity-ID/serial buiten `entities.local.yaml` |
| Ontbrekende-entity-rapport | `scripts/check_entities.py` (read-only HA MCP) | (waarschuwing) mapping-key → onbekende entity |
| Kaart-/resource-check | `scripts/check_resources.py` | Custom card-type zonder geregistreerde resource |

**Waar draait wat:** de puur-statische gates (yamllint, prettier, markdown, compose-validatie,
entity-ref-guard) draaien in **GitHub Actions** op elke PR. De **HA-afhankelijke** gates
(`check_entities.py`, `check_resources.py`) kunnen de lokale stdio-HA-MCP **niet** vanuit
Actions bereiken — dit zijn **lokale/pre-push** gates (bv. via een pre-push hook of handmatig),
niet cloud-CI. Draad ze niet in Actions in de verwachting dat ze daar draaien.

---

## 5. Milestones & PR-overzicht

| Milestone | PR's | Doel |
| --- | --- | --- |
| **M1 — Foundation** | PR-01 … PR-04 | Repo-structuur, CI, thema, gedeelde templates + privacy/mapping-laag |
| **M2 — Tooling & baseline** | PR-05 … PR-06 | Extract/render/stage-scripts; performance-baseline op MCP Test |
| **M3 — Kamerviews** | PR-07 … PR-19 | `room_view`-template + 13 kamer-/ruimteviews (badkamer eerst als referentie, dan 12 resterende) |
| **M4 — Domeinviews** | PR-21 … PR-31 | net, valliant, hainfo, water, person, ecopower, batteries1, anycubic, zwembad, huis (+ map optioneel) |
| **M5 — Ingebedde cards** | PR-32 | EV6 (`kia-dashboard-card`) + garden (`garden-dashboard-card`) |
| **M6 — Zware bespoke views** | PR-33 … PR-36 | Home-hub + energy: eerst YAML-1:1 (met stabiel `path`), daarna optioneel custom cards |
| **M7 — Optimalisatie** | PR-37 … PR-39 | Resource-sanering, card-mod→thema-tokens, nav-badge verlichten |
| **M8 — Assemblage & cutover** | PR-40 … PR-42 | Volledige assemblage, volledige pariteit-suite, staging-dashboard, **human-gated** cutover |

Totaal ± 42 PR's. **PR-nummers zijn indicatief** (er zijn 13 kamer-/ruimteviews; de analyse noemde ~12 bij benadering). M3 loopt PR-07–PR-19 (badkamer + 12 resterende), M4 start daarna. Lichte kamers/domeinen mogen door de reviewer 2–3 per PR gebatcht worden.

---

## 6. Gedetailleerde PR-specificaties

### M1 — Foundation

**PR-01 · chore(repo): scaffolding, docs & GitHub-setup** — *geen afhankelijkheden*
- Structuur uit analyserapport §12 (`dashboard/{views,cards,templates,themes}`, `scripts/`, `docs/`, `.github/`).
- Commit de bestaande docs (`default-dashboard-analysis-and-plan.md`, `poc-badkamer-migration.md`, dit bestand), `README.md`, `ARCHITECTURE.md`, `.gitignore`, `CODEOWNERS`, `PULL_REQUEST_TEMPLATE.md`.
- GitHub milestones + labels aanmaken (§11).
- **Let op — leak-preventie (blokkerend):** de werkmap bevat nu al twee ongesaniteerde bestanden die **niet** in de eerste publieke commit mogen: `dashboard/templates/decluttering_templates.yaml` (**bevat serials**) en `dashboard/views/badkamer.yaml` (echte ID's). **Gebruik géén `git add -A`.** Commit alleen expliciet de veilige paden (docs, `README`, `ARCHITECTURE`, `.github/`, `.gitignore`, `CODEOWNERS`). De twee ongesaniteerde bestanden komen pas terug via PR-04 (nav-badge → mapping) en PR-07 (badkamer → `room_view`). Zie de scoped `git add` in §11.
- **Acceptatie:** repo-boom staat, CI-skelet draait (nog leeg), docs renderen, en `git show --stat` op de PR-commit bevat **geen** `dashboard/views/*` of ongesaniteerde templates.

**PR-02 · ci: validatiepipeline** — *na PR-01*
- `scripts/validate_compose.py` (uit de POC), `check_entity_refs.py`, `check_entities.py`, `check_resources.py`; `.github/workflows/ci.yaml`; `.yamllint.yaml`, `.prettierignore`, `.markdownlint-cli2.yaml` (naar Kia).
- **Acceptatie:** CI faalt aantoonbaar op een test-fixture met een echte entity-ref; slaagt op geldige YAML.

**PR-03 · feat(theme): `juiced-horizon` thema-tokens** — *na PR-01*
- `dashboard/themes/juiced-horizon.yaml`: semantische tokens (surface/text/brand/status, radius, shadow) met `modes: {dark, light}` (best-practice: beide modi definiëren).
- **Acceptatie:** thema laadt op MCP Test; contrast getoetst (naar Kia `contrast-validation`).

**PR-04 · feat(templates): gedeelde templates + entity-mapping-contract** — *na PR-01*
- **Parameteriseer** `global_navigation_badges`: de nav-badge verwijst nu naar **serials** (`sensor.sn_<serial>_battery_soc_total`, `..._power_charge_total`, `..._power_discharge_total`, zonnepanelen/net-sensors). Vervang deze door logische keys (bv. `energy.battery_soc`, `energy.charge_power`) en zet de echte ID's in `entities.local.yaml`. Committeer alleen de geparameteriseerde template.
- Verder: `button_card_templates.yaml` (`vacuum_service`, `vacuum_room`, `ac_charge_speed`, `soc_target`), `colors.yaml`, `icons.yaml`, `entities.yaml` (generiek voorbeeld) + `entities.local.yaml.example`.
- **Acceptatie:** compose-validatie groen; entity-ref-guard groen (**geen serials in de gecommitte template**); nav-badge rendert op MCP Test na render met de lokale mapping.

### M2 — Tooling & baseline

**PR-05 · tooling: extract/render/stage-scripts** — *na PR-02/04*
- `scripts/extract_view.py` (read-only view uit default → geparameteriseerde YAML + mapping-suggestie), `render_dashboard.py` (logische keys → echte ID's), `stage_to_mcptest.py` (snapshot → surgical `views[i]`-write met `BestPracticeKey` + verse hash → post-write pariteitscheck), `parity_setdiff.py` (de `(entity, card_type, action)`-set-diff uit §2).
- **`BestPracticeKey` roteert per uur** (server-mededeling): `stage_to_mcptest.py` haalt de sleutel **at runtime** op via `ha_get_skill_guide` en slaat hem **nooit** op. Idem: haal telkens een **verse** `config_hash` vlak vóór de write.
- **Acceptatie:** scripts reproduceren de badkamer-POC (extract → render → stage → set-diff-pariteit) end-to-end.

**PR-06 · docs(perf): baseline op MCP Test** — *na PR-05*
- Voer de meetmethode uit analyserapport §7 uit (DevTools/Lighthouse per view: scripting time, DOM-nodes, JS-payload, template-listeners) op MCP Test. Leg echte cijfers vast in `docs/performance-baseline.md`. **Geen verzonnen benchmarks.**
- **Acceptatie:** baseline vastgelegd voor minstens Home, terras, energy, serverroom + een lichte view (person).

### M3 — Kamerviews (functionele pariteit)

**PR-07 · feat(templates): `room_view` + `room_*`-templates + badkamer als referentie** — *na PR-04/05*
- Definieer `room_view`, `room_light_row`, `sensor_graph_row` (decluttering) uit het herhaalde kamerpatroon; herbouw **badkamer** hiermee (parameteriseer de POC-view). Los meteen T8 (privacy) op voor deze view.
- **Acceptatie:** getemplatiseerde badkamer heeft **functionele pariteit** met default (entity/actie-set + screenshot op MCP Test).

**PR-08 … PR-19 · feat(views): resterende 12 kamers** — *na PR-07* (per view, batchbaar)
- Volgorde (licht → zwaar, om het template vroeg te toetsen): inkomhal, logeerkamer, slaapkamer, kinderkamer, bureau, toilet & berging, woonkamer, oprit, keuken, garage, serverroom, terras.
- Elke PR: extract → parameteriseer → `room_view` → stage/pariteit op MCP Test. **Camera-views** (oprit, garage, serverroom, terras, kinderkamer) krijgen expliciet een lichte preview/sub-stream-afweging (analyserapport V4).
- **Acceptatie per view:** functionele pariteit + responsief + CI groen.

### M4 — Domeinviews (overwegend byte-pariteit, 1:1 lift)

**PR-21 … PR-30 · feat(views): domeinviews** — *na PR-05* (per view)
- net, valliant, hainfo, water, person, ecopower, batteries1, anycubic, zwembad, huis. `huis` (7× simple-thermostat) en `energy` blijven bespoke; `auto-entities`-views (batteries1, anycubic) 1:1 behouden.
- **PR-31 (optioneel):** `map`-dashboard meenemen als aparte view/dashboard.
- **Acceptatie:** byte-pariteit (of functioneel waar bewust vereenvoudigd) + CI groen.

### M5 — Ingebedde reference-cards

**PR-32 · feat(views): EV6 + garden** — *na PR-05*
- Neem de bestaande `custom:kia-dashboard-card` (EV6) en `custom:garden-dashboard-card` (garden) 1:1 over. Bewijs dat het "één-card-per-domein"-patroon werkt (het draait al in productie).
- **Acceptatie:** beide views renderen op MCP Test; cards laden uit hun HACS-resources.

### M6 — Zware bespoke views

**PR-33 · feat(views): Home-hub YAML-1:1 + stabiel `path`** — *na PR-04*
- Home (137 kaarten) 1:1 naar YAML; **ken een stabiel `path` toe** (lost fragiel `lovelace/0` op, T4); ontvlecht het hybride `sections`+`cards`+`header` (T7).
- **Acceptatie:** functionele pariteit; deeplink werkt via stabiel pad.

**PR-34 · feat(views): energy YAML-1:1** — *na PR-04* — idem voor energy (73 kaarten, zeer custom-heavy).

**PR-35 (optioneel) · feat(card): `custom:juiced-home-card`** — *na PR-33*
- Render-gated custom card (Garden-model: `hasRelevantChange`, Shadow DOM, thema-tokens, geen zware deps) voor de Home-hub. Aparte HACS-distributie (`hacs.json`, `dist/`, `node --test`).
- **Acceptatie:** unit-tests groen; pariteit met de YAML-versie; meetbare perf-winst t.o.v. baseline (PR-06).

**PR-36 (optioneel) · feat(card): energy custom card** — idem voor energy, alleen als PR-06/34 dat rechtvaardigen.

### M7 — Optimalisatie

**PR-37 · perf: resource-sanering** — *na M3/M4*
- Verifieer de kandidaat-ongebruikte resources (analyserapport T5) tegen **álle** dashboards (default, map, dashboard-test, Kia-YAML) vóór verwijdering: Bubble-Card, config-template-card, energy-flow-card-plus, energy-period-selector-plus, flower-card, pool-monitor-card, vehicle-status-card, dual_gauge, cover-icon-element, hassio-trash-card + onzekere iconensets (T6). Documenteer wat verwijderd wordt (id+url) voor rollback.
- **Acceptatie:** alleen bewezen-ongebruikte resources verwijderd; MCP Test rendert ongestoord.

**PR-38 · perf: card-mod → thema-tokens** — vervang card-mod-ingrepen (279×) stapsgewijs door `juiced-horizon`-tokens.
**PR-39 · perf: nav-badge & global-load verlichten** — evalueer de ±12-chip nav-badge en globale bundel (G1–G3).

### M8 — Assemblage & cutover

**PR-40 · feat: volledige `dashboard.yaml`-assemblage** — alle 27 views via `!include` in de composition root; volledige compose-validatie.
**PR-41 · test: volledige pariteit- & responsive-suite** — geautomatiseerde 27-view pariteitsdiff tegen default + responsive/perf-hertest tegen baseline (PR-06). Rapport in `docs/acceptance-report.md`.
**PR-42 · chore(deploy): staging-dashboard `juiced-home`** — registreer een **nieuw** yaml-mode dashboard náást default (zie §7). **Cutover van het default zelf is een aparte, expliciet goedgekeurde stap — niet in dit plan uitgevoerd.**

---

## 7. Deploy- & cutover-strategie

- **Staging (doorlopend):** render → MCP-push naar `mcp-test-dashboard` per view (PR-05-tooling). Geen HA-configwijziging nodig; volledig reversibel.
- **Productie (Git-native, naar het bestaande Kia-patroon op deze host):** de HA-instance draait yaml-mode dashboards vanuit `HomeAssistant/dashboards/<naam>/`. Deploy = `juiced-dashboard` (gerenderd met de lokale mapping) uitchecken/renderen naar `HomeAssistant/dashboards/juiced/` en registreren in `configuration.yaml` als:
  ```yaml
  lovelace:
    dashboards:
      juiced-home:
        mode: yaml
        title: Juiced
        filename: dashboards/juiced/dashboard.yaml
  ```
  Deze HA-configwijziging is **human-gated** (aparte repo/host).
- **Cutover:** pas ná acceptatie (PR-41) en expliciete goedkeuring wordt `juiced-home` de primaire/nieuwe default. Het oude default dashboard blijft als fallback bestaan; niets wordt verwijderd.

---

## 8. Definition of Done

**Per view-PR:** CI groen · MCP-Test-pariteit bewezen (byte of functioneel) · snapshot gemaakt · overige views ongewijzigd · default onaangeroerd · screenshots desktop+mobiel · reviewer akkoord.

**Per milestone:** alle PR's gemerged · geen openstaande pariteitsregressies · docs bijgewerkt.

**Project:** alle 27 views gemigreerd met functionele pariteit · baseline→hertest toont geen verslechtering (idealiter winst) · `juiced-home` staging draait · cutover-PR klaar maar **niet** uitgevoerd zonder goedkeuring.

---

## 9. Rollback & veiligheid (per laag)

| Laag | Rollback |
| --- | --- |
| Repo | `git revert <PR>` (squash-commit) op `main` |
| MCP Test | Herstel `views[i]` uit de per-view snapshot (`stage_to_mcptest.py --restore`) |
| Productie | HA-configregel terugzetten / oude default blijft ongewijzigd als fallback |
| Default dashboard | **N.v.t. — wordt nooit gewijzigd in dit plan** |

Veiligheidsregels uit de oorspronkelijke opdracht blijven gelden: schrijven alleen naar MCP Test, snapshot vooraf, geen wijziging aan automations/scripts/scenes/helpers/integrations/entities, geen secrets in Git.

---

## 10. Open beslispunten (menselijke input)

1. **Repo publiek (privacy-safe mapping/render) vs privé (1:1 met echte ID's).** Bepaalt of PR-04/05 + parameterisatie nodig zijn. *Aanbeveling: houd publiek + mapping-laag (matcht Kia/Garden).*
2. **Custom cards voor Home/energy (PR-35/36)** — bouwen of pure YAML houden? *Aanbeveling: eerst YAML-1:1; custom card alleen als PR-06-baseline het rechtvaardigt.*
3. **PR-granulariteit** — per view of gebatcht? *Aanbeveling: per view voor kamers/zware views; lichte views batchbaar.*
4. **Productie-deploy** — yaml-mode op de HA-host (Git-native, aanbevolen) vs blijven MCP-pushen naar een storage-dashboard.
5. **Mag ik nu PR-01 aanmaken** (branch + scaffolding + milestones/labels) en de eerste PR openen? Nu wordt er nog **niets** gepusht.

---

## 11. Concrete eerstvolgende stap

**PR-01 aanmaken.** Voorgestelde acties (worden pas uitgevoerd na jouw akkoord — er is nog niets gepusht):

```bash
# branch + scaffolding
git checkout -b chore/pr-01-scaffolding
# SCOPED add — NOOIT `git add -A` (voorkomt committen van de serial-bevattende
# templates/decluttering_templates.yaml en de real-ID views/badkamer.yaml):
git add docs/ README.md ARCHITECTURE.md .github/ CODEOWNERS .gitignore
git status                      # bevestig: geen dashboard/views/* of ongesaniteerde templates
git commit -m "chore(repo): scaffolding, docs and GitHub setup"
git push -u origin chore/pr-01-scaffolding

# GitHub milestones + labels
for m in "M1 Foundation" "M2 Tooling & baseline" "M3 Room views" "M4 Domain views" \
         "M5 Embedded cards" "M6 Heavy views" "M7 Optimization" "M8 Cutover"; do
  gh api repos/ju1ced/juiced-dashboard/milestones -f title="$m" >/dev/null; done
for l in view-migration templates performance ci mcp-test-validated needs-decision cutover; do
  gh label create "$l" --repo ju1ced/juiced-dashboard 2>/dev/null || true; done

# PR openen
gh pr create --repo ju1ced/juiced-dashboard --base main \
  --title "chore(repo): scaffolding, docs and GitHub setup" \
  --body "M1 · PR-01. Repo structure, docs (analysis, POC, roadmap), CI skeleton, templates for PR/CODEOWNERS."
```

Zeg welk beslispunt uit §10 je anders wilt, of geef akkoord om PR-01 te starten.
