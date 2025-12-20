// Check which NocoDB images exist locally in /media
// Compares NocoDB file references with media-manifest.json

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = process.env.VITE_API_URL;
const API_TOKEN = process.env.VITE_API_TOKEN;
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
 * Extract filename from path
 */
function extractFilename(fileObj) {
  if (!fileObj) return null;
  
  // Try different properties
  const name = fileObj.name || fileObj.title;
  if (name) return name;
  
  // Extract from path
  const pathStr = fileObj.signedPath || fileObj.path;
  if (!pathStr) return null;
  
  const segments = pathStr.split("/");
  return segments[segments.length - 1];
}

/**
 * Recursively extract all file objects from a record
 */
function extractFilesFromRecord(record, prefix = "") {
  const files = [];
  
  for (const [key, value] of Object.entries(record)) {
    if (!value) continue;
    
    // Check if it's a file object
    if (typeof value === "object" && (value.name || value.path || value.signedPath)) {
      files.push({ field: `${prefix}${key}`, file: value });
    }
    // Check if it's an array of files
    else if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        if (typeof item === "object" && (item.name || item.path || item.signedPath)) {
          files.push({ field: `${prefix}${key}[${idx}]`, file: item });
        }
        // Nested objects in array (e.g., m2m relations)
        else if (typeof item === "object" && item !== null) {
          files.push(...extractFilesFromRecord(item, `${prefix}${key}[${idx}].`));
        }
      });
    }
    // Nested object
    else if (typeof value === "object" && value !== null) {
      files.push(...extractFilesFromRecord(value, `${prefix}${key}.`));
    }
  }
  
  return files;
}

async function main() {
  console.log("🔍 Checking NocoDB media files...\n");

  // 1. Load media manifest
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

  // 2. Fetch NocoDB data
  if (!API_URL || !API_TOKEN) {
    console.error("❌ Missing VITE_API_URL or VITE_API_TOKEN");
    console.log("   Please set these environment variables.");
    return;
  }

  const include = "include=_nc_m2m_sehetz_skills,_nc_m2m_sehetz_gears,_nc_m2m_sehetz_teams&limit=200";
  const urlWithInclude = API_URL.includes("?") ? `${API_URL}&${include}` : `${API_URL}?${include}`;

  console.log(`📡 Fetching from NocoDB: ${NOCO_BASE}`);
  console.log(`   ${urlWithInclude}\n`);

  let records = [];
  try {
    const res = await fetch(urlWithInclude, { headers: { "xc-token": API_TOKEN } });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const json = await res.json();
    records = json.list || [];
    console.log(`✅ Fetched ${records.length} records from NocoDB\n`);
  } catch (err) {
    console.error("❌ Failed to fetch from NocoDB:", err.message);
    return;
  }

  // 3. Extract all file references
  const allFiles = [];
  records.forEach((record, idx) => {
    const files = extractFilesFromRecord(record);
    files.forEach(({ field, file }) => {
      allFiles.push({
        recordId: record.Id || `record-${idx}`,
        recordTitle: record.title || record.name || record.Title || record.Name || "Untitled",
        field,
        file,
      });
    });
  });

  console.log(`📦 Found ${allFiles.length} file references in NocoDB records\n`);

  // 4. Check each file against manifest
  const results = {
    found: [],
    missing: [],
    noFilename: [],
  };

  allFiles.forEach(({ recordId, recordTitle, field, file }) => {
    const rawFilename = extractFilename(file);
    
    if (!rawFilename) {
      results.noFilename.push({ recordId, recordTitle, field, file });
      return;
    }

    const normalized = normalizeName(rawFilename);
    const existsInManifest = normalized && manifest[normalized];

    if (existsInManifest) {
      results.found.push({
        recordId,
        recordTitle,
        field,
        filename: rawFilename,
        normalized,
        localPath: manifest[normalized],
      });
    } else {
      results.missing.push({
        recordId,
        recordTitle,
        field,
        filename: rawFilename,
        normalized,
        remotePath: file.signedPath || file.path,
      });
    }
  });

  // 5. Print results
  console.log("=" .repeat(80));
  console.log("📊 RESULTS");
  console.log("=".repeat(80));
  console.log(`✅ Found locally:     ${results.found.length}`);
  console.log(`❌ Missing locally:   ${results.missing.length}`);
  console.log(`⚠️  No filename:      ${results.noFilename.length}`);
  console.log("=".repeat(80));
  console.log();

  // 6. Show details
  if (results.missing.length > 0) {
    console.log("❌ MISSING FILES (not in local /media):");
    console.log("-".repeat(80));
    results.missing.forEach(({ recordTitle, field, filename, normalized, remotePath }) => {
      console.log(`  📁 ${recordTitle}`);
      console.log(`     Field: ${field}`);
      console.log(`     File:  ${filename}`);
      if (normalized !== filename) {
        console.log(`     Normalized: ${normalized}`);
      }
      console.log(`     Remote: ${NOCO_BASE}/${remotePath}`);
      console.log();
    });
  }

  if (results.noFilename.length > 0) {
    console.log("⚠️  NO FILENAME:");
    console.log("-".repeat(80));
    results.noFilename.forEach(({ recordTitle, field, file }) => {
      console.log(`  📁 ${recordTitle}`);
      console.log(`     Field: ${field}`);
      console.log(`     File object:`, JSON.stringify(file, null, 2));
      console.log();
    });
  }

  if (results.found.length > 0 && results.missing.length === 0) {
    console.log("✨ All NocoDB images are available locally!");
  }

  // 7. Save report
  const reportPath = path.resolve(__dirname, "../public/noco-media-report.json");
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");
  console.log(`\n💾 Report saved to: ${reportPath}`);
}

main().catch(console.error);
