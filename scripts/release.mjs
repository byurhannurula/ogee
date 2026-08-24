#!/usr/bin/env node
// Versioned release: build both targets, zip them, and create a GitHub release.
// Requires the `gh` CLI to be authenticated (gh auth login).

import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function run(cmd, opts = {}) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { cwd: root, stdio: "inherit", ...opts });
}

function fail(msg) {
  console.error(`Error: ${msg}`);
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const manifest = JSON.parse(
  readFileSync(join(root, "src/manifest.json"), "utf8"),
);

if (pkg.version !== manifest.version) {
  fail(
    `Version mismatch: package.json=${pkg.version} src/manifest.json=${manifest.version}`,
  );
}
const version = pkg.version;
const tag = `v${version}`;

// Refuse to release with a dirty tree — the zips would not reflect HEAD.
const status = execSync("git status --porcelain", {
  cwd: root,
  encoding: "utf8",
});
if (status.trim()) {
  fail(`Working tree is dirty. Commit or stash before releasing:\n${status}`);
}

// gh CLI must be available + authenticated.
try {
  execSync("gh auth status", { cwd: root, stdio: "ignore" });
} catch {
  fail("`gh` CLI not authenticated. Run `gh auth login` and retry.");
}

run("npm run build:all");

const chromiumDir = join(root, "dist-chromium");
const firefoxDir = join(root, "dist-firefox");
if (!existsSync(chromiumDir) || !existsSync(firefoxDir)) {
  fail("Expected dist-chromium/ and dist-firefox/ after build:all");
}

const chromiumZip = `dist/ogee-${version}-chromium.zip`;
const firefoxZip = `dist/ogee-${version}-firefox.zip`;
run(`mkdir -p dist && rm -f ${chromiumZip} ${firefoxZip}`);
// Sourcemaps stay out of store builds
run(`cd dist-chromium && zip -r ../${chromiumZip} . -x "*.map" -x "*.DS_Store" && cd ..`);
run(`cd dist-firefox && zip -r ../${firefoxZip} . -x "*.map" -x "*.DS_Store" && cd ..`);

run(
  `gh release create ${tag} --generate-notes --title "OGee ${version}" ${chromiumZip} ${firefoxZip}`,
);

console.log(`\nReleased ${tag}.`);
