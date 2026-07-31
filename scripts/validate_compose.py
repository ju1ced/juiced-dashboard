#!/usr/bin/env python3
"""Validate the composition root: !include resolves and views are well-formed.

    python scripts/validate_compose.py

Passes on an empty (foundation) dashboard. As views are added, each must have a stable
``path`` and a ``type`` (fragile numeric render-paths are rejected).
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from juiced_common import DASHBOARD_DIR, load_composed  # noqa: E402


def main():
    dashboard_yaml = os.path.join(DASHBOARD_DIR, "dashboard.yaml")
    if not os.path.exists(dashboard_yaml):
        print("no dashboard/dashboard.yaml yet — nothing to validate")
        return
    config = load_composed(dashboard_yaml)  # raises if an !include target is missing
    views = config.get("views") or []
    problems = []
    for i, v in enumerate(views):
        if not isinstance(v, dict):
            problems.append(f"view[{i}]: not a mapping")
            continue
        if not v.get("path"):
            problems.append(f"view[{i}] ({v.get('title', '?')}): missing stable 'path'")
        if not v.get("type"):
            problems.append(f"view[{i}] ({v.get('title', '?')}): missing 'type'")
    print(f"composition OK: {len(views)} view(s), all !include targets resolved")
    if problems:
        print("\nFAIL:", file=sys.stderr)
        for p in problems:
            print(f"  - {p}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
