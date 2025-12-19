// ============================================
// URL ROUTING UTILITIES
// ============================================
// 
// NAMING CONVENTION:
//   url_*()    → URL parsing/building/history
//   text_*()   → Text transformation (slug ↔ label)
//   
// FORMAT:
//   /skills/illustration/project-slug (3 levels)
//   /gears/camera                      (2 levels, no project)
//   /teams/team-name                   (2 levels, no project)
// ============================================

/**
 * Parse URL pathname into structured state
 * Used in: App.jsx (initial URL parsing)
 * Returns: { filter, containerLabel, projectSlug }
 * 
 * Patterns:
 *   /                              → { filter: "skills" }
 *   /skills/illustration           → { filter: "skills", containerLabel: "Illustration" }
 *   /skills/illustration/my-project → { filter, containerLabel, projectSlug }
 */
export function url_parse(pathname) {
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
  const containerLabel = text_slugToLabel(second);

  // No third part → filter + container
  if (!third) {
    return { filter, containerLabel, projectSlug: null };
  }

  // Full path: filter + container + project
  return { filter, containerLabel, projectSlug: third };
}

/**
 * Build URL from state object
 * Used in: CaseContainer.jsx (onUpdateUrl), url_push(), url_replace()
 * Returns: URL path string
 * 
 * Examples:
 *   { filter: "skills" } → /skills
 *   { filter: "skills", containerLabel: "Illustration" } → /skills/illustration
 *   { filter: "skills", containerLabel: "Illustration", projectSlug: "my-project" } → /skills/illustration/my-project
 */
export function url_build(state) {
  const { filter = "skills", containerLabel = null, projectSlug = null } = state;

  let url = `/${filter}`;

  if (containerLabel) {
    const slug = text_labelToSlug(containerLabel);
    url += `/${slug}`;
  }

  if (projectSlug) {
    url += `/${projectSlug}`;
  }

  return url;
}

/**
 * Convert text to URL slug format
 * Used in: DataView.jsx (project title), CaseTeaser.jsx, url_build()
 * Returns: kebab-case string
 * 
 * Examples:
 *   "Web Illustration" → "web-illustration"
 *   "My Awesome Project" → "my-awesome-project"
 *   "Café" → "cafe"
 */
export function text_labelToSlug(label) {
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
 * Used in: url_parse()
 * Returns: Title Case string
 * 
 * Examples:
 *   "web-illustration" → "Web Illustration"
 *   "my-awesome-project" → "My Awesome Project"
 */
export function text_slugToLabel(slug) {
  if (!slug) return "";
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Push new URL state to browser history
 * Used in: CaseContainer.jsx (handleProjectToggle, auto-open)
 * Side effect: Updates window.history + URL bar
 */
export function url_push(state) {
  if (typeof window === "undefined") return;
  const url = url_build(state);
  window.history.pushState(null, "", url);
}

/**
 * Replace URL state without adding to history
 * Used in: App.jsx initialization (don't create extra history entry)
 * Side effect: Updates window.history + URL bar
 */
export function url_replace(state) {
  if (typeof window === "undefined") return;
  const url = url_build(state);
  window.history.replaceState(null, "", url);
}
