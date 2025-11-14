// ============================================
// CaseContainer.jsx – Skill-Level Container
// --------------------------------------------
// Handles:
// - Opening/closing the entire skill group
// - Listing all projects inside the skill
// - Ensuring only one project is open at a time
// - Auto-opening the first project when the
//   skill expands
//
// Layout rules:
// - One solid top border per skill block
// - Solid bottom border ONLY on the last block
// - No borders inside project teasers
// ============================================

import { useState, useEffect } from "react";
import CaseHeader from "./CaseHeader/CaseHeader.jsx";
import CaseTeaser from "./CaseTeaser/CaseTeaser.jsx";
import "./CaseContainer.css";

export default function CaseContainer({
  type,
  label,
  projects,
  isLast,
  isOpen,
  onToggle,
}) {
  // --------------------------------------------
  // PROJECT-LEVEL OPEN STATE
  // Only one project open per skill group
  // --------------------------------------------
  const [openProjectIndex, setOpenProjectIndex] = useState(null);

  // Auto-open first project when skill opens
  useEffect(() => {
    if (isOpen) setOpenProjectIndex(0);
    else setOpenProjectIndex(null);
  }, [isOpen]);

  // --------------------------------------------
  // DYNAMIC CLOSED HEIGHT
  // Exactly like original design:
  // 64px + 32px for each additional project
  // --------------------------------------------
  const closedHeight = 64 + 32 * Math.max(projects.length - 1, 0);

  

  return (
    <section
      className={`case-container ${isOpen ? "open" : "closed"}`}
      style={{
        // Figma: always a top border per skill section
        borderTop: "3px solid var(--color-fg)",

        // Only last skill block gets a bottom border
        borderBottom: isLast ? "3px solid var(--color-fg)" : "none",

        // Sketchbook rule: dynamic height OK
        height: isOpen ? "auto" : `${closedHeight}px`,
      }}
    >
      {/* ----------------------------------------
          SKILL HEADER
          (Motion, 3D, Photography…)
         ---------------------------------------- */}
      <div
        className="case-header-wrapper transition-height"
        onClick={onToggle}
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

      {/* ----------------------------------------
          PROJECT LIST (visible only when open)
         ---------------------------------------- */}
      {isOpen && (
        <div className="case-container__body">
          {projects.map((project, index) => (
            <CaseTeaser
              key={index}
              project={project}
              index={index}
              isOpen={openProjectIndex === index}
              onToggle={() =>
                setOpenProjectIndex(
                  openProjectIndex === index ? null : index
                )
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
