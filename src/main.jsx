import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";


// Load media manifest synchronously before rendering
async function init() {
  // Load media manifest and dimensions in parallel
  if (typeof window !== "undefined") {
    try {
      const [manifestRes, dimsRes] = await Promise.all([
        fetch("/media-manifest.json"),
        fetch("/media-dimensions.json"),
      ]);
      window.__MEDIA_MANIFEST = await manifestRes.json();
      window.__MEDIA_DIMENSIONS = dimsRes.ok ? await dimsRes.json() : {};
    } catch (err) {
      window.__MEDIA_MANIFEST = {};
      window.__MEDIA_DIMENSIONS = {};
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
