// ============================================
// CaseContainer.jsx – Skill / Gear / Team Container
// ============================================

import { useState, useEffect } from "react";
import CaseHeader from "./CaseHeader/CaseHeader.jsx";
import CaseTeaser from "./CaseTeaser/CaseTeaser.jsx";
import CaseDetail from "./CaseDetail/CaseDetail.jsx";
import GearTeaser from "./GearTeaser/GearTeaser.jsx";
import TeamTeaser from "./TeamTeaser/TeamTeaser.jsx";

export default function CaseContainer({
  type,
  label,
  projects,
  isLast,
  isOpen,
  onToggle,
}) {
  const [openProjectIndex, setOpenProjectIndex] = useState(null);
  const [nextProjectIndex, setNextProjectIndex] = useState(null); // ⭐ Queue next project

  // Auto-open first project when skill opens
  useEffect(() => {
    if (isOpen) setOpenProjectIndex(0);
    else setOpenProjectIndex(null);
  }, [isOpen]);

  // ⭐ FIXED: Sequential close → open flow
  useEffect(() => {
    if (nextProjectIndex !== null && openProjectIndex !== null) {
      // Step 1: Close current project (0.4s transition)
      const closeTimer = setTimeout(() => {
        setOpenProjectIndex(null);
        // ⭐ DON'T clear nextProjectIndex here!
      }, 400); // Match --transition-duration

      return () => clearTimeout(closeTimer);
    }
  }, [nextProjectIndex, openProjectIndex]);

  // ⭐ FIXED: Open next project after previous closed
  useEffect(() => {
    if (nextProjectIndex !== null && openProjectIndex === null) {
      // Step 2: Open new project
      setOpenProjectIndex(nextProjectIndex);
      // ⭐ Clear queue AFTER opening new project
      setNextProjectIndex(null);
    }
  }, [openProjectIndex, nextProjectIndex]);

  // Height when closed (skills only)
  const closedHeight = 64 + 32 * Math.max(projects.length - 1, 0);

  // Toggle logic
  const handleSkillToggle = () => {
    if (isOpen) {
      setTimeout(() => setOpenProjectIndex(null), 50);
      onToggle();
    } else {
      onToggle();
      if (type === "skills") setOpenProjectIndex(0);
    }
  };

  // ⭐ NEW: Handle project selection with queue
  const handleProjectToggle = (index) => {
    if (openProjectIndex === index) {
      // Closing same project
      setOpenProjectIndex(null);
    } else if (openProjectIndex !== null) {
      // Another project is open → queue this one
      setNextProjectIndex(index);
    } else {
      // No project open → open directly
      setOpenProjectIndex(index);
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
      {/* HEADER */}
      <div
        className={`case-header-wrapper transition-height ${
          isOpen ? "case-header-wrapper--selected" : ""
        }`}
        onClick={handleSkillToggle}
        style={{
          height: isOpen ? "64px" : `${closedHeight}px`,
        }}
      >
        <CaseHeader
          type={type}
          label={label}
          projects={projects}
          isOpen={isOpen}
        />
      </div>

      {/* CONTENT BLOCK */}
      <div className={`wipe ${isOpen ? "open" : ""}`}>
        <div className="case-container__body">
          {/* ============================================================
             SKILLS → full logic with multiple projects
             ============================================================ */}
          {type === "skills" &&
            projects.map((project, index) => (
              <div key={index} className={`w-full flex-col ${openProjectIndex === index ? "project-wrapper--open" : ""}`}>
                <CaseTeaser
                  project={project}
                  index={index}
                  isOpen={openProjectIndex === index}
                  skillIsOpen={isOpen}
                  onToggle={() => handleProjectToggle(index)}
                  type={type}
                />

                {openProjectIndex === index && <CaseDetail project={project} />}
              </div>
            ))}

          {/* ============================================================
    GEARS → exactly ONE teaser, but dynamic height
   ============================================================ */}
          {type === "gears" && (
            <>
              <GearTeaser gear={projects[0].__gearData} />

              {/* extra height simulation based on number of projects */}
              {!isOpen && projects.length > 1 && (
                <div
                  style={{
                    height: `${(projects.length - 1) * 32}px`,
                  }}
                />
              )}
            </>
          )}

          {/* ============================================================
    TEAMS → exactly ONE teaser, but dynamic height
   ============================================================ */}
          {type === "teams" && (
            <>
              <TeamTeaser team={projects[0].__teamData} />

              {/* extra height simulation based on number of projects */}
              {!isOpen && projects.length > 1 && (
                <div
                  style={{
                    height: `${(projects.length - 1) * 32}px`,
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
