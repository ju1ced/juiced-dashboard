#!/usr/bin/env python3
"""Privacy guard: block real entity IDs and device serials in committed dashboard YAML.

Rules (see docs/entity-mapping.md):
  - **Serials** (e.g. ``sn_1234567890``) are blocked in ALL scanned files, including
    examples and fixtures.
  - **Real entity IDs** (``<domain>.<name>``) are blocked in normal dashboard YAML — use a
    ``<<group.key>>`` placeholder instead.
  - In example/fixture files, entity IDs are allowed ONLY if provably fictional: the name
    part must start with ``example_`` (e.g. ``light.example_kitchen``).

False positives avoided: placeholders (``<<...>>``), Lovelace action/service names
(``perform_action: light.turn_on``), icons (``mdi:...``), URLs, and templating are not
flagged as entity IDs.

    python scripts/check_entity_refs.py            # scan git-tracked dashboard + fixtures
    python scripts/check_entity_refs.py a.yaml ... # scan explicit paths (pre-commit / tests)
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
    "input_datetime|person|device_tracker|alarm_control_panel|humidifier|water_heater|siren|"
    "valve|update|weather|todo|calendar|image|lawn_mower|remote|counter|timer|group"
)
ENTITY_RE = re.compile(r"\b(?:%s)\.[a-z0-9_]+\b" % DOMAINS)
# Service / action names (not entities): `perform_action: light.turn_on`, `service: script.x`
SERVICE_TOKEN_RE = re.compile(
    r"(?:perform_action|service|action)\s*:\s*[\"']?(?:%s)\.[a-z0-9_]+" % DOMAINS
)
INCLUDE_RE = re.compile(r"!include\s+\S+")
EXAMPLE_NAME_RE = re.compile(r"\.(example_[a-z0-9_]*)\b")
# name-parts that are file extensions, not entities (e.g. an !include of light.yaml)
FILE_EXTS = {"yaml", "yml", "json", "js", "css", "md", "png", "jpg", "jpeg", "svg", "txt", "html"}


def is_example_or_fixture(path):
    p = path.replace("\\", "/")
    base = os.path.basename(p)
    return ".example." in base or "tests/fixtures/" in p


def tracked_yaml():
    globs = ["dashboard/*.yaml", "dashboard/**/*.yaml", "tests/**/*.yaml"]
    try:
        out = subprocess.check_output(["git", "ls-files", *globs], cwd=REPO_ROOT, text=True)
    except subprocess.CalledProcessError:
        return []
    files = [os.path.join(REPO_ROOT, p) for p in out.split() if p.strip()]
    # never scan local mappings (git-ignored anyway) or negative test fixtures
    return [f for f in files if ".local." not in f and "/fixtures/negative/" not in f.replace("\\", "/")]


def scan(path):
    example = is_example_or_fixture(path)
    violations = []
    with open(path, "r", encoding="utf-8") as fh:
        for i, line in enumerate(fh, 1):
            for m in SERIAL_RE.finditer(line):
                violations.append((i, "serial", m.group(0)))
            # strip placeholders, !include paths and service/action tokens first
            cleaned = PLACEHOLDER_RE.sub("", line)
            cleaned = INCLUDE_RE.sub("", cleaned)
            cleaned = SERVICE_TOKEN_RE.sub("", cleaned)
            for m in ENTITY_RE.finditer(cleaned):
                token = m.group(0)
                if token.rsplit(".", 1)[1] in FILE_EXTS:
                    continue  # a filename like light.yaml, not an entity
                if example:
                    if not EXAMPLE_NAME_RE.search(token):
                        violations.append((i, "non-fictional-example", token))
                else:
                    violations.append((i, "entity_id", token))
    return violations


def main():
    args = [a for a in sys.argv[1:]]
    paths = args or tracked_yaml()
    paths = [p for p in paths if ".local." not in p]
    total = 0
    for path in paths:
        for line, kind, val in scan(path):
            rel = os.path.relpath(path, REPO_ROOT)
            hint = {
                "serial": "device serials must never be committed",
                "entity_id": "use a <<group.key>> placeholder",
                "non-fictional-example": "example IDs must start with 'example_'",
            }[kind]
            print(f"{rel}:{line}: {kind}: {val}  ({hint})")
            total += 1
    if total:
        print(f"\nFAIL: {total} privacy violation(s) in committed YAML.", file=sys.stderr)
        sys.exit(1)
    print(f"OK: no real entity IDs/serials in {len(paths)} scanned file(s).")


if __name__ == "__main__":
    main()
