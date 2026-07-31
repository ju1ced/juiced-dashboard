# Juiced Dashboard

Version-controlled source for a modular, fast, maintainable Home Assistant Lovelace
dashboard — a rebuild of the current default dashboard (`lovelace`) as small, reusable
YAML views, distributed via Git.

> **Status:** foundation (PR-01). The migration is built up in small pull requests.
> See [`docs/pr-roadmap.md`](docs/pr-roadmap.md) for the full plan and
> [`docs/default-dashboard-analysis-and-plan.md`](docs/default-dashboard-analysis-and-plan.md)
> for the analysis it is based on.

## Safety

- The live **default dashboard is never modified**. All validation happens on the
  **MCP Test** dashboard (`mcp-test-dashboard`).
- This is a **public** repository: **no real entity IDs or device serials are committed.**
  Real IDs live only in a git-ignored local mapping file (see below).

## Repository layout

```text
dashboard/
  dashboard.yaml            # composition root (!include per view)
  views/                    # one file per view (logical mapping keys, no real IDs)
  cards/                    # reusable card fragments
  templates/                # decluttering/button templates, colors, icons, entity mapping
  themes/                   # juiced-horizon theme tokens
scripts/                    # render + mapping + validation tooling
docs/                       # analysis, POC, roadmap, entity-mapping guide
.github/                    # CI, PR template, CODEOWNERS
```

## Entity mapping (the easy part)

Committed YAML never contains your real entity IDs. Instead it uses **logical placeholders**
like `<<badkamer.light>>`, which are resolved from a local file that stays on your machine:

```bash
# 1. one-time: create your local mapping from the template
cp dashboard/templates/entities.local.yaml.example dashboard/templates/entities.local.yaml

# 2. sync the skeleton with every placeholder used in the dashboard (safe to re-run;
#    keeps your existing values, adds TODOs for anything new)
python scripts/init_mapping.py

# 3. fill in the "# TODO" lines with your real entity IDs (only the new ones)

# 4. render the deployable dashboard with real IDs substituted
python scripts/render_dashboard.py --out build/juiced-dashboard.yaml
```

`entities.local.yaml` and everything under `build/` are git-ignored, so your real IDs and
serials never leave your machine. Full guide: [`docs/entity-mapping.md`](docs/entity-mapping.md).

## Development

```bash
python scripts/validate_compose.py     # !include resolves, views have path/type
python scripts/check_entity_refs.py     # fails if real IDs/serials sneak into committed YAML
```
