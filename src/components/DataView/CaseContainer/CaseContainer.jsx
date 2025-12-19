// ============================================
// CaseContainer.jsx – Skill / Gear / Team Container
// ============================================

import { useState, useEffect, useRef, lazy, Suspense, useMemo } from "react";
import CaseHeader from "./CaseComponents/CaseHeader.jsx";
import CaseTeaser from "./CaseComponents/CaseTeaser.jsx";
import GearTeaser from "./CaseComponents/GearTeaser.jsx";
import TeamTeaser from "./CaseComponents/TeamTeaser.jsx";
import { text_labelToSlug } from "../../../utils/urlRouting.js";

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

  // Memoize displayProjects BEFORE useEffects that depend on it
  const displayProjects = useMemo(() => {
    return type === "teams"
      ? projects.filter(p => p.__teamData?.Team?.toLowerCase() !== "sehetz")
      : projects;
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
    if (requestedProjectSlug && isOpen) {
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

  const handleSkillToggle = () => {
    if (isOpen) {
      setTimeout(() => setOpenProjectIndex(null), 50);
    } else if (type === "skills") {
      setOpenProjectIndex(DEFAULT_FIRST_OPEN_INDEX);
    }
    onToggle();
  };

  const handleProjectToggle = (index) => {
    // Same project → close
    if (openProjectIndex === index) {
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

  const closedHeight = 64 + 32 * Math.max(displayProjects.length - 1, 0);

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
      return (
        <>
          <GearTeaser gear={displayProjects[0].__gearData} />
          {!isOpen && displayProjects.length > 1 && (
            <div style={{ height: `${(displayProjects.length - 1) * 32}px` }} />
          )}
        </>
      );
    }

    if (type === "teams") {
      return (
        <>
          <TeamTeaser team={displayProjects[0].__teamData} />
          {!isOpen && displayProjects.length > 1 && (
            <div style={{ height: `${(displayProjects.length - 1) * 32}px` }} />
          )}
        </>
      );
    }
  };

  return (
    <section
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
        style={{ height: isOpen ? "64px" : `${closedHeight}px` }}
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
