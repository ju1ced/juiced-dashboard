#!/usr/bin/env python3
"""Extract one view from a dashboard export and parameterize it (offline).

Turns a live view (real entity IDs) into a committable view (logical `<<group.key>>`
placeholders) plus a mapping suggestion for your git-ignored entities.local.yaml. This
automates the tedious, error-prone part of a per-view migration.

    python scripts/extract_view.py export.json --view badkamer \
        --out dashboard/views/badkamer.yaml \
        --mapping-out badkamer.local-fragment.yaml

INPUT: a dashboard export JSON (the `ha_config_get_dashboard` result, or a bare config with
`views`). The agent produces it read-only via MCP; this script never talks to Home Assistant.

SAFETY: the emitted view is re-scanned with the privacy guard's rules; if any real entity ID
or serial would remain, the script errors instead of writing (no silent leaks). Placeholder
keys are sanitized so serials never end up in a committed key.
"""
import argparse
import json
import os
import re
import sys

import yaml

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from juiced_common import PLACEHOLDER_RE  # noqa: E402
from check_entity_refs import (  # noqa: E402
    ENTITY_RE, SERVICE_TOKEN_RE, INCLUDE_RE, SERIAL_RE, FILE_EXTS,
)

SERIAL_IN_KEY = re.compile(r"sn_[0-9]{3,}_?")


def load_views(export):
    with open(export, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    cfg = data.get("config", data)
    return cfg.get("views", [])


def find_view(views, selector):
    if selector.isdigit():
        return views[int(selector)]
    for v in views:
        if v.get("path") == selector:
            return v
    raise SystemExit(f"view '{selector}' not found (paths: {[v.get('path') for v in views]})")


SERVICE_KEYS = {"perform_action", "service"}


def collect_entities(view):
    """Ordered unique real entity tokens in string leaves (skip services/placeholders/files).

    Key-aware: values under `perform_action`/`service` keys are service names, not entities.
    """
    found = []
    seen = set()

    def visit(node, parent_key=None):
        if isinstance(node, str):
            if parent_key in SERVICE_KEYS:
                return
            cleaned = PLACEHOLDER_RE.sub("", node)
            cleaned = INCLUDE_RE.sub("", cleaned)
            cleaned = SERVICE_TOKEN_RE.sub("", cleaned)
            for m in ENTITY_RE.finditer(cleaned):
                tok = m.group(0)
                if tok.rsplit(".", 1)[1] in FILE_EXTS:
                    continue
                if tok not in seen:
                    seen.add(tok)
                    found.append(tok)
        elif isinstance(node, list):
            for x in node:
                visit(x, parent_key)
        elif isinstance(node, dict):
            for k, v in node.items():
                visit(v, k)

    visit(view)
    return found


def make_key(token, group, used):
    object_id = token.split(".", 1)[1]
    key = SERIAL_IN_KEY.sub("", object_id).strip("_")
    key = re.sub(r"_+", "_", key) or token.split(".", 1)[0]
    full = f"{group}.{key}"
    n = 2
    base = full
    while full in used and used[full] != token:
        full = f"{base}_{n}"
        n += 1
    used[full] = token
    return full


def parameterize(view, group):
    tokens = collect_entities(view)
    used = {}
    mapping_pairs = []  # (dotted_key, real_token)
    token_to_ph = {}
    for tok in tokens:
        dotted = make_key(tok, group, used)
        token_to_ph[tok] = dotted
        mapping_pairs.append((dotted, tok))

    def repl(node):
        if isinstance(node, str):
            s = node
            for tok, dotted in token_to_ph.items():
                s = re.sub(r"\b" + re.escape(tok) + r"\b", f"<<{dotted}>>", s)
            return s
        if isinstance(node, list):
            return [repl(x) for x in node]
        if isinstance(node, dict):
            return {k: repl(v) for k, v in node.items()}
        return node

    return repl(view), mapping_pairs


def self_guard(text):
    problems = []
    for i, line in enumerate(text.splitlines(), 1):
        if SERIAL_RE.search(line):
            problems.append(f"line {i}: serial leaked: {SERIAL_RE.search(line).group(0)}")
        cleaned = PLACEHOLDER_RE.sub("", line)
        cleaned = INCLUDE_RE.sub("", cleaned)
        cleaned = SERVICE_TOKEN_RE.sub("", cleaned)
        for m in ENTITY_RE.finditer(cleaned):
            if m.group(0).rsplit(".", 1)[1] not in FILE_EXTS:
                problems.append(f"line {i}: real entity leaked: {m.group(0)}")
    return problems


def nest(mapping_pairs):
    tree = {}
    for dotted, real in mapping_pairs:
        parts = dotted.split(".")
        cur = tree
        for p in parts[:-1]:
            cur = cur.setdefault(p, {})
        cur[parts[-1]] = real
    return tree


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("export", help="dashboard export JSON")
    ap.add_argument("--view", required=True, help="view path or numeric index")
    ap.add_argument("--group", default=None, help="placeholder group (default: view path)")
    ap.add_argument("--out", default=None, help="write parameterized view YAML here")
    ap.add_argument("--mapping-out", default=None, help="write mapping suggestion here")
    args = ap.parse_args()

    view = find_view(load_views(args.export), args.view)
    group = args.group or view.get("path") or "view"
    param, pairs = parameterize(view, group)
    view_yaml = yaml.safe_dump(param, default_flow_style=False, allow_unicode=True, sort_keys=False, width=100)

    leaks = self_guard(view_yaml)
    if leaks:
        print("REFUSING TO WRITE — parameterization left real data:", file=sys.stderr)
        for p in leaks:
            print(f"  {p}", file=sys.stderr)
        sys.exit(1)

    header = f"# Parameterized from a dashboard export for view '{args.view}'. Review keys before committing.\n"
    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            fh.write(header + view_yaml)
        print(f"view -> {args.out}")
    else:
        print(header + view_yaml)

    mapping_tree = {group: nest(pairs).get(group, {})} if pairs else {}
    map_hdr = ("# Mapping SUGGESTION — paste into your git-ignored entities.local.yaml and\n"
               "# verify each real entity id. NEVER commit this file.\n")
    map_yaml = map_hdr + yaml.safe_dump(mapping_tree, default_flow_style=False, allow_unicode=True, sort_keys=False)
    if args.mapping_out:
        with open(args.mapping_out, "w", encoding="utf-8") as fh:
            fh.write(map_yaml)
        print(f"mapping suggestion -> {args.mapping_out} ({len(pairs)} entities)")
    else:
        print("\n--- mapping suggestion (do not commit) ---")
        print(map_yaml)


if __name__ == "__main__":
    main()
