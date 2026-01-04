import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";

/**
 * Apply National Park font styling if National Park is the active font.
 * Styles are defined in global.css under body.national-park-active
 */
async function detectNationalPark() {
  try {
    await document.fonts.load('12px "National Park"');
    document.body.classList.add("national-park-active");
  } catch {
    // National Park not loaded, no class needed
  }
}

// Detect National Park font BEFORE anything renders
detectNationalPark();

// Load media manifest synchronously before rendering
async function init() {
  // Load media manifest
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/media-manifest.json");
      const manifest = await res.json();
      window.__MEDIA_MANIFEST = manifest;
    } catch (err) {
      window.__MEDIA_MANIFEST = {};
    }
  }

  // Restore original SPA path when redirected via 404.html (?p=/sarah-heitz)
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const redirectPath = params.get("p");
    const redirectQuery = params.get("q");
    if (redirectPath) {
      const next = `${redirectPath}${redirectQuery ? `?${redirectQuery}` : ""}${window.location.hash}`;
      window.history.replaceState(null, "", next);
    }
  }

  // Render app
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

init();
