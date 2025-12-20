// ============================================
// DataView.jsx – URL-Driven State Management
// ============================================

import { useState, useEffect } from "react";
import CaseContainer from "./CaseContainer/CaseContainer";
import FilterNav from "./FilterNav/FilterNav";
import { project_normalize } from "../../utils/helpers.js";
import { url_push, url_replace } from "../../utils/urlRouting.js";

export default function DataView({ urlState, currentPath }) {
  // ============================================
  // ALL HOOKS FIRST (before any conditional returns!)
  // ============================================
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  // Initialize state from URL
  const [filter, setFilter] = useState(urlState?.filter || "skills");
  const [openContainerLabel, setOpenContainerLabel] = useState(urlState?.containerLabel || null);
  const [requestedProjectSlug, setRequestedProjectSlug] = useState(urlState?.projectSlug || null);

  const API_URL = import.meta.env.VITE_API_URL;
  const API_TOKEN = import.meta.env.VITE_API_TOKEN;
  const NOCO_BASE_URL = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";

  // ============================================
  // EFFECT: Sync URL changes to state
  // ============================================
  useEffect(() => {
    setFilter(urlState?.filter || "skills");
    setOpenContainerLabel(urlState?.containerLabel || null);
    setRequestedProjectSlug(urlState?.projectSlug || null);
  }, [currentPath]);

  // ============================================
  // EFFECT: Fetch data from API
  // ============================================
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(API_URL, { headers: { "xc-token": API_TOKEN } });
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const json = await res.json();
        const normalized = json.list.map(p => project_normalize(p, NOCO_BASE_URL));
        setData(normalized);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchData();

    // Auto-refresh every 30 seconds for live CMS updates
    const refreshInterval = setInterval(fetchData, 30000);

    return () => clearInterval(refreshInterval);
  }, [API_URL, API_TOKEN, NOCO_BASE_URL]);

  // ============================================
  // EARLY RETURNS (after all hooks!)
  // ============================================
  if (error) return <pre>Error: {error}</pre>;
  if (!data) return <pre>Loading data...</pre>;

  // ============================================
  // DATA PROCESSING
  // ============================================

  // 1) Filter: Only online projects
  const onlineData = data.filter((project) =>
    project.is_online === 1 || project.is_online === true || project.is_online === "1"
  );

  // Helper: get sortable timestamp
  const getProjectDate = (project) => {
    const rawDate = project?.Datum || project?.date || project?.created_at || project?.updated_at;
    const ts = rawDate ? Date.parse(rawDate) : NaN;
    return Number.isNaN(ts) ? 0 : ts;
  };

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
      projects: [...projects].sort((a, b) => getProjectDate(b) - getProjectDate(a)), // newest first
    }))
    .sort((a, b) => b.projects.length - a.projects.length);

  // Find currently open container index (based on URL)
  const openIndex = openContainerLabel 
    ? containers.findIndex(c => c.label === openContainerLabel)
    : -1;

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const handleUrlUpdate = (state) => {
    url_push(state);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setOpenContainerLabel(null);
    setRequestedProjectSlug(null);
    url_push({ filter: newFilter });
  };

  const handleContainerToggle = (index) => {
    const container = containers[index];
    
    if (openIndex === index) {
      // Closing container
      setOpenContainerLabel(null);
      setRequestedProjectSlug(null);
      url_push({ filter });
    } else {
      // Opening container
      const label = container.label;
      setOpenContainerLabel(label);
      setRequestedProjectSlug(null);
      url_push({ filter, containerLabel: label });
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <main className="data-view">
      <FilterNav filter={filter} setFilter={handleFilterChange} />
      {containers.map((container, index) => (
        <CaseContainer
          key={`${container.type}-${container.label}`}
          type={container.type}
          label={container.label}
          projects={container.projects}
          isLast={index === containers.length - 1}
          isOpen={openIndex === index}
          onToggle={() => handleContainerToggle(index)}
          onUpdateUrl={handleUrlUpdate}
          requestedProjectSlug={requestedProjectSlug}
        />
      ))}
    </main>
  );
}
