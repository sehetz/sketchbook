/**
 * timelineHelpers.js – Timeline Data Fetching & Processing
 *
 * Used in: TimelineViz.jsx
 * What: Fetches and normalizes team/project data from NocoDB for SVG timeline visualization
 */

/**
 * Generate slug from title
 * @private
 */
function timeline_generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]/g, "")
    .replace(/\-+/g, "-");
}

/**
 * Parse year from various formats
 * @private
 */
function timeline_parseYear(val) {
  if (val == null) return null;
  if (typeof val === "number" && Number.isFinite(val)) return Math.floor(val);
  if (typeof val === "string") {
    const m = val.match(/(\d{4})/);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

/**
 * Fetch teams and projects from NocoDB
 * Populates timeline data (teams with date ranges, projects per team/year)
 *
 * Used in: TimelineViz.jsx (useEffect)
 * What: Fetches teams and projects, calculates min/max years, organizes data
 *
 * @param {Function} setTeams – setState for teams array
 * @param {Function} setMinYear – setState for min year (calculated)
 * @param {Function} setProjects – setState for projects array
 */
export async function timeline_fetch(setTeams, setMinYear, setProjects) {
  try {
    const API_TOKEN = import.meta.env.VITE_API_TOKEN;
    const NOCO_BASE = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";
    const TEAMS_TABLE_ID = "mpz7ywybfxm3isa";
    const PROJECTS_TABLE_ID = "mieh9d1y7a7ls74";

    // Try static data first
    let teamsJson, projectsJson;
    
    try {
      const [teamsRes, projectsRes] = await Promise.all([
        fetch("/data/teams.json", { cache: "force-cache" }),
        fetch("/data/projects.json", { cache: "force-cache" })
      ]);
      
      if (teamsRes.ok && projectsRes.ok) {
        teamsJson = await teamsRes.json();
        projectsJson = await projectsRes.json();
      }
    } catch (err) {
      // Fall through to live fetch
    }

    // Fallback to live NocoDB in development
    if (!teamsJson && import.meta.env.DEV) {
      const TEAMS_API_URL = `${NOCO_BASE}/api/v2/tables/${TEAMS_TABLE_ID}/records`;
      const teamsRes = await fetch(TEAMS_API_URL, {
        headers: { "xc-token": API_TOKEN },
      });
      if (teamsRes.ok) {
        teamsJson = await teamsRes.json();
      }
    }

    if (!projectsJson && import.meta.env.DEV) {
      const PROJECTS_API_URL = `${NOCO_BASE}/api/v2/tables/${PROJECTS_TABLE_ID}/records?include=_nc_m2m_sehetz_skills,_nc_m2m_sehetz_teams&limit=200`;
      const projectsRes = await fetch(PROJECTS_API_URL, {
        headers: { "xc-token": API_TOKEN },
      });
      if (projectsRes.ok) {
        projectsJson = await projectsRes.json();
      }
    }

    if (!teamsJson || !projectsJson) return;

    const teamRows = teamsJson.list || [];

    // Normalize team data
    const extracted = teamRows.map((row) => ({
      team: row.Team || "Unknown",
      start: timeline_parseYear(row["start-date"]),
      end: timeline_parseYear(row["end-date"]),
      designWork: row["design-work"] === 1 || row["design-work"] === true,
      link: row.link || null,
      role: row.role || null,
    }));

    // Filter valid teams (must have start year) and sort by end year
    const validTeams = extracted
      .filter((t) => Number.isInteger(t.start))
      .sort((a, b) => {
        if (a.end === null && b.end === null) return b.start - a.start;
        if (a.end === null) return -1;
        if (b.end === null) return 1;
        return b.end - a.end;
      });

    setTeams(validTeams);

    // Calculate min year from all start dates
    const startYears = validTeams.map((t) => t.start).filter(Boolean);
    const calculatedMinYear = startYears.length
      ? Math.min(...startYears)
      : new Date().getFullYear();
    setMinYear(calculatedMinYear);

    // Process projects data
    const projectRows = projectsJson.list || [];
    const projectsExtracted = [];
    projectRows.forEach((proj, projIdx) => {
      // Skip offline projects
      if (!proj.is_online) return;
      
      const year = timeline_parseYear(proj.Datum);
      if (!year) return;

      // Get the first related skill
      const relSkills = proj._nc_m2m_sehetz_skills || [];
      const skillObj = relSkills[0]?.skill;
      const skillSlug = skillObj?.Skill ? timeline_generateSlug(skillObj.Skill) : "all";

      const relTeams = proj._nc_m2m_sehetz_teams || [];
      relTeams.forEach((rel) => {
        const teamObj = rel.team;
        if (!teamObj) return;
        projectsExtracted.push({
          team: teamObj.Team,
          year,
          title: proj.Title || "Untitled",
          slug: timeline_generateSlug(proj.Title),
          skillSlug: skillSlug,
        });
      });
    });

    setProjects(projectsExtracted);
  } catch (err) {
    // Silent fail
  }
}
