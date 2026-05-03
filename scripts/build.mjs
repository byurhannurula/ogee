import * as esbuild from "esbuild";
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const src = join(root, "src");
const dist = join(root, "dist");
const publicDir = join(root, "public");

// Ensure dist folder exists
if (!existsSync(dist)) {
  mkdirSync(dist, { recursive: true });
}

const isWatch = process.argv.includes("--watch");

// Common esbuild options
const commonOptions = {
  bundle: true,
  minify: !isWatch,
  sourcemap: isWatch,
  target: ["chrome100"],
  define: {
    "process.env.NODE_ENV": isWatch ? '"development"' : '"production"',
  },
};

// Build content script
const contentCtx = await esbuild.context({
  ...commonOptions,
  entryPoints: [join(src, "content.tsx")],
  outfile: join(dist, "content.js"),
  jsx: "automatic",
  jsxImportSource: "react",
});

// Build popup
const popupCtx = await esbuild.context({
  ...commonOptions,
  entryPoints: [join(src, "popup.tsx")],
  outfile: join(dist, "popup.js"),
  jsx: "automatic",
  jsxImportSource: "react",
});

// Copy static files
const staticFiles = [
  { from: join(src, "manifest.json"), to: join(dist, "manifest.json") },
  { from: join(src, "popup.html"), to: join(dist, "popup.html") },
  { from: join(publicDir, "icon-34.png"), to: join(dist, "icon-34.png") },
  { from: join(publicDir, "icon-128.png"), to: join(dist, "icon-128.png") },
];

function copyStatic() {
  for (const { from, to } of staticFiles) {
    if (existsSync(from)) {
      copyFileSync(from, to);
      console.log(`Copied: ${from} -> ${to}`);
    } else {
      console.warn(`Warning: ${from} not found`);
    }
  }
}

if (isWatch) {
  console.log("Watching for changes...");
  copyStatic();
  await contentCtx.watch();
  await popupCtx.watch();
} else {
  console.log("Building...");
  await contentCtx.rebuild();
  await popupCtx.rebuild();
  copyStatic();
  await contentCtx.dispose();
  await popupCtx.dispose();
  console.log("Build complete! Load dist/ folder in Chrome.");
}
