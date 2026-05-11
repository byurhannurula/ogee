#!/usr/bin/env node
// Generate extension icons from the source logo
import sharp from "sharp";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(__dirname, "..", "public");

const src = join(publicDir, "ogee-logo.png");

async function generate() {
  // Trim transparent pixels so the logo fills more of the canvas
  const trimmedBuffer = await sharp(src).trim().toBuffer();

  // Overwrite the source logo with the trimmed version
  await sharp(trimmedBuffer).png().toFile(join(publicDir, "ogee-logo.png"));

  await sharp(trimmedBuffer)
    .resize(34, 34, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(join(publicDir, "icon-34.png"));

  await sharp(trimmedBuffer)
    .resize(128, 128, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(join(publicDir, "icon-128.png"));

  console.log("Icons generated: ogee-logo.png, icon-34.png, icon-128.png");
}

generate().catch((err) => {
  console.error("Failed to generate icons:", err.message);
  process.exit(1);
});
