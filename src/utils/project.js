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

