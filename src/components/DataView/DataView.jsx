// ============================================
// DataView.jsx – URL-Driven State Management
// ============================================

import { useState, useEffect } from "react";
import CaseContainer from "./CaseContainer/CaseContainer";
import FilterNav from "./FilterNav/FilterNav";
import Intro from "../layout/Intro.jsx";
import { project_normalize } from "../../utils/project.js";
import { url_push, url_replace } from "../../utils/routing.js";

export default function DataView({ urlState, currentPath }) {
  // ============================================
  // ALL HOOKS FIRST (before any conditional returns!)
  // ============================================
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const CACHE_KEY = "sehetz-projects-cache-v1";
  
  // Initialize state from URL
  const [filter, setFilter] = useState(urlState?.filter || "skills");
  const [openContainerLabel, setOpenContainerLabel] = useState(urlState?.containerLabel || null);
  const [requestedProjectSlug, setRequestedProjectSlug] = useState(urlState?.projectSlug || null);

  const API_URL = import.meta.env.VITE_API_URL;
  const API_TOKEN = import.meta.env.VITE_API_TOKEN;
  const NOCO_BASE_URL = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";

  // Hydrate quickly from session cache (same tab) or pre-rendered JSON
  useEffect(() => {
    let cancelled = false;
    // 1) sessionStorage cache
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setData((prev) => (prev && prev.length ? prev : parsed));
        }
      }
    } catch (err) {
      // ignore
    }

    // 2) static prerender JSON
    async function hydrateFromStatic() {
      try {
        const res = await fetch("/data/projects.json", { cache: "force-cache" });
        if (!res.ok) return;
        const json = await res.json();
        const normalized = (json.list || []).map((p) => project_normalize(p, NOCO_BASE_URL));
        if (!cancelled && normalized.length) {
          setData((prev) => (prev && prev.length ? prev : normalized));
        }
      } catch (err) {
        // ignore
      }
    }

    hydrateFromStatic();
    return () => {
      cancelled = true;
    };
  }, [NOCO_BASE_URL]);

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
        const include = "include=_nc_m2m_sehetz_skills,_nc_m2m_sehetz_gears,_nc_m2m_sehetz_teams&limit=200";
        const urlWithInclude = API_URL.includes("?") ? `${API_URL}&${include}` : `${API_URL}?${include}`;
        const res = await fetch(urlWithInclude, { headers: { "xc-token": API_TOKEN } });
        if (!res.ok) return; // Silent fail - static data already loaded
        const json = await res.json();
        const normalized = (json.list || []).map((p) => project_normalize(p, NOCO_BASE_URL));
        setData(normalized);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(normalized));
        } catch (err) {
          // ignore
        }
      } catch (err) {
        // Silent fail - static data already loaded
      }
    }

    // Only fetch fresh data in development
    // In production, rely on static JSON updated at build time
    if (import.meta.env.DEV) {
      fetchData();
      const refreshInterval = setInterval(fetchData, 30000);
      return () => clearInterval(refreshInterval);
    }
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
  // NocoDB M2M relation keys (current base uses these names)
  const groupKeyMap = {
    skills: "_nc_m2m_sehetz_skills",
    gears: "_nc_m2m_sehetz_gears",
    teams: "_nc_m2m_sehetz_teams",
  };
  const groupKey = groupKeyMap[filter];

  // 3) Group projects by skill/gear/team
  const grouped = onlineData.reduce((acc, project) => {
    const rel = project[groupKey];
    if (!rel?.length) return acc;

      rel.forEach((item) => {
        const keyName = filter === "skills" ? item.skill?.Skill
          : filter === "gears" ? item.gear?.Gear
          : item.team?.Team;

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

  // Find currently open container index (based on URL) - case-insensitive
  const openIndex = openContainerLabel 
    ? containers.findIndex(c => c.label.toLowerCase() === openContainerLabel.toLowerCase())
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
      <Intro filter={filter} />
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
