// Fetch current data from NocoDB and save as static JSON
// Run this before deployment to get the latest data snapshot

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NOCO_BASE_URL = process.env.VITE_NOCO_BASE_URL || "https://sehetz-noco.onrender.com";
const NOCO_TOKEN = process.env.VITE_API_TOKEN;
const PROJECTS_TABLE_ID = "mieh9d1y7a7ls74";
const TEAMS_TABLE_ID = "mpz7ywybfxm3isa";
const INTRO_TABLE_ID = "m1usrhdmzjt7qo8";
const PROJECTS_API_URL = `${NOCO_BASE_URL}/api/v2/tables/${PROJECTS_TABLE_ID}/records`;
const TEAMS_API_URL = `${NOCO_BASE_URL}/api/v2/tables/${TEAMS_TABLE_ID}/records`;
const INTRO_API_URL = `${NOCO_BASE_URL}/api/v2/tables/${INTRO_TABLE_ID}/records`;

async function fetchStaticData() {
  console.log("📦 Fetching latest data from NocoDB...\n");

  if (!NOCO_TOKEN) {
    console.error("❌ Error: VITE_API_TOKEN environment variable not set");
    console.log("   Please set it in your .env file");
    process.exit(1);
  }

  try {
    // Fetch projects with all relations
    const includeProjects = "include=_nc_m2m_sehetz_skills,_nc_m2m_sehetz_gears,_nc_m2m_sehetz_teams&limit=200";
    const projectsUrl = `${PROJECTS_API_URL}?${includeProjects}`;
    
    console.log(`🔗 Fetching projects: ${projectsUrl}`);
    
    const projectsResponse = await fetch(projectsUrl, {
      headers: { "xc-token": NOCO_TOKEN }
    });

    if (!projectsResponse.ok) {
      throw new Error(`Projects: HTTP ${projectsResponse.status}: ${projectsResponse.statusText}`);
    }

    const projectsData = await projectsResponse.json();
    console.log(`✅ Fetched ${projectsData.list?.length || 0} projects`);

    // Fetch teams for timeline
    console.log(`🔗 Fetching teams: ${TEAMS_API_URL}`);
    
    const teamsResponse = await fetch(TEAMS_API_URL, {
      headers: { "xc-token": NOCO_TOKEN }
    });

    if (!teamsResponse.ok) {
      throw new Error(`Teams: HTTP ${teamsResponse.status}: ${teamsResponse.statusText}`);
    }

    const teamsData = await teamsResponse.json();
    console.log(`✅ Fetched ${teamsData.list?.length || 0} teams\n`);

    // Fetch intro texts
    console.log(`🔗 Fetching intro texts: ${INTRO_API_URL}`);

    const introResponse = await fetch(INTRO_API_URL, {
      headers: { "xc-token": NOCO_TOKEN }
    });

    if (!introResponse.ok) {
      throw new Error(`Intro: HTTP ${introResponse.status}: ${introResponse.statusText}`);
    }

    const introData = await introResponse.json();
    console.log(`✅ Fetched ${introData.list?.length || 0} intro texts\n`);

    // Save to public/data/
    const outputDir = path.resolve(__dirname, "../public/data");
    await fs.mkdir(outputDir, { recursive: true });
    
    // Save projects.json
    const projectsPath = path.resolve(outputDir, "projects.json");
    await fs.writeFile(projectsPath, JSON.stringify(projectsData, null, 2), "utf8");
    console.log(`💾 Saved projects: ${projectsPath}`);
    console.log(`   Size: ${(JSON.stringify(projectsData).length / 1024).toFixed(2)} KB`);
    
    // Save teams.json for timeline
    const teamsPath = path.resolve(outputDir, "teams.json");
    await fs.writeFile(teamsPath, JSON.stringify(teamsData, null, 2), "utf8");
    console.log(`💾 Saved teams: ${teamsPath}`);
    console.log(`   Size: ${(JSON.stringify(teamsData).length / 1024).toFixed(2)} KB`);

    // Save intro.json
    const introPath = path.resolve(outputDir, "intro.json");
    await fs.writeFile(introPath, JSON.stringify(introData, null, 2), "utf8");
    console.log(`💾 Saved intro: ${introPath}`);
    console.log(`   Size: ${(JSON.stringify(introData).length / 1024).toFixed(2)} KB`);

    console.log("\n✨ Static data updated successfully!");
    
  } catch (err) {
    console.error("❌ Failed to fetch static data:", err.message);
    process.exit(1);
  }
}

fetchStaticData();
