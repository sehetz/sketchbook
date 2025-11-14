import { useState } from "react";
import CaseHeader from "../CaseHeader/CaseHeader.jsx";
import Teaser from "../Teaser/Teaser.jsx";
import "./CaseContainer.css";

export default function CaseContainer({ type, label, projects, isLast }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen((prev) => !prev);

  // Dynamische Höhe für geschlossene Box (1 = 64px, +32px je weiteres)
  const closedHeight = 64 + 32 * Math.max(projects.length - 1, 0);

  return (
    <section
      className={`case-container ${isOpen ? "open" : "closed"}`}
      style={{
        height: isOpen ? "auto" : `${closedHeight}px`,
        borderBottom: isLast ? "3px solid var(--color-fg)" : "none",
      }}
    >
      {/* Header — gleiche Höhe wie Container, wenn geschlossen */}
      <div
        className="case-header-wrapper border-top transition-height"
        onClick={toggleOpen}
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

      {/* Linie unter Header */}
      {isOpen && <div className="case-container__divider border-top-dotted" />}
      
      {/* Inhalt nur sichtbar, wenn geöffnet */}
      {isOpen && (
        <div className="case-container__body">
          <Teaser project={projects[0]} type={type} />
        </div>
      )}
    </section>
  );
}
