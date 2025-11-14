// ============================================
// CaseContainer.jsx – Skill-Level Container
// ============================================

import { useState, useEffect } from "react";
import CaseHeader from "./CaseHeader/CaseHeader.jsx";
import CaseTeaser from "./CaseTeaser/CaseTeaser.jsx";
import CaseDetail from "./CaseDetail/CaseDetail.jsx";
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

  // Auto-open first project when skill opens
  useEffect(() => {
    if (isOpen) setOpenProjectIndex(0);
    else setOpenProjectIndex(null);
  }, [isOpen]);

  const closedHeight = 64 + 32 * Math.max(projects.length - 1, 0);

  // ============================================
  //  NEW: Smart Skill Toggle with smooth close
  // ============================================
  const handleSkillToggle = () => {
    if (isOpen) {
      // ⭐ Start closing animation FIRST
      setTimeout(() => {
        setOpenProjectIndex(null);
      }, 50);

      onToggle(); // Close skill
    } else {
      onToggle(); // Open skill
      setOpenProjectIndex(0); // Auto-open first project
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
        className="case-header-wrapper transition-height"
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

      {/* CONTENT BLOCK W/ WIPE */}
      <div className={`wipe ${isOpen ? "open" : ""}`}>
        <div className="case-container__body">
          {projects.map((project, index) => (
            <div key={index} className="w-full flex-col">
              {/* TEASER */}
              <CaseTeaser
                project={project}
                index={index}
                isOpen={openProjectIndex === index}
                skillIsOpen={isOpen} // ⭐ NEU
                onToggle={() =>
                  setOpenProjectIndex(openProjectIndex === index ? null : index)
                }
              />

              {/* DETAIL */}
              {openProjectIndex === index && <CaseDetail project={project} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
