#!/usr/bin/env python3
"""Render a deployable dashboard by resolving includes and substituting real entity IDs.

    python scripts/render_dashboard.py --out build/juiced-dashboard.yaml
    python scripts/render_dashboard.py --self-test        # verify the mechanism on a fixture

Reads dashboard/dashboard.yaml (resolving !include) plus the git-ignored local mapping
(dashboard/templates/entities.local.yaml), replaces every ``<<group.key>>`` placeholder with
the mapped entity ID, and writes the result. The rendered output contains real IDs and is
git-ignored (write it under build/).
"""
import argparse
import os
import sys
import yaml

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from juiced_common import (  # noqa: E402
    REPO_ROOT, DASHBOARD_DIR, PLACEHOLDER_RE, load_composed, walk_strings,
    lookup, load_local_mapping,
)


def substitute(config, mapping):
    missing = set()

    def repl_str(s):
        def _one(m):
            key = m.group(1)
            val = lookup(mapping, key)
            if val is None:
                missing.add(key)
                return m.group(0)
            return str(val)
        return PLACEHOLDER_RE.sub(_one, s)

    rendered = walk_strings(config, repl_str)
    return rendered, sorted(missing)


def render(dashboard_yaml, mapping_path, out_path, allow_missing=False):
    config = load_composed(dashboard_yaml)
    mapping, used_path = load_local_mapping(mapping_path)
    rendered, missing = substitute(config, mapping)
    if missing and not allow_missing:
        print(f"ERROR: {len(missing)} unmapped placeholder(s) (add them to {used_path}):", file=sys.stderr)
        for k in missing:
            print(f"  - {k}", file=sys.stderr)
        print("Run: python scripts/init_mapping.py  then fill the TODO lines.", file=sys.stderr)
        return None, missing
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as fh:
        yaml.safe_dump(rendered, fh, default_flow_style=False, allow_unicode=True, sort_keys=False)
    return out_path, missing


def self_test():
    fx = os.path.join(REPO_ROOT, "tests", "fixtures")
    out = os.path.join(REPO_ROOT, "build", "selftest.yaml")
    config = load_composed(os.path.join(fx, "demo-dashboard.yaml"))
    mapping, _ = load_local_mapping(os.path.join(fx, "mapping.yaml"))
    rendered, missing = substitute(config, mapping)
    text = yaml.safe_dump(rendered, allow_unicode=True)
    assert not missing, f"self-test: unexpected missing keys {missing}"
    assert "<<" not in text, "self-test: placeholders remained after render"
    assert "light.example_badkamer" in text, "self-test: expected mapped id not found"
    print("render self-test OK — placeholders resolved from local mapping")
    return 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dashboard", default=os.path.join(DASHBOARD_DIR, "dashboard.yaml"))
    ap.add_argument("--mapping", default=None, help="entities.local.yaml (default: dashboard/templates/)")
    ap.add_argument("--out", default=os.path.join(REPO_ROOT, "build", "juiced-dashboard.yaml"))
    ap.add_argument("--allow-missing", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()

    if args.self_test:
        sys.exit(self_test())

    out, missing = render(args.dashboard, args.mapping, args.out, args.allow_missing)
    if out is None:
        sys.exit(1)
    print(f"rendered -> {out}" + (f" ({len(missing)} placeholders left unmapped)" if missing else ""))


if __name__ == "__main__":
    main()
