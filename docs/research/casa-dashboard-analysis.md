# Casa Dashboard — architecture study for Juiced Dashboard

Research and architectural comparison of **Casa Dashboard Community** as an external
reference, to inform future `juiced-dashboard` work. This is analysis only — no dashboard
changes were made (see roadmap; Casa was **not** vendored into this repo).

## 1. Executive summary

Casa Dashboard Community is an **app-like Home Assistant custom panel** (a single web
component served by a HA integration) that deliberately abandons Lovelace. It is portable
across installations because it ships a **fixed catalogue of ~173 logical entity keys** that
the user maps to their real `entity_id`s, plus **user-defined "dynamic rooms"**, both edited
from an **in-dashboard configurator** and persisted to a JSON file in `www/`. Its two
strongest ideas are **progressive disclosure** (unconfigured/irrelevant sections are hidden)
and **capability→entity mapping**. Its weakest traits are the **frontend shipped as 19
`.part*.txt` fragments reassembled in the browser** (unmaintainable, untestable, unreviewable),
**no tests**, **hard-coded structure/localization**, and a handful of code-quality smells.

For Juiced Dashboard the verdict is: **stay on Lovelace/YAML, evolve toward a hybrid** (a few
render-gated custom cards where they pay off, as with our Kia/Garden cards) and **adopt Casa's
UX/abstraction ideas natively**, but **do not become a full custom panel** and **do not copy
the monolithic frontend pattern**. Juiced already owns Casa's best structural idea (a logical
entity-mapping layer) in a more maintainable form (`entities.local.yaml` + render-time
substitution, versioned in git and byte-parity tested).

## 2. Repository / version analysed

- Repository: <https://github.com/fabiovit/casa-dashboard>
- Commit analysed: `c1d81fe40bdac7f65b63926ca2e141ff589421e6`
- Version: **2.1.2** (`custom_components/casa_dashboard_community/manifest.json`); README badge v2.1.2
- Analysis date: 2026-08-19
- License: **MIT**, © 2026 Fabio Vittori (`LICENSE`) — permissive; learning/reimplementing
  concepts is unrestricted, actual code/asset copying requires the MIT notice + attribution
- HA minimum: `2025.1.0` (`hacs.json`); integration `iot_class: local_push`
- CI: `.github/workflows/hacs.yml` (HACS validation) + `hassfest.yml` (HA manifest lint). **No
  unit/frontend tests in the repo.**

## 3. Casa architecture (overview)

Casa is a **HA custom integration that registers a custom sidebar panel**. There is almost no
"backend logic": the Python side only (a) registers the panel + a static file route, (b)
seeds/merges a user-editable entity-map JSON, and (c) exposes two WebSocket commands to
read/write that JSON. Everything else — layout, rooms, device visuals, state rendering,
navigation, configurator UI, i18n — lives in a **single ~418 KB vanilla-JS web component**
delivered as 19 text fragments.

```text
HA integration (Python, ~10 KB)
├── registers panel_custom  → sidebar entry "Casa Community"
├── serves  /casa-dashboard-community-static/  (frontend dir)
├── seeds/merges  /config/www/casa-dashboard-community-entities.json
└── WS: casa_dashboard_community/config/get | /config/save   (@require_admin)

Browser (single web component, vanilla JS)
├── loader .js  → fetch 19 × .part*.txt → concat → Blob → import()
├── class CasaDashboardPanel extends HTMLElement (Shadow DOM)
├── reads full `hass`, fetches the www JSON, renders innerHTML
└── in-dashboard Configurator (search entities, assign, rooms) → WS save
```

## 4. Backend architecture

Files: `custom_components/casa_dashboard_community/{__init__.py, websocket_api.py,
config_flow.py, const.py, manifest.json}`.

- **Panel registration** (`__init__.py::async_setup_entry`): `panel_custom.async_register_panel(
  webcomponent_name="casa-dashboard-community-panel",
  module_url="…/casa-dashboard-community-panel.js?v={VERSION}", require_admin=False)`. The panel
  is removed+re-registered on each setup; a `handle_safe_area` kwarg is added conditionally for
  forward/backward HA compat (a nice defensive touch).
- **Static serving**: `hass.http.async_register_static_paths([StaticPathConfig(STATIC_URL,
  frontend_dir, False)])` → the 19 parts are served from `/casa-dashboard-community-static/`.
- **Config seeding & additive merge** (`__init__.py::_ensure_entity_config`): copies
  `casa-dashboard-community-entities.example.json` to
  `<config>/www/casa-dashboard-community-entities.json` on first run; on upgrade it **adds new
  template keys without overwriting existing user values**, and writes atomically
  (`.tmp` + `os.replace`). This is a genuinely careful migration strategy.
- **WebSocket API** (`websocket_api.py`): `casa_dashboard_community/config/get` and
  `/config/save`, both `@websocket_api.require_admin` + `@async_response`, running file I/O in
  an executor. Save validates the `rooms` payload (id/name/type/icon/entities/entity_labels),
  filters labels to known entities, and writes atomically. Returns `configured`/`total` counts.
- **Config flow** (`config_flow.py`): trivial single-instance (`_abort_if_unique_id_configured`),
  no options flow.

**Persistence & security implications.** Configuration lives at
`/config/www/casa-dashboard-community-entities.json`, i.e. under `www/`, which HA serves
publicly at `/local/…`. The frontend even fetches it directly:
`const ENTITY_CONFIG_URL = "/local/casa-dashboard-community-entities.json"`. Writes are
admin-only and atomic (safe), **but the file is world-readable** to anyone who can reach the HA
URL — it exposes the user's entity IDs and room structure (not secrets, but an information leak
of the home's topology). Writes are safe against races (tmp+replace); reads tolerate malformed
JSON by falling back to `{}`.

**Smell — version drift.** `__init__.py` hard-codes `VERSION = "1.1.4"` while manifest, README
and the loader are `2.1.2`. Because the panel's `module_url` cache-buster is `?v={VERSION}`,
the browser can serve a **stale cached loader** after an update. Concrete, low-effort bug.

## 5. Frontend architecture

- **Delivery**: `frontend/casa-dashboard-community-panel.js` is a 564-byte **loader** that
  `fetch`es `part0..18.txt` (`{cache:"no-store"}`), joins them, makes a `Blob`, and
  `import()`s it. The 19 `.part*.txt` are ~22 KB each; reassembled ≈ **418 KB, ~3600 lines**.
  The parts are **split mid-statement**, so each is invalid JS alone — only the concatenation
  runs. This is build/publish output treated as source.
- **Framework**: **none**. 0 ESM imports, 0 Lit/lit-html, 0 React. One class
  `CasaDashboardPanel extends HTMLElement` (single `customElements.define`), Shadow DOM
  (`attachShadow`, 22 `shadowRoot` refs).
- **Rendering**: **string templates → `innerHTML`** (≈815 `${…}` interpolations, 8 `innerHTML =`,
  48 `render*(` methods). No virtual DOM / diffing. Re-render rebuilds HTML chunks.
- **State model**: the panel receives the whole `hass` object from HA (custom-panel contract);
  it does **not** use `subscribeEntities`/`subscribeMessage`. Instead `set hass(value)` stores
  it and, crucially, only schedules a render when a **fingerprint of the *configured* entities**
  changes:

  ```js
  set hass(value){ this._hass=value; this._syncOptimistic();
    if(!this._rendered) this._renderShell(); this._loadEntityConfig();
    // HA publishes many hass updates unrelated to this dashboard. … render only when one of
    // the configured entities has actually changed.
    if(!this._entityConfigLoaded || this._stateFingerprint()!==this._lastStateFingerprint)
      this._scheduleRender(); }
  ```

  `_scheduleRender` is `requestAnimationFrame`-batched (4 rAF refs). Optimistic UI is applied
  before HA confirms (`_syncOptimistic`).
- **Services / WS**: `callService` (8), `callWS` (3, the two config commands). `localStorage`
  (4) for client state (selected language, active nav/tab).
- **i18n**: an in-bundle **EN/IT** dictionary; the selected language is stored per browser.
  Defaults are Italian (the hard-coded `NAV` labels are Italian). Only two languages, embedded
  in the bundle.
- **Hard-coded structure**: top-level consts `NAV`, `LIGHTS`, `OPENINGS`, `ROOM_META`,
  `ENTITY_KEYS`, `ENTITY_CONFIG_URL`. The section catalogue and the ~173 logical keys are
  baked into the JS; user "rooms" are layered on top.

### Why the split-file pattern is a problem (and what we should avoid)

The 19 `.part*.txt` fragments mean: you cannot lint, type-check, unit-test, or meaningfully
diff/review the frontend; a PR touching it is opaque; debugging maps to a runtime-assembled
Blob URL, not a file. It is almost certainly a workaround (single-file size / hosting / editor
constraints), but it makes the largest and most complex part of the project the least
maintainable. **Juiced must not adopt this.** Our YAML-in-git is the opposite (reviewable,
diffable, linted, byte-parity tested); if we ever build custom cards we keep them as real
source + a `dist/` build with tests (the Kia/Garden model), never split text.

## 6. Entity / configuration model

- Schema (`…entities.example.json`, and the live `/config/www/…json`):

  ```json
  { "_description": "...", "_author": "...", "_support": "...",
    "entities": { "sensor.solar_pv_power": "", "light.kitchen_main": "", … 173 keys },
    "rooms": [] }
  ```

- The **keys are Casa's canonical logical names** (themselves in `domain.name` shape) and are
  **fixed** ("le chiavi a sinistra non vanno cambiate"). The **value is the user's real
  `entity_id`**. Empty value ⇒ "Non configurato" ⇒ that function is hidden and its controls
  disabled. `examples/ENTITY_MAP.md` documents the 173 keys grouped by area (Security, Lights,
  Kitchen, Bathroom, Bedroom, Garage, Solar, Wallbox, Weather station, Robot vacuum, …).
- This is exactly the **capability → mapping → entity** indirection:

  ```text
  sensor.solar_pv_power   (logical capability, fixed catalogue)
      ↓  www JSON mapping
  sensor.my_inverter_pv_total   (this user's real entity)
  ```

- **Comparison with Juiced.** We already have this abstraction, in a stronger form:
  `<<group.key>>` placeholders in committed YAML resolved at render time from the git-ignored
  `dashboard/templates/entities.local.yaml` (≈1242 keys across 28 groups). Differences that
  matter:

  | | Casa | Juiced |
  |---|---|---|
  | Key origin | **top-down** universal catalogue (~173 keys the author defined for a "standard home") | **bottom-up**, extracted from our actual dashboard (`scripts/extract_view.py`) |
  | Storage | `www/…json` (public, in-dashboard editable) | `entities.local.yaml` (git-ignored, versioned locally, never committed) |
  | Resolution | frontend reads JSON at runtime | `scripts/render_dashboard.py` substitutes at render/deploy time |
  | Verification | none | byte-parity round-trip + `check_entities.py` guard + acceptance suite |
  | Goal | make one dashboard reusable across homes | make one home's dashboard portable + privacy-safe on a public repo |

  Casa's model is optimised for **distribution** (any home fills in the catalogue and gets the
  same UI). Ours is optimised for **one bespoke home, reviewed in git**. Casa validates our
  choice to keep an indirection layer; it does not argue for replacing ours.

## 7. Room model (dynamic rooms)

Casa V2 stores user rooms in `rooms: [{ id, name, type, icon, entities[], entity_labels{} }]`,
edited from the configurator: create / rename / reorder / choose type (Kitchen, Bathroom,
Bedroom, Living, Office, Laundry, Basement, Garage, Balcony, Outdoor, Stairs, Entrance, Hallway,
Generic) / choose icon / assign multiple entities / multiple rooms of a type. On first run,
existing catalogue mappings seed compatible rooms; afterwards "Rooms" is the source of truth.

This is powerful **as a distribution feature** (each installer models their own house without
touching code). For a **single, known house like ours it is over-engineered**: we already know
our rooms at author time. The relevant question the prompt poses — *do we need dynamic rooms or
a better room component?* — resolves firmly to **a better room component**. We already have the
seed of that (`room_light_row`, `sensor_graph_row` decluttering sub-templates); the lesson is to
strengthen a **`room_view` template**, not build runtime room CRUD.

## 8. Device recognition

Casa chooses an icon/visual from six signals, in priority order (README + code): (1) custom
display name, (2) HA `friendly_name`, (3) recognized function, (4) HA `icon`, (5) `device_class`,
(6) entity `domain`. In the bundle this is string/prefix matching (`device_class` 9,
`friendly_name` 11, `.attributes` 17, `startsWith(` 21, `entity_id.split(".")` 9) against a
large category list (air fryer, Thermomix, oven, dishwasher, robot mower, wallbox, inverter…).

Assessment: it is a **convenience heuristic for a generic product** — necessary because Casa
cannot know what a user's `switch.plug_3` really is. It is inherently **fragile**: name-based
matching is locale-sensitive (IT/EN), risks false positives ("a smart plug shows as *Air Fryer*
if named so"), and carries ongoing maintenance of the category table. **Juiced does not need
any of this**: we map specific entities to specific cards by hand, deterministically. If we ever
want light auto-classification, prefer a tiny deterministic layer keyed on `domain` +
`device_class` only — never on friendly-name strings.

## 9. Navigation / information architecture

Casa uses **app-like navigation**: a fixed `NAV` (Overview + section/room tabs) inside one
panel, plus (V2) an **Overview that deliberately does not duplicate the room list** — it
surfaces active states, key temperatures, weather, solar/battery, wallbox/EV, and **hides
sections with no configured entities**. Rooms are the control context; specialist info
(energy/EV/weather) is separated.

Juiced's IA today: a Lovelace multi-view dashboard (27 views, composition root), navigation via
the shared **mushroom-chips nav-badge** on every view + the HA sidebar; the **home hub mixes an
overview with per-room chips**, and every view tends to **show everything**. Casa's
Overview/Rooms/Specialist separation is a useful lens: our home hub could become a leaner true
**Overview** (KPIs + active/abnormal states + weather + energy), with room detail reached by
navigation, reducing duplication and first-paint weight.

## 10. Performance

Casa's relevant lessons (from code, not marketing):

1. **One lightweight bundle** (~418 KB, single component) vs a large Lovelace resource set. Our
   default install measured ≈**18.4 MB** of frontend resources with **51 global resources** and
   **card-mod applied ~279×** (`docs/default-dashboard-analysis-and-plan.md`, findings G1/G2).
   Casa's initial load is far lighter. This reinforces our own **resource-sanering (PR-37)** and
   **card-mod → theme-tokens (PR-38, now underway)** work as the real shared wins.
2. **Fingerprint-gated re-render**: despite receiving every `hass` update, Casa only re-renders
   when a *configured* entity's state fingerprint changes, and batches with rAF. It explicitly
   avoids rebuilding on irrelevant updates.
3. **Progressive disclosure** keeps the DOM small — unconfigured sections are never rendered.

What **not** to copy: `innerHTML` rebuilds are coarse; Lovelace's per-card reactivity is finer
if the card/resource overhead is controlled. The right reading is: our performance problem is
**global bundle + card-mod + rendering everything**, not the Lovelace model itself. Progressive
disclosure + resource sanering + theme tokens address it without a rewrite.

## 11. UX analysis

Casa's UX philosophy distilled: **app-like not admin-like; overview first; rooms as context;
recognizable device visuals; hide irrelevant info; controls next to status; responsive;
progressive detail.** The interpretation for *our* home: keep our own visual identity (Juiced
Horizon), but bias toward **"show important by default, details on demand, nothing irrelevant."**
Our dashboard should not be made to look like Casa; the transferable value is the *principles*,
above all progressive disclosure and overview/detail separation.

## 12. What Casa does well

| # | Concept | Why it's good | How Casa does it | Benefit | Relevance to us | Difficulty here | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | **Progressive disclosure** | Less noise, faster, focuses attention | 169 configured-checks + 84 hide rules; empty catalogue keys & empty sections hidden | UX + perf | **High** | Low–med (native visibility/conditional cards) | **Adopt** |
| 2 | **Capability→entity mapping** | Decouples UI from entity IDs; portable; rename-safe | fixed 173-key catalogue in JSON, user fills real IDs | Architecture | High (we already have it) | Done differently already | **Adapt** |
| 3 | **Overview vs Rooms vs Specialist** | Clear IA, no duplication | V2 Overview curates KPIs; rooms separate | UX | Med–high | Med (restructure home hub) | **Adapt** |
| 4 | **Single lightweight frontend payload** | Light initial load | one bundle, few requests | Perf | Med (as a goal, not a method) | via resource sanering | **Study/Adapt** |
| 5 | **Fingerprint-gated, rAF-batched re-render** | Avoids needless work/flicker | `_stateFingerprint()` of configured entities | Perf | Low (Lovelace already granular) | n/a | **Study** |
| 6 | **Careful additive config migration** | No data loss on upgrade | additive key merge + atomic write | Robustness | Low (git handles ours) | n/a | **Study** |
| 7 | **In-dashboard configurator** | No YAML for end users | entity search by name/id/custom name → WS save | UX (distribution) | Low for us | High | **Ignore (for now)** |
| 8 | **Empty-state behaviour** | Graceful when nothing configured | "Non configurato", disabled controls | UX | Med | Low | **Adopt** |

## 13. What Casa does poorly

For each: evidence → consequence → does the same risk exist in Juiced → what we do differently.

1. **Frontend shipped as 19 `.part*.txt` fragments.** Evidence: `frontend/…part0..18.txt`
   reassembled by the loader; split mid-statement. Consequence: unlintable, untestable,
   unreviewable, opaque diffs, Blob-URL debugging. Juiced risk: **none today** (YAML in git);
   would appear only if we built a custom panel the same way. Do differently: proper source +
   `dist/` build + tests if we ever ship JS.
2. **No tests.** Evidence: no `tests/`; CI is only HACS + hassfest (manifest validation).
   Consequence: refactors and HA-frontend-API changes are unguarded. Juiced risk: **lower** — we
   run yamllint/prettier/markdownlint/compose/entity-ref-guard + 27 pytest + an acceptance
   parity suite. Keep and extend that.
3. **Public config file** at `/config/www/…json` (`/local/…`). Evidence:
   `ENTITY_CONFIG_URL="/local/…"`. Consequence: home topology (entity IDs, room names) is
   world-readable. Juiced risk: **avoided** — our mapping is git-ignored and never web-served;
   committed YAML uses placeholders. Do differently: never put mapping in `www/`.
4. **Hard-coded structure + IT-first, 2-language i18n baked into the bundle.** Evidence: Italian
   `NAV`, `ROOM_META`, `ENTITY_KEYS` consts; EN/IT dict only. Consequence: not truly generic;
   adding a language or section means editing the monolith. Juiced risk: n/a (single home, own
   language) but a reminder to keep structure data-driven where cheap.
5. **Dual V1+V2 implementations in one bundle.** Evidence: README/RELEASE_NOTES_v2.0.0 ship both
   "Classic" and "Dynamic"; both live in the 418 KB bundle. Consequence: duplicated surface,
   larger payload, more to maintain. Juiced risk: watch for parallel old/new implementations
   during migrations — we delete the old inline view when a templated one lands.
6. **Listener lifecycle**: `addEventListener` 13, `removeEventListener` 0. Consequence: potential
   leaks as sub-nodes are re-created on `innerHTML` rebuilds. Juiced risk: n/a (no bespoke JS).
7. **Version drift** `1.1.4` vs `2.1.2` breaking the cache-buster (see §4). Consequence: stale
   frontend after update. Juiced risk: low; we version via git + CI.
8. **Committed build artifacts** (`__pycache__/*.pyc`). Minor hygiene smell.

## 14. Comparison with Juiced Dashboard

| Area | Casa Dashboard | Juiced Dashboard today | Casa advantage | Juiced advantage | Recommendation |
|---|---|---|---|---|---|
| Architecture | Custom HA panel (integration + web component) | Native Lovelace YAML, composition root + `!include` | app-like shell | reviewable in git, native stability | Keep Lovelace; go hybrid only where it pays |
| Frontend stack | Vanilla JS, Shadow DOM, innerHTML | HA/Lovelace + HACS cards + Juiced Horizon theme | one light bundle | no bespoke JS to maintain | Prefer native; small custom cards only |
| HA integration | `panel_custom` + 2 WS commands | Storage/YAML dashboards + MCP/websocket tooling | app control | uses stable HA surfaces | Keep native surfaces |
| Navigation | In-panel app NAV + Overview | mushroom-chips nav-badge + sidebar + 27 views | app-like feel | deep-linkable stable paths | Borrow overview/detail IA, keep Lovelace nav |
| Reusable components | JS render methods in one class | decluttering templates (`room_light_row`, `sensor_graph_row`, nav) | — | git-diffable, testable | Strengthen `room_view` template |
| Entity references | logical catalogue → real id (JSON) | `<<group.key>>` → real id (`entities.local.yaml`) | in-dashboard editable | versioned, byte-parity tested, privacy-safe | Keep ours; consider small capability aliases |
| Entity abstraction | top-down universal (173) | bottom-up extracted (~1242) | portability | fidelity + privacy | Adapt, don't replace |
| Room abstraction | dynamic user rooms | authored per-view + templates | flexibility | simplicity | Better component, not dynamic CRUD |
| Device recognition | 6-signal heuristic | explicit per-entity mapping | zero-config | deterministic | Reject heuristics |
| Overview | curated V2 Overview, hides empties | home hub shows most things | focus | completeness | Adapt toward curated overview |
| Specialist pages | separated | separate views (energy/net/EV/garden…) | — | already modular | Keep |
| Configuration | in-dashboard configurator | git YAML + mapping + render/stage | end-user friendly | reviewed, reproducible | Keep git model |
| Performance | ~418 KB bundle, fingerprint re-render | 18.4 MB resources, 279× card-mod, lazy views | lighter load | granular reactivity | Do G1/G2 (already planned) + disclosure |
| Responsive | adaptive menus/layout | sections views + viewport verification | app-like | native responsive grid | Keep native |
| Styling/theming | in-JS CSS in Shadow DOM | Juiced Horizon theme tokens (dark/light) | encapsulated | central tokens, OS dark/light | Keep theme; finish card-mod→tokens |
| Mobile | designed for it | verified desktop+mobile | app feel | native | Keep + apply disclosure |
| State management | full `hass` + fingerprint | per-card HA subscriptions | simple | granular | Keep native |
| Maintainability | monolithic split JS, no tests | small YAML files + CI + parity suite | — | **strong** | Preserve our advantage |
| Testability | none | guards + pytest + acceptance | — | **strong** | Extend |
| HACS distribution | integration (turnkey) | not distributed (bespoke) | turnkey | not a goal now | Only matters if we distribute |
| Migrations | additive JSON merge | git history + acceptance parity | in-place | auditable | Keep git |
| Extensibility | edit the monolith | add a view / template / card | — | modular | Keep |

## 15. Concepts worth adopting

- **Progressive disclosure** — hide unconfigured/irrelevant/all-quiet sections; details on
  demand. Native Lovelace: `conditional` cards, per-card/section `visibility` conditions,
  `expander-card`/subviews. We already use `restriction`/`conditional`/`expander` cards in some
  rooms — generalise the pattern.
- **Overview/detail separation** — make the home hub a curated overview (active/abnormal states,
  weather, energy, EV) rather than a full mirror of everything.
- **Empty-state behaviour** — explicit "not configured/quiet" states instead of dead controls.

## 16. Concepts worth adapting

- **Capability alias layer** — for cross-cutting/global values (already partly done: the nav
  badge uses `energy.solar_power`, `energy.battery_soc`, etc.). Consider a small, curated set of
  stable capability keys for the values that appear in multiple views, to reduce coupling and
  make entity renames a one-line change. Do **not** build a 173-key universal catalogue.
- **A real `room_view` component** — consolidate `room_light_row` + `sensor_graph_row` into a
  higher-level room template so rooms are one declarative block, not repeated inline card trees.

## 17. Concepts we should reject

- **Becoming a full custom panel** (loses git-reviewability, byte-parity, native stability,
  theme tokens; couples us to the HA frontend internals).
- **The 19-part split-file frontend** (unmaintainable).
- **Dynamic user-created rooms / in-dashboard configurator** (over-engineered for one known
  home; git-YAML is better for us).
- **Friendly-name string device recognition** (fragile heuristics; we map entities explicitly).
- **Public `www/` config file** (topology leak; conflicts with our privacy model).

## 18. Quick wins (P1–P2)

- **Progressive disclosure on the home hub / rooms** — wrap sections in `conditional`/visibility
  so unconfigured or all-quiet groups collapse. Files: `dashboard/views/home.yaml` and room
  views; native cards only. Low risk, clear UX gain. **P1**.
- **Curate the home Overview** — reduce duplication vs per-room views; surface active/abnormal +
  weather + energy first. `dashboard/views/home.yaml`. **P1/P2**.
- **Finish G1/G2** — resource sanering (PR-37, gated) + card-mod→theme-tokens (PR-38, underway).
  Already in the roadmap; Casa confirms these are the real perf levers. **P1**.

## 19. Medium-term improvements (P2)

- **`room_view` template** consolidating the room pattern (`dashboard/templates/…`,
  room views). Reduces duplication, eases future changes.
- **Small capability-alias group** for shared/global values (extend the existing `energy.*`/`nav.*`
  logical keys), documented in `docs/entity-mapping.md`.

## 20. Experiments / prototypes (P3)

- **One render-gated custom "overview" card** (Kia/Garden model) *only if* native
  conditional/section composition proves too heavy for the home hub — prototype in isolation with
  a proper build + tests, never as split `.txt`. Decide with a measured before/after against
  `docs/performance-baseline.md`.

## 21. Recommended architecture direction

**Stay Lovelace/YAML; evolve to a selective hybrid.** Keep our strengths (git-reviewed YAML,
placeholder mapping, byte-parity acceptance, privacy model, Juiced Horizon tokens, native HA
stability). Import Casa's **ideas** — progressive disclosure, overview/detail separation, a
lean capability-alias layer, a proper room component — using **native Lovelace mechanisms**.
Reserve custom cards for the few heavy views where a measured perf win justifies them (already
the PR-35/36 idea), built as real source with tests. **Do not** become a custom panel and **do
not** copy Casa's monolithic frontend.

## 22. Prioritized backlog

| Priority | Item | Type |
|---|---|---|
| P1 | Progressive disclosure on home hub + rooms (native conditional/visibility) | Quick win |
| P1 | Finish resource-sanering (PR-37) + card-mod→tokens (PR-38) | Perf (in roadmap) |
| P1/P2 | Curate the home Overview (reduce duplication) | Quick win |
| P2 | `room_view` template consolidation | Architecture |
| P2 | Small capability-alias group for shared/global values | Architecture |
| P3 | Prototype a single render-gated overview card (measured) | Experiment |
| — | Reject: custom panel, split-file frontend, dynamic rooms, name heuristics, www config | Decision |

## 23. Code references

- Panel + config seed: `custom_components/casa_dashboard_community/__init__.py`
  (`async_setup_entry`, `_ensure_entity_config`, `VERSION="1.1.4"` drift)
- WS API: `custom_components/casa_dashboard_community/websocket_api.py`
  (`config/get`, `config/save`, `@require_admin`, atomic write)
- Loader: `custom_components/casa_dashboard_community/frontend/casa-dashboard-community-panel.js`
- Frontend bundle: `frontend/casa-dashboard-community-panel.part0..18.txt` (≈418 KB reassembled)
  — `class CasaDashboardPanel`, `set hass()` + `_stateFingerprint()`, `NAV`/`ENTITY_KEYS`/
  `ROOM_META`, `ENTITY_CONFIG_URL="/local/…json"`
- Entity catalogue: `custom_components/casa_dashboard_community/casa-dashboard-community-entities.example.json`,
  `examples/ENTITY_MAP.md` (173 keys)
- Juiced counterparts: `dashboard/dashboard.yaml`, `dashboard/templates/decluttering_templates.yaml`,
  `dashboard/templates/entities.local.yaml` (git-ignored), `scripts/render_dashboard.py`,
  `scripts/extract_view.py`, `scripts/acceptance_suite.py`,
  `docs/default-dashboard-analysis-and-plan.md` (G1/G2/G3), `docs/theme-rollout-plan.md`

## 24. Open questions

- Does a curated **Overview** reduce enough duplication to justify restructuring the home hub, or
  is disclosure alone sufficient? (measure DOM/first-paint before/after)
- Which shared values genuinely warrant **capability aliases** vs staying per-view keys?
- If we ever distribute a view (Kia/Garden style), is a small **custom card** worth the build/test
  cost vs native composition? (prototype + measure)
- Would selectively hiding all-quiet room sections ever hide something the household expects to
  always see? (UX validation with real usage)
