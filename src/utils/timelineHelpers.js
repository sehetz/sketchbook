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
    const TEAMS_VIEW_ID = "vwq1bb9edqp3oq27";
    const PROJECTS_VIEW_ID = "vw9n29p51rs5maj4";
    const TEAMS_API_URL = `${NOCO_BASE}/api/v2/views/${TEAMS_VIEW_ID}/records`;
    const PROJECTS_API_URL = `${NOCO_BASE}/api/v2/views/${PROJECTS_VIEW_ID}/records`;

    // Fetch teams
    const teamsRes = await fetch(TEAMS_API_URL, {
      headers: { "xc-token": API_TOKEN },
    });

    if (!teamsRes.ok) return;

    const teamsJson = await teamsRes.json();
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

    // Fetch projects and link to teams
    const projectsRes = await fetch(PROJECTS_API_URL, {
      headers: { "xc-token": API_TOKEN },
    });

    if (projectsRes.ok) {
      const projectsJson = await projectsRes.json();
      const projectRows = projectsJson.list || [];

      const projectsExtracted = [];
      projectRows.forEach((proj, projIdx) => {
        const year = timeline_parseYear(proj.Datum);
        if (!year) return;

        // Get the first related skill
        const relSkills = proj["nc_3zu8___nc_m2m_nc_3zu8__Projec_Skills"] || [];
        const skillObj = relSkills[0]?.Skills;
        const skillSlug = skillObj?.Skill ? timeline_generateSlug(skillObj.Skill) : "all";

        const relTeams = proj["nc_3zu8___nc_m2m_nc_3zu8__Projec_Teams"] || [];
        relTeams.forEach((rel) => {
          const teamObj = rel.Teams;
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
    }
  } catch (err) {
    console.error("Timeline fetch error:", err);
  }
}
