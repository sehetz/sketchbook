// Generate a media manifest mapping filenames to their relative paths for runtime fallbacks
// Also generates media-dimensions.json for CLS prevention (width/height on img elements)
// Output: public/media-manifest.json, public/media-dimensions.json

// Usage:
// cd /Users/sarahcarnault/Documents/sketchbook/scripts
// node generate-media-manifest.js

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mediaRoot = path.resolve(__dirname, "../public/media");
const outPath = path.resolve(__dirname, "../public/media-manifest.json");
const dimsPath = path.resolve(__dirname, "../public/media-dimensions.json");

const IMAGE_EXTS = new Set([".webp", ".jpg", ".jpeg", ".png", ".avif", ".gif"]);

async function walk(dir, prefix = "") {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === ".DS_Store") continue;
    const abs = path.join(dir, entry.name);
    const rel = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(abs, rel)));
    } else {
      files.push(rel.replace(/\\/g, "/"));
    }
  }
  return files;
}

async function main() {
  try {
    const exists = await fs.access(mediaRoot).then(() => true).catch(() => false);
    if (!exists) {
      console.warn("[media-manifest] media folder not found, skipping");
      return;
    }
    const files = await walk(mediaRoot);
    const manifest = {};
    const dimensions = {};
    let dimsCount = 0;

    for (const rel of files) {
      const base = path.basename(rel);
      const publicPath = `/media/${base}`;
      // Now we have a flat structure: just filename -> /media/filename
      if (!manifest[base]) {
        manifest[base] = publicPath;
      }

      // Read image dimensions for CLS prevention
      const ext = path.extname(base).toLowerCase();
      if (IMAGE_EXTS.has(ext) && !dimensions[publicPath]) {
        const absPath = path.join(mediaRoot, rel);
        try {
          const { width, height } = await sharp(absPath).metadata();
          if (width && height) {
            dimensions[publicPath] = { width, height };
            dimsCount++;
          }
        } catch {
          // Skip files sharp can't read (e.g. animated gifs, corrupt files)
        }
      }
    }

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(manifest, null, 2), "utf8");
    console.log(`[media-manifest] wrote ${Object.keys(manifest).length} entries to ${outPath}`);

    await fs.writeFile(dimsPath, JSON.stringify(dimensions, null, 2), "utf8");
    console.log(`[media-dimensions] wrote ${dimsCount} entries to ${dimsPath}`);
  } catch (err) {
    console.error("[media-manifest] failed:", err.message);
  }
}

main();
