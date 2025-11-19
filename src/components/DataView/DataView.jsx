// ============================================
// DataView.jsx
// --------------------------------------------
// Data Logic Layer – now with content block extraction
// ============================================

import { useState, useEffect } from "react";
import CaseContainer from "./CaseContainer/CaseContainer";
import "./DataView.css";
import FilterNav from "./FilterNav/FilterNav";

export default function DataView({ onFilterChange }) {
  // --------------------------------------------
  // STATE: holds normalized project data
  // --------------------------------------------
  const [data, setData] = useState(null);

  // --------------------------------------------
  // FILTER STATE
  // --------------------------------------------
  const [filter, setFilter] = useState("skills");

  // ⭐ Notify parent when filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filter);
    }
  }, [filter, onFilterChange]);

  // --------------------------------------------
  // ERROR / LOADING
  // --------------------------------------------
  const [error, setError] = useState(null);

  // --------------------------------------------
  // OPEN STATE FOR SKILL GROUPS
  // --------------------------------------------
  const [openIndex, setOpenIndex] = useState(null);

  // --------------------------------------------
  // API CONFIG
  // --------------------------------------------
  const API_URL = import.meta.env.VITE_API_URL;
  const API_TOKEN = import.meta.env.VITE_API_TOKEN;

  // --------------------------------------------
  // ⭐ NEU — CONTENT MASTER ORDER
  // --------------------------------------------
  const CONTENT_MASTER = [
    "content_01_text",
    "content_02_image",
    "content_03_text",
    "content_04_images",
    "content_05_text",
    "content_06_gallery",
    "content_07_links",
  ];

  // --------------------------------------------
  // ⭐ NEU — extract content blocks from a project
  // --------------------------------------------
  function buildContentBlocks(project) {
    return CONTENT_MASTER.filter((field) => {
      const value = project[field];

      if (!value) return false;

      // text fields → ignore empty strings
      if (typeof value === "string") {
        return value.trim() !== "";
      }

      // image/gallery fields → ignore empty attachment arrays
      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return false;
    }).map((field) => ({
      type: field,
      data: project[field],
    }));
  }

  // --------------------------------------------
  // PROJECT NORMALIZATION
  // --------------------------------------------
  function normalizeProject(project) {
    const file = project["Teaser-Image"]?.[0];
    const NOCO_BASE_URL = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";

    let teaserImage = null;
    let teaserVideo = null;
    if (file) {
      const fullPath = `${NOCO_BASE_URL}/${file.signedPath || file.path}`;
      const mime = file.mimetype || file.type || "";
      const ext = (file.name || "").toLowerCase();
      if (mime.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(ext)) {
        teaserVideo = fullPath;
      } else {
        teaserImage = fullPath;
      }
    }

    const blocks = buildContentBlocks(project).map(b => {
      if (Array.isArray(b.data)) {
        return {
          ...b,
          data: b.data.map(att => {
            const mime = att.mimetype || att.type || "";
            const ext = (att.name || "").toLowerCase();
            const url = `${NOCO_BASE_URL}/${att.signedPath || att.path}`;
            const isVideo = mime.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(ext);
            return { ...att, __url: url, __isVideo: isVideo };
          })
        };
      }
      if (typeof b.data === "object" && b.data?.path) {
        const mime = b.data.mimetype || b.data.type || "";
        const ext = (b.data.name || "").toLowerCase();
        const url = `${NOCO_BASE_URL}/${b.data.signedPath || b.data.path}`;
        const isVideo = mime.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(ext);
        return { ...b, data: { ...b.data, __url: url, __isVideo: isVideo } };
      }
      return b;
    });

    return { ...project, teaserImage, teaserVideo, blocks };
  }

  // --------------------------------------------
  // DATA FETCHING
  // --------------------------------------------
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(API_URL, {
          headers: { "xc-token": API_TOKEN },
        });
        if (!res.ok) throw new Error(`Error: ${res.status}`);

        const json = await res.json();

        const normalized = json.list.map(normalizeProject); // ⭐ includes blocks
        setData(normalized);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchData();
  }, [API_URL, API_TOKEN]);

  if (error) return <pre>Error: {error}</pre>;
  if (!data) return <pre>Loading data...</pre>;

  // --------------------------------------------
// GROUP KEY
// --------------------------------------------
const groupKey =
  filter === "skills"
    ? "nc_3zu8___nc_m2m_nc_3zu8__Projec_Skills"
    : filter === "gears"
    ? "nc_3zu8___nc_m2m_nc_3zu8__Projec_Gears"
    : "nc_3zu8___nc_m2m_nc_3zu8__Projec_Teams";

// --------------------------------------------
// GROUPING PROJECTS BY SKILL / GEAR / TEAM
// --------------------------------------------
const grouped = data.reduce((acc, project) => {
  const rel = project[groupKey];

  if (!rel?.length) return acc;

  rel.forEach((item) => {
    // 1) Gruppenschlüssel bestimmen
    const keyName =
      filter === "skills"
        ? item.Skills.Skill
        : filter === "gears"
        ? item.Gear.Gear
        : item.Teams.Team;

    // 2) Basis-Projekt
    let entry = project;

    // 3) Gear-/Team-Daten als Zusatzobjekt anhängen
    if (filter === "gears") {
      entry = { ...project, __gearData: item.Gear };
    } else if (filter === "teams") {
      entry = { ...project, __teamData: item.Teams };
    }

    // 4) Gruppe befüllen
    acc[keyName] = acc[keyName] || [];
    acc[keyName].push(entry);
  });

  return acc;
}, {});


  const entries = Object.entries(grouped);

  // --------------------------------------------
  // RENDER
  // --------------------------------------------
  return (
    <main className="data-view">
      <FilterNav filter={filter} setFilter={setFilter} />
      {entries.map(([key, projects], index) => (
        <CaseContainer
          key={key}
          type={filter}
          label={key}
          projects={projects}
          isLast={index === entries.length - 1}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </main>
  );
}
