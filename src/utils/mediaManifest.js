// Helper to resolve media filenames to paths using build-time manifest

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
