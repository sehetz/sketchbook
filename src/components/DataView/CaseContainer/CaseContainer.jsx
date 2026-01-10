// ============================================
// CaseContainer.jsx – Skill / Gear / Team Container
// ============================================

import { useState, useEffect, useRef, lazy, Suspense, useMemo } from "react";
import CaseHeader from "./CaseComponents/CaseHeader.jsx";
import CaseTeaser from "./CaseComponents/CaseTeaser.jsx";
import GearTeaser from "./CaseComponents/GearTeaser.jsx";
import TeamTeaser from "./CaseComponents/TeamTeaser.jsx";
import { text_labelToSlug, url_build } from "../../../utils/urlRouting.js";

import { CLOSE_MS, TRANSITION_GAP_MS, DEFAULT_FIRST_OPEN_INDEX, timer_clear, timer_schedule } from "../../../utils/helpers.js";

// Lazy-load CaseDetail to reduce initial bundle size
const CaseDetail = lazy(() => import("./CaseComponents/CaseDetail.jsx"));

export default function CaseContainer({
  type,
  label,
  projects,
  isLast,
  isOpen,
  onToggle,
  onUpdateUrl,
  requestedProjectSlug,
}) {
  const [openProjectIndex, setOpenProjectIndex] = useState(null);
  const queuedProjectRef = useRef(null);
  const transitionTimerRef = useRef(null);
  const containerRef = useRef(null);
  const userClearedRequestedRef = useRef(false);

  // Memoize displayProjects BEFORE useEffects that depend on it
  const displayProjects = useMemo(() => {
    if (type !== "teams") return projects;
    return projects.filter((p) => {
      const name = (p.__teamData?.Team || p._nc_m2m_sehetz_teams?.[0]?.team?.Team || "").toLowerCase();
      return name !== "sehetz";
    });
  }, [type, projects]);

  // Auto-open first project when group opens
  useEffect(() => {
    if (isOpen && openProjectIndex === null) {
      // Container just opened → open first project
      setOpenProjectIndex(DEFAULT_FIRST_OPEN_INDEX);
    } else if (!isOpen) {
      // Container closed → clear project
      setOpenProjectIndex(null);
    }
  }, [isOpen]);

  // Sync URL when openProjectIndex changes (auto-open or manual toggle)
  // Only include projectSlug for "skills" type
  useEffect(() => {
    if (isOpen && openProjectIndex !== null && openProjectIndex !== undefined) {
      const project = displayProjects?.[openProjectIndex];
      if (project && onUpdateUrl) {
        // Only add projectSlug for skills; gears and teams only have container URL
        if (type === "skills") {
          const projectSlug = text_labelToSlug(project.Title || "");
          onUpdateUrl({ filter: type, containerLabel: label, projectSlug });
        } else {
          // For gears/teams: just container, no project slug
          onUpdateUrl({ filter: type, containerLabel: label });
        }
      }
    }
  }, [openProjectIndex, isOpen, displayProjects, type, label, onUpdateUrl]);

  // If URL has requestedProjectSlug, find and open matching project
  useEffect(() => {
    if (requestedProjectSlug && isOpen && !userClearedRequestedRef.current) {
      const matchingIndex = projects.findIndex(p => text_labelToSlug(p.Title) === requestedProjectSlug);
      if (matchingIndex !== -1 && openProjectIndex !== matchingIndex) {
        setOpenProjectIndex(matchingIndex);
      }
    }
  }, [requestedProjectSlug, isOpen, projects, openProjectIndex]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => timer_clear(transitionTimerRef, queuedProjectRef);
  }, []);

  // Reset manual-clear flag when URL slug changes
  useEffect(() => {
    userClearedRequestedRef.current = false;
  }, [requestedProjectSlug, label]);

  // Scroll gears/teams into view when opened (skills already scroll per project)
  useEffect(() => {
    if (!isOpen) return;
    if (type === "skills") return;
    const node = containerRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetY = rect.top + scrollTop;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  }, [isOpen, type]);

  const handleSkillToggle = () => {
    if (isOpen) {
      userClearedRequestedRef.current = true;
      setTimeout(() => setOpenProjectIndex(null), 50);
    } else if (type === "skills") {
      setOpenProjectIndex(DEFAULT_FIRST_OPEN_INDEX);
    }
    onToggle();
  };

  const handleProjectToggle = (index) => {
    // Same project → close
    if (openProjectIndex === index) {
      userClearedRequestedRef.current = true;
      timer_clear(transitionTimerRef, queuedProjectRef);
      setOpenProjectIndex(null);
      
      // Update URL: remove project slug (only container)
      if (onUpdateUrl) {
        onUpdateUrl({ filter: type, containerLabel: label });
      }
      return;
    }

    // Another project open → close current, queue switch, open after delay
    if (openProjectIndex !== null) {
      setOpenProjectIndex(null);
      timer_clear(transitionTimerRef, queuedProjectRef);
      timer_schedule(index, transitionTimerRef, queuedProjectRef, CLOSE_MS + TRANSITION_GAP_MS);
      
      transitionTimerRef.current = setTimeout(() => {
        setOpenProjectIndex(queuedProjectRef.current);
        timer_clear(transitionTimerRef, queuedProjectRef);
        // URL will be synced by useEffect when openProjectIndex changes
      }, CLOSE_MS + TRANSITION_GAP_MS);
      return;
    }

    // No project open → open directly
    setOpenProjectIndex(index);
    // URL will be synced by useEffect when openProjectIndex changes
  };

  if (displayProjects.length === 0) return null;

  const headerBaseHeight = 66; // 64px base + 2px bottom padding
  const closedHeight = headerBaseHeight + 32 * Math.max(displayProjects.length - 1, 0);

  // ============================================
  // RENDER CONTENT BY TYPE
  // ============================================
  const renderContent = () => {
    if (type === "skills") {
      return displayProjects.map((project, index) => (
        <div key={project.id || index} className={`w-full flex-col ${openProjectIndex === index ? "project-wrapper--open" : ""}`}>
          <CaseTeaser
            project={project}
            index={index}
            isOpen={openProjectIndex === index}
            skillIsOpen={isOpen}
            onToggle={handleProjectToggle}
            type={type}
          />
          {openProjectIndex === index && (
            <Suspense fallback={<div className="case-detail-loading">Loading...</div>}>
              <CaseDetail project={project} />
            </Suspense>
          )}
        </div>
      ));
    }

    if (type === "gears") {
      const primary = displayProjects[0] || {};
      const gearData = primary.__gearData || primary._nc_m2m_sehetz_gears?.[0]?.gear || null;
      return (
        <>
          <GearTeaser gear={gearData} />
          {/* Show all projects for this gear as links */}
          {displayProjects.map((project, index) => {
            const firstSkill = project["_nc_m2m_sehetz_skills"]?.[0]?.skill?.Skill || "";
            const projectSlug = text_labelToSlug(project.Title || "");
            const skillUrl = url_build({ 
              filter: "skills", 
              containerLabel: firstSkill, 
              projectSlug: projectSlug 
            });
            
            const firstTeam = project["_nc_m2m_sehetz_teams"]?.[0]?.team?.Team || "";

            return (
              <a
                key={project.id || index}
                href={skillUrl}
                className={`case-line ${index === 0 ? "border-top-dotted" : "border-top-dotted"}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="flex w-full gap-6 text-2">
                  <div className="flex-1 axis-left case-line__title">→ {project.Title || ""}</div>
                  <div className="flex-1 axis-right case-line__team">{firstTeam}</div>
                </div>
              </a>
            );
          })}
        </>
      );
    }

    if (type === "teams") {
      const primary = displayProjects[0] || {};
      const teamData = primary.__teamData || primary._nc_m2m_sehetz_teams?.[0]?.team || null;
      return (
        <>
          <TeamTeaser team={teamData} />
          {/* Show all projects for this team as links */}
          {displayProjects.map((project, index) => {
            const firstSkill = project["_nc_m2m_sehetz_skills"]?.[0]?.skill?.Skill || "";
            const projectSlug = text_labelToSlug(project.Title || "");
            const skillUrl = url_build({ 
              filter: "skills", 
              containerLabel: firstSkill, 
              projectSlug: projectSlug 
            });

            const firstGear = project["_nc_m2m_sehetz_gears"]?.[0]?.gear?.Gear || "";

            return (
              <a
                key={project.id || index}
                href={skillUrl}
                className={`case-line ${index === 0 ? "border-top-dotted" : "border-top-dotted"}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="flex w-full gap-6 text-2">
                  <div className="flex-1 axis-left case-line__title">→ {project.Title || ""}</div>
                  <div className="flex-1 axis-center case-line__gear">{firstGear}</div>
                  <div className="flex-1 axis-right case-line__team"></div>
                </div>
              </a>
            );
          })}
        </>
      );
    }
  };

  return (
    <section
      ref={containerRef}
      className={`case-container ${isOpen ? "open" : "closed"}`}
      style={{
        borderTop: "3px solid var(--color-fg)",
        borderBottom: isLast ? "3px solid var(--color-fg)" : "none",
        height: isOpen ? "auto" : `${closedHeight}px`,
      }}
    >
      <div
        className={`case-header-wrapper transition-height ${isOpen ? "case-header-wrapper--selected" : ""}`}
        onClick={handleSkillToggle}
        style={{ height: isOpen ? `${headerBaseHeight}px` : `${closedHeight}px` }}
      >
        <CaseHeader type={type} label={label} projects={displayProjects} isOpen={isOpen} />
      </div>

      <div className={`wipe ${isOpen ? "open" : ""}`}>
        <div className="case-container__body">
          {renderContent()}
        </div>
      </div>
    </section>
  );
}
