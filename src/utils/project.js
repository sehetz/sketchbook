// ============================================
// PROJECT & CONTENT DATA UTILITIES
// ============================================
// 
// NAMING CONVENTION:
//   content_*()   → Content/block manipulation
//   project_*()   → Project data normalization
//   media_*()     → Media path resolution
//   timeline_*()  → Timeline data fetching/processing
//
// All functions documented with:
//   - Where they're used
//   - What they do (1 sentence)
//   - Parameters & return value
// ============================================

// ============================================
// CONTENT BLOCK HELPERS
// ============================================

// Content field names in NocoDB (order matters for render)
const CONTENT_FIELD_ORDER = [
  "content_01_text",
  "content_02_image",
  "content_03_text",
  "content_04_images",
  "content_05_text",
  "content_06_gallery",
  "content_07_links",
];

/**
 * Extract and structure content blocks from project data
 * Used in: project_normalize()
 * What: Filters NocoDB fields, removes empty content, returns array of { type, data } objects
 * 
 * @param {Object} project - NocoDB project record
 * @returns {Array} Array of { type: "content_XX_YY", data: ... } objects
 */
export function content_build(project) {
  return CONTENT_FIELD_ORDER.filter((field) => {
    const value = project[field];
    if (!value) return false;
    if (typeof value === "string") return value.trim() !== "";
    if (Array.isArray(value)) return value.length > 0;
    return false;
  }).map((field) => ({ type: field, data: project[field] }));
}

// ============================================
// PROJECT DATA HELPERS
// ============================================

/**
 * Transform raw NocoDB project into frontend format
 * Used in: DataView.jsx (in fetchData loop for each project)
 * What: Extracts teaser file objects and builds content blocks
 * 
 * @param {Object} project - Raw NocoDB project record
 * @param {String} NOCO_BASE_URL - NocoDB API base URL (for video URLs)
 * @returns {Object} Normalized project with { teaserImageFile, teaserVideoFile, blocks, ... }
 */
export function project_normalize(project, NOCO_BASE_URL) {
  const file = project["Teaser-Image"]?.[0];
  let teaserImageFile = null;
  let teaserVideoFile = null;

  if (file) {
    const mime = file.mimetype || file.type || "";
    const ext = (file.name || "").toLowerCase();
    const isVideo = mime.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(ext);
    
    if (isVideo) {
      teaserVideoFile = file;
    } else {
      teaserImageFile = file;
    }
  }

  const blocks = content_build(project).map((b) => {
    if (Array.isArray(b.data)) {
      return {
        ...b,
        data: b.data.map((att) => {
          const mime = att.mimetype || att.type || "";
          const ext = (att.name || "").toLowerCase();
          const url = `${NOCO_BASE_URL}/${att.signedPath || att.path}`;
          const isVideo =
            mime.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(ext);
          return { ...att, __url: url, __isVideo: isVideo };
        }),
      };
    }
    if (typeof b.data === "object" && b.data?.path) {
      const mime = b.data.mimetype || b.data.type || "";
      const ext = (b.data.name || "").toLowerCase();
      const url = `${NOCO_BASE_URL}/${b.data.signedPath || b.data.path}`;
      const isVideo =
        mime.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(ext);
      return { ...b, data: { ...b.data, __url: url, __isVideo: isVideo } };
    }
    return b;
  });

  return { ...project, teaserImageFile, teaserVideoFile, blocks };
}

// ============================================
// MEDIA PATH RESOLUTION
// ============================================

/**
 * Build candidate filenames for manifest lookup
 * Strips duplicate markers, hash suffixes, and other transient patterns
 * @private
 */
function buildCandidates(name) {
  const decoded = decodeURIComponent(name || "");
  const candidates = new Set();

  if (name) candidates.add(name);
  if (decoded) candidates.add(decoded);

  // Remove duplicate markers like "(1)", "(2)", " copy" etc.
  // Matches: "filename(1).ext" -> "filename.ext" or "filename (1).ext" -> "filename.ext"
  const stripDuplicateMarker = decoded.replace(/\s*\(\d+\)(\.[^.]+)$/i, "$1");
  if (stripDuplicateMarker !== decoded) candidates.add(stripDuplicateMarker);
  
  // Also try without space: "filename copy.ext" -> "filename.ext"
  const stripCopy = stripDuplicateMarker.replace(/\s+copy(\.[^.]+)$/i, "$1");
  if (stripCopy !== stripDuplicateMarker) candidates.add(stripCopy);

  // Remove transient hash suffixes like "@8x_H3hL7.webp" -> "@8x.webp"
  const stripTaggedScale = stripCopy.replace(/@(\d+x)_([A-Za-z0-9]+)(\.[^.]+)$/i, "@$1$3");
  if (stripTaggedScale !== stripCopy) candidates.add(stripTaggedScale);

  // Generic "_hash.ext" -> ".ext" cleanup (matches 4+ alphanumeric chars before extension)
  const stripHash = stripTaggedScale.replace(/_[A-Za-z0-9]{4,}(\.[^.]+)$/i, "$1");
  if (stripHash !== stripTaggedScale) candidates.add(stripHash);

  // Additional cleanup: strip multiple consecutive hash-like patterns
  let current = stripHash;
  while (current !== current.replace(/_[A-Za-z0-9]{4,}(\.[^.]+)$/i, "$1")) {
    current = current.replace(/_[A-Za-z0-9]{4,}(\.[^.]+)$/i, "$1");
    candidates.add(current);
  }

  return Array.from(candidates);
}

/**
 * Resolve media filename to actual path using build-time manifest
 * Used in: MasterMedia components (Image/Video/3D)
 * What: Matches filename against manifest, handles URL encoding, strips hashes
 * 
 * @param {String} name - Original filename from NocoDB
 * @returns {String} Resolved path to media file in /media/ directory
 */
export function resolveMediaPath(name) {
  if (!name) return null;
  if (typeof window === "undefined") return `/media/${encodeURIComponent(name)}`;
  const manifest = window.__MEDIA_MANIFEST || {};
  const candidates = buildCandidates(name);

  for (const candidate of candidates) {
    if (manifest[candidate]) return manifest[candidate];
  }

  // Fallback to the most normalized candidate even if manifest not ready
  const preferred = candidates[candidates.length - 1] || name;
  return `/media/${encodeURIComponent(preferred)}`;
}

// ============================================
// TIMELINE DATA PROCESSING
// ============================================

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
