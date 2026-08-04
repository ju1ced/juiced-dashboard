#!/usr/bin/env python3
"""Compute a deterministic, static performance baseline (offline; no browser).

Two measurements, both reproducible and free of entity IDs (counts only):

  1. GLOBAL FIRST-LOAD BUNDLE — total bytes of the JS modules loaded on every view
     (from perf/loaded-resources.txt mapped onto the on-disk HACS www/community dir).
  2. PER-VIEW STRUCTURAL METRICS — from a dashboard export JSON: card count, max nesting
     depth, unique-entity count, custom-card count, card_mod count, template-token counts.

These are proxies for render cost that later PRs re-run and diff. They do NOT replace runtime
metrics (scripting time, DOM nodes, TTI) — see the runtime template in
docs/performance-baseline.md, filled in via Chrome DevTools / Lighthouse on MCP Test.

    python scripts/perf_baseline.py --export export.json \
        --resources-dir /path/to/config/www/community \
        --json-out perf-baseline.json --md-out docs/performance-baseline.md

The export is produced read-only by the agent (ha_config_get_dashboard) and is NOT committed.
--resources-dir is a local path (HACS files) and is optional; without it, bundle bytes are
reported as unmeasured.
"""
import argparse
import json
import os
import re
import sys

CONTAINER_KEYS = ("cards", "card", "sections", "badges", "states", "elements")


def load_views(export):
    with open(export, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    return data.get("config", data).get("views", [])


def count_cards_and_depth(node, depth=0):
    cards = 0
    max_depth = depth
    if isinstance(node, dict):
        if isinstance(node.get("type"), str):
            cards += 1
        for k in CONTAINER_KEYS:
            if k in node:
                c, d = count_cards_and_depth(node[k], depth + 1)
                cards += c
                max_depth = max(max_depth, d)
        cf = node.get("custom_fields")
        if isinstance(cf, dict):
            for v in cf.values():
                c, d = count_cards_and_depth(v, depth + 1)
                cards += c
                max_depth = max(max_depth, d)
    elif isinstance(node, list):
        for x in node:
            c, d = count_cards_and_depth(x, depth)
            cards += c
            max_depth = max(max_depth, d)
    return cards, max_depth


def collect_entities(node, acc):
    if isinstance(node, dict):
        e = node.get("entity")
        if isinstance(e, str):
            acc.add(e)
        ents = node.get("entities")
        if isinstance(ents, list):
            for it in ents:
                if isinstance(it, str):
                    acc.add(it)
                elif isinstance(it, dict) and isinstance(it.get("entity"), str):
                    acc.add(it["entity"])
        for v in node.values():
            collect_entities(v, acc)
    elif isinstance(node, list):
        for x in node:
            collect_entities(x, acc)


def token_counts(text):
    return {
        "jinja_stmt": len(re.findall(r"{%", text)),
        "jinja_expr": len(re.findall(r"{{", text)),
        "js_template": len(re.findall(r"\[\[\[", text)),
        "card_mod": len(re.findall(r"card_mod", text)),
    }


def custom_cards(text):
    return len(re.findall(r'"type":\s*"custom:', text))


def measure_bundle(resources_list, resources_dir):
    mods = []
    missing = []
    total = 0
    with open(resources_list, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            url = line.split("?", 1)[0]
            if not url.startswith("/hacsfiles/"):
                missing.append(url + " (not under /hacsfiles)")
                continue
            rel = url[len("/hacsfiles/"):]
            path = os.path.join(resources_dir, rel)
            if os.path.isfile(path):
                size = os.path.getsize(path)
                total += size
                mods.append((rel, size))
            else:
                missing.append(url)
    mods.sort(key=lambda x: -x[1])
    return {"total_bytes": total, "total_kb": round(total / 1024, 1),
            "modules_measured": len(mods), "modules_missing": missing,
            "top_modules": [{"module": m, "kb": round(b / 1024, 1)} for m, b in mods[:10]]}


def build(export, resources_list, resources_dir):
    views = load_views(export)
    per_view = []
    all_ents = set()
    g_tokens = {"jinja_stmt": 0, "jinja_expr": 0, "js_template": 0, "card_mod": 0}
    total_cards = 0
    for v in views:
        text = json.dumps(v)
        # count cards INSIDE the view's containers — the view wrapper is not a card
        cards, depth = 0, 0
        for key in ("cards", "sections", "badges"):
            if key in v:
                c, d = count_cards_and_depth(v[key], 0)
                cards += c
                depth = max(depth, d)
        hdr = v.get("header")
        if isinstance(hdr, dict) and isinstance(hdr.get("card"), dict):
            c, _ = count_cards_and_depth(hdr["card"], 0)
            cards += c
        ents = set()
        collect_entities(v, ents)
        all_ents |= ents
        tk = token_counts(text)
        for k in g_tokens:
            g_tokens[k] += tk[k]
        total_cards += cards
        per_view.append({
            "title": v.get("title") or v.get("path") or "(untitled)",
            "path": v.get("path"),
            "type": v.get("type", "masonry"),
            "cards": cards,
            "max_depth": depth,
            "entities": len(ents),
            "custom_cards": custom_cards(text),
            "card_mod": tk["card_mod"],
            "jinja": tk["jinja_stmt"] + tk["jinja_expr"],
        })
    bundle = (measure_bundle(resources_list, resources_dir) if resources_dir
              else {"total_bytes": None, "note": "not measured (pass --resources-dir)"})
    return {
        "note": "Static baseline (counts only, no entity IDs). Regenerate with scripts/perf_baseline.py.",
        "global": {
            "views": len(views),
            "total_cards": total_cards,
            "unique_entities": len(all_ents),
            "template_tokens": g_tokens,
            "bundle": bundle,
        },
        "views": per_view,
    }


def to_markdown(data):
    g = data["global"]
    b = g["bundle"]
    lines = []
    lines.append("# Performance baseline (static / structural)")
    lines.append("")
    lines.append("> Generated by `scripts/perf_baseline.py` — deterministic, no browser, counts only.")
    lines.append("> Regenerate after each migration PR and diff against this file.")
    lines.append("> Runtime metrics (scripting time, DOM nodes, TTI) are NOT here — fill the")
    lines.append("> runtime template at the bottom via Chrome DevTools / Lighthouse on MCP Test.")
    lines.append("")
    lines.append("## Global first-load")
    lines.append("")
    lines.append(f"- Views: **{g['views']}** · total cards: **{g['total_cards']}** · unique entities: **{g['unique_entities']}**")
    if b.get("total_bytes") is not None:
        lines.append(f"- **JS bundle loaded on every view: {b['total_kb']} KB** across {b['modules_measured']} modules"
                     + (f" ({len(b['modules_missing'])} not measured)" if b['modules_missing'] else ""))
        lines.append("  (uncompressed on-disk = browser parse cost; gzip transfer is smaller)")
    else:
        lines.append("- JS bundle: not measured (run with `--resources-dir`)")
    tt = g["template_tokens"]
    lines.append(f"- Template load: `{{%` {tt['jinja_stmt']}× · `{{{{` {tt['jinja_expr']}× · `[[[` {tt['js_template']}× · `card_mod` {tt['card_mod']}×")
    lines.append("")
    if b.get("top_modules"):
        lines.append("### Heaviest bundle modules")
        lines.append("")
        lines.append("| Module | KB |")
        lines.append("| --- | ---: |")
        for m in b["top_modules"]:
            lines.append(f"| `{m['module']}` | {m['kb']} |")
        lines.append("")
    lines.append("## Per-view structural metrics")
    lines.append("")
    lines.append("| View | Type | Cards | Depth | Entities | Custom | card_mod | Jinja |")
    lines.append("| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |")
    for v in sorted(data["views"], key=lambda x: -x["cards"]):
        lines.append(f"| {v['title']} | {v['type']} | {v['cards']} | {v['max_depth']} | "
                     f"{v['entities']} | {v['custom_cards']} | {v['card_mod']} | {v['jinja']} |")
    lines.append("")
    rt = data.get("runtime")
    lines.append("## Runtime metrics (measured on MCP Test)")
    lines.append("")
    if rt:
        lines.append("Measured with `perf/collect_runtime.mjs` (headless Chromium, Shadow-DOM-aware node")
        lines.append("count, JS Coverage). `Load` is navigation-only; main-thread cost is in `Long-tasks`.")
        lines.append("")
        lines.append("| View | Load ms | DOM nodes | Long-tasks ms | JS heap MB | Unused JS % |")
        lines.append("| --- | ---: | ---: | ---: | ---: | ---: |")
        for vid, m in rt.items():
            label = "Home" if str(vid) == "0" else vid
            if m.get("error") or m.get("authFailed"):
                lines.append(f"| {label} | (measurement failed) |  |  |  |  |")
            else:
                lines.append(f"| {label} | {m.get('load')} | {m.get('domNodes')} | "
                             f"{m.get('longTasksMs')} | {m.get('jsHeapMB')} | {m.get('jsUnusedPct')} |")
    else:
        lines.append("Not yet measured. Run `perf/collect_runtime.mjs` (see perf/README.md) and pass")
        lines.append("`--runtime perf/runtime-results.json` to this script to fill this table.")
        lines.append("")
        lines.append("| View | Load ms | DOM nodes | Long-tasks ms | JS heap MB | Unused JS % |")
        lines.append("| --- | ---: | ---: | ---: | ---: | ---: |")
        for name in ("Home", "terras", "energy", "serverroom", "person"):
            lines.append(f"| {name} |  |  |  |  |  |")
    lines.append("")
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--export", required=True)
    ap.add_argument("--resources-list", default=os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "perf", "loaded-resources.txt"))
    ap.add_argument("--resources-dir", default=None)
    ap.add_argument("--json-out", default=None)
    ap.add_argument("--md-out", default=None)
    ap.add_argument("--runtime", default=None, help="runtime-results.json to fill the runtime table")
    args = ap.parse_args()

    data = build(args.export, args.resources_list, args.resources_dir)
    if args.runtime and os.path.exists(args.runtime):
        with open(args.runtime, "r", encoding="utf-8") as fh:
            rt = json.load(fh)
        data["runtime"] = {r["view"]: r for r in rt.get("results", [])}
    if args.json_out:
        with open(args.json_out, "w", encoding="utf-8") as fh:
            json.dump(data, fh, indent=2)
        print(f"json -> {args.json_out}")
    if args.md_out:
        with open(args.md_out, "w", encoding="utf-8") as fh:
            fh.write(to_markdown(data).rstrip() + "\n")
        print(f"markdown -> {args.md_out}")
    g = data["global"]
    print(f"views={g['views']} cards={g['total_cards']} entities={g['unique_entities']} "
          f"bundle_kb={g['bundle'].get('total_kb')}")


if __name__ == "__main__":
    main()
