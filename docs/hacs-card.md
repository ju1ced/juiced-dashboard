# HACS card: `juiced-dashboard-room-card`

Alongside the YAML dashboard config in `dashboard/**`, this repo also ships a small,
independent HACS-installable custom card: `custom:juiced-dashboard-room-card`. Tap a room,
get a popup with only what's actually controllable there — lights, covers, awnings, a media
player, climate — instead of navigating to a full dashboard page. A category with nothing
configured for a room is simply left out of its popup.

This is additive, not a replacement: the existing static-YAML views and their migration
roadmap ([`pr-roadmap.md`](pr-roadmap.md), [`horizon-redesign-roadmap.md`](horizon-redesign-roadmap.md))
are untouched. This card is a new, separate capability that happens to live in the same
repository, built following the same architectural pattern (single-file TypeScript →
esbuild → a committed `dist/juiced-dashboard.js` bundle, `hacs.json`, HACS release
automation) as the sibling `ha-kia-connect-dashboard` and `garden-dashboard` projects, and
loosely inspired by — but sharing no code with — the independently developed
`ju1ced/home-dashboard` project.

## Install (HACS, custom repository)

Not yet in the default HACS store. Add it manually:

1. HACS → the **⋮** menu (top right) → **Custom repositories**.
2. Repository: `https://github.com/ju1ced/juiced-dashboard`, category **Dashboard**.
3. Install **Juiced Dashboard**, then add the resource if HACS doesn't do it automatically
   (Settings → Dashboards → Resources → `/hacsfiles/juiced-dashboard/juiced-dashboard.js`,
   type **JavaScript Module**).
4. Full browser refresh.

## Configuration

```yaml
type: custom:juiced-dashboard-room-card
title: Kamers
subtitle: Tik een kamer om lichten, rolluiken, luifels, radio of airco direct te bedienen
rooms:
  - name: Bureau
    icon: mdi:desk
    temperature: sensor.bureau_temperature # optional — shown on the row
    humidity: sensor.bureau_humidity # optional — shown on the row
    lights:
      - entity: light.bureau_spellenruimte
        name: Bureau & spellenruimte # optional — falls back to friendly_name
      - entity: light.bureau_spellentafel
    covers:
      - entity: cover.rolluik_bureau
    awnings:
      - entity: cover.luifel_bureau
    media_player: media_player.kantoor
    climate: climate.daikin_bureau
  - name: Toilet & berging
    icon: mdi:toilet
    lights:
      - entity: light.toilet
      - entity: light.berging
    # no covers/awnings/media_player/climate — those sections just don't
    # appear in this room's popup
```

### Room options

| Key            | Type                       | Required | Notes                                                                                   |
| -------------- | -------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `name`         | string                     | yes      | Row title and popup heading.                                                             |
| `icon`         | `mdi:…`                    | no       | Falls back to a generic room glyph.                                                      |
| `temperature`  | entity id                  | no       | Sensor shown on the row's stat line.                                                     |
| `humidity`     | entity id                  | no       | Sensor shown on the row's stat line.                                                     |
| `idle_text`    | string                     | no       | Row stat line when no temperature/humidity is configured (default `Rustig`).             |
| `lights`       | list of `{entity, name?}`  | no       | First entry also gets the row's quick-toggle button.                                     |
| `covers`       | list of `{entity, name?}`  | no       | Open/stop/close + position.                                                              |
| `awnings`      | list of `{entity, name?}`  | no       | Same controls as `covers`, its own popup section.                                        |
| `media_player` | entity id                  | no       | Now-playing + play/pause.                                                                |
| `climate`      | entity id                  | no       | hvac-mode buttons (from the entity's own `hvac_modes`) + a target-temperature stepper.   |

## Development

```sh
npm install
npm run verify   # typecheck + build + syntax check + unit tests
```

`src/cards/juiced-dashboard-room-card.ts` holds the card; `test/*.test.mjs` covers every
pure helper and service-call action, plus render-path smoke tests (via a minimal
hand-rolled fake shadow root — Node has no DOM) that assert the card never throws on
missing, unknown, or unavailable entities. Tests import from the **built**
`dist/juiced-dashboard.js` (an `npm run build` runs automatically before `npm test` via the
`pretest` script), not the TypeScript source, so there's no separate test-time TS loader to
maintain.

## Preview harness

`docs/renders/preview.html` loads the built bundle in a real browser against a small fake
`hass` object (fictional example data, matching the config above) — no Home Assistant
install required. Serve the repo root with any static file server and open the page, e.g.:

```sh
python -m http.server 8942
# then open http://localhost:8942/docs/renders/preview.html
```

This is how the card was manually verified end-to-end this session (list view, opening a
room's popup, all four sections rendering correctly) — a real screenshot from this harness
still needs to be captured and added to the README (currently missing; `hacs/action`'s
`check-images` validation flags this).

## Status

v0.1.0 is a working first release, ported from the (now superseded)
[`ju1ced/juiced-room-card`](https://github.com/ju1ced/juiced-room-card) spike: YAML-only
configuration (no visual editor yet), not yet exercised against a real Home Assistant
instance. See [`CHANGELOG.md`](../CHANGELOG.md).
