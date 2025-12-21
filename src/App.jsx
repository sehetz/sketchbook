// src/App.jsx
import "./styles/global.css";
import { useHead } from "./utils/useHead.js";
import { schema_inject, schema_getOrganization } from "./utils/structuredData.js";
import { url_parse } from "./utils/urlRouting.js";

// Core Components
import Header from "./components/Header/Header";
import Intro from "./components/Intro/Intro";
import Footer from "./components/Footer/Footer";

// Data Logic Layer
import DataView from "./components/DataView/DataView";
import TimelineViz from "./components/AboutViz/TimelineViz";
import SehetzTeaser from "./components/AboutViz/SehetzTeaser";
import { useState, useEffect } from "react";
import Impressum from "./impressum";
import About from "./About";
import Privacy from "./privacy";

function App() {
  // Simple client-side page switch (reacts to history / popstate)
  const [currentPath, setCurrentPath] = useState(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );
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
  if (normalized === "/impressum") return <Impressum />;
  if (normalized === "/about") return <About />;
  if (normalized === "/privacy") return <Privacy />;

  return (
    <>
      <Header />
      <main>
        <DataView urlState={urlState} currentPath={currentPath} />
      </main>
      <Footer />
    </>
  );
}

export default App;
