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
  // let the dashboard hydrate
  await page.waitForTimeout(4000);
  const landed = page.url();
  const authFailed = /\/auth\/authorize|\/auth\/login/.test(landed);
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] || {};
    return {
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
      load: Math.round(nav.loadEventEnd || 0),
      domNodes: document.getElementsByTagName("*").length,
      longTasksMs: Math.round(window.__longtasks || 0),
      jsHeapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null,
    };
  });
  const cov = await page.coverage.stopJSCoverage();
  let total = 0, used = 0;
  for (const e of cov) {
    total += e.source ? e.source.length : 0;
    for (const r of e.ranges) used += r.end - r.start;
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
