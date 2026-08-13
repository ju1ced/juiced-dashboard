# Nav-badge evaluation (roadmap PR-39, finding G3)

Evaluation of the shared global navigation badge and its global-load cost, per the
analysis report's optimization findings **G1–G3**
(`docs/default-dashboard-analysis-and-plan.md`).

## The three global-load findings

| # | finding | impact | status |
| --- | --- | --- | --- |
| G1 | 51 frontend resources load globally regardless of active view | high | **gated** — PR-37 resource-sanering; a global lovelace-resource deletion (`docs/resource-removal-manifest.yaml`), scheduled for cutover |
| G2 | card-mod loaded globally + applied ~279× (post-render DOM styling) | high | **blocked** — PR-38 card-mod→theme-tokens needs `juiced-horizon` deployed to HA first (only "Kia Horizon" is loaded) + the views adopting it (a full restyle) |
| G3 | shared nav-badge (`mushroom-chips`, live energy entities) renders on every view | medium | **this doc** |

The analysis is explicit that the largest *shared* wins are G1/G2, not the nav-badge.

## What the migrated nav-badge is

`dashboard/templates/decluttering_templates.yaml` → `global_navigation_badges`, referenced
by all 27 views as `custom:decluttering-card template: global_navigation_badges`.

- **1× `custom:mushroom-chips-card`**, 14 chips: `back`, Home, 6 live energy KPIs
  (battery SoC, charge power, discharge power, solar power, grid import, peak power),
  kiosk toggle, Laadpaal (charger daily), Nebula → car, Tuin → garden, `menu`.
- **0 card_mod blocks** — no post-render DOM styling here (the G2 concern does not touch it).
- **~1.9 KB**, privacy-clean (logical `<<energy.*>>` / `<<nav.*>>` placeholders only; no
  serials/names).

**Conclusion: the nav-badge is already lean.** The migration added no card-mod and no weight;
it is a plain mushroom-chips row.

## Residual G3 cost

The only real cost is that **6 chips subscribe to live energy entities**, and the badge
re-renders on every view switch. Because HA lazy-mounts views, the live subscriptions are
active for the *current* view (6 live chips), not multiplied across all 27 simultaneously —
which is why the analysis rates G3 *medium*, below G1/G2.

## Lightening options (UX trade-offs — owner decision)

There is **no zero-UX-change structural optimization** left in the badge; every chip is
functional. Reducing G3 further means trading information for render cost:

1. **Consolidate the 6 energy KPIs → fewer chips** (e.g. one SoC chip + one net-flow chip,
   the rest behind the `energy` view). Cuts live subscriptions roughly in half; loses
   at-a-glance solar/charge/discharge/peak values.
2. **Move energy KPIs behind a single "energy" chip** (navigate only). Maximal lightening;
   loses all at-a-glance energy values from the global bar.
3. **Keep as-is (recommended).** The badge is already card-mod-free and light; the medium G3
   cost is inherent to showing live energy KPIs globally, and the analysis puts the real
   shared wins in G1/G2.

A future **custom `juiced-nav` card** (render-gated, Shadow DOM) could compute the KPI row
once and avoid per-view chip re-subscription — but that is a build-and-distribute effort
(HACS module), out of scope here and only worth it if G1/G2 are already done.

## Recommendation

Keep the nav-badge as-is (option 3). It carries no card-mod debt and is not the bottleneck;
the high-impact shared wins are **G1 (resource-sanering, PR-37)** and **G2 (card-mod→tokens,
PR-38)**, both of which are host-/cutover-gated. Revisit a bespoke nav card only after those
land, if a KPI trim is desired.
