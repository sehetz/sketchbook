// ============================================
// DataView.jsx
// --------------------------------------------
// Data Logic Layer – now with content block extraction
// ============================================

import { useState, useEffect } from "react";
import CaseContainer from "./CaseContainer/CaseContainer";
import "./DataView.css";
import FilterNav from "./FilterNav/FilterNav";
import { normalizeProject } from "../../utils/helpers.js";

export default function DataView({ onFilterChange }) {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("skills");
  const [error, setError] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const API_TOKEN = import.meta.env.VITE_API_TOKEN;
  const NOCO_BASE_URL = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";

  // ============================================
  // EFFECT: Fetch data from API
  // ============================================
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(API_URL, { headers: { "xc-token": API_TOKEN } });
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const json = await res.json();
        const normalized = json.list.map(p => normalizeProject(p, NOCO_BASE_URL));
        setData(normalized);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchData();
  }, [API_URL, API_TOKEN, NOCO_BASE_URL]);

  // ============================================
  // EFFECT: Notify parent on filter change
  // ============================================
  useEffect(() => {
    if (onFilterChange) onFilterChange(filter);
  }, [filter, onFilterChange]);

  // ============================================
  // LOADING / ERROR
  // ============================================
  if (error) return <pre>Error: {error}</pre>;
  if (!data) return <pre>Loading data...</pre>;

  // ============================================
  // DATA PROCESSING
  // ============================================

  // 1) Filter: Only online projects (is_online === 1)
  const onlineData = data.filter(project => project.is_online === 1);

  // 2) Get group key based on filter type
  const groupKeyMap = {
    skills: "nc_3zu8___nc_m2m_nc_3zu8__Projec_Skills",
    gears: "nc_3zu8___nc_m2m_nc_3zu8__Projec_Gears",
    teams: "nc_3zu8___nc_m2m_nc_3zu8__Projec_Teams",
  };
  const groupKey = groupKeyMap[filter];

  // 3) Group projects by skill/gear/team
  const grouped = onlineData.reduce((acc, project) => {
    const rel = project[groupKey];
    if (!rel?.length) return acc;

    rel.forEach((item) => {
      const keyName = filter === "skills" ? item.Skills.Skill
        : filter === "gears" ? item.Gear.Gear
        : item.Teams.Team;

      let entry = project;
      if (filter === "gears") entry = { ...project, __gearData: item.Gear };
      else if (filter === "teams") entry = { ...project, __teamData: item.Teams };

      acc[keyName] = acc[keyName] || [];
      acc[keyName].push(entry);
    });

    return acc;
  }, {});

  // 4) Convert to containers + sort by project count
  const containers = Object.entries(grouped)
    .map(([name, projects]) => ({
      type: filter,
      label: name,
      projects,
    }))
    .sort((a, b) => b.projects.length - a.projects.length);

  // ============================================
  // RENDER
  // ============================================
  return (
    <main className="data-view">
      <FilterNav filter={filter} setFilter={setFilter} />
      {containers.map((container, index) => (
        <CaseContainer
          key={`${container.type}-${container.label}`}
          type={container.type}
          label={container.label}
          projects={container.projects}
          isLast={index === containers.length - 1}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </main>
  );
}
