// src/components/ProjectContainer/ProjectContainer.jsx
import "./ProjectContainer.css";

export default function ProjectContainer({ skill, projects, isLast }) {
  const height = 64 + 32 * Math.max(projects.length - 1, 0);

  const borderStyle = {
    borderTop: "3px solid var(--color-fg)",
    borderBottom: isLast ? "3px solid var(--color-fg)" : "none",
  };

  return (
    <div
      className="project-container"
      style={{ height: `${height}px`, ...borderStyle }}
    >
      <div className="project-container__content text-1">{skill}</div>
    </div>
  );
}
