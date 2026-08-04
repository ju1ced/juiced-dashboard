# Performance harness

Two layers, matching the two halves of the baseline:

- **Static** (`../scripts/perf_baseline.py`) — deterministic, no browser. Already the committed
  baseline (`../perf-baseline.json`, `../docs/performance-baseline.md`).
- **Runtime** (`collect_runtime.mjs`) — drives headless Chromium against the **MCP Test**
  dashboard to measure load timing, DOM nodes, long-tasks, JS heap and **% unused JS**.

## One-time setup (on the machine that runs the harness)

```bash
npm i -D playwright@1
npx playwright install --with-deps chromium   # browser + OS libraries
```

## Credentials (never committed)

The HA frontend requires auth, so the harness needs a **Long-Lived Access Token**:

1. In Home Assistant: your profile → **Security** → **Long-lived access tokens** → **Create**.
2. Put it in a git-ignored `perf/ha.env` (matched by `.gitignore`):

   ```bash
   HA_URL=http://192.168.5.50:8123
   HA_TOKEN=<your long-lived access token>
   ```

The token is used only at runtime (injected into the browser's `localStorage`, the frontend's
own auth store). It is never written to any committed file. Revoke it anytime from the same HA
page.

## Run

```bash
# a few representative views (Home is index 0; others by path)
node perf/collect_runtime.mjs --out perf/runtime-results.json 0 terras energy serverroom person
```

Output per view: `load` ms, DOM nodes, long-task ms, JS heap MB, **% unused JS**. Results
(`runtime-results.json`) contain only timing numbers — no secrets — and can be committed and
pasted into the runtime table in `../docs/performance-baseline.md`.

## Safety

- Targets **`mcp-test-dashboard` only** (hard-wired); never the default dashboard. Read-only —
  it loads pages, it does not change any dashboard.
