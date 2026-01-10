export default function CaseHeader({ type, label, projects, isOpen }) {
  let alignmentClass = "axis-left";

  if (type === "gears") alignmentClass = "axis-center";
  if (type === "teams") alignmentClass = "axis-right";

  // Würfel-Unicode basierend auf Projektanzahl (1-6)
  const getDice = (count) => {
    const dice = ["1", "2", "3", "4", "5", "6"];
    return dice[Math.min(count - 1, 5)] || "6"; // Max 6 (⚅)
  };

  return (
    <div className="case-header flex text-1 p-6">
      <div className={`flex-1 ${alignmentClass}`} style={{ display: 'flex', alignItems: 'center' }}>
        {type === "skills" && projects?.length > 0 && (
          <span className="text-1 dice hover-only">{getDice(projects.length)}{"\u00A0"}</span>
        )}
        {label}
        {type === "skills" && projects?.length > 0 && (
          <span className="text-1 project-s hover-only">{"\u00A0"}{projects.length === 1 ? "project" : "projects"}</span>
        )}
      </div>
    </div>
  );
}
