# Changelog

Tracks the HACS-installable card(s) shipped from this repo (`dist/juiced-dashboard.js`).
The static-YAML dashboard config in `dashboard/**` has its own history — see `git log` and
[`docs/pr-roadmap.md`](docs/pr-roadmap.md).

## 0.2.0-beta.2 - 2026-09-09

### Added

- "Gezin" section on Home: a tile per `general.person_entities` entity, positioned between the
  hero row and Kamers instead of as view-level badges (which HA always pins to the very top).
- "Snel naar" section on Home: one-tap navigation buttons (native HA `shortcut` cards) to
  other dashboards or views, from a new repeatable `shortcuts` config section in the editor.

## 0.2.0-beta.1 - 2026-09-08

First release of the full GUI-configured dashboard strategy — `custom:juiced-dashboard` now
appears in Home Assistant's own **+ Add Dashboard → Community-dashboards** picker, alongside
the room card from 0.1.0.

### Added

- Dashboard strategy (`custom:juiced-dashboard`) generating Home, Kamers, Energie, Domeinen
  and Meer views plus a per-room detail subview — entirely GUI-configured via a native
  strategy config editor (`getConfigElement`), no hand-written YAML.
- "Vandaag" hero card: weather, energy KPIs, and waste-collection chips (a calendar-style
  day/weekday tile plus a relative label — "Vandaag" / "Morgen" / "Over N dagen").
- Security card: alarm control plus a browsable camera carousel; a privacy label only shows
  for a camera that actually has a configured privacy switch.
- Snelacties: a small curated row of cross-room quick actions.
- Room detail subview: a hero, an Overzicht status-tile grid, and Klimaat/Verlichting/
  Rolluiken/Luifels/Media sections — sharing its section renderers with the room card's
  popup so the two surfaces never drift apart.
- Rooms can be grouped into zones (Buiten/Gelijkvloers/Boven), rendered as a responsive grid
  instead of a single narrow column.
- Person badges on Home, from `general.person_entities`.
- A room's lights/covers/awnings are entity *lists* now (multiple per category), not a
  single entity each.

### Fixed

- Sections and the cards inside them now correctly span the full available row width
  (`column_span` on every section plus `grid_options: {columns: "full"}` on every top-level
  card) instead of being capped to roughly a third of the row.
- Vandaag and Security now share one row at equal height instead of two independently-sized
  sections.

### Known limitations (intentional, for this beta)

- Energie, Domeinen and Meer are still placeholder views.
- No package-lock.json yet, so CI uses `npm install` rather than `npm ci`.

## 0.1.0 - 2026-09-07

Initial release — HACS packaging for `juiced-dashboard` itself, and
`custom:juiced-dashboard-room-card` ported in from the (now superseded) spike repo
[`ju1ced/juiced-room-card`](https://github.com/ju1ced/juiced-room-card).

### Added

- `custom:juiced-dashboard-room-card` — a compact, config-driven room list. Tapping a row
  opens a popup with only the categories configured for that room: lights (toggle), covers
  and awnings (open/stop/close + position), a media player (now playing + play/pause), and
  climate (hvac mode + target temperature stepper).
- A small quick-toggle button on each row for the room's first configured light.
- Colors read the `juiced-horizon` theme tokens first and fall back to core Home Assistant
  variables.
- Render-gated updates (`hasRelevantChange`) — no needless re-renders on unrelated state
  ticks.
- HACS packaging: `hacs.json`, a TypeScript → esbuild → `dist/juiced-dashboard.js` build
  pipeline, an official `hacs/action` CI validation gate, and a tag-triggered release
  workflow.
- Unit tests for every pure helper, the service-call actions, and render-path smoke tests
  asserting the card never throws on missing/unknown/unavailable entities — imported from
  the built bundle so there's no separate TypeScript test loader.

### Known limitations (intentional, for a v0.1 first release)

- YAML-only configuration — no visual editor (`getConfigElement`) yet.
- Not yet wired into `dashboard/home.yaml` or exercised against a real Home Assistant
  instance — see [`docs/horizon-redesign-roadmap.md`](docs/horizon-redesign-roadmap.md).
- No `package-lock.json` yet, so CI uses `npm install` rather than `npm ci`.
