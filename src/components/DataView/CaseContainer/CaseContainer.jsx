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

export default function CaseContainer({
  type,
  label,
  projects,
  isLast,
  isOpen,
  onToggle,
}) {
  const [openProjectIndex, setOpenProjectIndex] = useState(null);
  const projectRefs = useRef([]); // ⭐ Refs for each project line

  // Auto-open first project when skill opens
  useEffect(() => {
    if (isOpen) setOpenProjectIndex(0);
    else setOpenProjectIndex(null);
  }, [isOpen]);

  // ⭐ Scroll to project line when opened (manual calculation)
  useEffect(() => {
    if (openProjectIndex !== null && projectRefs.current[openProjectIndex]) {
      // Immediate scroll after state change (next tick)
      requestAnimationFrame(() => {
        const element = projectRefs.current[openProjectIndex];
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = rect.top + scrollTop - 24; // 24px offset from top
        
        window.scrollTo({ top: targetY, behavior: "smooth" });
      });
    }
  }, [openProjectIndex]);

  // Height when closed (skills only)
  const closedHeight = 64 + 32 * Math.max(projects.length - 1, 0);

  // Toggle logic
  const handleSkillToggle = () => {
    if (isOpen) {
      // smooth close for skills
      setTimeout(() => setOpenProjectIndex(null), 50);
      onToggle();
    } else {
      onToggle();
      if (type === "skills") setOpenProjectIndex(0);
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
              <div 
                key={index} 
                className={`w-full flex-col ${openProjectIndex === index ? "project-wrapper--open" : ""}`}
                ref={(el) => (projectRefs.current[index] = el)}
              >
                <CaseTeaser
                  project={project}
                  index={index}
                  isOpen={openProjectIndex === index}
                  skillIsOpen={isOpen}
                  onToggle={() =>
                    setOpenProjectIndex(
                      openProjectIndex === index ? null : index
                    )
                  }
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
