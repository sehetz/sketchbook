import "./ProjectContainer.css";

export default function ProjectContainer({ projects, isLast }) {
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
      <div className="project-container__content text-1">
        {projects[0]?.Title}
      </div>
    </div>
  );
}
