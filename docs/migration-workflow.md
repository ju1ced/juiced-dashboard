# Per-view migration workflow (M2 tooling)

The scripts that automate migrating one view from the default dashboard into committable,
placeholder-based YAML — and validating it on MCP Test. All scripts are **offline** (no Home
Assistant access, no tokens); the live read/write is done by the agent via the MCP tools.

## The loop

```text
 1. EXPORT (agent, read-only MCP)   ha_config_get_dashboard(url_path="lovelace") -> export.json
 2. EXTRACT (offline)               extract_view.py export.json --view <path>
                                       -> dashboard/views/<view>.yaml        (placeholders only)
                                       -> <view>.local-fragment.yaml         (real IDs; DO NOT commit)
 3. MAP (you)                        paste the fragment into entities.local.yaml, verify IDs
 4. RENDER (offline)                render_dashboard.py --dashboard ... --out build/<view>.yaml
 5. STAGE (agent, write MCP)         stage_to_mcptest.py build/<view>.yaml --index N
                                       -> emits the surgical python_transform + checklist
                                     agent then: snapshot -> ha_config_set_dashboard(
                                       url_path="mcp-test-dashboard", python_transform=...,
                                       config_hash=<fresh>, BestPracticeKey=<fresh>)
 6. VERIFY (offline)                parity_setdiff.py export-of-original.json build/<view>.yaml
                                       -> entities + actions must MATCH
```

## Scripts

| Script | Role | Notes |
| --- | --- | --- |
| `extract_view.py` | live view → placeholder YAML + mapping suggestion | Self-guards: refuses to write if a real ID/serial would remain; sanitizes serials out of keys |
| `render_dashboard.py` | placeholders → real IDs (from `entities.local.yaml`) | Output under `build/` (git-ignored) |
| `stage_to_mcptest.py` | generate the surgical `views[N]` transform + safety checklist | Dry-run generator; **refuses** to target `lovelace`/`default`; holds no token |
| `parity_setdiff.py` | functional-parity gate (entity + action + card-type sets) | Primary parity check for templatized views (byte-diff is impossible once decluttering is used) |

## Safety

- The default dashboard is **read-only**; writes go only to `mcp-test-dashboard`, snapshot first.
- `BestPracticeKey` (MCP write gate) rotates hourly — the agent fetches it at write time via
  `ha_get_skill_guide` and never stores it; a fresh `config_hash` is fetched immediately before
  the write.
- Real IDs live only in `entities.local.yaml` and `build/` (both git-ignored). `check_entity_refs.py`
  fails CI if any real ID/serial reaches a committed file.

The badkamer view was used to validate this loop end-to-end (extract → render → parity: entities
and card types match the original).
