// ============================================
// UTILITY FUNCTIONS – Core Helpers
// ============================================
// 
// NAMING CONVENTION:
//   content_*()  → Content/block manipulation
//   project_*()  → Project data normalization
//   timer_*()    → Async timer management
//   animation_*() → Animation utilities
//   CONSTANT_*   → Configuration constants
//
// All functions documented with:
//   - Where they're used
//   - What they do (1 sentence)
//   - Parameters & return value
// ============================================

// ============================================
// CONSTANTS
// ============================================

// Used in: CaseContainer.jsx (animation timing)
// Controls when project panel closes/transitions/opens
export const CLOSE_MS = 400;
export const TRANSITION_GAP_MS = 20;
export const DEFAULT_FIRST_OPEN_INDEX = 0;

// ============================================
// ANIMATION HELPERS
// ============================================

/**
 * Rotate animation loop for DOM elements
 * Used in: Header.jsx (disco button rotation)
 * What: Continuously rotates element via requestAnimationFrame with 2deg increments. Snaps to last full 360° rotation on stop.
 *
 * @param {HTMLElement} element - DOM element to rotate
 * @param {Boolean} isActive - Whether animation should run
 * @returns {Function} Cleanup function to stop animation
 */
export function useRotationAnimation(element, isActive) {
  let animationId;
  let rotation = 0;

  const getRotationFromTransform = () => {
    const transform = element.style.transform;
    const match = transform.match(/rotate\((-?\d+(?:\.\d+)?)deg\)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const rotate = () => {
    element.style.transform = `rotate(${(rotation += 2)}deg)`;
    animationId = requestAnimationFrame(rotate);
  };

  if (isActive) {
    rotation = getRotationFromTransform();
    animationId = requestAnimationFrame(rotate);
  } else {
    const currentRotation = getRotationFromTransform();
    const lastFullRotation = Math.floor(currentRotation / 360) * 360;
    element.style.transform = `rotate(${lastFullRotation}deg)`;
  }

  return () => animationId && cancelAnimationFrame(animationId);
}

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
// TIMER HELPERS
// ============================================

/**
 * Schedule async project open with delay
 * Used in: CaseContainer.jsx (handleProjectToggle when switching projects)
 * What: Sets up a timeout queue ref for delayed project open
 * 
 * @param {Number} index - Project index to open
 * @param {Object} timerRef - useRef object for setTimeout ID
 * @param {Object} queuedRef - useRef object for queued index
 * @param {Number} delay - Milliseconds before opening
 */
export function timer_schedule(index, timerRef, queuedRef, delay) {
  queuedRef.current = index;
  timerRef.current = setTimeout(() => {
    // Timer runs, actual state update handled by useEffect
  }, delay);
}

/**
 * Clear and reset timer refs
 * Used in: CaseContainer.jsx (handleSkillToggle, handleProjectToggle, cleanup useEffect)
 * What: Clears timeout and resets both timer and queued refs
 * 
 * @param {Object} timerRef - useRef object from setTimeout
 * @param {Object} queuedRef - useRef object storing queued index
 */
export function timer_clear(timerRef, queuedRef) {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
  if (queuedRef.current !== null) {
    queuedRef.current = null;
  }
}
