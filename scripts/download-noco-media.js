// Download missing NocoDB media files to local /media folder
// and update media-manifest.json

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NOCO_BASE = process.env.VITE_NOCO_BASE_URL || "https://sehetz-noco.onrender.com";

/**
 * Normalize filename: remove scale tags, hash suffixes
 */
function normalizeName(rawName) {
  if (!rawName) return null;
  const decoded = decodeURIComponent(rawName);
  // Remove @2x_abc123 patterns
  const stripTaggedScale = decoded.replace(/@(\d+x)_([A-Za-z0-9]+)(\.[^.]+)$/i, "@$1$3");
  // Remove _abc123 hash patterns
  const stripHash = stripTaggedScale.replace(/_[A-Za-z0-9]{4,}(\.[^.]+)$/i, "$1");
  return stripHash;
}

/**
 * Download file from URL to local path
 */
async function downloadFile(url, localPath) {
  try {
    console.log(`  ⬇️  Downloading: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, Buffer.from(buffer));
    console.log(`  ✅ Saved to: ${localPath}`);
    return true;
  } catch (err) {
    console.error(`  ❌ Failed to download ${url}:`, err.message);
    return false;
  }
}

/**
 * Determine appropriate subfolder based on filename patterns
 */
function getSubfolder(filename) {
  const lower = filename.toLowerCase();
  
  // Team images
  if (lower.includes("team")) {
    return "Teams";
  }
  
  // Gear/Tool images
  if (lower.includes("gear")) {
    return "Gear";
  }
  
  // Web illustrations
  if (lower.includes("sehetz") && lower.includes("sarah")) {
    return "Web Illustrations";
  }
  
  // Default to a general folder
  return "sehetz";
}

async function main() {
  console.log("📥 Downloading missing NocoDB media files...\n");

  // 1. Load existing media manifest
  const manifestPath = path.resolve(__dirname, "../public/media-manifest.json");
  let manifest = {};
  
  try {
    const manifestContent = await fs.readFile(manifestPath, "utf8");
    manifest = JSON.parse(manifestContent);
    console.log(`✅ Loaded ${Object.keys(manifest).length} files from media-manifest.json\n`);
  } catch (err) {
    console.error("❌ Could not load media-manifest.json:", err.message);
    return;
  }

  // 2. Load the media check report
  const reportPath = path.resolve(__dirname, "../public/noco-media-report.json");
  let report;
  
  try {
    const reportContent = await fs.readFile(reportPath, "utf8");
    report = JSON.parse(reportContent);
    console.log(`✅ Loaded report with ${report.missing.length} missing files\n`);
  } catch (err) {
    console.error("❌ Could not load noco-media-report.json:", err.message);
    console.log("   Please run 'npm run check-noco-media' first.");
    return;
  }

  if (report.missing.length === 0) {
    console.log("✨ No missing files to download!");
    return;
  }

  // 3. Download each missing file
  console.log(`📥 Downloading ${report.missing.length} missing files...\n`);
  
  const results = {
    success: [],
    failed: [],
  };

  for (const item of report.missing) {
    const { filename, normalized, remotePath } = item;
    const url = `${NOCO_BASE}/${remotePath}`;
    
    // Determine subfolder
    const subfolder = getSubfolder(normalized || filename);
    const localPath = path.resolve(__dirname, `../public/media/${subfolder}/${normalized || filename}`);
    
    console.log(`📁 ${normalized || filename}`);
    console.log(`   Subfolder: ${subfolder}`);
    
    const success = await downloadFile(url, localPath);
    
    if (success) {
      // Add to manifest
      const manifestKey = normalized || filename;
      const manifestValue = `/media/${subfolder}/${normalized || filename}`;
      manifest[manifestKey] = manifestValue;
      results.success.push({ filename: normalized || filename, path: manifestValue });
    } else {
      results.failed.push({ filename: normalized || filename, url });
    }
    
    console.log();
  }

  // 4. Update media-manifest.json
  if (results.success.length > 0) {
    console.log("💾 Updating media-manifest.json...");
    // Sort manifest keys alphabetically
    const sortedManifest = Object.keys(manifest)
      .sort()
      .reduce((acc, key) => {
        acc[key] = manifest[key];
        return acc;
      }, {});
    
    await fs.writeFile(manifestPath, JSON.stringify(sortedManifest, null, 2), "utf8");
    console.log(`✅ Added ${results.success.length} files to media-manifest.json\n`);
  }

  // 5. Print summary
  console.log("=".repeat(80));
  console.log("📊 DOWNLOAD SUMMARY");
  console.log("=".repeat(80));
  console.log(`✅ Downloaded successfully: ${results.success.length}`);
  console.log(`❌ Failed:                  ${results.failed.length}`);
  console.log("=".repeat(80));
  console.log();

  if (results.success.length > 0) {
    console.log("✅ DOWNLOADED FILES:");
    console.log("-".repeat(80));
    results.success.forEach(({ filename, path }) => {
      console.log(`  ${filename}`);
      console.log(`    → ${path}`);
    });
    console.log();
  }

  if (results.failed.length > 0) {
    console.log("❌ FAILED DOWNLOADS:");
    console.log("-".repeat(80));
    results.failed.forEach(({ filename, url }) => {
      console.log(`  ${filename}`);
      console.log(`    From: ${url}`);
    });
    console.log();
  }

  if (results.success.length > 0) {
    console.log("🎉 Done! Run 'npm run generate-media-manifest' to update the manifest.");
  }
}

main().catch(console.error);
