// Helper to resolve media filenames to paths using build-time manifest

function buildCandidates(name) {
  const decoded = decodeURIComponent(name || "");
  const candidates = new Set();

  if (name) candidates.add(name);
  if (decoded) candidates.add(decoded);

  // Remove transient hash suffixes like "@8x_H3hL7.webp" -> "@8x.webp"
  const stripTaggedScale = decoded.replace(/@(\d+x)_([A-Za-z0-9]+)(\.[^.]+)$/i, "@$1$3");
  if (stripTaggedScale !== decoded) candidates.add(stripTaggedScale);

  // Generic "_hash.ext" -> ".ext" cleanup (matches 4+ alphanumeric chars before extension)
  const stripHash = decoded.replace(/_[A-Za-z0-9]{4,}(\.[^.]+)$/i, "$1");
  if (stripHash !== decoded) candidates.add(stripHash);

  // Additional cleanup: strip multiple consecutive hash-like patterns
  let current = stripHash;
  while (current !== current.replace(/_[A-Za-z0-9]{4,}(\.[^.]+)$/i, "$1")) {
    current = current.replace(/_[A-Za-z0-9]{4,}(\.[^.]+)$/i, "$1");
    candidates.add(current);
  }

  return Array.from(candidates);
}

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
