export default function CaseHeader({ type, label, projects, isOpen }) {
  let alignmentClass = "axis-left";

  if (type === "gears") alignmentClass = "axis-center";
  if (type === "teams") alignmentClass = "axis-right";

  // Skills: border nur wenn offen (case details sichtbar)
  // Gears/Teams: border immer
  const showBorder = type !== "skills" || isOpen;

  return (
    <div className={`case-header flex text-1 p-6 ${showBorder ? "border-bottom-dotted" : ""}`}>
      <div className={`flex-1 ${alignmentClass}`}>
        {label}
      </div>
    </div>
  );
}

