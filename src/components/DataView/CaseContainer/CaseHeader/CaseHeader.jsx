import "./CaseHeader.css";

export default function CaseHeader({ type, label, projects, isOpen }) {
  const first = projects[0];

  const gear =
    first?.nc_3zu8___nc_m2m_nc_3zu8__Projec_Gears?.[0]?.Gear?.Gear;

  const team =
    first?.nc_3zu8___nc_m2m_nc_3zu8__Projec_Teams?.[0]?.Teams?.Team;

  return (
    <div className="case-header flex text-1 p-6">
      {/* ALWAYS VISIBLE — Skill / Label */}
      <div className="case-header flex-1 axis-left">{label}</div>

      {/* ONLY WHEN OPEN — Gear & Team */}
      {isOpen && (
        <>
          <div className="case-header flex-1 axis-center">{gear}</div>
          <div className="case-header flex-1 axis-right">{team}</div>
        </>
      )}
    </div>
  );
}
