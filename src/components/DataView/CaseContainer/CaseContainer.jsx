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
import { CLOSE_MS, TRANSITION_GAP_MS, DEFAULT_FIRST_OPEN_INDEX } from "../../../config/uiConstants.js"; // ⭐ globals

/**
 * CaseContainer
 *
 * Responsibilities:
 * - Render header + list of projects (teasers + detail).
 * - Ensure only one project is open at a time.
 * - Orchestrate exact sequence when switching from open project A -> clicked project B:
 *     1) close A immediately (start close animation)
 *     2) after CLOSE_MS + small gap -> open B
 *     3) CaseTeaser will trigger scroll after it sees isOpen === true
 *
 * Notes:
 * - CaseTeaser calls onToggle(index). Parent handles queueing / timers.
 * - Timings are driven from src/config/uiConstants.js
 */

export default function CaseContainer({
  type,
  label,
  projects,
  isLast,
  isOpen,
  onToggle,
}) {
  // index of currently opened project (or null)
  const [openProjectIndex, setOpenProjectIndex] = useState(null);

  // refs used as instance storage for pending index + active timer id
  const queuedProjectRef = useRef(null);       // index queued to open after close
  const transitionTimerRef = useRef(null);     // timer id for scheduled open

  // Auto-open first project when skill group opens
  useEffect(() => {
    if (isOpen) setOpenProjectIndex(DEFAULT_FIRST_OPEN_INDEX);
    else setOpenProjectIndex(null);
  }, [isOpen]);

  // ensure timers cleared on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    };
  }, []);

  // Toggle whole skill group header
  const handleSkillToggle = () => {
    if (isOpen) {
      // close group smoothly
      setTimeout(() => setOpenProjectIndex(null), 50);
      onToggle();
    } else {
      onToggle();
      if (type === "skills") setOpenProjectIndex(DEFAULT_FIRST_OPEN_INDEX);
    }
  };

  /**
   * handleProjectToggle(index)
   *
   * Called by CaseTeaser via onToggle(index).
   *
   * Cases:
   * - clicking currently open project -> close it immediately
   * - clicking another project while one is open -> close current immediately, queue clicked,
   *   then open queued after CLOSE_MS + small gap (exact sequence required by UX)
   * - clicking when no project open -> open directly
   */
  const handleProjectToggle = (index) => {
    // 1) Clicking the currently open project => just close it
    if (openProjectIndex === index) {
      // cancel any pending scheduled open
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
        queuedProjectRef.current = null;
      }
      setOpenProjectIndex(null);
      return;
    }

    // 2) Another project currently open => begin close now, schedule open for queued index
    if (openProjectIndex !== null) {
      // clear any previous scheduled open
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }

      // start closing current project immediately (triggers CSS close animation)
      setOpenProjectIndex(null);

      // queue the requested index and schedule open after CLOSE_MS + small gap
      queuedProjectRef.current = index;
      transitionTimerRef.current = setTimeout(() => {
        // open queued project
        setOpenProjectIndex(queuedProjectRef.current);
        // cleanup refs
        queuedProjectRef.current = null;
        transitionTimerRef.current = null;
      }, CLOSE_MS + TRANSITION_GAP_MS);

      return;
    }

    // 3) No project open -> open clicked one immediately
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
                key={project.id || index}
                className={`w-full flex-col ${
                  openProjectIndex === index ? "project-wrapper--open" : ""
                }`}
              >
                <CaseTeaser
                  project={project}
                  index={index}
                  isOpen={openProjectIndex === index}
                  skillIsOpen={isOpen}
                  onToggle={handleProjectToggle} // parent orchestrates sequence
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
