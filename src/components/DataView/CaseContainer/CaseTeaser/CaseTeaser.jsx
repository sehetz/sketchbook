// ============================================
// CaseTeaser.jsx – Project-Level Collapsible
// ============================================

import "./CaseTeaser.css";

export default function CaseTeaser({ project, index, isOpen, onToggle }) {
  return (
    <div className="case-teaser">
      {/* TITELZEILE */}
      <div className={`case-line ${isOpen ? "case-line--open" : ""}`} onClick={onToggle}>
        <div className="text-1">{project.Title}</div>
      </div>

      {/* INHALT */}
      {isOpen && (
        <div className="case-teaser__body teaser">
          <div className="teaser__text text-2">
            {project["description"]}
          </div>

          {project.teaserImage ? (
            <img
              src={project.teaserImage}
              alt={project.Title}
              className="teaser__image"
            />
          ) : (
            <div className="teaser__image placeholder" />
          )}
        </div>
      )}
    </div>
  );
}
