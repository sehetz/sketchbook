import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";


// Restore original SPA path when redirected via 404.html
if (typeof window !== "undefined") {
  const params = new URLSearchParams(window.location.search);
  const redirectPath = params.get("p");
  const redirectQuery = params.get("q");
  if (redirectPath) {
    const next = `${redirectPath}${redirectQuery ? `?${redirectQuery}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", next);
  }
}

// Set defaults immediately to prevent flicker
window.__MEDIA_MANIFEST = {};
window.__MEDIA_DIMENSIONS = {};

// Render app immediately (don't wait for JSON)
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Load media manifest in background after render
if (typeof window !== "undefined") {
  Promise.all([
    fetch("/media-manifest.json").then(r => r.json()),
    fetch("/media-dimensions.json").then(r => r.json()),
  ]).then(([manifest, dims]) => {
    window.__MEDIA_MANIFEST = manifest;
    window.__MEDIA_DIMENSIONS = dims || {};
  }).catch(() => {
    // Keep defaults on error
  });
}
