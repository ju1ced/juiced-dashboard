#!/usr/bin/env python3
"""CI guard: fail if real entity IDs or device serials are committed.

Committed dashboard YAML must use logical placeholders (``<<group.key>>``), not real entity
IDs. Real IDs and serials belong only in the git-ignored entities.local.yaml. This guard
scans git-tracked dashboard YAML (excluding *.local.* and *.example.*) and fails on:

  - device serials (e.g. ``sn_1234567890``)
  - real entity IDs (``<domain>.<name>``) that are NOT wrapped in a ``<<...>>`` placeholder

    python scripts/check_entity_refs.py           # scans git-tracked files
    python scripts/check_entity_refs.py a.yaml ... # scans the given paths (pre-commit hook)
"""
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from juiced_common import REPO_ROOT, PLACEHOLDER_RE  # noqa: E402

SERIAL_RE = re.compile(r"\bsn_[0-9]{6,}\b")
DOMAINS = (
    "light|switch|sensor|binary_sensor|cover|climate|media_player|fan|lock|vacuum|camera|"
    "number|select|button|scene|script|input_boolean|input_number|input_text|input_select|"
    "person|device_tracker|alarm_control_panel|humidifier|water_heater|siren|valve|update|"
    "weather|todo|calendar|image|lawn_mower|remote|counter|timer"
)
ENTITY_RE = re.compile(r"\b(?:%s)\.[a-z0-9_]+\b" % DOMAINS)


def tracked_yaml():
    try:
        out = subprocess.check_output(
            ["git", "ls-files", "dashboard/*.yaml", "dashboard/**/*.yaml"],
            cwd=REPO_ROOT, text=True,
        )
    except subprocess.CalledProcessError:
        return []
    files = [os.path.join(REPO_ROOT, p) for p in out.split() if p.strip()]
    return [f for f in files if ".local." not in f and ".example." not in f]


def scan(path):
    violations = []
    with open(path, "r", encoding="utf-8") as fh:
        for i, line in enumerate(fh, 1):
            for m in SERIAL_RE.finditer(line):
                violations.append((i, "serial", m.group(0)))
            stripped = PLACEHOLDER_RE.sub("", line)  # ignore placeholder contents
            for m in ENTITY_RE.finditer(stripped):
                violations.append((i, "entity_id", m.group(0)))
    return violations


def main():
    paths = sys.argv[1:] or tracked_yaml()
    paths = [p for p in paths if ".local." not in p and ".example." not in p]
    total = 0
    for path in paths:
        for line, kind, val in scan(path):
            rel = os.path.relpath(path, REPO_ROOT)
            print(f"{rel}:{line}: real {kind} committed: {val}  (use a <<group.key>> placeholder)")
            total += 1
    if total:
        print(f"\nFAIL: {total} real entity reference(s) in committed YAML.", file=sys.stderr)
        sys.exit(1)
    print(f"OK: no real entity IDs/serials in {len(paths)} committed dashboard file(s).")


if __name__ == "__main__":
    main()
