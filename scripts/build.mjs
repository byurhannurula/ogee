import * as esbuild from "esbuild";
import {
  copyFileSync,
  mkdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
  watch as fsWatch,
} from "fs";
import { createServer } from "http";
import { dirname, join, basename } from "path";
import { fileURLToPath } from "url";

const RELOAD_PORT = 9012;
const RELOAD_PATH = "/__tagpeek_reload";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const src = join(root, "src");
const publicDir = join(root, "public");

const isWatch = process.argv.includes("--watch");

// Build target (browser family). chromium = Chrome / Brave / Edge / Opera.
// firefox = Firefox 121+ (MV3). Output goes to a per-target dist dir so both
// can coexist on disk.
const VALID_TARGETS = ["chromium", "firefox"];
const targetArg = process.argv.find((a) => a.startsWith("--target="));
const target = targetArg ? targetArg.split("=")[1] : "chromium";
if (!VALID_TARGETS.includes(target)) {
  console.error(
    `Invalid --target=${target}. Expected one of: ${VALID_TARGETS.join(", ")}`,
  );
  process.exit(1);
}
const dist = join(root, `dist-${target}`);

if (!existsSync(dist)) {
  mkdirSync(dist, { recursive: true });
}

// Firefox-specific manifest transform. Required: a stable extension id under
// browser_specific_settings.gecko for AMO. Everything else in the base manifest
// is already MV3-portable (FF supports background.service_worker since 121).
const FIREFOX_GECKO_ID = "tagpeek@recheck.dev";
const FIREFOX_MIN_VERSION = "121.0";

function transformManifestForTarget(raw) {
  const manifest = JSON.parse(raw);
  if (target === "firefox") {
    manifest.browser_specific_settings = {
      ...(manifest.browser_specific_settings ?? {}),
      gecko: {
        id: FIREFOX_GECKO_ID,
        strict_min_version: FIREFOX_MIN_VERSION,
      },
    };
  }
  return manifest;
}

// Alias react -> preact/compat for a smaller content-script bundle. Preact
// is loaded on every page, so the size win matters more than feature parity
// with React internals (which we don't use).
const reactAlias = {
  react: "preact/compat",
  "react-dom": "preact/compat",
  "react-dom/client": "preact/compat/client",
  "react/jsx-runtime": "preact/jsx-runtime",
};

// Reload SSE server (watch mode only). Holds open connections; we push a
// "reload" event from the rebuild plugin below and the SW reloads itself.
const reloadClients = new Set();
let reloadServer = null;
let reloadDebounce = null;

function startReloadServer() {
  reloadServer = createServer((req, res) => {
    if (req.url !== RELOAD_PATH) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });
    res.write(": connected\n\n");
    // Keep-alive: MV3 service workers are terminated after ~30s idle, which
    // silently drops the fetch reader and causes rebuild signals to be
    // missed. A periodic comment frame keeps the fetch active so the SW
    // stays alive between rebuilds.
    const ping = setInterval(() => {
      try {
        res.write(": ping\n\n");
      } catch {
        clearInterval(ping);
      }
    }, 25000);
    reloadClients.add(res);
    req.on("close", () => {
      clearInterval(ping);
      reloadClients.delete(res);
    });
  });
  reloadServer.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Reload port ${RELOAD_PORT} is already in use. Another \`npm run dev\` is probably still running — kill it (\`lsof -ti :${RELOAD_PORT} | xargs kill\`) and try again.`,
      );
      process.exit(1);
    }
    console.error("Reload server error:", err.message);
    process.exit(1);
  });
  reloadServer.listen(RELOAD_PORT, "127.0.0.1");
}

function broadcastReload() {
  if (reloadDebounce) clearTimeout(reloadDebounce);
  reloadDebounce = setTimeout(() => {
    if (!reloadClients.size) return;
    for (const res of reloadClients) res.write("data: reload\n\n");
    console.log(`Reload signal sent to ${reloadClients.size} client(s).`);
  }, 80);
}

const reloadPlugin = {
  name: "reload-broadcast",
  setup(build) {
    build.onEnd((result) => {
      if (result.errors.length) return;
      broadcastReload();
    });
  },
};

const commonOptions = {
  bundle: true,
  minify: !isWatch,
  sourcemap: isWatch,
  target: ["chrome100"],
  alias: reactAlias,
  plugins: isWatch ? [reloadPlugin] : [],
  define: {
    "process.env.NODE_ENV": isWatch ? '"development"' : '"production"',
    "process.env.TAGPEEK_RELOAD_URL": JSON.stringify(
      isWatch ? `http://localhost:${RELOAD_PORT}${RELOAD_PATH}` : "",
    ),
  },
};

const contentCtx = await esbuild.context({
  ...commonOptions,
  entryPoints: [join(src, "content.tsx")],
  outfile: join(dist, "content.js"),
  jsx: "automatic",
  jsxImportSource: "preact",
});

const popupCtx = await esbuild.context({
  ...commonOptions,
  entryPoints: [join(src, "popup.tsx")],
  outfile: join(dist, "popup.js"),
  jsx: "automatic",
  jsxImportSource: "preact",
});

const backgroundCtx = await esbuild.context({
  ...commonOptions,
  entryPoints: [join(src, "background.ts")],
  outfile: join(dist, "background.js"),
  format: "iife",
});

const staticFiles = [
  { from: join(src, "manifest.json"), to: join(dist, "manifest.json") },
  { from: join(src, "popup.html"), to: join(dist, "popup.html") },
  { from: join(publicDir, "icon-34.png"), to: join(dist, "icon-34.png") },
  { from: join(publicDir, "icon-128.png"), to: join(dist, "icon-128.png") },
];

function copyOne(from, to) {
  if (!existsSync(from)) {
    console.warn(`Warning: ${from} not found`);
    return;
  }
  if (basename(from) === "manifest.json") {
    // Apply target-specific transforms (gecko id for Firefox) and, in watch
    // mode, append the localhost host_permission the SW needs to talk to the
    // reload SSE server. Production output keeps a clean manifest.
    const raw = readFileSync(from, "utf8");
    const manifest = transformManifestForTarget(raw);
    if (isWatch) {
      const hostPerm = `http://localhost:${RELOAD_PORT}/*`;
      const existing = manifest.host_permissions ?? [];
      if (!existing.includes(hostPerm)) {
        manifest.host_permissions = [...existing, hostPerm];
      }
    }
    writeFileSync(to, JSON.stringify(manifest, null, 2));
    console.log(
      `Copied: manifest.json (target=${target}${isWatch ? ", dev" : ""})`,
    );
    return;
  }
  copyFileSync(from, to);
  console.log(`Copied: ${basename(from)}`);
}

function copyStatic() {
  for (const { from, to } of staticFiles) copyOne(from, to);
}

function watchStatic() {
  // fs.watch each source file individually so manifest.json / popup.html
  // edits re-copy without restarting the dev server.
  for (const { from, to } of staticFiles) {
    if (!existsSync(from)) continue;
    let pending = false;
    fsWatch(from, () => {
      // Coalesce burst events (editors often fire 2+ on save).
      if (pending) return;
      pending = true;
      setTimeout(() => {
        pending = false;
        copyOne(from, to);
        broadcastReload();
      }, 50);
    });
  }
}

if (isWatch) {
  console.log(`Watching for changes (target=${target}, out=${dist})...`);
  startReloadServer();
  console.log(`Reload server: http://localhost:${RELOAD_PORT}${RELOAD_PATH}`);
  copyStatic();
  watchStatic();
  await contentCtx.watch();
  await popupCtx.watch();
  await backgroundCtx.watch();
} else {
  console.log(`Building (target=${target})...`);
  await contentCtx.rebuild();
  await popupCtx.rebuild();
  await backgroundCtx.rebuild();
  copyStatic();
  await contentCtx.dispose();
  await popupCtx.dispose();
  await backgroundCtx.dispose();
  console.log(`Build complete! Load ${dist} in your browser.`);
}
