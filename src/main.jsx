import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";

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

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
