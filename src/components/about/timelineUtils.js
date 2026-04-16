// Pure helper functions shared across Timeline components

export function getCSSVar(name, element = document.documentElement) {
  return getComputedStyle(element).getPropertyValue(name).trim();
}

export function parseCSSValueInPx(name, element = document.documentElement) {
  const value = getComputedStyle(element).getPropertyValue(name).trim();
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

export function parseYear(val) {
  if (val == null) return null;
  if (typeof val === "number" && Number.isFinite(val)) return Math.floor(val);
  if (typeof val === "string") {
    const m = val.match(/(\d{4})/);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

export function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-");
}
