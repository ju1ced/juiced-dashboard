#!/usr/bin/env python3
"""Verify every custom card type used has a declared frontend resource (offline).

OFFLINE (CI-safe): scans committed dashboard YAML for ``custom:<type>`` and fails if a type
is not declared in the resource manifest ``dashboard/resources.yaml`` (``allowed_custom_cards``).
The manifest is the offline source of truth for which HACS/custom cards the dashboard is
allowed to depend on.

LIVE (local only, opt-in via --live): would cross-check the manifest against the resources
actually registered in the running Home Assistant. Not run in CI (no HA access / secrets).

    python scripts/check_resources.py
    python scripts/check_resources.py a.yaml ...   # explicit paths (tests)
    python scripts/check_resources.py --manifest dashboard/resources.yaml
    python scripts/check_resources.py --live        # local only
"""
import argparse
import os
import re
import sys

import yaml

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from juiced_common import DASHBOARD_DIR, REPO_ROOT, iter_yaml_files  # noqa: E402

CUSTOM_RE = re.compile(r"custom:[a-z0-9][a-z0-9_-]*")
DEFAULT_MANIFEST = os.path.join(DASHBOARD_DIR, "resources.yaml")


def load_allowed(manifest):
    if not os.path.exists(manifest):
        return None
    with open(manifest, "r", encoding="utf-8") as fh:
        data = yaml.safe_load(fh) or {}
    return set(data.get("allowed_custom_cards") or [])


def used_custom_types(paths):
    used = {}
    for path in paths:
        with open(path, "r", encoding="utf-8") as fh:
            for i, line in enumerate(fh, 1):
                for m in CUSTOM_RE.finditer(line):
                    used.setdefault(m.group(0), []).append((path, i))
    return used


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("paths", nargs="*")
    ap.add_argument("--manifest", default=DEFAULT_MANIFEST)
    ap.add_argument("--live", action="store_true")
    args = ap.parse_args()

    if args.live:
        print("live resource check is a local-only step (requires Home Assistant) — skipped in CI")
        return

    allowed = load_allowed(args.manifest)
    if allowed is None:
        print(f"FAIL: resource manifest not found: {args.manifest}", file=sys.stderr)
        sys.exit(1)

    paths = args.paths or list(iter_yaml_files(DASHBOARD_DIR))
    used = used_custom_types(paths)
    problems = []
    for ctype, locs in sorted(used.items()):
        if ctype not in allowed:
            f, ln = locs[0]
            problems.append(f"{os.path.relpath(f, REPO_ROOT)}:{ln}: undeclared custom card '{ctype}' "
                            f"(add it to {os.path.relpath(args.manifest, REPO_ROOT)})")
    if problems:
        print("FAIL: undeclared custom card resources:", file=sys.stderr)
        for p in problems:
            print(f"  - {p}", file=sys.stderr)
        sys.exit(1)
    print(f"OK: {len(used)} custom card type(s) used, all declared in the manifest.")


if __name__ == "__main__":
    main()
