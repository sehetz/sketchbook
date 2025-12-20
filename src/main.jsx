import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";

// Load media manifest synchronously before rendering
async function init() {
  // Load media manifest
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/media-manifest.json");
      const manifest = await res.json();
      window.__MEDIA_MANIFEST = manifest;
      console.log("✅ Media manifest loaded:", Object.keys(manifest).length, "files");
    } catch (err) {
      console.warn("⚠️ Could not load media-manifest.json:", err.message);
      window.__MEDIA_MANIFEST = {};
    }
  }

  // Restore original SPA path when redirected via 404.html (?p=/about)
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
