// ============================================
// Helpers – Project Logic + UI Constants
// ============================================

// ============================================
// UI CONSTANTS
// ============================================
// Used in: CaseContainer.jsx
export const CLOSE_MS = 400;
export const TRANSITION_GAP_MS = 20;
export const DEFAULT_FIRST_OPEN_INDEX = 0;

// ============================================
// PROJECT HELPERS
// ============================================

// Used in: DataView.jsx, helpers.js (normalizeProject)
const CONTENT_MASTER = [
  "content_01_text",
  "content_02_image",
  "content_03_text",
  "content_04_images",
  "content_05_text",
  "content_06_gallery",
  "content_07_links",
];

// Used in: normalizeProject()
export function buildContentBlocks(project) {
  return CONTENT_MASTER.filter((field) => {
    const value = project[field];
    if (!value) return false;
    if (typeof value === "string") return value.trim() !== "";
    if (Array.isArray(value)) return value.length > 0;
    return false;
  }).map((field) => ({ type: field, data: project[field] }));
}

// Used in: DataView.jsx (in fetchData)
export function normalizeProject(project, NOCO_BASE_URL) {
  const file = project["Teaser-Image"]?.[0];
  let teaserImage = null;
  let teaserVideo = null;

  if (file) {
    const fullPath = `${NOCO_BASE_URL}/${file.signedPath || file.path}`;
    const mime = file.mimetype || file.type || "";
    const ext = (file.name || "").toLowerCase();
    if (mime.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(ext)) {
      teaserVideo = fullPath;
    } else {
      teaserImage = fullPath;
    }
  }

  const blocks = buildContentBlocks(project).map((b) => {
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

  return { ...project, teaserImage, teaserVideo, blocks };
}

// ============================================
// TIMER HELPERS
// ============================================

// Used in: CaseContainer.jsx (handleProjectToggle)
export function scheduleProjectOpen(index, timerRef, queuedRef, delay) {
  queuedRef.current = index;
  timerRef.current = setTimeout(() => {
    // Diese Funktion wird von außen abgerufen — return nicht nötig
  }, delay);
}

// Used in: CaseContainer.jsx (handleProjectToggle, handleSkillToggle, cleanup)
export function clearTimer(timerRef, queuedRef) {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
  if (queuedRef) queuedRef.current = null;
}
