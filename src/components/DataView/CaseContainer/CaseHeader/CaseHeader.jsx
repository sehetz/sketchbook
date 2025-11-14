import "./CaseHeader.css";

export default function CaseHeader({ type, label, isOpen }) {
  return (
    <div className="case-header flex text-1 p-6">
      {/* nur der Name */}
      <div className="flex-1 axis-left">{label}</div>

      {/* Skills behalten Gear + Team Spalten */}
      {type === "skills" && isOpen && (
        <>
          <div className="flex-1 axis-center"></div>
          <div className="flex-1 axis-right"></div>
        </>
      )}
    </div>
  );
}

