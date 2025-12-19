// ============================================
// urlRouting.js – URL State Management
// ============================================

/**
 * Parse URL pathname into structured state
 * Patterns:
 *   /                                    → { filter: "skills" }
 *   /skills                              → { filter: "skills" }
 *   /gears                               → { filter: "gears" }
 *   /skills/illustration                 → { filter: "skills", containerLabel: "Illustration" }
 *   /skills/illustration/my-project      → { filter: "skills", containerLabel: "Illustration", projectSlug: "my-project" }
 */
export function parseUrlPath(pathname) {
  const normalized = pathname.replace(/\/$/, "").toLowerCase() || "/";
  const parts = normalized.split("/").filter(Boolean);

  // No path → default to skills
  if (parts.length === 0) {
    return { filter: "skills", containerLabel: null, projectSlug: null };
  }

  const [first, second, third] = parts;

  // Validate filter type
  const validFilters = ["skills", "gears", "teams"];
  const filter = validFilters.includes(first) ? first : "skills";

  // No more parts → just filter
  if (!second) {
    return { filter, containerLabel: null, projectSlug: null };
  }

  // Convert slug back to label (kebab-case → Title Case)
  const containerLabel = slugToLabel(second);

  // No third part → filter + container
  if (!third) {
    return { filter, containerLabel, projectSlug: null };
  }

  // Full path: filter + container + project
  return { filter, containerLabel, projectSlug: third };
}

/**
 * Build URL from state
 * Examples:
 *   { filter: "skills" } → /skills
 *   { filter: "skills", containerLabel: "Illustration" } → /skills/illustration
 *   { filter: "skills", containerLabel: "Illustration", projectSlug: "my-project" } → /skills/illustration/my-project
 */
export function buildUrl(state) {
  const { filter = "skills", containerLabel = null, projectSlug = null } = state;

  let url = `/${filter}`;

  if (containerLabel) {
    const slug = labelToSlug(containerLabel);
    url += `/${slug}`;
  }

  if (projectSlug) {
    url += `/${projectSlug}`;
  }

  return url;
}

/**
 * Convert label to URL slug
 * "Web Illustration" → "web-illustration"
 * "My Awesome Project" → "my-awesome-project"
 */
export function labelToSlug(label) {
  if (!label) return "";
  return label
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Convert slug back to label (best guess)
 * "web-illustration" → "Web Illustration"
 */
export function slugToLabel(slug) {
  if (!slug) return "";
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Push new URL state to browser history
 */
export function updateUrl(state) {
  if (typeof window === "undefined") return;
  const url = buildUrl(state);
  window.history.pushState(null, "", url);
}

/**
 * Replace URL state without adding to history (for initial sync)
 */
export function replaceUrl(state) {
  if (typeof window === "undefined") return;
  const url = buildUrl(state);
  window.history.replaceState(null, "", url);
}
