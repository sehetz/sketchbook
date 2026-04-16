import { useTimeline } from "./TimelineContext.jsx";
import ProjectDot from "./ProjectDot.jsx";

// Renders one team's bars, project dots, and (on desktop) label + circle link.
// Pass hideLabel={true} on mobile – circles/labels are handled by MobileTeamHeader.
export default function TeamGroup({ teamName, teamIdx, hideLabel = false }) {
  const {
    teams,
    cssVars,
    isMobile,
    maxYear,
    yearToY,
    teamToX,
    labelLineHeight,
    labelFontSize,
    labelFontWeight,
    projectsByTeam,
    projectStackY,
    hoveredProjectId,
  } = useTimeline();

  const teamData = teams.filter((t) => t.team === teamName);
  if (!teamData.length) return null;

  const teamProjects = projectsByTeam[teamName] || [];
  // On mobile, skip teams that have no projects
  if (isMobile && teamProjects.length === 0) return null;

  const x = teamToX(teamIdx, teamName);
  const firstBar = teamData[0];
  const circleRadius = firstBar.designWork
    ? cssVars.circleRadiusDesign
    : cssVars.circleRadiusNondesign;

  // Group projects by year
  const projectsByYear = {};
  teamProjects.forEach((p) => {
    if (!projectsByYear[p.year]) projectsByYear[p.year] = [];
    projectsByYear[p.year].push(p);
  });

  // Render dots for a year, keeping the hovered one on top
  function renderProjectsForYear(projs, dotY) {
    const secondary = projs.slice(1);
    const primary = projs[0];
    const dots = [];
    let hoveredDot = null;

    secondary.forEach((p, sIdx) => {
      const posY = dotY + (sIdx + 1) * projectStackY;
      const posX = teamToX(teamIdx, teamName);
      const projectId = `${teamIdx}-${posX}-${posY}-${p.title}`;
      const dot = (
        <ProjectDot
          key={`sec-${sIdx}`}
          x={posX}
          y={posY}
          title={p.title}
          teamIdx={teamIdx}
          slug={p.slug}
          skillSlug={p.skillSlug}
        />
      );
      if (hoveredProjectId === projectId) hoveredDot = dot;
      else dots.push(dot);
    });

    if (primary) {
      const posX = teamToX(teamIdx, teamName);
      const projectId = `${teamIdx}-${posX}-${dotY}-${primary.title}`;
      const dot = (
        <ProjectDot
          key="prim"
          x={posX}
          y={dotY}
          title={primary.title}
          teamIdx={teamIdx}
          slug={primary.slug}
          skillSlug={primary.skillSlug}
        />
      );
      if (hoveredProjectId === projectId) hoveredDot = dot;
      else dots.push(dot);
    }

    return [...dots, hoveredDot].filter(Boolean);
  }

  // Label positioning (desktop only)
  let labelY, circleY, hasLink;
  if (!hideLabel) {
    const firstBarStartY = yearToY(firstBar.start);
    const firstBarEndY = yearToY(firstBar.end || maxYear);
    const barTopY = Math.min(firstBarStartY, firstBarEndY);
    labelY = barTopY - cssVars.barOvershoot - cssVars.labelOffsetAboveBar;
    circleY = labelY + cssVars.circleOffset;
    hasLink = Boolean(firstBar.link);
  }

  return (
    <g className="team-group">
      {!hideLabel && hasLink && (
        <a href={firstBar.link} target="_blank" rel="noopener noreferrer">
          <circle
            cx={x}
            cy={circleY}
            r={circleRadius}
            fill={cssVars.colorCircle}
            className="team-circle"
            style={{ cursor: "pointer" }}
          />
        </a>
      )}

      {/* Bars */}
      {teamData.map((t, i) => {
        const startY = yearToY(t.start);
        const endY = yearToY(t.end || maxYear);
        const barHeight = Math.abs(endY - startY);
        const barWidth = t.designWork ? cssVars.barWidthDesign : cssVars.barWidthNondesign;
        const barRadius = t.designWork ? cssVars.barRadiusDesign : cssVars.barRadiusNondesign;
        return (
          <rect
            key={`bar-${teamIdx}-${i}`}
            x={x - barWidth / 2}
            y={Math.min(startY, endY) - cssVars.barOvershoot}
            width={barWidth}
            height={barHeight + cssVars.barOvershoot * 2}
            fill={`url(#gradient-${teamIdx})`}
            rx={barRadius}
          />
        );
      })}

      {/* Project dots */}
      {Object.entries(projectsByYear).map(([year, projs]) => {
        const dotY = yearToY(parseInt(year, 10));
        return (
          <g key={`dots-${teamIdx}-${year}`}>
            {renderProjectsForYear(projs, dotY)}
          </g>
        );
      })}

      {/* Team label (desktop only) */}
      {!hideLabel && (
        <text
          x={x}
          y={labelY}
          fontSize={labelFontSize}
          fontFamily={cssVars.fontSans}
          fontWeight={labelFontWeight}
          textAnchor="middle"
          fill={cssVars.colorFg}
          className="team-label"
          style={{ pointerEvents: "none" }}
        >
          {teamName.split(" ").map((w, idx) => (
            <tspan key={idx} x={x} dy={idx === 0 ? 0 : labelLineHeight}>
              {w}
            </tspan>
          ))}
          {firstBar.role &&
            firstBar.role.split(" ").map((rw, rIdx) => (
              <tspan
                key={`role-${rIdx}`}
                x={x}
                dy={labelLineHeight}
                fontSize={labelFontSize}
                fontWeight="400"
              >
                {rw}
              </tspan>
            ))}
        </text>
      )}
    </g>
  );
}
