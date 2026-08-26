# Casa-inspired dashboard roadmap

Turns the Casa research (`docs/research/casa-dashboard-analysis.md`) into a concrete,
repository-specific implementation plan for `juiced-dashboard`. **Planning only — no dashboard
changes here.** Where the repo evidence disagrees with the research assumptions, the repo wins
(as instructed).

## 1. Current-state findings

- **Git**: branch `main`, in sync with origin; last merged work is `#43` "adopt Juiced Horizon
  on all views (PR-38 rollout)". Only untracked path is `docs/research/` (the Casa report).
- **View migration + theme are done**: all 27 views are committed YAML and every view now sets
  `theme: Juiced Horizon` (dark/light, deployed to the live `/config`). Composition is in
  default view order (`dashboard/dashboard.yaml`, 27 `!include`s).
- **PR-numbering has drifted (conflict, see §2)**: the roadmap's **PR-38 = "card-mod → theme
  tokens"**, but git used the "PR-38" label for the *theme adoption* (Phase 0–3 of
  `docs/theme-rollout-plan.md`). The actual card-mod→token conversion (theme-rollout-plan
  **Phase 4**) is **not done**. It is now *unblocked* (theme is live) but is partly impossible:
  ~66% of home's `card_mod` is dynamic per-state chip colouring, not theme-styling — only the
  repeated status palette (green `rgba(67,138,94)`, red `rgba(230,118,118)`, orange
  `rgba(255,181,118)`) is a token candidate.
- **PR-37 resource-sanering is host-gated**: it deletes global Lovelace resources on the live
  `/config`, which the agent cannot reach (`/projects/HomeAssistant` is a git *mirror*; live
  config is `/config` — see project memory `ha-config-is-mirror`). The removal manifest
  (`docs/resource-removal-manifest.yaml`, ~2.1 MB, `vehicle-status-card` the only large one) is
  ready but explicitly scheduled for cutover. **It is not an autonomous "first" step.**
- **PR-35/36 (optional custom home/energy cards)**: not started; gated on a measured perf
  justification we do not yet have.
- **home.yaml is an "everything" hub, not an Overview**: one HA `section` (span 4) containing
  **344 cards, 216 logical keys, 190 `card_mod`, 44 `mushroom-chips` rows, 13 `conditional`
  cards, and 0 native `visibility:` conditions**. Rooms are grouped **Gelijkvloers / Boven /
  Buiten / Security**, each room rendered as a chip row (a compressed mirror of that room's own
  view), plus energy gauges (15), a weather card, an energy-flow card, presence, a security
  camera, waste (afvalophaling), and per-room Sonos media chips.
- **Duplication**: the 44 per-room chip rows duplicate the 13 room views (same real entities,
  different logical keys). This is the single biggest reduction opportunity.
- **Performance baseline gap**: `docs/performance-baseline.md` records the static cost
  (**~18.4 MB JS across 47 modules on every view**, `card_mod` 258× repo-wide) but the
  **runtime metrics (DOM nodes, TTI, scripting, long-tasks) are unfilled placeholders**. We have
  no measured runtime baseline to compare against — a prerequisite for the whole plan.
- **Reusable templates today** (`dashboard/templates/decluttering_templates.yaml`):
  `global_navigation_badges` (nav), `room_light_row(entity, icon, name)`,
  `sensor_graph_row(temp_entity, humidity_entity)` — fine-grained rows, no higher-level room
  composition.
- **Cross-view entity sharing is minimal**: of 28 logical-key groups, **only `energy` is used by
  more than one file** (the nav badge + `energy.yaml`); the other 27 groups are per-view. So a
  broad capability-alias layer has little to deduplicate today (§7).
- **Reference custom-card architecture** exists in sibling repos `/projects/ha-kia-connect-dashboard`
  and `/projects/garden-dashboard` (render-gated card, `dist/`, `node --test`, `hacs.json`) — the
  "Garden model" the roadmap's PR-35 refers to.

## 2. Dependency / conflict analysis

The prompt proposes: `resource cleanup → card-mod→tokens → Overview → progressive disclosure →
room_view`. **Repo evidence says this order is wrong for what we can actually execute now.**

- **Resource cleanup (PR-37) must NOT be first.** It is a global `/config` change the agent
  can't perform and is gated to cutover. It does not block any dashboard-side improvement.
  → **Defer** (owner/cutover-gated).
- **card-mod→tokens (roadmap PR-38 / theme-plan Phase 4) is not a prerequisite for the Overview.**
  It is now unblocked (theme live) but is a *styling* concern, independent of information
  architecture. It can run **in parallel** and only for the tokenizable status-palette subset.
- **Overview redesign + progressive disclosure are native, autonomous, highest-value, and depend
  on nothing.** They should go **first**. They also *reduce* the home-mirror duplication that a
  capability-alias layer would otherwise target — doing them first makes aliases largely moot.
- **room_view** is an independent template-consolidation; it can run **in parallel** with the
  Overview work (different files) but benefits from the Overview redesign being decided first
  (so room views own the detail the Overview stops mirroring).
- **Measurement must come before disclosure/overview** so gains are provable (the baseline is
  unfilled).

**Revised dependency order (challenged):**

```text
capture runtime baseline           (prerequisite, measurement only)
        ↓
progressive disclosure + Overview IA   (native, highest value, no deps)   ── parallel ──▶ room_view
        ↓                                                                    parallel ──▶ card-mod→token (status palette)
resource-sanering (PR-37)          (deferred: owner/cutover-gated)
custom overview card               (P3, only if measured to be needed)
```

**Explicit classification:**

- Before PR-37/38: **runtime baseline, progressive disclosure, Overview IA, room_view** (none
  need PR-37/38).
- After / independent of PR-38 (theme adoption, already done): **card-mod→token status palette**
  (needs the theme live — it is).
- Parallel-safe: **room_view** and **card-mod→token** (different files/concerns from Overview).
- Avoid entirely (from Casa): full custom panel, dynamic room CRUD, name-based device
  recognition, `www/` config model.

**Conflicts discovered:**

1. **PR-numbering drift** — "PR-38" now means two things (theme adoption in git vs
   card-mod→tokens in the roadmap). Recommendation: keep the roadmap PR-38 = card-mod→tokens, and
   treat the completed theme adoption as its own (theme-rollout Phase 0–3). Do **not** reuse the
   number.
2. **Research vs repo on capability aliases** — the research said "consider a small
   capability-alias layer"; repo evidence shows almost no cross-view sharing, so its value is
   marginal now (§7). Repo wins.

## 3. Home Overview content classification

Information-architecture only (no visual redesign). Current home content classified:

| Content (home.yaml) | Classification | Rationale |
|---|---|---|
| Weather card + forecast | **KEEP ON OVERVIEW** | Genuine glance value; lives only on home |
| Household presence (Thuis/Afwezig person cards) | **KEEP ON OVERVIEW** | Core "who's home" glance; controls/nav-adjacent |
| Energy summary — solar-now, grid import/export, battery SoC, peak | **KEEP ON OVERVIEW (subset)** | Energy is a real overview concern — but a few KPIs, not all 15 gauges |
| Alarm state + open doors/windows aggregate, leak/smoke | **SHOW ONLY WHEN ACTIVE/ABNORMAL** | Noise when quiet; critical when not. Keep the alarm *control* always |
| 44 per-room status chip rows (lights/motion/climate mirrors) | **SHOW ONLY WHEN ACTIVE** → otherwise **MOVE TO room views** | Duplicate the room views; show a room only when something is on/abnormal, else collapse to a nav chip |
| Full energy gauges (15) + energy-flow detail | **MOVE TO DETAIL (energy view)** / **ON DEMAND** | The `energy` view already owns this; keep only a compact summary on home |
| Per-room Sonos media chips (7 rooms × 8) | **MOVE TO DETAIL (room views)** | Media belongs in the room; heavy on the hub |
| Security camera (doorbell/driveway) | **SHOW ON DEMAND** (expander) / detail in `oprit` | Heavy image; behind expansion or in the camera room |
| Waste / afvalophaling | **SHOW ONLY WHEN NEAR COLLECTION** | Relevant a day or two around collection, noise otherwise |
| Detailed mini-graphs / apex on home | **SHOW ON DEMAND** | Trends belong behind expansion/navigation |
| Room chip rows that exactly equal the room view | **REMOVE / REDUNDANT** (once rooms are reachable) | Pure duplication of the room view |

Guiding split: **status may disappear when quiet; controls and navigation must always remain.**

## 4. Target Overview architecture

Proposed Home Overview sections (using this repo's actual entities/features):

| Section | Why on Overview | When visible | Native or card | Detail lives in |
|---|---|---|---|---|
| **Presence & household** | "who's home" at a glance | always | native (mushroom-template/tile) | `person` view |
| **Alerts / problems** (open openings, leak, smoke, alarm-not-armed, low batteries) | safety, exception-driven | **only when abnormal** | native `conditional` + `visibility` | room / security |
| **Weather** | glance value, home-only | always | native weather + forecast | (home) |
| **Energy summary** (solar now, grid ±, battery SoC, month peak) | core household KPI | always (compact) | native (few gauges/chips) | `energy` view (full) |
| **EV / charging** | only meaningful while charging | **only when charging/plugged** | native `conditional` | `car` (EV6) view |
| **Active lights/devices** ("N on" + all-off) | quick control of what's on | **only when ≥1 on** | native (aggregate) | room views |
| **Rooms quick-access** | navigation | **always** | native (nav chips / area buttons) | room views |
| **Waste** (next collection) | timely reminder | **only near collection day** | native `conditional` | — |

Everything else the current home shows moves into the already-existing room/specialist views.
Nothing here requires a custom card (§8).

## 5. Progressive disclosure rules

Native mechanisms, in preference order: per-card/section **`visibility`** (`state`,
`numeric_state`, `screen`) → **`conditional`** cards → **`expander-card`** for on-demand detail.
Prefer native `visibility:` over `card_mod { display:none }` (declarative, themeable, testable).

Concrete rules (derived from this dashboard):

```text
Room status group   → visible only when any of its lights/motion/climate is on/active
Openings group      → visible only when a door/window is open
Alerts group        → visible only when leak/smoke/alarm-abnormal/low-battery is true
EV charging detail  → visible only while charging/plugged
Waste reminder      → visible only within N days of collection
Detailed graphs     → behind expander-card / room navigation, never inline on the hub
```

**Always visible (never disclosed away):** navigation (nav badge + rooms access), the alarm
arm/disarm control, presence. **Guard against "disappearing info":** every hidden status group
must remain reachable via a stable path (the room view / specialist view), and each rule is
documented with its "where to find it when quiet" location. Disclosure hides **status**, never
**controls/navigation**.

## 6. `room_view` proposal (composable, not universal)

- **Responsibilities**: assemble a room's *common* block from room-level parameters — light
  rows (delegating to `room_light_row`), a temp/humidity graph (`sensor_graph_row`), optional
  climate (thermostat) and openings/battery status — and apply the room disclosure rule from §5.
- **Parameters (proposed)**: `name`, `icon`, `lights: [{entity,name,icon}]`,
  `temp_entity`, `humidity_entity`, `climate_entity?`, `covers?: [...]`,
  `status?: [...]` (openings/battery), `options?: {show_graph, columns, disclose}`.
- **Deliberately NOT abstracted**: cameras, media players, `mod-card` wrappers, bespoke gauges,
  and any room-specific one-offs stay **inline**. The template composes the common ~80%; the
  exotic ~20% remains explicit.
- **Special-case rooms remain possible**: a room YAML uses `room_view` for the standard block and
  appends inline cards for its extras (exactly how `inkomhal`/`bureau` keep bespoke parts today).
- **Duplication reduction**: the ~13 room views repeat the same light-row + sensor-graph +
  climate scaffolding; `room_view` centralises it — a change to room layout becomes one template
  edit.
- **Incremental migration**: build `room_view` as a decluttering template; migrate **one simple
  room first** (e.g. `logeerkamer` or `slaapkamer`) with **functional parity** verified by
  `scripts/acceptance_suite.py` (set-diff, per the M3 approach — not byte-parity, because a
  decluttering template expands only in the frontend); then roll room-by-room. No big-bang.
- **Not implemented here** (planning only); a tiny PoC is only warranted if needed to validate
  the parameter shape.

## 7. Capability-alias proposal

Repo evidence (only `energy` is cross-view) means a broad alias layer is **low value now**.
Candidates:

| Alias | Current references | Benefit | Migration cost | Recommendation |
|---|---|---|---|---|
| `energy.*` (solar_power, battery_soc, charge/discharge, grid_import, peak, charger_daily) | nav badge + `energy.yaml` (2 files) — already shared | already decouples the shared KPIs | none (exists) | **Keep; just document** in `docs/entity-mapping.md`. Already the de-facto alias. |
| `weather.*` | `home.yaml` only | none yet (single view) | low | **Defer** until weather is cross-view (e.g. a weather view or the Overview + a detail view) |
| `nav.*` | `decluttering_templates.yaml` only | already centralised | none | **Keep as-is** |
| Home-mirror shared entities (`home.X` vs `room.X` for the same real entity) | home hub + room views | would dedupe the mirror | medium (touch home + room views) | **Do NOT alias — remove the duplication at the source via the Overview redesign (§3–4)** |

**Conclusion**: do **not** build a Casa-style universal catalogue. Formalise/document the
existing `energy.*` shared keys only, and **re-evaluate after the Overview redesign** (which
removes most of the apparent cross-view duplication).

## 8. Custom-card decision criteria

**Default: native Lovelace first.** We currently **cannot** justify a custom card — the runtime
metrics that would justify it are **unmeasured** (`docs/performance-baseline.md` placeholders).

**Escalate to a custom `custom:juiced-overview-card` (Garden model) only if, AFTER** the native
Overview + progressive disclosure (Phases B–C) and with a captured baseline, the home Overview
still fails measurable targets:

- home **DOM node count** stays above target (capture baseline first; set target = a clear
  reduction vs today, e.g. ≥40% fewer than the pre-disclosure home);
- home **first-paint / TTI on mobile** above target;
- **long-tasks (ms)** on home load above target;
- the native disclosure logic needs an unmaintainable number of `conditional` cards (a
  maintainability, not just perf, trigger).

If warranted, it is a **P3 isolated benchmark**: render-gated (`hasRelevantChange`), Shadow DOM,
theme tokens, no heavy deps, `node --test`, `dist/`, `hacs.json` — benchmarked against the
native Overview and adopted **only on a measured win**. This is roadmap PR-35, kept optional/P3.

## 9. Prioritized phased roadmap

Each phase = one small, independently-reviewable branch/PR. No big-bang.

**Status (2026-08-26):** **B ✅ · C ✅ · D ✅ · E ✅ merged to `main` · F ✅ executed on the live
host** (A folded into B/C measurement). Remaining: **G** only (optional, if metrics demand it).
Cumulative: Home ~1305 → ~916 card-elements (**−29.8%**) across B+C; F unregistered ~2.1 MB of
unused resources from every dashboard.

| Phase | PR | Merge | Outcome |
| --- | --- | --- | --- |
| B — disclosure | #44 | `fef6f9e` | alerts + openings as mushroom `conditional` chips (−75) |
| C — overview/detail | #45 | `8e5b7d5` | all 10 room mirrors → name+nav+`s1` summary (−154 more) |
| E — card-mod tokens | #46 | `7a0d938` | chip palette → `var(--juiced-chip-*, <literal>)`, owner redeploy to activate |
| D — room_view PoC | #48 | `045ef08` | shared temp/hum + CO2 mini-graph block → `sensor_graph_mini` / `air_quality_mini` across slaapkamer/kinderkamer/logeerkamer |

### Phase A — Capture runtime performance baseline · **P1** · ◑ FOLDED INTO B/C

> **As shipped:** the headless DOM-node harness (`perf/collect_runtime.mjs`) proved unstable on
> the heavy `home` view (readings swung 204–5320). Switched to a consistent `shoot_view.mjs`
> card-element proxy (fixed hydrate wait) and measured before/after per slice inside B and C
> instead of a standalone baseline PR. Numbers live in `docs/performance-baseline.md`.

- **Objective**: fill the missing runtime metrics (DOM nodes, first-paint/TTI, long-tasks, JS
  heap) for `home` + 2–3 representative views, so later phases are measurable.
- **Files**: `docs/performance-baseline.md` (+ existing perf harness `scripts/perf_baseline.py`
  / Playwright). No dashboard YAML change.
- **Dependencies**: none.
- **Steps**: run the harness on mcp-test for home/energy/a room; record numbers.
- **Tests/validation**: `make validate` unaffected (docs only).
- **Performance measurement**: this *is* the measurement.
- **Rollback**: revert the doc.
- **Risk**: very low. **Benefit**: unblocks measuring every later phase.

### Phase B — Progressive disclosure: alerts/openings (native) · **P1** · ✅ DONE (PR #44, `fef6f9e`)

> **As shipped:** disclosed 12 alert + 11 opening chips by wrapping each in a mushroom
> `conditional` chip (`condition: state … "on"`) — the chip-level equivalent of native
> `visibility:` (which applies to cards, not chips). Excluded controls (garage gate) and appliance
> doors. Measured −75 card-elements (1305→1230). Curated set + measurement in
> `docs/performance-baseline.md`.

- **Objective**: on `home`, render the openings + safety-alert chips **only when open/abnormal**
  via native `visibility`, keeping all controls/nav always visible.
- **Files**: `dashboard/views/home.yaml`.
- **Dependencies**: Phase A (to measure the DOM reduction).
- **Steps**: wrap the openings + leak/smoke/alarm-abnormal groups in `visibility` state
  conditions; keep the alarm control unconditional; document the "where to find it" path.
- **Tests/validation**: `scripts/acceptance_suite.py` (functional parity — info still reachable);
  guards + pytest; mcp-test render, 0 error-cards.
- **Performance measurement**: home DOM nodes + first-paint before/after.
- **Rollback**: revert home.yaml (single file).
- **Risk**: low (native, reversible). **Benefit**: proves the pattern + first DOM reduction.

### Phase C — Overview IA: collapse room mirrors to active-only + rooms nav · **P1** · ✅ DONE (PR #45, `8e5b7d5`)

> **As shipped:** chose **structural overview/detail** over state-conditional "active-only" —
> a motion-chip test showed state-conditional disclosure only helps stably-off states (motion is
> often on, so it read flat and was reverted). Each of the 10 room button-cards already navigates
> to its view and carries an `s1` summary (temp/humidity/CO₂); collapse = keep name+navigate+`s1`,
> drop the control-chip fields that duplicate the room view. Live home-only entities (keuken fridge
> controls, bureau tv-backlight) relocated into their views first; 8 stale refs swept out. Home
> ~1230→~916 (−29.8% cumulative). Verified parity per room via `ha_get_state` + structural check.

- **Objective**: turn the home hub into a curated Overview — per-room chip rows show only when
  active; otherwise the room is a nav chip; move full room content to the (existing) room views.
- **Files**: `dashboard/views/home.yaml` (room views already own the detail).
- **Dependencies**: Phases A–B.
- **Steps**: apply the §4 section set; add a rooms quick-access strip; remove redundant mirrors.
- **Tests/validation**: acceptance parity (all info reachable via nav), mcp-test dark/light
  screenshots, 0 error-cards.
- **Performance measurement**: home DOM/first-paint vs baseline (target: major reduction).
- **Rollback**: revert home.yaml.
- **Risk**: medium (UX — validate nothing important vanished). **Benefit**: the core Casa lesson,
  biggest UX + perf win.

### Phase D — `room_view` template + PoC migration · **P2** · ✅ DONE (PR #48, `045ef08`)

> **As shipped:** the "universal `room_view`" premise does **not** hold — the room views are 1:1
> lifts and non-uniform (lights, climate and opening/battery grids are idiosyncratic per room), and
> only `inkomhal` ever used the sub-templates. The single reliably-shared shard is the
> temp/humidity and CO2 **mini-graph** block, proven byte-identical (entity-agnostic) across
> slaapkamer/kinderkamer/
> logeerkamer. So D = two verbatim templates (`sensor_graph_mini`, `air_quality_mini`; kept separate
> from the apexcharts `sensor_graph_row` inkomhal uses) + migrate those 3 rooms. Verified offline
> (`substitute(template, keys)` == the room's block) + frontend (0 error cards; +4 typed elems/room =
> decluttering-card wrappers). Pure dedup, not a perf win. **Note:** `decluttering_templates` are
> dashboard-level, so single-view staging must register them first (`build/set_declutter.mjs`).

- **Objective**: introduce a composable `room_view` decluttering template; migrate one simple
  room as PoC.
- **Files**: `dashboard/templates/decluttering_templates.yaml`, one room view.
- **Dependencies**: Overview IA decided (so room views own the detail); otherwise independent.
- **Tests/validation**: `scripts/acceptance_suite.py` set-diff parity for the migrated room.
- **Performance measurement**: n/a (structural); confirm no card-count change.
- **Rollback**: revert the room + template.
- **Risk**: low–medium. **Benefit**: less YAML duplication, easier future room changes.

### Phase E — card-mod → theme-token status palette · **P2** (parallel, independent) · ✅ DONE (PR #46, `7a0d938`)

> **As shipped:** did a **zero-regression indirection** rather than the palette *change* sketched
> below. Added 3 mode-independent tokens (`--juiced-chip-ok/-alert/-active`) = the exact current
> rgba values, and rewrote 73 literals to `var(--juiced-chip-*, <same literal>)` (literal kept as
> CSS fallback). No visual/perf change until the owner redeploys `juiced-horizon.yaml` to
> `/config`; a later deliberate recolour (e.g. onto `juiced-status-*` via `color-mix`) is then a
> theme-only edit. See theme-rollout-plan Phase 4.

- **Objective**: unify the 3 hardcoded chip status colours to `var(--juiced-status-*)` via
  `color-mix` (theme-rollout Phase 4 / roadmap PR-38 proper). Dynamic state-logic stays.
- **Files**: view YAMLs (home + rooms).
- **Dependencies**: theme live (done). Independent of A–D.
- **Tests/validation**: guards + pytest; dark/light mcp-test review (deliberate palette change).
- **Performance measurement**: card_mod count reduction (informational).
- **Rollback**: revert view files.
- **Risk**: low (visual, reviewed). **Benefit**: theme-consistent chips; small card_mod cleanup.

### Phase F — resource-sanering (PR-37) · **P3** · ✅ DONE (executed 2026-08-26, live host)

> **As executed:** with the owner present and explicitly authorizing the one live global write
> (the exception to the "writes only to mcp-test" rule), the 10 manifest resources were re-verified
> (0 refs across all **6** live dashboards — incl. the new `home-dashboard`; IDs still valid; `tc:`
> 0 entity-icon overrides; `kuf:`/`phu:` icon sets kept) and deleted from the registry: **53 → 43
> resources, ~2.1 MB** off every dashboard. Reversible — the `/hacsfiles/` files are untouched;
> rollback via HACS or `ha_config_set_dashboard_resource(url=…, module)` (URLs in the manifest).

- Was: global `/config` resource deletion, gated on owner approval at cutover, using
  `docs/resource-removal-manifest.yaml`. Rollback via HACS.

### Phase G — custom overview card benchmark · **P3 (only if measured needed)**

- Only if Phase A–C metrics miss targets. Isolated Garden-model card + benchmark. Optional.

## 10. Recommended next task

```text
NEXT TASK
  Phase B (first, minimal): add native progressive-disclosure to ONE group on home.yaml —
  render the openings + safety-alert chips only when open/abnormal — plus capture the home
  DOM-node + first-paint baseline (folds in the essential part of Phase A for this view).

Why this first
  It is the smallest change that (a) establishes the reusable disclosure pattern, (b) produces
  the first measured before/after, and (c) is low-risk and fully reversible (one file, native
  visibility, controls stay). It needs nothing from the gated PR-37/38 work.

Exact scope
  On dashboard/views/home.yaml ONLY: wrap the per-room "openings" (door/window) chips and the
  safety-alert chips (leak / smoke / alarm-not-armed) in native `visibility:` state conditions so
  they render only when open/abnormal. Keep the alarm arm/disarm control and all navigation
  ALWAYS visible. Change nothing else on the hub (rooms, energy, weather, presence untouched).

Files allowed to change
  dashboard/views/home.yaml
  docs/performance-baseline.md   (record the before/after numbers only)

Files that must NOT change
  any other dashboard/views/*.yaml, dashboard/templates/*, dashboard/dashboard.yaml,
  dashboard/themes/*, scripts/*, entities.example.yaml, any other doc.

Acceptance criteria
  - When a door/window is open OR an alert is abnormal, that chip is shown (parity with today).
  - When all are closed/normal, the group is hidden.
  - Alarm control + navigation remain visible in all states.
  - scripts/acceptance_suite.py: the ONLY diffs vs default are the added visibility conditions.
  - mcp-test render: 0 error-cards, 0 unresolved placeholders, dark + light OK.

Tests to run
  python scripts/check_entity_refs.py && python scripts/validate_compose.py &&
  python scripts/check_entities.py --mapping dashboard/templates/entities.example.yaml &&
  python scripts/check_resources.py && python scripts/render_dashboard.py --self-test &&
  python -m pytest -q  ; then stage home to mcp-test[0] and screenshot dark+light.

Measurements to capture
  home DOM node count and first-paint/TTI, all-quiet vs one-open, before vs after — into
  docs/performance-baseline.md.
```

## 11. Ready-to-run follow-up Claude Code prompt

Paste this to execute Phase B (scope-locked):

```text
Work in /projects/juiced-dashboard. Follow all applicable CLAUDE.md rules (writes only to
mcp-test-dashboard, snapshot before staging, never touch the default dashboard, no commit/push
without explicit permission).

TASK: Add native progressive disclosure to ONE group on the Home hub, and measure it.

Do ONLY this:
1. In dashboard/views/home.yaml, wrap (a) the per-room openings chips (doors/windows) and
   (b) the safety-alert chips (water-leak, smoke, "alarm not armed") in native Lovelace
   `visibility:` state conditions so each is rendered ONLY when it is open / abnormal.
   - Keep the alarm arm/disarm control and ALL navigation ALWAYS visible.
   - Do not use card_mod display:none — use native `visibility:`.
   - Change nothing else on the hub (rooms/energy/weather/presence untouched).
2. Validate: run check_entity_refs, validate_compose, check_entities
   (--mapping dashboard/templates/entities.example.yaml), check_resources,
   render_dashboard --self-test, and pytest -q. Then render home with the local mapping,
   stage it surgically to mcp-test-dashboard index 0 (snapshot first; verify the other 26 views
   are byte-identical and view 0 == the rendered file), and screenshot dark + light.
3. Verify with scripts/acceptance_suite.py that the ONLY diffs of home vs the default view are
   the added visibility conditions (no other content change).
4. Measure home DOM node count and first-paint in two states (all openings closed/normal vs one
   open) before and after the change, and record the numbers in docs/performance-baseline.md.

HARD CONSTRAINTS:
- Files you may modify: dashboard/views/home.yaml and docs/performance-baseline.md ONLY.
- Do NOT modify any other view, any template, dashboard.yaml, the theme, scripts, or the example
  mapping. Do NOT introduce a custom card, a new framework, or card_mod. Do NOT touch the default
  dashboard. Do NOT commit or push.
- If a hidden status group would become unreachable, STOP and report instead — status may hide
  when quiet, but it must always remain reachable via an existing room/specialist view.

Report: the before/after DOM numbers, the acceptance-suite diff for home, the two screenshots'
paths, and the exact home.yaml changes. Then stop for review.
```
