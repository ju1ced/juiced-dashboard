"""Tests for scripts/perf_baseline.py — offline, synthetic fixtures only."""
import json
import os
import subprocess
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPT = os.path.join(REPO, "scripts", "perf_baseline.py")

EXPORT = {"config": {"views": [
    {"path": "a", "type": "sections", "cards": [
        {"type": "tile", "entity": "light.a"},
        {"type": "grid", "cards": [{"type": "tile", "entity": "sensor.b"}]}]},
    {"path": "b", "type": "sections", "cards": [
        {"type": "markdown", "content": "{{ states('x') }}"}]},
]}}


def run(*args):
    p = subprocess.run([sys.executable, SCRIPT, *args], cwd=REPO, capture_output=True, text=True)
    return p.returncode, p.stdout + p.stderr


def test_structural_metrics_and_no_entity_leak(tmp_path):
    exp = tmp_path / "export.json"
    exp.write_text(json.dumps(EXPORT))
    out = tmp_path / "b.json"
    rc, log = run("--export", str(exp), "--json-out", str(out))
    assert rc == 0, log
    data = json.loads(out.read_text())
    assert data["global"]["views"] == 2
    assert data["global"]["total_cards"] == 4  # tile, grid, tile, markdown
    va = next(v for v in data["views"] if v["path"] == "a")
    assert va["cards"] == 3 and va["entities"] == 2 and va["max_depth"] >= 1
    assert data["global"]["bundle"]["total_bytes"] is None  # no --resources-dir
    # counts only — never entity IDs
    blob = out.read_text()
    assert "light.a" not in blob and "sensor.b" not in blob


def test_bundle_measurement(tmp_path):
    community = tmp_path / "community" / "mod"
    community.mkdir(parents=True)
    (community / "mod.js").write_bytes(b"x" * 2048)
    rlist = tmp_path / "res.txt"
    rlist.write_text("/hacsfiles/mod/mod.js?hacstag=1\n")
    exp = tmp_path / "e.json"
    exp.write_text(json.dumps({"config": {"views": []}}))
    out = tmp_path / "b.json"
    rc, log = run("--export", str(exp), "--resources-list", str(rlist),
                  "--resources-dir", str(tmp_path / "community"), "--json-out", str(out))
    assert rc == 0, log
    b = json.loads(out.read_text())["global"]["bundle"]
    assert b["total_bytes"] == 2048 and b["modules_measured"] == 1
