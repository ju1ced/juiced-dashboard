#!/usr/bin/env python3
"""Functional-parity check between two view configs (offline, deterministic).

Extracts the (entity, action, card_type) signature sets from each view and compares them.
This is the primary parity gate for templatized (room) migrations, where a byte-diff is
impossible because decluttering-card expands only in the frontend.

Typical use: render the migrated view (placeholders -> real IDs), then compare it to the
original view exported from the default dashboard:

    python scripts/parity_setdiff.py original.json rendered.yaml

Exit non-zero if the ENTITY set or the ACTION set differs (the hard parity signals).
Card-type set differences are reported as informational (structure may change on purpose).
Accepts .json or .yaml for each side.
"""
import argparse
import os
import sys

import yaml

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from juiced_common import IncludeLoader  # noqa: E402


def load_view(path):
    with open(path, "r", encoding="utf-8") as fh:
        text = fh.read()
    if path.endswith(".json"):
        import json
        data = json.loads(text)
    else:
        data = yaml.load(text, IncludeLoader)
    # accept a full export, a config, a views list, or a single view
    if isinstance(data, dict) and "config" in data:
        data = data["config"]
    if isinstance(data, dict) and "views" in data:
        views = data["views"]
        return views[0] if len(views) == 1 else {"views": views}
    return data


def signatures(view):
    entities, actions, cards = set(), set(), set()

    def add_entity(e):
        if isinstance(e, str):
            entities.add(e)
        elif isinstance(e, dict) and isinstance(e.get("entity"), str):
            entities.add(e["entity"])

    def visit(node):
        if isinstance(node, dict):
            if isinstance(node.get("type"), str):
                cards.add(node["type"])
            if "entity" in node:
                add_entity(node["entity"] if not isinstance(node["entity"], dict) else node["entity"])
                if isinstance(node["entity"], str):
                    entities.add(node["entity"])
            if isinstance(node.get("entity_id"), str):
                entities.add(node["entity_id"])
            elif isinstance(node.get("entity_id"), list):
                for e in node["entity_id"]:
                    if isinstance(e, str):
                        entities.add(e)
            if isinstance(node.get("entities"), list):
                for e in node["entities"]:
                    add_entity(e)
            for key in ("tap_action", "hold_action", "double_tap_action"):
                act = node.get(key)
                if isinstance(act, dict):
                    a = act.get("action", "")
                    tgt = act.get("navigation_path") or act.get("perform_action") or act.get("service") or ""
                    actions.add(f"{a}:{tgt}" if tgt else a)
            for v in node.values():
                visit(v)
        elif isinstance(node, list):
            for x in node:
                visit(x)

    visit(view)
    return entities, actions, cards


def report(name, a, b):
    only_a, only_b = sorted(a - b), sorted(b - a)
    ok = not only_a and not only_b
    print(f"{name}: {'MATCH' if ok else 'DIFF'} ({len(a)} vs {len(b)})")
    for x in only_a:
        print(f"    - only in A: {x}")
    for x in only_b:
        print(f"    + only in B: {x}")
    return ok


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("a")
    ap.add_argument("b")
    args = ap.parse_args()
    ea, aa, ca = signatures(load_view(args.a))
    eb, ab, cb = signatures(load_view(args.b))
    print(f"A = {os.path.basename(args.a)}   B = {os.path.basename(args.b)}")
    e_ok = report("entities", ea, eb)
    a_ok = report("actions", aa, ab)
    report("card_types (informational)", ca, cb)
    if e_ok and a_ok:
        print("PARITY OK (entities + actions match)")
    else:
        print("PARITY FAIL", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
