<!-- PR title: Conventional Commits, e.g. feat(views): migrate badkamer to YAML -->

## Scope
<!-- One view / one concern. Link the roadmap PR id and any finding/issue. -->
- Roadmap: PR-__ (Milestone M__)
- Related finding/issue:

## What & why
<!-- Short description of the change and the finding it traces to. -->

## Checklist
- [ ] Small, focused change (one view / one concern)
- [ ] `python scripts/validate_compose.py` passes
- [ ] `python scripts/check_entity_refs.py` passes (no real entity IDs / serials committed)
- [ ] Parity proven on **MCP Test** (byte-parity for 1:1 lift, or entity+action set-diff for templatized refactor)
- [ ] Snapshot of the affected MCP Test view taken before staging
- [ ] **Default dashboard untouched** (read-only)
- [ ] Screenshots attached (desktop + mobile) — optional visual confirmation
- [ ] Docs updated if behavior/structure changed
