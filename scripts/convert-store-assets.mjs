#!/usr/bin/env node
// Convert screenshots to Chrome Web Store requirements.
// Usage: node scripts/convert-store-assets.mjs [width] [format]
//   width:  1280 (default) or 640
//   format: jpeg (default) or png
//
// Reads from docs/store-assets/, writes to docs/store-assets/converted/

import sharp from "sharp";
import { readdirSync, mkdirSync, existsSync } from "fs";
import { join, extname, basename } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");
const srcDir = join(root, "docs", "store-assets");
const outDir = join(srcDir, "converted");

const widthArg = process.argv[2];
const formatArg = process.argv[3];

const TARGET_WIDTH = widthArg === "640" ? 640 : 1280;
const TARGET_HEIGHT = widthArg === "640" ? 400 : 800;
const FORMAT = formatArg === "png" ? "png" : "jpeg";

const SUPPORTED_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

async function convert() {
  if (!existsSync(srcDir)) {
    console.error(`Source folder not found: ${srcDir}`);
    process.exit(1);
  }

  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  const files = readdirSync(srcDir).filter((f) =>
    SUPPORTED_EXTS.has(extname(f).toLowerCase()),
  );

  if (!files.length) {
    console.error(`No images found in ${srcDir}`);
    process.exit(1);
  }

  console.log(
    `Converting ${files.length} image(s) to ${TARGET_WIDTH}x${TARGET_HEIGHT} ${FORMAT.toUpperCase()}...\n`,
  );

  for (const file of files) {
    const srcPath = join(srcDir, file);
    const name = basename(file, extname(file));
    const outName = `${name}-${TARGET_WIDTH}x${TARGET_HEIGHT}.${FORMAT}`;
    const outPath = join(outDir, outName);

    let pipeline = sharp(srcPath).resize(TARGET_WIDTH, TARGET_HEIGHT, {
      fit: "fill",
    });

    if (FORMAT === "jpeg") {
      pipeline = pipeline.jpeg({ quality: 90 });
    } else {
      // 24-bit PNG (no alpha)
      pipeline = pipeline
        .png({
          compressionLevel: 9,
          force: true,
        })
        .flatten({ background: { r: 255, g: 255, b: 255 } });
    }

    await pipeline.toFile(outPath);
    console.log(`  ${file} → ${outName}`);
  }

  console.log(`\nDone! Output: ${outDir}`);
}

convert().catch((err) => {
  console.error("Failed to convert assets:", err.message);
  process.exit(1);
});
