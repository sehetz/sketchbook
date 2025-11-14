// ============================================
// CaseContainer.jsx
// --------------------------------------------
// Presentation component for a single group of
// projects within the Sketchbook layout.
//
// Linked files / components:
// - CaseHeader.jsx → renders the group header
// - Teaser.jsx     → renders the feature teaser
//
// Responsibilities (allowed):
// - Maintain open/closed UI state for this section
// - Compute dynamic height when closed (required by design rules)
// - Render header + teaser in correct layout
//
// Forbidden tasks (and intentionally NOT present):
// - No API calls
// - No filtering or grouping
// - No data mutation
// - No typography or arbitrary layout styles
// ============================================

import CaseHeader from "./CaseHeader/CaseHeader.jsx";
import Teaser from "./CaseTeaser/CaseTeaser.jsx";
import "./CaseContainer.css";

export default function CaseContainer({
  type,
  label,
  projects,
  isLast,
  isOpen,
  onToggle
}) {
  const closedHeight = 64 + 32 * Math.max(projects.length - 1, 0);

  return (
    <section
      className={`case-container ${isOpen ? "open" : "closed"}`}
      style={{
        height: isOpen ? "auto" : `${closedHeight}px`,
        borderBottom: isLast ? "3px solid var(--color-fg)" : "none",
      }}
    >
      <div
        className="case-header-wrapper border-top transition-height"
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

      {isOpen && <div className="case-container__divider border-top-dotted" />}

      {isOpen && (
        <div className="case-container__body">
          <Teaser project={projects[0]} type={type} />
        </div>
      )}
    </section>
  );
}
