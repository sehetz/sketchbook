import TimelineViz from "../TimelineViz/TimelineViz.jsx";

export default function TeamTimeline({ teams, minYear, maxYear }) {
  if (!teams || teams.length === 0) return null;

  return (
    <div className="w-full">
      <TimelineViz teams={teams} minYear={minYear} maxYear={maxYear} />
    </div>
  );
}
