// Generate a media manifest mapping filenames to their relative paths for runtime fallbacks
// Output: public/media-manifest.json

// Usage:
// cd /Users/sarahcarnault/Documents/sketchbook/scripts
// node generate-media-manifest.js

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mediaRoot = path.resolve(__dirname, "../public/media");
const outPath = path.resolve(__dirname, "../public/media-manifest.json");

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
    for (const rel of files) {
      const base = path.basename(rel);
      // Now we have a flat structure: just filename -> /media/filename
      if (!manifest[base]) {
        manifest[base] = `/media/${base}`;
      }
    }
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(manifest, null, 2), "utf8");
    console.log(`[media-manifest] wrote ${Object.keys(manifest).length} entries to ${outPath}`);
  } catch (err) {
    console.error("[media-manifest] failed:", err.message);
  }
}

main();
