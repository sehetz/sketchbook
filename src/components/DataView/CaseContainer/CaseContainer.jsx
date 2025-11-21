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
  const pendingRef = useRef(null); // pending index during transition
  const openTimerRef = useRef(null);

  // Auto-open first project when skill opens
  useEffect(() => {
    if (isOpen) setOpenProjectIndex(0);
    else setOpenProjectIndex(null);
  }, [isOpen]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
    };
  }, []);

  const CLOSE_MS = 400; // must match CSS transition duration
  const GAP_MS = 20; // tiny gap to ensure close finished

  // Toggle logic for the whole skill group
  const handleSkillToggle = () => {
    if (isOpen) {
      setTimeout(() => setOpenProjectIndex(null), 50);
      onToggle();
    } else {
      onToggle();
      if (type === "skills") setOpenProjectIndex(0);
    }
  };

  // NEW: orchestrated toggle -> close current immediately, then open pending after CLOSE_MS
  const handleProjectToggle = (index) => {
    // clicking same open project -> close it
    if (openProjectIndex === index) {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
        pendingRef.current = null;
      }
      setOpenProjectIndex(null);
      return;
    }

    // if some other project is open -> close it now, queue the clicked one
    if (openProjectIndex !== null) {
      // ensure any previous timer cleared
      if (openTimerRef.current) clearTimeout(openTimerRef.current);

      // start close immediately
      setOpenProjectIndex(null);

      // queue and schedule open after CLOSE_MS + small gap
      pendingRef.current = index;
      openTimerRef.current = setTimeout(() => {
        setOpenProjectIndex(pendingRef.current);
        pendingRef.current = null;
        openTimerRef.current = null;
      }, CLOSE_MS + GAP_MS);

      return;
    }

    // no project open -> open directly
    setOpenProjectIndex(index);
  };

  // Height when closed (skills only)
  const closedHeight = 64 + 32 * Math.max(projects.length - 1, 0);

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
          {type === "skills" &&
            projects.map((project, index) => (
              <div
                key={index}
                className={`w-full flex-col ${openProjectIndex === index ? "project-wrapper--open" : ""}`}
              >
                <CaseTeaser
                  project={project}
                  index={index}
                  isOpen={openProjectIndex === index}
                  skillIsOpen={isOpen}
                  onToggle={handleProjectToggle} // parent handles queuing
                  type={type}
                />

                {openProjectIndex === index && <CaseDetail project={project} />}
              </div>
            ))}

          {type === "gears" && (
            <>
              <GearTeaser gear={projects[0].__gearData} />
              {!isOpen && projects.length > 1 && (
                <div style={{ height: `${(projects.length - 1) * 32}px` }} />
              )}
            </>
          )}

          {type === "teams" && (
            <>
              <TeamTeaser team={projects[0].__teamData} />
              {!isOpen && projects.length > 1 && (
                <div style={{ height: `${(projects.length - 1) * 32}px` }} />
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
