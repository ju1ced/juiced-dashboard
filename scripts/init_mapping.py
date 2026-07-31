#!/usr/bin/env python3
"""Sync the local entity mapping with every placeholder used in the dashboard.

Safe to re-run: keeps your existing values, only adds ``TODO`` entries for placeholders
that are not mapped yet. This is the "easy mapping" entry point — you run it, then fill in
the handful of ``TODO`` lines with your real entity IDs.

    python scripts/init_mapping.py

Writes to dashboard/templates/entities.local.yaml (git-ignored). Creates it if missing.
"""
import os
import sys
import yaml

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from juiced_common import (  # noqa: E402
    DASHBOARD_DIR, iter_yaml_files, find_placeholders_in_text,
)

TODO = "TODO: set entity_id"


def collect_placeholders():
    keys = set()
    for path in iter_yaml_files(DASHBOARD_DIR):
        with open(path, "r", encoding="utf-8") as fh:
            keys |= find_placeholders_in_text(fh.read())
    return sorted(keys)


def set_nested(tree, dotted, value):
    parts = dotted.split(".")
    cur = tree
    for p in parts[:-1]:
        cur = cur.setdefault(p, {})
        if not isinstance(cur, dict):
            raise SystemExit(f"mapping conflict at '{p}' for key '{dotted}'")
    cur.setdefault(parts[-1], value)


def has_nested(tree, dotted):
    cur = tree
    for p in dotted.split("."):
        if not isinstance(cur, dict) or p not in cur:
            return False
        cur = cur[p]
    return True


def main():
    local_path = os.path.join(DASHBOARD_DIR, "templates", "entities.local.yaml")
    existing = {}
    if os.path.exists(local_path):
        with open(local_path, "r", encoding="utf-8") as fh:
            existing = yaml.safe_load(fh) or {}

    keys = collect_placeholders()
    added = []
    for key in keys:
        if not has_nested(existing, key):
            set_nested(existing, key, TODO)
            added.append(key)

    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    header = (
        "# Local entity mapping — REAL entity IDs. Git-ignored (never committed).\n"
        "# Generated/updated by scripts/init_mapping.py. Fill in the 'TODO' lines.\n"
    )
    with open(local_path, "w", encoding="utf-8") as fh:
        fh.write(header)
        yaml.safe_dump(existing, fh, default_flow_style=False, allow_unicode=True, sort_keys=True)

    todo_count = sum(1 for k in keys if _val(existing, k) == TODO)
    print(f"placeholders found: {len(keys)} | new entries added: {len(added)} | still TODO: {todo_count}")
    if added:
        print("added:")
        for k in added:
            print(f"  - {k}")
    print(f"mapping file: {local_path}")


def _val(tree, dotted):
    cur = tree
    for p in dotted.split("."):
        cur = cur[p]
    return cur


if __name__ == "__main__":
    main()
