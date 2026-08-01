# CLAUDE.md — project rules for juiced-dashboard

Project-specific guardrails that supplement the central instructions. These are hard rules.

## Home Assistant safety

- The **default dashboard (`lovelace`) is always read-only.** Never write, update, delete or
  migrate it.
- **Writes go only to `mcp-test-dashboard`.** Target it explicitly and verify the target
  before every write.
- **Snapshot before every MCP Test write** so the view can be restored.
- Never modify automations, scripts, scenes, helpers, integrations, devices or entities —
  read-only only.

## Repository / privacy

- **Never commit real entity IDs, device serials, tokens or internal URLs.** Committed
  dashboard YAML uses only logical `<<group.key>>` placeholders; real IDs live in the
  git-ignored `dashboard/templates/entities.local.yaml`. `scripts/check_entity_refs.py`
  enforces this — run it before committing.
- Example/fixture entity IDs must be provably fictional (`example_` convention).

## Workflow

- **Never work directly on `main`.** Branch per change: `feat/…`, `chore/…`, `ci/…`.
- **One roadmap item per branch/PR** (`docs/pr-roadmap.md`); keep PRs small and reviewable.
- **Do not commit or push without explicit permission.**
- Before finishing, run `make validate` (the same blocking checks as CI).

## Include convention

`!include` paths are **file-relative** (resolved relative to the including file), matching
Home Assistant. See `ARCHITECTURE.md`.
