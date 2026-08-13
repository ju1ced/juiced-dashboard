# Theme rollout plan — `Juiced Horizon`

Staged plan to deploy the `Juiced Horizon` theme (`dashboard/themes/juiced-horizon.yaml`) to
Home Assistant and adopt it across the migrated views. This unblocks **PR-38** (card-mod →
theme-tokens) and is the visual half of the cutover.

> **Payoff framing.** Adopting the theme delivers **consistent surfaces / text / shadows and
> clean OS dark↔light switching** across all views — driven by one file instead of per-card
> colours. It does **not** "retire 283 card_mods": ~66% of home's card_mod is *dynamic
> state-logic* (chip colour by entity state) that survives theming (see
> `docs/nav-badge-evaluation.md` / the PR-38 finding). Theme adoption and card-mod reduction
> are separate; this plan does the first and enables a *scoped* second (Phase 4).

## Hard constraints

- **Default dashboard stays read-only.** The default's views also use `Backend-selected`
  (verified: 17 `Backend-selected` + 10 none), so switching the **global** default theme via
  `ha_manage_theme set` would restyle the default. **Therefore: set `theme: Juiced Horizon`
  per-view; never change the global default during rollout.** (Revisit a global default only at
  cutover, when the new dashboard replaces the default.)
- **Repo writes are safe; host + HA-global writes are gated.** Deploying the theme file and
  reloading themes are **host changes** (HA config repo `/projects/HomeAssistant`), gated on
  explicit approval — same category as PR-42 and the PR-37 resource deletions.

## Phase 0 — Deploy the theme to HA (HOST, user-gated) — HARD PREREQUISITE

HA loads themes via `configuration.yaml` → `frontend: themes: !include_dir_merge_named themes`
(confirmed). Only `themes/kia-horizon.yaml` is present today (→ theme "Kia Horizon").

1. Copy `dashboard/themes/juiced-horizon.yaml` → `/projects/HomeAssistant/themes/juiced-horizon.yaml`.
2. Reload themes (Developer Tools → YAML → *Reload Themes*, or `homeassistant.reload_core_config`).
3. Verify: `ha_manage_theme(action="list")` shows **`Juiced Horizon`** alongside `Kia Horizon`.

> **Gate.** Nothing downstream is visually validatable until this lands — mcp-test cannot render
> a theme HA has not loaded. **Phases 1–4 stall here until you deploy.** (I cannot do this step
> autonomously: it writes to the HA host, outside the mcp-test-only envelope.)

## Phase 1 — Theme-variable compatibility fix (repo; do BEFORE any rollout)

Audit result (all `var(--…)` referenced across the 27 views + nav template vs what Juiced
Horizon defines):

| var | uses | defined by Juiced Horizon |
| --- | --- | --- |
| `--main-icon-background-color` | 77 | **NO — must add** |
| `--ha-card-background` | 21 | yes |
| `--card-background-color` | 21 | yes |
| `--ha-card-border-radius` | 21 | yes |
| `--ha-card-box-shadow` | 21 | yes |
| `--primary-color` | 3 | yes |

**`--main-icon-background-color`** is the mushroom-chip fallback background (used 77× as the
"inactive chip" colour). Neither Juiced Horizon nor Kia Horizon defines it — it currently comes
from the mushroom/base theme. Under Juiced Horizon it would fall back to mushroom's own default,
a likely visible change on every chip row. **Fix: define it in `juiced-horizon.yaml` in both
modes** so chips keep a deliberate look, e.g.:

```yaml
# add under modes.dark:
main-icon-background-color: "rgba(255, 255, 255, 0.06)"   # subtle raised tint on dark surface
# add under modes.light:
main-icon-background-color: "rgba(15, 17, 21, 0.05)"      # subtle tint on light surface
```

Exact values to be confirmed against the current look in the Phase-2 pilot screenshot (tune to
match today's chip background, or intentionally re-tone). The other 5 vars need no change.

## Phase 2 — Pilot ONE mid-complexity view (mcp-test + review)

Pick a mid-complexity view — **bureau** or **slaapkamer** (mushroom cards, a thermostat, a few
card_mods) — **not home** (its 191 card_mods are the most likely to clash).

1. Repo: set `theme: Juiced Horizon` on the pilot view (replacing `theme: Backend-selected`).
2. Render + stage the pilot to `mcp-test-dashboard` (existing `save_view.mjs`).
3. Screenshot **dark and light** (`colorScheme` emulation — the theme has explicit `modes:`, so
   it switches on `prefers-color-scheme`).
4. **You review both.** Confirm chips, surfaces, text contrast, and the `--main-icon-background`
   fix look right. Approve → Phase 3; adjust the theme/values and re-shoot otherwise.

## Phase 3 — Roll out per-view (review-as-we-go)

Set `theme: Juiced Horizon` on the remaining views, staging + dark/light screenshots per batch
for your sign-off. **Order: simplest → home last** (home is the highest-clash surface). Each is
a one-line repo change per view; parity is now *visual* (screenshots), not byte-diff.

## Phase 4 — PR-38 card-mod → tokens (scoped, only after theming is stable)

With the theme active, do the one genuine tokenization: unify the repeated hardcoded status
palette in the dynamic chip card_mods to theme tokens, preserving translucency via `color-mix`:

| hardcoded | → token |
| --- | --- |
| `rgba(67,138,94,0.7)` (green, ×118) | `color-mix(in srgb, var(--juiced-status-ok) 70%, transparent)` |
| `rgba(230,118,118,·)` (red, ×100) | `var(--juiced-status-critical)` / `color-mix(… 70% …)` |
| `rgba(255,181,118,·)` (orange, ×42) | `var(--juiced-status-warning)` (+ alpha via `color-mix`) |

This is a deliberate palette change (theme colours differ from the hardcoded ones), reviewed via
screenshots. Dynamic state-logic and bespoke pills/resets stay. Leave the shadow `rgba(0,0,0,·)`
and multi-colour gradients as-is.

## Verification & rollback (per phase)

- **Verify:** `ha_manage_theme list` (Phase 0); mcp-test dark+light screenshots, 0 error-cards,
  contrast check (Phase 2–3); acceptance suite still green (repo edits don't change entities).
- **Rollback:** per-view — revert the `theme:` key (repo). Host — remove
  `/projects/HomeAssistant/themes/juiced-horizon.yaml` + reload. Nothing touches the default.

## Standing dependencies

- **`entities.local.yaml`** must carry the neutralized logical keys for every migrated view, or
  render/stage fails (unrelated to theming, but required to stage the pilots).
- Independent of the **git-history name scrub** decision.

## What I can / cannot do autonomously

- **Autonomous (repo + mcp-test):** Phase 1 theme edit, per-view `theme:` changes, staging,
  screenshots, Phase 4 card-mod edits.
- **Gated (you):** Phase 0 deploy + reload on the HA host. **This plan ends at "awaiting your
  theme deploy"** — I cannot execute or validate any phase until Juiced Horizon is loaded in HA.
