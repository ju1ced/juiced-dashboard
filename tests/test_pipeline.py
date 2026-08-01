"""PR-02 validation-pipeline tests.

Positive cases run against the real repo. Every NEGATIVE case is constructed in a tmp dir so
no real IDs / serials / malformed data are ever committed. Each guard is proven to exit
non-zero on bad input.
"""
import os
import subprocess
import sys

import pytest

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS = os.path.join(REPO, "scripts")
sys.path.insert(0, SCRIPTS)

import juiced_common as jc  # noqa: E402


def run(script, *args, cwd=REPO):
    """Run a script; return (returncode, combined output)."""
    proc = subprocess.run(
        [sys.executable, os.path.join(SCRIPTS, script), *args],
        cwd=cwd, capture_output=True, text=True,
    )
    return proc.returncode, proc.stdout + proc.stderr


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(text)
    return path


# --------------------------------------------------------------------------- positive

def test_render_self_test_passes():
    rc, out = run("render_dashboard.py", "--self-test")
    assert rc == 0, out


def test_validate_compose_repo_passes():
    rc, out = run("validate_compose.py")
    assert rc == 0, out


def test_check_entity_refs_repo_clean():
    rc, out = run("check_entity_refs.py")
    assert rc == 0, out


def test_check_entities_example_mapping_ok():
    rc, out = run("check_entities.py", "--mapping", "dashboard/templates/entities.example.yaml")
    assert rc == 0, out


def test_check_resources_repo_ok():
    rc, out = run("check_resources.py")
    assert rc == 0, out


def test_nested_includes_are_file_relative():
    dash = os.path.join(REPO, "tests", "fixtures", "nested", "demo-dashboard.yaml")
    cfg = jc.load_composed(dash)
    card = cfg["views"][0]["sections"][0]["cards"][0]
    assert card["type"] == "custom:mushroom-light-card"
    assert card["entity"] == "<<demo.light>>"


# --------------------------------------------------------------------------- negative: privacy guard

def test_guard_rejects_real_entity_id(tmp_path):
    f = write(str(tmp_path / "view.yaml"), "type: entities\nentities:\n  - entity: light.living_room\n")
    rc, out = run("check_entity_refs.py", f)
    assert rc != 0 and "light.living_room" in out, out


def test_guard_rejects_serial(tmp_path):
    f = write(str(tmp_path / "view.yaml"), 'name: "sn_1234567890"\nentity: "<<room.x>>"\n')
    rc, out = run("check_entity_refs.py", f)
    assert rc != 0 and "serial" in out, out


def test_guard_rejects_nonfictional_example(tmp_path):
    f = write(str(tmp_path / "bad.example.yaml"), "entity: light.living_room\n")
    rc, out = run("check_entity_refs.py", f)
    assert rc != 0 and "example" in out.lower(), out


def test_guard_allows_placeholder_and_example(tmp_path):
    f = write(str(tmp_path / "good.example.yaml"),
              'a: "<<room.light>>"\nb: light.example_kitchen\n')
    rc, out = run("check_entity_refs.py", f)
    assert rc == 0, out


def test_guard_ignores_service_and_action(tmp_path):
    f = write(str(tmp_path / "actions.yaml"),
              "tap_action:\n  action: perform-action\n  perform_action: light.turn_on\n")
    rc, out = run("check_entity_refs.py", f)
    assert rc == 0, out


# --------------------------------------------------------------------------- negative: compose

def _dash(tmp_path, views_yaml):
    return write(str(tmp_path / "dashboard.yaml"), f"title: T\nviews:\n{views_yaml}")


def test_compose_missing_include(tmp_path):
    dash = _dash(tmp_path, "  - !include missing.yaml\n")
    rc, out = run("validate_compose.py", "--dashboard", dash)
    assert rc != 0 and "not found" in out, out


def test_compose_view_without_path(tmp_path):
    dash = _dash(tmp_path, "  - title: X\n    type: sections\n")
    rc, out = run("validate_compose.py", "--dashboard", dash)
    assert rc != 0 and "path" in out, out


def test_compose_view_without_type(tmp_path):
    dash = _dash(tmp_path, "  - title: X\n    path: x\n")
    rc, out = run("validate_compose.py", "--dashboard", dash)
    assert rc != 0 and "type" in out, out


# --------------------------------------------------------------------------- negative: render / mapping

def test_render_unresolved_placeholder_fails(tmp_path):
    dash = write(str(tmp_path / "dashboard.yaml"), "title: T\nviews:\n  - !include view.yaml\n")
    write(str(tmp_path / "view.yaml"), 'title: v\npath: v\ntype: sections\nsections:\n  - type: grid\n    cards:\n      - {type: tile, entity: "<<room.unmapped>>"}\n')
    mapping = write(str(tmp_path / "map.yaml"), "room:\n  other: light.example_x\n")
    out_file = str(tmp_path / "out.yaml")
    rc, out = run("render_dashboard.py", "--dashboard", dash, "--mapping", mapping, "--out", out_file)
    assert rc != 0 and "room.unmapped" in out, out


def test_check_entities_missing_mapping_fails(tmp_path):
    scan = tmp_path / "scan"
    write(str(scan / "view.yaml"), 'entity: "<<room.light>>"\n')
    mapping = write(str(tmp_path / "map.yaml"), "room:\n  other: light.example_x\n")
    rc, out = run("check_entities.py", "--scan-dir", str(scan), "--mapping", mapping)
    assert rc != 0 and "room.light" in out, out


def test_check_entities_malformed_value_fails(tmp_path):
    scan = tmp_path / "scan"
    os.makedirs(scan, exist_ok=True)
    mapping = write(str(tmp_path / "map.yaml"), "room:\n  light: not_an_entity_id\n")
    rc, out = run("check_entities.py", "--scan-dir", str(scan), "--mapping", mapping)
    assert rc != 0 and "not_an_entity_id" in out, out


# --------------------------------------------------------------------------- negative: resources

def test_check_resources_unknown_custom_fails(tmp_path):
    f = write(str(tmp_path / "view.yaml"), "type: custom:totally-unknown-card\n")
    rc, out = run("check_resources.py", f)
    assert rc != 0 and "totally-unknown-card" in out, out


def test_check_resources_known_custom_ok(tmp_path):
    f = write(str(tmp_path / "view.yaml"), "type: custom:mushroom-light-card\n")
    rc, out = run("check_resources.py", f)
    assert rc == 0, out


if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-v"]))
