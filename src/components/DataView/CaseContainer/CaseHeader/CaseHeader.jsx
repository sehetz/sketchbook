import "./CaseHeader.css";

export default function CaseHeader({ type, label, projects, isOpen }) {
  let alignmentClass = "axis-left";

  if (type === "gears") alignmentClass = "axis-center";
  if (type === "teams") alignmentClass = "axis-right";

  return (
    <div className="case-header flex text-1 p-6">
      <div className={`flex-1 ${alignmentClass}`}>
        {label}
      </div>
    </div>
  );
}

