import { useTimeline } from "./TimelineContext.jsx";

// Mobile-only: renders team circles + labels in a fixed row above the timeline.
export default function MobileTeamHeader() {
  const {
    teams,
    cssVars,
    uniqueTeams,
    projectsByTeam,
    teamToX,
    yearFontSize,
    labelFontWeight,
  } = useTimeline();

  return (
    <g className="team-header-mobile">
      {uniqueTeams.map((teamName, teamIdx) => {
        const teamData = teams.filter((t) => t.team === teamName);
        const teamProjects = projectsByTeam[teamName] || [];
        if (teamProjects.length === 0 || !teamData.length) return null;

        const firstBar = teamData[0];
        const hasLink = Boolean(firstBar.link);
        const circleRadius = firstBar.designWork
          ? cssVars.circleRadiusDesign
          : cssVars.circleRadiusNondesign;
        const x = teamToX(teamIdx, teamName);
        const headerY = -32;

        return (
          <g key={`header-${teamIdx}`}>
            {hasLink && (
              <a href={firstBar.link} target="_blank" rel="noopener noreferrer">
                <circle
                  cx={x}
                  cy={headerY}
                  r={circleRadius}
                  fill={cssVars.colorCircle}
                  className="team-circle"
                  style={{ cursor: "pointer" }}
                />
              </a>
            )}
            <text
              x={x}
              y={headerY - circleRadius + 32}
              fontSize={yearFontSize}
              fontFamily={cssVars.fontSans}
              fontWeight={labelFontWeight}
              textAnchor="middle"
              fill={cssVars.colorFg}
              className="team-label"
              style={{ pointerEvents: "none" }}
            >
              {teamName}
            </text>
          </g>
        );
      })}
    </g>
  );
}
