// ============================================
// DataView.jsx – URL-Driven Project View
// ============================================
//
// Diese Component zeigt Projects gefiltert nach Skills/Gears/Teams.
// ALLE DATEN kommen jetzt aus dem DataContext (siehe DataContext.jsx)
//
// Funktionen:
// - URL-basierte Navigation (z.B. /skills/illustration/project-slug)
// - Filtern nach Skills, Gears oder Teams
// - Gruppierung & Sortierung von Projects
// - Öffnen/Schließen von Containern
// ============================================

import { useState, useEffect } from "react";
import CaseContainer from "./CaseContainer/CaseContainer";
import FilterNav from "./FilterNav/FilterNav";
import Intro from "../layout/Intro.jsx";
import { url_push } from "../../utils/routing.js";
import { useData } from "../../contexts/DataContext.jsx";

export default function DataView({ urlState, currentPath }) {
  // ============================================
  // DATEN AUS CONTEXT HOLEN
  // ============================================
  
  const { projects, isLoading, error } = useData();

  // ============================================
  // URL-STATE MANAGEMENT
  // ============================================
  
  // Initialize state from URL
  const [filter, setFilter] = useState(urlState?.filter || "skills");
  const [openContainerLabel, setOpenContainerLabel] = useState(urlState?.containerLabel || null);
  const [requestedProjectSlug, setRequestedProjectSlug] = useState(urlState?.projectSlug || null);

  // Sync URL changes to state
  useEffect(() => {
    setFilter(urlState?.filter || "skills");
    setOpenContainerLabel(urlState?.containerLabel || null);
    setRequestedProjectSlug(urlState?.projectSlug || null);
  }, [currentPath]);

  // ============================================
  // EARLY RETURNS (Loading/Error States)
  // ============================================
  
  if (error) {
    return (
      <main className="data-view">
        <pre style={{ padding: "2rem", color: "red" }}>
          Fehler beim Laden: {error}
        </pre>
      </main>
    );
  }

  if (isLoading || !projects || projects.length === 0) {
    return (
      <main className="data-view">
        <Intro filter={filter} />
        <FilterNav filter={filter} setFilter={() => {}} />
        <div style={{ padding: "2rem", textAlign: "center" }}>
          Lade Projekte...
        </div>
      </main>
    );
  }

  // ============================================
  // DATA PROCESSING
  // ============================================

  // 1) Filter: Nur online Projects
  const onlineData = projects.filter((project) =>
    project.is_online === 1 || project.is_online === true || project.is_online === "1"
  );

  // Helper: Get sortable timestamp from project
  const getProjectDate = (project) => {
    const rawDate = project?.Datum || project?.date || project?.created_at || project?.updated_at;
    const ts = rawDate ? Date.parse(rawDate) : NaN;
    return Number.isNaN(ts) ? 0 : ts;
  };

  // 2) NocoDB M2M Relation Keys basierend auf Filter
  const groupKeyMap = {
    skills: "_nc_m2m_sehetz_skills",
    gears: "_nc_m2m_sehetz_gears",
    teams: "_nc_m2m_sehetz_teams",
  };
  const groupKey = groupKeyMap[filter];

  // 3) Gruppiere Projects nach Skill/Gear/Team
  const grouped = onlineData.reduce((acc, project) => {
    const rel = project[groupKey];
    if (!rel?.length) return acc;

    rel.forEach((item) => {
      // Extrahiere den Namen (Skill, Gear oder Team)
      const keyName = filter === "skills" ? item.skill?.Skill
        : filter === "gears" ? item.gear?.Gear
        : item.team?.Team;

      if (!keyName) return;

      // Füge zusätzliche Daten hinzu für Gear/Team Teasers
      let entry = project;
      if (filter === "gears") entry = { ...project, __gearData: item.Gear };
      else if (filter === "teams") entry = { ...project, __teamData: item.Teams };

      // Füge Project zur Gruppe hinzu
      acc[keyName] = acc[keyName] || [];
      acc[keyName].push(entry);
    });

    return acc;
  }, {});

  // 4) Konvertiere zu Containers Array + Sortiere
  const containers = Object.entries(grouped)
    .map(([name, projects]) => ({
      type: filter,
      label: name,
      // Sortiere Projects nach Datum (neueste zuerst)
      projects: [...projects].sort((a, b) => getProjectDate(b) - getProjectDate(a)),
    }))
    // Sortiere Container nach Anzahl Projects (meiste zuerst)
    .sort((a, b) => b.projects.length - a.projects.length);

  // Finde Index des aktuell geöffneten Containers (case-insensitive)
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
      // Container schließen
      setOpenContainerLabel(null);
      setRequestedProjectSlug(null);
      url_push({ filter });
    } else {
      // Container öffnen
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
      
      {containers.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          Keine Projekte gefunden für "{filter}"
        </div>
      ) : (
        containers.map((container, index) => (
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
        ))
      )}
    </main>
  );
}
