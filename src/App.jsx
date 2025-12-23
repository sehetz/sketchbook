// src/App.jsx
import "./styles/global.css";
import { useHead } from "./utils/useHead.js";
import { schema_inject, schema_getOrganization } from "./utils/structuredData.js";
import { url_parse } from "./utils/urlRouting.js";
import { initGA, trackPageView } from "./utils/analytics.js";

// Core Components
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

// Lazy load non-critical pages for better performance
import { useState, useEffect, lazy, Suspense } from "react";

const DataView = lazy(() => import("./components/DataView/DataView"));
const Impressum = lazy(() => import("./impressum"));
const About = lazy(() => import("./About"));
const Privacy = lazy(() => import("./privacy"));

function App() {
  // Simple client-side page switch (reacts to history / popstate)
  const [currentPath, setCurrentPath] = useState(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );
  
  // Initialize Google Analytics on mount
  useEffect(() => {
    initGA();
  }, []);
  
  // Track page views when path changes
  useEffect(() => {
    trackPageView(currentPath);
  }, [currentPath]);
  
  useEffect(() => {
    const onPop = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Parse URL to get initial state
  const urlState = url_parse(currentPath);
  const filter = urlState.filter || "skills";

  // Set meta tags for homepage
  useHead({
    title: "Sehetz Sketchbook – Creative Portfolio",
    description: "Explore a curated portfolio of design, illustration, and digital art projects. Discover skills, gears, and creative teams.",
    url: "https://sehetz.ch",
  });

  // Inject Organization schema
  useEffect(() => {
    schema_inject(schema_getOrganization());
  }, []);

  // normalize trailing slash, then route
  const normalized = currentPath.replace(/\/$/, "");
  if (normalized === "/impressum") return <Suspense fallback={<div className="loading">Loading...</div>}><Impressum /></Suspense>;
  if (normalized === "/about") return <Suspense fallback={<div className="loading">Loading...</div>}><About /></Suspense>;
  if (normalized === "/privacy") return <Suspense fallback={<div className="loading">Loading...</div>}><Privacy /></Suspense>;

  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<div className="loading">Loading content...</div>}>
          <DataView urlState={urlState} currentPath={currentPath} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

export default App;
