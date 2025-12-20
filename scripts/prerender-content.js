// Pre-render NocoDB content to static JSON for fast first paint on static hosting
// Reads VITE_API_URL, VITE_API_TOKEN, VITE_NOCO_BASE_URL
// Writes public/data/projects.json (list + metadata)

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = process.env.VITE_API_URL;
const API_TOKEN = process.env.VITE_API_TOKEN;
const NOCO_BASE = process.env.VITE_NOCO_BASE_URL || "https://sehetz-noco.onrender.com";

async function main() {
  if (!API_URL || !API_TOKEN) {
    console.warn("[prerender] Missing VITE_API_URL or VITE_API_TOKEN – skipping prerender.");
    return;
  }

  const include = "include=_nc_m2m_sehetz_skills,_nc_m2m_sehetz_gears,_nc_m2m_sehetz_teams&limit=200";
  const urlWithInclude = API_URL.includes("?") ? `${API_URL}&${include}` : `${API_URL}?${include}`;

  console.log(`[prerender] Fetching ${urlWithInclude}`);

  try {
    const res = await fetch(urlWithInclude, { headers: { "xc-token": API_TOKEN } });
    if (!res.ok) {
      console.warn(`[prerender] Fetch failed with status ${res.status} – skipping prerender.`);
      return;
    }

    const json = await res.json();
    const list = json.list || [];

    const outDir = path.resolve(__dirname, "../public/data");
    await fs.mkdir(outDir, { recursive: true });
    const outPath = path.join(outDir, "projects.json");
    const payload = {
      source: "nocodb",
      fetchedAt: new Date().toISOString(),
      base: NOCO_BASE,
      list,
    };
    await fs.writeFile(outPath, JSON.stringify(payload, null, 2), "utf8");
    console.log(`[prerender] Wrote ${list.length} records to ${outPath}`);
  } catch (err) {
    console.warn("[prerender] Error during prerender:", err.message);
  }
}

main();
