"""Shared helpers for the Juiced Dashboard tooling.

Placeholder contract: committed YAML never contains real entity IDs. Instead it uses
logical placeholders of the form ``<<group.key>>`` (at least one dot), resolved at render
time from the git-ignored ``dashboard/templates/entities.local.yaml``.

Include contract: ``!include <path>`` is **file-relative** — resolved relative to the
directory of the file that declares it, exactly like Home Assistant's own YAML loader
(``homeassistant.util.yaml.loader``). So a view in ``dashboard/views/foo.yaml`` includes a
card with ``!include ../cards/bar.yaml``. This is documented in ARCHITECTURE.md.
"""
import os
import re
import yaml

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DASHBOARD_DIR = os.path.join(REPO_ROOT, "dashboard")

PLACEHOLDER_RE = re.compile(r"<<\s*([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)+)\s*>>")


class IncludeError(Exception):
    """Raised when an ``!include`` target cannot be resolved."""


class IncludeLoader(yaml.SafeLoader):
    """SafeLoader that resolves ``!include`` **relative to the including file**.

    Each loader instance records the directory of its own stream, so nested includes
    (dashboard -> view -> card) each resolve against their own file's directory.
    """

    def __init__(self, stream):
        try:
            self._root = os.path.dirname(os.path.abspath(stream.name))
        except AttributeError:
            self._root = os.getcwd()
        super().__init__(stream)


def _construct_include(loader, node):
    rel = loader.construct_scalar(node)
    path = os.path.normpath(os.path.join(loader._root, rel))
    if not os.path.isfile(path):
        raise IncludeError(f"!include target not found: '{rel}' (resolved to {path})")
    with open(path, "r", encoding="utf-8") as fh:
        return yaml.load(fh, IncludeLoader)


IncludeLoader.add_constructor("!include", _construct_include)


def load_composed(dashboard_yaml=None):
    """Load dashboard.yaml resolving all ``!include`` directives (file-relative)."""
    if dashboard_yaml is None:
        dashboard_yaml = os.path.join(DASHBOARD_DIR, "dashboard.yaml")
    with open(dashboard_yaml, "r", encoding="utf-8") as fh:
        return yaml.load(fh, IncludeLoader)


def iter_yaml_files(root, skip_local=True, skip_example=True):
    """Yield .yaml/.yml files under root, skipping local/example and build/."""
    for dirpath, _dirnames, filenames in os.walk(root):
        parts = dirpath.split(os.sep)
        if "build" in parts or "node_modules" in parts:
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
