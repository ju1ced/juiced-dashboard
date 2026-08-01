#!/usr/bin/env python3
"""Validate the entity mapping (offline) with an optional live check.

OFFLINE (CI-safe, no Home Assistant needed):
  - completeness: every ``<<group.key>>`` placeholder used in the committed dashboard has a
    mapping entry (and it is not still a ``TODO`` sentinel);
  - format: every mapping leaf value is a syntactically valid ``<domain>.<name>`` entity ID.

LIVE (local only, opt-in via --live): would check each mapped entity actually exists in the
running Home Assistant. Not run in CI — GitHub Actions cannot reach the local HA MCP, and no
HA secrets are used in CI. This mode is a documented placeholder that exits 0.

    python scripts/check_entities.py --mapping dashboard/templates/entities.example.yaml
    python scripts/check_entities.py --live      # local only
"""
import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from juiced_common import (  # noqa: E402
    DASHBOARD_DIR, iter_yaml_files, find_placeholders_in_text, lookup, load_local_mapping,
)

ENTITY_ID_RE = re.compile(r"^[a-z_]+\.[a-z0-9_]+$")
TODO_PREFIX = "TODO"


def collect_placeholders(scan_dir):
    keys = set()
    for path in iter_yaml_files(scan_dir):
        with open(path, "r", encoding="utf-8") as fh:
            keys |= find_placeholders_in_text(fh.read())
    return sorted(keys)


def iter_leaves(node, prefix=""):
    if isinstance(node, dict):
        for k, v in node.items():
            yield from iter_leaves(v, f"{prefix}.{k}" if prefix else str(k))
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from iter_leaves(v, f"{prefix}[{i}]")
    else:
        yield prefix, node


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mapping", default=None, help="mapping file (default: entities.local.yaml)")
    ap.add_argument("--scan-dir", default=DASHBOARD_DIR, help="dir scanned for placeholders")
    ap.add_argument("--live", action="store_true")
    args = ap.parse_args()

    if args.live:
        print("live entity check is a local-only step (requires Home Assistant) — skipped in CI")
        return

    mapping, used_path = load_local_mapping(args.mapping)
    problems = []

    # completeness
    for key in collect_placeholders(args.scan_dir):
        val = lookup(mapping, key)
        if val is None:
            problems.append(f"placeholder '<<{key}>>' has no mapping entry in {used_path}")
        elif isinstance(val, str) and val.strip().startswith(TODO_PREFIX):
            problems.append(f"placeholder '<<{key}>>' still unmapped (TODO) in {used_path}")

    # format
    for path, val in iter_leaves(mapping):
        if not isinstance(val, str):
            problems.append(f"mapping '{path}' is not a string entity id")
            continue
        if val.strip().startswith(TODO_PREFIX):
            continue  # unmapped placeholder handled above / by render
        if not ENTITY_ID_RE.match(val.strip()):
            problems.append(f"mapping '{path}' = '{val}' is not a valid <domain>.<name> entity id")

    if problems:
        print("FAIL: entity mapping problems:", file=sys.stderr)
        for p in problems:
            print(f"  - {p}", file=sys.stderr)
        sys.exit(1)
    print(f"OK: entity mapping valid ({used_path if os.path.exists(used_path) else 'no local mapping'}).")


if __name__ == "__main__":
    main()
