#!/usr/bin/env python3
"""Prepare a surgical single-view write to the MCP Test dashboard (offline generator).

This script does NOT talk to Home Assistant and holds no token. It takes a RENDERED view
(real entity IDs, produced by render_dashboard.py into git-ignored build/) and emits:

  1. the exact `python_transform` for a surgical `config['views'][<index>] = {...}` write, and
  2. the safety checklist the agent must follow to perform that write via the MCP tool
     `ha_config_set_dashboard` (runtime BestPracticeKey from ha_get_skill_guide — it rotates
     hourly, never store it — plus a FRESH config_hash from ha_config_get_dashboard).

It hard-refuses to target the default dashboard. The rendered view and the emitted payload
contain real IDs, so they go under build/ (git-ignored) and must never be committed.

    python scripts/stage_to_mcptest.py build/badkamer.yaml --index 11
"""
import argparse
import os
import sys

import yaml

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from juiced_common import REPO_ROOT  # noqa: E402

FORBIDDEN = {"lovelace", "default"}


def load_view(path):
    with open(path, "r", encoding="utf-8") as fh:
        if path.endswith(".json"):
            import json
            return json.load(fh)
        return yaml.safe_load(fh)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("rendered_view", help="rendered view file (real IDs; from build/)")
    ap.add_argument("--index", type=int, required=True, help="view index to replace")
    ap.add_argument("--url-path", default="mcp-test-dashboard")
    ap.add_argument("--out", default=None, help="write the transform to this file (default: build/)")
    args = ap.parse_args()

    if args.url_path in FORBIDDEN:
        print(f"REFUSED: '{args.url_path}' is the default dashboard — never a write target.", file=sys.stderr)
        sys.exit(2)

    view = load_view(args.rendered_view)
    transform = f"config['views'][{args.index}] = {view!r}"

    out = args.out or os.path.join(REPO_ROOT, "build", f"transform-view-{args.index}.txt")
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(transform + "\n")

    print(f"target dashboard : {args.url_path}")
    print(f"view index       : {args.index}")
    print(f"transform ({len(transform)} chars) -> {out}  (git-ignored; do NOT commit)")
    print()
    print("Agent staging checklist (perform the write via MCP, not from this script):")
    print(f"  1. Confirm target is '{args.url_path}' (NOT lovelace/default).")
    print("  2. Snapshot: ha_config_get_dashboard(url_path=...) -> save current views[index].")
    print("  3. Fresh key: ha_get_skill_guide(...) -> BestPracticeKey (rotates hourly; never store).")
    print("  4. Fresh hash: ha_config_get_dashboard(url_path=...) -> config_hash.")
    print("  5. Write: ha_config_set_dashboard(url_path=..., python_transform=<file above>,")
    print("           config_hash=<fresh>, BestPracticeKey=<fresh>, MandatoryBPS=false).")
    print("  6. Verify: re-read; other views unchanged; then")
    print("     python scripts/parity_setdiff.py <original-view.json> <rendered_view>.")


if __name__ == "__main__":
    main()
