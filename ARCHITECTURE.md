# Architecture

Juiced Dashboard rebuilds the Home Assistant default dashboard as a **modular YAML-mode
dashboard** (composition root + `!include` per view + shared templates), following the
`ha-kia-connect-dashboard` pattern, with render-gated custom cards reserved for the heaviest
bespoke views (a Garden-dashboard-style approach). The chosen target architecture and its
rationale are documented in
[`docs/default-dashboard-analysis-and-plan.md`](docs/default-dashboard-analysis-and-plan.md)
(chapters 10–13).

## Composition

- `dashboard/dashboard.yaml` is the composition root. It wires shared templates and one
  `!include` per view — no large inline card definitions.
- `dashboard/views/` holds top-level views; `dashboard/cards/` reusable fragments;
  `dashboard/templates/` shared contracts (decluttering/button templates, colors, icons,
  entity mapping); `dashboard/themes/` the theme tokens.

## Entity-mapping layer (public-repo safe)

Because the repository is public, committed YAML must not contain real entity IDs or device
serials. Views reference **logical placeholders** (`<<group.key>>`) resolved at render time
from a git-ignored `dashboard/templates/entities.local.yaml`. A generic
`entities.example.yaml` documents the contract with fictional IDs. CI (`check_entity_refs.py`)
rejects real IDs/serials in committed files. See
[`docs/entity-mapping.md`](docs/entity-mapping.md).

## Render & deploy

- `scripts/render_dashboard.py` resolves `!include` and substitutes placeholders from the
  local mapping, producing a deployable config (`build/…`, git-ignored).
- **Staging:** the rendered per-view config is pushed surgically to the `mcp-test-dashboard`
  storage dashboard for validation. The default dashboard is never touched.
- **Production:** the rendered dashboard is deployed as a YAML-mode dashboard on the HA host
  (the pattern the existing Kia "Nebula" dashboard already uses). Cutover is human-gated.

## Include rules (from the reference project)

- Views may include cards and templates. Cards may include templates. Templates do not
  include views. Themes do not include structure.
- Keep files small enough to review in focused pull requests.

### Include path resolution — file-relative

`!include <path>` is **file-relative**: resolved relative to the directory of the file that
declares the include, exactly like Home Assistant's own YAML loader. So:

- `dashboard/dashboard.yaml` includes a view with `!include views/badkamer.yaml`
  (relative to `dashboard/`);
- `dashboard/views/badkamer.yaml` includes a card with `!include ../cards/foo.yaml`
  (relative to `dashboard/views/`).

This convention is implemented in `scripts/juiced_common.py` (`IncludeLoader`) and enforced
by `scripts/validate_compose.py` (a missing include fails with a clear message). Nested
resolution is covered by `tests/test_pipeline.py`.

## Validation pipeline

The foundation is kept reproducible by a validation pipeline (GitHub Actions +
`make validate` locally). Blocking gates:

- **yamllint** / **markdownlint-cli2** — YAML and Markdown linting.
- **`check_entity_refs.py`** — privacy guard: blocks real entity IDs and device serials in
  committed YAML (examples/fixtures must use the `example_` convention).
- **`validate_compose.py`** — `!include` resolves; every view has a stable `path` and `type`.
- **`check_entities.py`** — offline mapping completeness + entity-id format (`--live` cross-checks
  the running HA; local-only).
- **`check_resources.py`** — every `custom:<type>` used is declared in `dashboard/resources.yaml`
  (`--live` cross-checks HA-registered resources; local-only).
- **`render_dashboard.py --self-test`** — the placeholder-mapping render mechanism.
- **`pytest`** — positive and negative fixtures for every guard.

The HA-dependent (`--live`) checks are local-only: GitHub Actions cannot reach the stdio HA
MCP and no HA secrets are used in CI.
