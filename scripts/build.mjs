import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const version = process.env.JUICED_DASHBOARD_VERSION || packageJson.version;

await mkdir(new URL("../dist/", import.meta.url), { recursive: true });

await build({
  banner: {
    js: `/*! Juiced Dashboard ${version} | MIT License | https://github.com/ju1ced/juiced-dashboard */`,
  },
  bundle: true,
  define: {
    __JUICED_DASHBOARD_VERSION__: JSON.stringify(version),
  },
  entryPoints: [fileURLToPath(new URL("../src/index.ts", import.meta.url))],
  format: "esm",
  legalComments: "eof",
  minify: true,
  outfile: fileURLToPath(new URL("../dist/juiced-dashboard.js", import.meta.url)),
  platform: "browser",
  sourcemap: false,
  target: ["es2022"],
});

console.log(`Bundle gebouwd: dist/juiced-dashboard.js (${version})`);
