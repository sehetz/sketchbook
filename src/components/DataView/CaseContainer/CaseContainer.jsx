// ============================================
// CaseContainer.jsx – Skill / Gear / Team Container
// ============================================

import { useState, useEffect, useRef } from "react";
import CaseHeader from "./CaseHeader/CaseHeader.jsx";
import CaseTeaser from "./CaseTeaser/CaseTeaser.jsx";
import CaseDetail from "./CaseDetail/CaseDetail.jsx";
import GearTeaser from "./GearTeaser/GearTeaser.jsx";
import TeamTeaser from "./TeamTeaser/TeamTeaser.jsx";
import "./CaseContainer.css";
import { CLOSE_MS, TRANSITION_GAP_MS, DEFAULT_FIRST_OPEN_INDEX, clearTimer, scheduleProjectOpen } from "../../../utils/helpers.js";

export default function CaseContainer({
  type,
  label,
  projects,
  isLast,
  isOpen,
  onToggle,
}) {
  const [openProjectIndex, setOpenProjectIndex] = useState(null);
  const queuedProjectRef = useRef(null);
  const transitionTimerRef = useRef(null);

  // Auto-open first project when group opens
  useEffect(() => {
    setOpenProjectIndex(isOpen ? DEFAULT_FIRST_OPEN_INDEX : null);
  }, [isOpen]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => clearTimer(transitionTimerRef, queuedProjectRef);
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
      clearTimer(transitionTimerRef, queuedProjectRef);
      setOpenProjectIndex(null);
      return;
    }

    // Another project open → close current, queue switch, open after delay
    if (openProjectIndex !== null) {
      setOpenProjectIndex(null);
      clearTimer(transitionTimerRef, queuedProjectRef);
      scheduleProjectOpen(index, transitionTimerRef, queuedProjectRef, CLOSE_MS + TRANSITION_GAP_MS);
      
      transitionTimerRef.current = setTimeout(() => {
        setOpenProjectIndex(queuedProjectRef.current);
        clearTimer(transitionTimerRef, queuedProjectRef);
      }, CLOSE_MS + TRANSITION_GAP_MS);
      return;
    }

    // No project open → open directly
    setOpenProjectIndex(index);
  };

  const displayProjects = type === "teams"
    ? projects.filter(p => p.__teamData?.Team?.toLowerCase() !== "sehetz")
    : projects;

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
          {openProjectIndex === index && <CaseDetail project={project} />}
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
