"""Tests for the PR-05 migration tooling (extract_view, parity_setdiff, stage_to_mcptest).

All offline. No Home Assistant, no committed real data — synthetic fixtures in tmp dirs.
"""
import json
import os
import subprocess
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS = os.path.join(REPO, "scripts")


def run(script, *args):
    p = subprocess.run([sys.executable, os.path.join(SCRIPTS, script), *args],
                       cwd=REPO, capture_output=True, text=True)
    return p.returncode, p.stdout + p.stderr


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(text)
    return path


EXPORT = {
    "config": {"views": [{
        "path": "demo", "type": "sections", "cards": [
            {"type": "custom:mushroom-light-card", "entity": "light.demo_room"},
            {"type": "entities", "entities": [
                {"entity": "sensor.sn_9998887_power"}, "sensor.demo_temp"]},
            {"type": "button", "tap_action": {"action": "perform-action",
                                              "perform_action": "light.turn_on"}},
        ],
    }]},
}


def test_extract_view_parameterizes_and_maps(tmp_path):
    exp = write(str(tmp_path / "export.json"), json.dumps(EXPORT))
    vout = str(tmp_path / "view.yaml")
    mout = str(tmp_path / "map.yaml")
    rc, out = run("extract_view.py", exp, "--view", "demo", "--out", vout, "--mapping-out", mout)
    assert rc == 0, out
    view = open(vout).read()
    mapping = open(mout).read()
    # committed view: only placeholders, no real IDs, no serial (even in keys)
    assert "<<demo." in view
    assert "light.demo_room" not in view and "sensor.demo_temp" not in view
    assert "9998887" not in view
    # service call is preserved (not treated as an entity)
    assert "light.turn_on" in view
    # mapping suggestion carries the real IDs (this file is never committed)
    assert "light.demo_room" in mapping and "sensor.demo_temp" in mapping
    assert "sensor.sn_9998887_power" in mapping


def test_parity_match(tmp_path):
    a = write(str(tmp_path / "a.yaml"),
              "type: sections\ncards:\n  - {type: tile, entity: light.x, tap_action: {action: toggle}}\n")
    b = write(str(tmp_path / "b.yaml"),
              "type: sections\ncards:\n  - {type: tile, entity: light.x, tap_action: {action: toggle}}\n")
    rc, out = run("parity_setdiff.py", a, b)
    assert rc == 0 and "PARITY OK" in out, out


def test_parity_entity_diff_fails(tmp_path):
    a = write(str(tmp_path / "a.yaml"), "type: sections\ncards:\n  - {type: tile, entity: light.x}\n")
    b = write(str(tmp_path / "b.yaml"), "type: sections\ncards:\n  - {type: tile, entity: light.y}\n")
    rc, out = run("parity_setdiff.py", a, b)
    assert rc != 0 and "PARITY FAIL" in out, out


def test_parity_expands_decluttering_template(tmp_path):
    # A: the light expressed inline, with its toggle action.
    a = write(str(tmp_path / "a.yaml"),
              "type: sections\ncards:\n"
              "  - {type: custom:mushroom-light-card, entity: light.x, "
              "tap_action: {action: toggle}}\n")
    # A room sub-template: the entity comes in as a variable, the action lives in
    # the body — so parity must expand the call to see either.
    templates = write(str(tmp_path / "tpl.yaml"),
                      "room_light_row:\n"
                      "  default:\n"
                      "  - name: null\n"
                      "  card:\n"
                      "    type: custom:mushroom-light-card\n"
                      "    entity: '[[entity]]'\n"
                      "    name: '[[name]]'\n"
                      "    tap_action:\n"
                      "      action: toggle\n")
    # B: same light via a decluttering-card call (variables as a list of dicts).
    b = write(str(tmp_path / "b.yaml"),
              "type: sections\ncards:\n"
              "  - type: custom:decluttering-card\n"
              "    template: room_light_row\n"
              "    variables:\n"
              "    - entity: light.x\n")
    rc, out = run("parity_setdiff.py", a, b, "--templates", templates)
    assert rc == 0 and "PARITY OK" in out, out
    # Without the templates the call cannot expand -> entity + action go missing.
    rc2, out2 = run("parity_setdiff.py", a, b, "--templates", str(tmp_path / "none.yaml"))
    assert rc2 != 0 and "PARITY FAIL" in out2, out2


def test_stage_generates_transform(tmp_path):
    rv = write(str(tmp_path / "rendered.yaml"), "title: v\npath: v\ntype: sections\nsections: []\n")
    outfile = str(tmp_path / "transform.txt")
    rc, out = run("stage_to_mcptest.py", rv, "--index", "11", "--out", outfile)
    assert rc == 0, out
    assert "config['views'][11] =" in open(outfile).read()
    assert "mcp-test-dashboard" in out


def test_stage_refuses_default_dashboard(tmp_path):
    rv = write(str(tmp_path / "rendered.yaml"), "title: v\npath: v\ntype: sections\n")
    rc, out = run("stage_to_mcptest.py", rv, "--index", "0", "--url-path", "lovelace")
    assert rc != 0 and "REFUSED" in out, out
