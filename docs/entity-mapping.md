# Entity mapping — the easy way

This is a **public** repository, so committed dashboard YAML never contains your real entity
IDs or device serials. Instead it uses **logical placeholders**; your real IDs live only in a
git-ignored local file. This guide is designed so the mapping costs you almost no manual work.

## The idea in one picture

```text
committed (public):   entity: "<<badkamer.light>>"
local (git-ignored):  badkamer: { light: light.example_spots }   # entities.local.yaml
render:               entity: light.example_spots                # build/… (git-ignored)
```

- **Placeholder syntax:** `<<group.key>>` (at least one dot). Group by room/domain however you like.
- **Where real IDs live:** `dashboard/templates/entities.local.yaml` — matched by `.gitignore` (`*.local.yaml`), never committed.
- **Contract/reference:** `dashboard/templates/entities.example.yaml` (fictional IDs, committed) shows the structure.

## First-time setup (once)

```bash
cp dashboard/templates/entities.local.yaml.example dashboard/templates/entities.local.yaml
```

## The everyday workflow

```bash
# 1. Sync the mapping skeleton with every placeholder currently used in the dashboard.
#    Safe to re-run: keeps your values, only ADDS a "TODO" line for anything new.
python scripts/init_mapping.py

# 2. Open dashboard/templates/entities.local.yaml and replace each
#    "TODO: set entity_id" with your real entity ID. Only the new ones — existing stay put.

# 3. Render the deployable dashboard (real IDs substituted). Output is git-ignored.
python scripts/render_dashboard.py --out build/juiced-dashboard.yaml
```

If any placeholder is still unmapped, `render_dashboard.py` stops and lists exactly which
keys need a value — so you never ship a half-mapped dashboard.

## Why it stays low-effort

- **You rarely type IDs by hand.** During migration, the extraction tooling (PR-05) records
  the real ID for each placeholder straight into `entities.local.yaml`. `init_mapping.py` only
  fills gaps for entities you add later.
- **`init_mapping.py` is idempotent.** Re-run it any time; it never overwrites your values.
- **`TODO` markers show precisely what's missing**, and the renderer fails loudly on unmapped keys.

## Safety net (CI)

`scripts/check_entity_refs.py` runs in CI and **fails the build** if a real entity ID or a
device serial (e.g. `sn_1234567890`) ever appears in a committed file. `*.local.yaml` and
`*.example.yaml` are excluded. This makes it hard to leak real IDs by accident.

## Deploying

- **Staging:** the rendered per-view config is pushed surgically to the `mcp-test-dashboard`
  storage dashboard (never the default). See `docs/pr-roadmap.md` §2.
- **Production:** deploy the rendered dashboard as a YAML-mode dashboard on the HA host
  (same pattern as the existing Kia "Nebula" dashboard). Cutover is human-gated.
