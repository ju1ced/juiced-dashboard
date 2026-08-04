// Runtime performance collector for the MCP Test dashboard (PR-06 Half 2).
//
// Drives headless Chromium against Home Assistant, authenticates with a Long-Lived Access
// Token (injected into localStorage — the frontend's own auth store), and measures per view:
//   load timing, DOM node count, long-task total, JS heap, and % unused JS (Coverage API).
//
// Reads HA_URL + HA_TOKEN from the environment, or from a git-ignored perf/ha.env
// (KEY=VALUE lines). NEVER commit the token. Targets ONLY mcp-test-dashboard, never lovelace.
//
//   node perf/collect_runtime.mjs 0 terras energy serverroom person
//   node perf/collect_runtime.mjs --out perf/runtime-results.json 0 terras energy serverroom person
//
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const DASHBOARD = "mcp-test-dashboard"; // hard-wired; never the default dashboard

function loadEnv() {
  let url = process.env.HA_URL, token = process.env.HA_TOKEN;
  const envFile = path.join(process.cwd(), "perf", "ha.env");
  if ((!url || !token) && fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
      const m = line.match(/^\s*(HA_URL|HA_TOKEN)\s*=\s*(.+?)\s*$/);
      if (m) { if (m[1] === "HA_URL") url ||= m[2]; else token ||= m[2]; }
    }
  }
  if (!url || !token) {
    console.error("Missing HA_URL / HA_TOKEN (env or perf/ha.env). See perf/README.md.");
    process.exit(2);
  }
  return { url: url.replace(/\/$/, ""), token };
}

const args = process.argv.slice(2);
let out = null;
const views = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--out") out = args[++i];
  else views.push(args[i]);
}
if (!views.length) views.push("0", "terras", "energy", "serverroom", "person");

const { url, token } = loadEnv();

const initScript = (haUrl, tok) => {
  window.__longtasks = 0;
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__longtasks += e.duration; })
      .observe({ entryTypes: ["longtask"] });
  } catch (e) {}
  const tokens = {
    access_token: tok, token_type: "Bearer", expires_in: 1800,
    hassUrl: haUrl, clientId: haUrl + "/",
    expires: Date.now() + 10 * 365 * 24 * 3600 * 1000, refresh_token: tok,
  };
  localStorage.setItem("hassTokens", JSON.stringify(tokens));
};

async function measure(context, viewId) {
  const page = await context.newPage();
  await page.coverage.startJSCoverage();
  const target = `${url}/${DASHBOARD}/${viewId}`;
  const t0 = Date.now();
  await page.goto(target, { waitUntil: "load", timeout: 45000 });
  // let the SPA hydrate and render cards (HA renders into Shadow DOM after load)
  await page.waitForTimeout(6000);
  const landed = page.url();
  const authFailed = /\/auth\/authorize|\/auth\/login/.test(landed);
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] || {};
    // shadow-DOM-aware node count — HA renders almost everything inside shadow roots
    function countNodes(root) {
      let n = 0;
      const els = root.querySelectorAll("*");
      n += els.length;
      els.forEach((e) => { if (e.shadowRoot) n += countNodes(e.shadowRoot); });
      return n;
    }
    return {
      load: Math.round(nav.loadEventEnd || 0),
      domNodes: countNodes(document),
      longTasksMs: Math.round(window.__longtasks || 0),
      jsHeapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null,
    };
  });
  const cov = await page.coverage.stopJSCoverage();
  let total = 0, used = 0;
  for (const e of cov) {
    const len = e.source ? e.source.length : 0;
    total += len;
    if (!len) continue;
    // version-robust: old API exposes top-level ranges {start,end};
    // new API nests covered ranges under functions[].ranges {startOffset,endOffset,count}
    const covered = new Uint8Array(len);
    if (Array.isArray(e.ranges)) {
      // old API: top-level ranges are the COVERED regions
      for (const r of e.ranges) for (let i = r.start; i < r.end && i < len; i++) covered[i] = 1;
    } else {
      // new API: v8 nested ranges, outer-to-inner; innermost count wins
      for (const f of e.functions || []) {
        for (const r of f.ranges) {
          const v = r.count > 0 ? 1 : 0;
          for (let i = r.startOffset; i < r.endOffset && i < len; i++) covered[i] = v;
        }
      }
    }
    for (let i = 0; i < len; i++) used += covered[i];
  }
  await page.close();
  return {
    view: viewId, authFailed, wallMs: Date.now() - t0, ...metrics,
    jsTotalKB: +(total / 1024).toFixed(0),
    jsUnusedPct: total ? +(100 * (total - used) / total).toFixed(1) : null,
  };
}

const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const context = await browser.newContext();
await context.addInitScript({ content: `(${initScript.toString()})(${JSON.stringify(url)}, ${JSON.stringify(token)})` });

const results = [];
for (const v of views) {
  try {
    const r = await measure(context, v);
    results.push(r);
    console.log(`${r.authFailed ? "AUTH-FAIL " : ""}${r.view.padEnd(12)} ` +
      `load=${r.load}ms dom=${r.domNodes} longtask=${r.longTasksMs}ms ` +
      `heap=${r.jsHeapMB}MB jsUnused=${r.jsUnusedPct}%`);
  } catch (e) {
    results.push({ view: v, error: String(e).slice(0, 120) });
    console.log(`${v}: ERROR ${String(e).slice(0, 120)}`);
  }
}
await browser.close();

if (out) {
  fs.writeFileSync(out, JSON.stringify({ dashboard: DASHBOARD, results }, null, 2));
  console.log(`\nresults -> ${out}`);
}
if (results.some((r) => r.authFailed)) {
  console.error("\nAUTH FAILED — token rejected. Verify HA_TOKEN is a valid Long-Lived Access Token.");
  process.exit(1);
}
