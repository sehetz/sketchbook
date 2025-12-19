import { useEffect, useState, useMemo } from "react";
import { timeline_fetch } from "../../utils/timelineHelpers.js";

// ============================================
// TimelineViz.jsx – SVG-based Team Timeline
// ============================================

// Timeline layout & design constants (easily tweakable)
const TIMELINE_CONFIG = {
  // Layout & Spacing
  padding: { top: 80, right: 96, bottom: 40, left: 24 },
  teams: { startX: 96, endXOffset: 96, minGap: 12 },
  svgWidth: 1000,

  // Year Axis
  year: {
    spacing: 120,
    labelOffsetAbove: 24,
    fontSize: 24,
    letterSpacing: 0.12,
  },

  // Year Lines (dotted)
  lines: {
    strokeWidth: 3,
    dashArray: "0.1 8",
  },

  // Timeline Bars
  bars: {
    overshoot: 12,
    widthDesign: 32,
    widthNondesign: 12,
    radiusDesign: 18,
    radiusNondesign: 8,
  },

  // Team Labels
  labels: {
    offsetAboveBar: 32,
    fontSize: 12,
    lineHeight: 14,
  },

  // Link Circles
  circles: {
    offsetDesign: 32,
    offsetNondesign: 32,
    radiusDesign: 28,
    radiusNondesign: 12,
  },

  // Project Dots & Tooltips
  projects: {
    dotRadius: 4,
    tooltipOffsetX: 24,
    tooltipStackY: 24,
    tooltipFontSize: 12,
    tooltipBgPadding: 4,
    tooltipHeight: 16,
  },

  // Responsive mobile overrides
  mobile: {
    yearSpacing: 90,
    projectStackY: 16,
    projectDotRadius: 4,
    dashArray: "0.1 4",
    tooltipOffsetX: 12,
  },
};

export default function TimelineViz() {
  const [teams, setTeams] = useState([]);
  const [minYear, setMinYear] = useState(null);
  const [maxYear, setMaxYear] = useState(new Date().getFullYear());
  const [projects, setProjects] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Fetch data from NocoDB
  useEffect(() => {
    timeline_fetch(setTeams, setMinYear, setProjects);
  }, []);

  // Responsive mobile detection
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Derived dimensions
  const yearRange = maxYear - minYear;
  const { padding, teams: teamsCfg, svgWidth } = TIMELINE_CONFIG;
  const width = svgWidth;
  const height = padding.top + padding.bottom + (yearRange * TIMELINE_CONFIG.year.spacing);
  const teamsStartX = teamsCfg.startX;
  const teamsEndX = width - teamsCfg.endXOffset;
  const plotWidth = teamsEndX - teamsStartX;
  const yearToY = (year) => padding.top + ((maxYear - year) * TIMELINE_CONFIG.year.spacing);

  // Memoized computed data
  const uniqueTeams = useMemo(() => [...new Set(teams.map((t) => t.team))], [teams]);
  const teamSpacing = Math.max(teamsCfg.minGap, (plotWidth || 1) / Math.max(1, uniqueTeams.length));
  const teamToX = (teamIndex) => teamsStartX + teamIndex * teamSpacing + teamSpacing / 2;

  const projectsByTeam = useMemo(() => {
    const map = {};
    projects.forEach((p) => {
      if (!map[p.team]) map[p.team] = [];
      map[p.team].push(p);
    });
    return map;
  }, [projects]);

  // Responsive config values
  const yearSpacingD = isMobile ? TIMELINE_CONFIG.mobile.yearSpacing : TIMELINE_CONFIG.year.spacing;
  const projectStackYD = isMobile ? TIMELINE_CONFIG.mobile.projectStackY : TIMELINE_CONFIG.projects.tooltipStackY;
  const projectDotRadiusD = isMobile ? TIMELINE_CONFIG.mobile.projectDotRadius : TIMELINE_CONFIG.projects.dotRadius;
  const lineDashArrayD = isMobile ? TIMELINE_CONFIG.mobile.dashArray : TIMELINE_CONFIG.lines.dashArray;
  const tooltipOffsetXD = isMobile ? TIMELINE_CONFIG.mobile.tooltipOffsetX : TIMELINE_CONFIG.projects.tooltipOffsetX;

  if (teams.length === 0) return null;

  // ---------- Inner SVG components ----------

  function ProjectTooltip({ x, y, title }) {
    const tooltipWidth = Math.max(80, Math.min(220, title.length * 7 + TIMELINE_CONFIG.projects.tooltipBgPadding * 2));
    return (
      <rect
        className="project-tooltip-bg"
        x={x}
        y={y - TIMELINE_CONFIG.projects.tooltipHeight / 2}
        width={tooltipWidth}
        height={TIMELINE_CONFIG.projects.tooltipHeight}
        opacity="0"
      />
    );
  }

  function ProjectDot({ x, y, title }) {
    const tx = x + tooltipOffsetXD - TIMELINE_CONFIG.projects.tooltipBgPadding;
    return (
      <g className="project-dot-group">
        <circle
          cx={x}
          cy={y}
          r={Math.max(projectDotRadiusD, 14)}
          fill="transparent"
          className="project-dot-hit"
        />
        <circle cx={x} cy={y} r={projectDotRadiusD} fill="#121212" className="project-dot" />
        <ProjectTooltip x={tx} y={y} title={title} />
        <text
          x={tx + TIMELINE_CONFIG.projects.tooltipBgPadding}
          y={y + 1}
          fontSize={TIMELINE_CONFIG.projects.tooltipFontSize}
          fontFamily="SF Pro Rounded"
          fontWeight="700"
          textAnchor="start"
          fill="#121212"
          className="project-title"
          style={{ pointerEvents: "none" }}
        >
          {title}
        </text>
      </g>
    );
  }

  function TeamGroup({ teamName, teamIdx }) {
    const x = teamToX(teamIdx);
    const teamData = teams.filter((t) => t.team === teamName);
    if (!teamData.length) return null;

    const firstBar = teamData[0];
    const firstBarStartY = yearToY(firstBar.start);
    const firstBarEndY = yearToY(firstBar.end || maxYear);
    const barTopY = Math.min(firstBarStartY, firstBarEndY);
    const labelY = barTopY - TIMELINE_CONFIG.bars.overshoot - TIMELINE_CONFIG.labels.offsetAboveBar;
    const circleOffset = firstBar.designWork ? TIMELINE_CONFIG.circles.offsetDesign : TIMELINE_CONFIG.circles.offsetNondesign;
    const circleY = labelY + circleOffset;
    const hasLink = Boolean(firstBar.link);
    const circleRadius = firstBar.designWork ? TIMELINE_CONFIG.circles.radiusDesign : TIMELINE_CONFIG.circles.radiusNondesign;

    const teamProjects = projectsByTeam[teamName] || [];
    const projectsByYear = {};
    teamProjects.forEach((p) => {
      if (!projectsByYear[p.year]) projectsByYear[p.year] = [];
      projectsByYear[p.year].push(p);
    });

    return (
      <g className="team-group" key={`team-${teamIdx}`}>
        {hasLink && (
          <a href={firstBar.link} target="_blank" rel="noopener noreferrer">
            <circle
              cx={x}
              cy={circleY}
              r={circleRadius}
              fill="#EFEFEF"
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
          const barWidth = t.designWork ? TIMELINE_CONFIG.bars.widthDesign : TIMELINE_CONFIG.bars.widthNondesign;
          const barRadius = t.designWork ? TIMELINE_CONFIG.bars.radiusDesign : TIMELINE_CONFIG.bars.radiusNondesign;
          return (
            <rect
              key={`bar-${teamIdx}-${i}`}
              x={x - barWidth / 2}
              y={Math.min(startY, endY) - TIMELINE_CONFIG.bars.overshoot}
              width={barWidth}
              height={barHeight + TIMELINE_CONFIG.bars.overshoot * 2}
              fill={`url(#gradient-${teamIdx})`}
              rx={barRadius}
            />
          );
        })}

        {/* Projects: secondary first, primary last */}
        {Object.entries(projectsByYear).map(([year, projs]) => {
          const dotY = yearToY(parseInt(year, 10));
          const secondary = projs.slice(1);
          const primary = projs[0];
          return (
            <g key={`dots-${teamIdx}-${year}`}>
              {secondary.map((p, sIdx) => {
                const posY = dotY + (sIdx + 1) * projectStackYD;
                return <ProjectDot key={`sec-${sIdx}`} x={x} y={posY} title={p.title} />;
              })}
              {primary && <ProjectDot key={`prim`} x={x} y={dotY} title={primary.title} />}
            </g>
          );
        })}

        {/* Team Label (shown on hover via CSS) */}
        <text
          x={x}
          y={labelY}
          fontSize={TIMELINE_CONFIG.labels.fontSize}
          fontFamily="SF Pro Rounded"
          fontWeight="700"
          textAnchor="middle"
          fill="#121212"
          className="team-label"
          style={{ pointerEvents: "none" }}
        >
          {teamName.split(" ").map((w, idx) => (
            <tspan key={idx} x={x} dy={idx === 0 ? 0 : TIMELINE_CONFIG.labels.lineHeight}>
              {w}
            </tspan>
          ))}
          {firstBar.role &&
            firstBar.role.split(" ").map((rw, rIdx) => (
              <tspan
                key={`role-${rIdx}`}
                x={x}
                dy={TIMELINE_CONFIG.labels.lineHeight}
                fontSize={TIMELINE_CONFIG.labels.fontSize}
                fontWeight="400"
              >
                {rw}
              </tspan>
            ))}
        </text>
      </g>
    );
  }

  // ---------- Render ----------
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ maxWidth: "100%", height: "auto" }}
    >
      <defs>
        {teams.map((team, idx) => (
          <linearGradient key={`grad-${idx}`} id={`gradient-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DBDBDB" />
            <stop offset="100%" stopColor="#F6F6F6" />
          </linearGradient>
        ))}
      </defs>

      {/* Year lines (dotted grid) */}
      {Array.from({ length: yearRange + 1 }, (_, i) => {
        const year = maxYear - i;
        const y = yearToY(year);
        return (
          <line
            key={`grid-${year}`}
            x1={0}
            y1={y}
            x2={width}
            y2={y}
            stroke="#121212"
            strokeWidth={TIMELINE_CONFIG.lines.strokeWidth}
            strokeDasharray={lineDashArrayD}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}

      {/* Team groups (bars + dots + labels) */}
      {uniqueTeams.map((teamName, idx) => (
        <TeamGroup key={teamName} teamName={teamName} teamIdx={idx} />
      ))}

      {/* Year labels */}
      {Array.from({ length: yearRange + 1 }, (_, i) => {
        const year = maxYear - i;
        const y = yearToY(year);
        return (
          <text
            key={`year-${year}`}
            x={padding.left}
            y={y - TIMELINE_CONFIG.year.labelOffsetAbove}
            fontSize={TIMELINE_CONFIG.year.fontSize}
            fontFamily="SF Pro Rounded"
            letterSpacing={`${TIMELINE_CONFIG.year.letterSpacing}px`}
            textAnchor="start"
            fill="#121212"
          >
            {year}
          </text>
        );
      })}
    </svg>
  );
}
