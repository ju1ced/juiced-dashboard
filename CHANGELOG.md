# Changelog

Tracks the HACS-installable card(s) shipped from this repo (`dist/juiced-dashboard.js`).
The static-YAML dashboard config in `dashboard/**` has its own history — see `git log` and
[`docs/pr-roadmap.md`](docs/pr-roadmap.md).

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
