// src/components/AboutViz/TeamTimelinie/TeamTimeline.jsx

import YearBlock from "../YearBlock.jsx";                 //  ← RICHTIG!
import buildYearsFromTeams from "../buildYearsFromTeams.js";

export default function TeamTimeline({ teams }) {
  const nowYear = new Date().getFullYear();
  const years = buildYearsFromTeams(teams, nowYear);

  return (
    <div className="w-full flex-col">
      {years.map((year) => (
        <YearBlock key={year} year={year} teams={teams} />
      ))}
    </div>
  );
}
