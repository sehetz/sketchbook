// ============================================
// YearBlock.jsx — shows 1 year + all team-bars that span this year
// ============================================

export default function YearBlock({ year, teams }) {
  // Teams die in diesem Jahr aktiv sind
  const activeTeams = teams.filter((t) => {
    return (
      t.start <= year &&
      (t.end === null || t.end >= year)
    );
  });

  return (
    <div className="w-full flex-col">
      {/* YEAR LABEL */}
      <div className="p-6 axis-left">
        <div className="text-3">{year}</div>
      </div>

      {/* TEAM BARS */}
      <div className="w-full flex-col gap-1 pb-4">
        {activeTeams.map((team, i) => (
          <div
            key={i}
            className="team-bar bg-fg text-bg p-2 rounded-2xl text-4"
          >
            {team.team}
          </div>
        ))}
      </div>

      {/* YEAR DIVIDER */}
      <div className="border-bottom-solid" />
    </div>
  );
}
