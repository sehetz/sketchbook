// ============================================
// DataView.jsx
// --------------------------------------------
// This component acts as the *Data Logic Layer*
// for the entire Sketchbook application.
//
// Linked files / components:
// - CaseContainer.jsx  → Receives grouped project data
// - Teaser.jsx         → Receives fully normalized project objects via CaseContainer
//
// Responsibilities:
// - Fetch raw project data from the NocoDB REST API
// - Normalize data (e.g., generate image URLs)
// - Group projects by Skills, Gears, or Teams
// - Pass structured data downward to presentation components
//
// API details:
// - Uses NocoDB REST API (tables endpoint), protected via `xc-token` header
// - Expects an env-configured URL such as:
//   VITE_API_URL = http://localhost:8080/api/v2/tables/<id>/records
// ============================================

import { useState, useEffect } from "react";
import CaseContainer from "./CaseContainer/CaseContainer";

export default function DataView() {
  // --------------------------------------------
  // STATE: holds normalized project data
  // Used in: grouping logic + CaseContainer props
  // --------------------------------------------
  const [data, setData] = useState(null);

  // --------------------------------------------
  // STATE: active filter selection
  // Determines grouping key (skills / gears / teams)
  // Used in: groupKey resolution + UI structure
  // --------------------------------------------
  const [filter, setFilter] = useState("skills");

  // --------------------------------------------
  // STATE: error handling for failed API calls
  // Used in: conditional error rendering
  // --------------------------------------------
  const [error, setError] = useState(null);

  // --------------------------------------------
  // ENV VARIABLES: API configuration
  // Used in: fetch request headers + endpoint URL
  // --------------------------------------------
  const API_URL = import.meta.env.VITE_API_URL;
  const API_TOKEN = import.meta.env.VITE_API_TOKEN;

  // ============================================
  // normalizeProject()
  // --------------------------------------------
  // Purpose:
  // - Adds derived fields to each project
  // - Generates a fully qualified teaser image URL
  //
  // Used in:
  // - Data normalization inside fetchData()
  //
  // Returned shape:
  // { ...project, teaserImage: <string|null> }
  // ============================================
  function normalizeProject(project) {
    const file = project["Teaser-Image"]?.[0];

    const NOCO_BASE_URL =
      import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";

    const teaserImage = file
      ? `${NOCO_BASE_URL}/${file.signedPath || file.path}`
      : null;

    return { ...project, teaserImage };
  }

  // ============================================
  // DATA FETCHING — useEffect()
  // --------------------------------------------
  // - Fetches raw project data from NocoDB
  // - Injects xc-token authorization header
  // - Normalizes all projects before storing them
  // - Handles API/network errors
  //
  // Runs:
  // - Once on mount
  // - When API_URL or API_TOKEN changes
  // ============================================
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(API_URL, {
          headers: { "xc-token": API_TOKEN },
        });
        if (!res.ok) throw new Error(`Error: ${res.status}`);

        const json = await res.json();

        // Normalize ALL projects at once
        const normalized = json.list.map(normalizeProject);
        setData(normalized);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchData();
  }, [API_URL, API_TOKEN]);

  // Render fallback states
  if (error) return <pre>Error: {error}</pre>;
  if (!data) return <pre>Loading data...</pre>;

  // ============================================
  // GROUPING — based on active filter
  // --------------------------------------------
  // filter === "skills" → group by Skill name
  // filter === "gears"  → group by Gear name
  // filter === "teams"  → group by Team name
  //
  // Used in:
  // - Reduce operation that builds `grouped` object
  // - CaseContainer receives each grouped project list
  // ============================================
  const groupKey =
    filter === "skills"
      ? "nc_3zu8___nc_m2m_nc_3zu8__Projec_Skills"
      : filter === "gears"
      ? "nc_3zu8___nc_m2m_nc_3zu8__Projec_Gears"
      : "nc_3zu8___nc_m2m_nc_3zu8__Projec_Teams";

  // --------------------------------------------
  // GROUPING LOGIC:
  // Converts flat project array into a dictionary:
  // {
  //   "Figma": [projectA, projectB],
  //   "Cinema4D": [projectC],
  //   ...
  // }
  //
  // Used in:
  // - entries.map() to render <CaseContainer>
  // --------------------------------------------
  const grouped = data.reduce((acc, project) => {
    const rel = project[groupKey];
    if (rel?.length) {
      rel.forEach((item) => {
        const keyName =
          filter === "skills"
            ? item.Skills.Skill
            : filter === "gears"
            ? item.Gear.Gear
            : item.Teams.Team;

        acc[keyName] = acc[keyName] || [];
        acc[keyName].push(project);
      });
    }
    return acc;
  }, {});

  const entries = Object.entries(grouped);


  return (
    <main>
      {entries.map(([key, projects], index) => (
        <CaseContainer
          key={key}
          type={filter}
          label={key}
          projects={projects}
          isLast={index === entries.length - 1}
        />
      ))}
    </main>
  );
}
