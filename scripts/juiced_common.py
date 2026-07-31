"""Shared helpers for the Juiced Dashboard tooling.

Placeholder contract: committed YAML never contains real entity IDs. Instead it uses
logical placeholders of the form ``<<group.key>>`` (at least one dot), resolved at render
time from the git-ignored ``dashboard/templates/entities.local.yaml``.
"""
import os
import re
import yaml

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DASHBOARD_DIR = os.path.join(REPO_ROOT, "dashboard")

PLACEHOLDER_RE = re.compile(r"<<\s*([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)+)\s*>>")


class IncludeLoader(yaml.SafeLoader):
    """SafeLoader that resolves ``!include <relative-path>`` against a base dir."""


def _make_include(base_dir):
    def _include(loader, node):
        rel = loader.construct_scalar(node)
        path = os.path.join(base_dir, rel)
        with open(path, "r", encoding="utf-8") as fh:
            return yaml.load(fh, IncludeLoader)
    return _include


def load_composed(dashboard_yaml=None):
    """Load dashboard.yaml resolving all ``!include`` directives."""
    if dashboard_yaml is None:
        dashboard_yaml = os.path.join(DASHBOARD_DIR, "dashboard.yaml")
    base_dir = os.path.dirname(dashboard_yaml)
    IncludeLoader.add_constructor("!include", _make_include(base_dir))
    with open(dashboard_yaml, "r", encoding="utf-8") as fh:
        return yaml.load(fh, IncludeLoader)


def iter_yaml_files(root, skip_local=True, skip_example=True):
    """Yield .yaml/.yml files under root, skipping local/example and build/."""
    for dirpath, dirnames, filenames in os.walk(root):
        if "build" in dirpath.split(os.sep):
            continue
        for name in filenames:
            if not name.endswith((".yaml", ".yml")):
                continue
            if skip_local and ".local." in name:
                continue
            if skip_example and ".example." in name:
                continue
            yield os.path.join(dirpath, name)


def find_placeholders_in_text(text):
    return set(PLACEHOLDER_RE.findall(text))


def walk_strings(obj, fn):
    """Return a copy of obj with fn applied to every string leaf."""
    if isinstance(obj, str):
        return fn(obj)
    if isinstance(obj, list):
        return [walk_strings(x, fn) for x in obj]
    if isinstance(obj, dict):
        return {k: walk_strings(v, fn) for k, v in obj.items()}
    return obj


def lookup(mapping, dotted_key):
    """Nested lookup: 'a.b.c' -> mapping['a']['b']['c']; returns None if missing."""
    cur = mapping
    for part in dotted_key.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return None
        cur = cur[part]
    return cur


def load_local_mapping(path=None):
    if path is None:
        path = os.path.join(DASHBOARD_DIR, "templates", "entities.local.yaml")
    if not os.path.exists(path):
        return {}, path
    with open(path, "r", encoding="utf-8") as fh:
        return (yaml.safe_load(fh) or {}), path
