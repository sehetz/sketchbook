// src/App.jsx
import "./styles/global.css";
import { useHead } from "./utils/useHead.js";
import { injectSchema, getOrganizationSchema } from "./utils/structuredData.js";

// Core Components
import Header from "./components/Header/Header";
import Intro from "./components/Intro/Intro";
import Footer from "./components/Footer/Footer";

// Data Logic Layer
import DataView from "./components/DataView/DataView";
import AllProjectsMasonry from "./components/AboutViz/AllProjectsMasonry/AllProjectsMasonry";
import { useState, useEffect } from "react";
import Impressum from "./impressum";

function App() {
  const [filter, setFilter] = useState("skills");

  // Simple client-side page switch (reacts to history / popstate)
  const [currentPath, setCurrentPath] = useState(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );
  useEffect(() => {
    const onPop = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Set meta tags for homepage
  useHead({
    title: "Sehetz Sketchbook – Creative Portfolio",
    description: "Explore a curated portfolio of design, illustration, and digital art projects. Discover skills, gears, and creative teams.",
    url: "https://sehetz.ch",
  });

  // Inject Organization schema
  useEffect(() => {
    injectSchema(getOrganizationSchema());
  }, []);

  // normalize trailing slash, then route
  const normalized = currentPath.replace(/\/$/, "");
  if (normalized === "/impressum") return <Impressum />;

  return (
    <>
      <Header />
      <Intro filter={filter} /> {/* ⭐ Pass filter */}
      <main>
        <DataView onFilterChange={setFilter} /> {/* ⭐ Pass setter */}
        {/* <AllProjectsMasonry /> */}
      </main>
      <Footer />
    </>
  );
}

export default App;
