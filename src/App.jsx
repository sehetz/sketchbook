// src/App.jsx
import "./styles/global.css";
import { useHead, schema_inject, schema_getOrganization } from "./utils/seo.js";
import { url_parse } from "./utils/routing.js";
import { initGA, trackPageView } from "./utils/analytics.js";
import { DataProvider } from "./contexts/DataContext.jsx";

// Core Components
// import Banner from "./components/layout/Banner/Banner";
import Header from "./components/layout/Header/Header";
import Footer from "./components/layout/Footer/Footer";
import DataView from "./components/DataView/DataView";

import About from "./pages/About";
import { useState, useEffect, lazy, Suspense } from "react";

const Impressum = lazy(() => import("./pages/Impressum"));
const Privacy = lazy(() => import("./pages/Privacy"));
const MissionIris = lazy(() => import("./pages/MissionIris"));

function App() {
  // Simple client-side page switch (reacts to history / popstate)
  const [currentPath, setCurrentPath] = useState(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );

  // View mode: list or feed
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window === "undefined") return "list";
    const params = new URLSearchParams(window.location.search);
    return params.get("view") === "feed" ? "feed" : "list";
  });

  // Sync viewMode with URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newView = viewMode === "feed" ? "feed" : "list";
    const currentView = params.get("view");

    if (newView === "list" && currentView) {
      params.delete("view");
    } else if (newView === "feed" && currentView !== "feed") {
      params.set("view", "feed");
    }

    const newSearch = params.toString();
    const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`;

    if (newUrl !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, "", newUrl);
    }
  }, [viewMode]);

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
    title: "Sarah Elena Heitz – Illustrator & Designer | Sehetz",
    description: "Sarah Elena Heitz, illustrator, graphic & information designer at home in Basel, Switzerland. Online portfolio loaded with projects across different skills and creative teams.",
    url: "https://sehetz.ch",
  });

  // Set keywords and author meta tags
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Keywords
      let keywordsMeta = document.querySelector('meta[name="keywords"]');
      if (!keywordsMeta) {
        keywordsMeta = document.createElement('meta');
        keywordsMeta.name = 'keywords';
        document.head.appendChild(keywordsMeta);
      }
      keywordsMeta.content = 'Sarah Heitz, illustrator, designer, Basel, Switzerland, creative portfolio, illustration, graphic design';

      // Author
      let authorMeta = document.querySelector('meta[name="author"]');
      if (!authorMeta) {
        authorMeta = document.createElement('meta');
        authorMeta.name = 'author';
        document.head.appendChild(authorMeta);
      }
      authorMeta.content = 'Sarah Heitz';
    }
  }, []);

  // Inject Organization schema
  useEffect(() => {
    schema_inject(schema_getOrganization());
  }, []);

  // normalize trailing slash, then route
  const normalized = currentPath.replace(/\/$/, "");
  if (normalized === "/sarah-heitz") return <DataProvider><About /></DataProvider>;
  if (normalized === "/about") return <DataProvider><About /></DataProvider>;
  if (normalized === "/privacy") return <Suspense fallback={<div className="loading">Loading...</div>}><Privacy /></Suspense>;
  if (normalized === "/impressum") return <Suspense fallback={<div className="loading">Loading...</div>}><Impressum /></Suspense>;
  if (normalized === "/mission-iris") return <Suspense fallback={<div className="loading">Loading...</div>}><MissionIris /></Suspense>;

  return (
    <DataProvider>
      {/* <Banner/> */}
      <Header viewMode={viewMode} setViewMode={setViewMode} />
      <main>
          <DataView urlState={urlState} currentPath={currentPath} viewMode={viewMode} />
        </main>
      <Footer />
    </DataProvider>
  );
}

export default App;
