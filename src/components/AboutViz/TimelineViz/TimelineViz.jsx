import { useEffect, useState } from "react";

// ============================================
// TimelineViz.jsx – SVG-based Team Timeline
// ============================================

export default function TimelineViz() {
  const [teams, setTeams] = useState([]);
  const [minYear, setMinYear] = useState(null);
  const [maxYear, setMaxYear] = useState(new Date().getFullYear());
  const [projects, setProjects] = useState([]);

  const API_TOKEN = import.meta.env.VITE_API_TOKEN;
  const NOCO_BASE = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";
  const TEAMS_API_URL = `${NOCO_BASE}/api/v2/tables/m9i2b930g5qelnr/records`;
  const PROJECTS_API_URL = `${NOCO_BASE}/api/v2/tables/ma2nz1h01whlpni/records`;

  useEffect(() => {
    async function load() {
      try {
        const parseYear = (val) => {
          if (val == null) return null;
          if (typeof val === "number" && Number.isFinite(val)) return Math.floor(val);
          if (typeof val === "string") {
            const m = val.match(/(\d{4})/);
            if (m) return parseInt(m[1], 10);
          }
          return null;
        };

        // Fetch teams
        const res = await fetch(TEAMS_API_URL, {
          headers: { "xc-token": API_TOKEN },
        });
        if (!res.ok) return;

        const json = await res.json();
        const rows = json.list || [];

        const extracted = rows.map((row) => ({
          team: row.Team || "Unknown",
          start: parseYear(row["start-date"]),
          end: parseYear(row["end-date"]),
          designWork: row["design-work"] === 1 || row["design-work"] === true,
          link: row.link || null,
          role: row.role || null, // ⭐ NEW: role field
        }));

        const valid = extracted
          .filter((t) => Number.isInteger(t.start))
          .sort((a, b) => {
            if (a.end === null && b.end === null) return b.start - a.start;
            if (a.end === null) return -1;
            if (b.end === null) return 1;
            return b.end - a.end;
          });

        setTeams(valid);

        const startYears = valid.map((t) => t.start).filter(Boolean);
        const calculatedMinYear = startYears.length ? Math.min(...startYears) : new Date().getFullYear();
        setMinYear(calculatedMinYear);

        // Fetch projects
        const projectsRes = await fetch(PROJECTS_API_URL, {
          headers: { "xc-token": API_TOKEN },
        });

        if (projectsRes.ok) {
          const projectsJson = await projectsRes.json();
          const projectRows = projectsJson.list || [];
          
          const projectsExtracted = [];
          projectRows.forEach((proj) => {
            const year = parseYear(proj.Datum);
            if (!year) return;
            
            const relTeams = proj["nc_3zu8___nc_m2m_nc_3zu8__Projec_Teams"] || [];
            relTeams.forEach((rel) => {
              const teamObj = rel.Teams;
              if (!teamObj) return;
              projectsExtracted.push({
                team: teamObj.Team,
                year,
                title: proj.Title || "Untitled",
              });
            });
          });
          
          setProjects(projectsExtracted);
        }
      } catch (err) {
        console.error("Timeline fetch error:", err);
      }
    }

    load();
  }, [TEAMS_API_URL, PROJECTS_API_URL, API_TOKEN]);

  if (teams.length === 0) return null;

  // ⭐ TWEAKABLE CONSTANTS
  // Layout & Spacing
  const PADDING_TOP = 80;
  const PADDING_RIGHT = 96;
  const PADDING_BOTTOM = 40;
  const PADDING_LEFT = 24;
  const TEAMS_START_X = 96;
  const TEAMS_END_X_OFFSET = 96; // offset from right edge
  const TEAM_MIN_GAP = 12;
  const SVG_WIDTH = 1000;
  
  // Year Axis
  const YEAR_SPACING = 120 // Height between year lines
  const YEAR_LABEL_OFFSET_ABOVE_LINE = 24 // Years appear 24px above line
  const YEAR_FONT_SIZE = 24
  const YEAR_LETTER_SPACING = 0.12
  
  // Year Lines (dotted)
  const LINE_STROKE_WIDTH = 3;
  const LINE_DASH_ARRAY = "0.1 8"; // dot size + gap
  
  // Timeline Bars
  const BAR_OVERSHOOT = 12; // px bars extend above/below year lines
  const BAR_WIDTH_DESIGN = 32;
  const BAR_WIDTH_NONDESIGN = 12;
  const BAR_RADIUS_DESIGN = 18; // ⭐ NEW: separate radius for design bars
  const BAR_RADIUS_NONDESIGN = 8; // ⭐ NEW: separate radius for non-design bars
  
  // Team Labels
  const LABEL_OFFSET_ABOVE_BAR = 32;
  const LABEL_FONT_SIZE = 12;
  const LABEL_LINE_HEIGHT = 14; // spacing between words/lines
  
  // Link Circles
  const CIRCLE_OFFSET_DESIGN = 32;
  const CIRCLE_OFFSET_NONDESIGN = 32;
  const CIRCLE_RADIUS_DESIGN = 28;
  const CIRCLE_RADIUS_NONDESIGN = 12;
  
  // Project Dots
  const PROJECT_DOT_RADIUS = 5;
  const PROJECT_TOOLTIP_OFFSET_X = 24;
  const PROJECT_STACK_Y = 24; // vertical spacing between stacked projects
  const PROJECT_TOOLTIP_FONT_SIZE = 12;
  const PROJECT_TOOLTIP_BG_PADDING = 4;
  const PROJECT_TOOLTIP_HEIGHT = 16;

  const yearRange = maxYear - minYear;
  const padding = { top: PADDING_TOP, right: PADDING_RIGHT, bottom: PADDING_BOTTOM, left: PADDING_LEFT };
  const width = SVG_WIDTH;
  const height = padding.top + padding.bottom + (yearRange * YEAR_SPACING);
  const teamsStartX = TEAMS_START_X;
  const teamsEndX = width - TEAMS_END_X_OFFSET;
  const plotWidth = teamsEndX - teamsStartX;

  const yearToY = (year) => padding.top + ((maxYear - year) * YEAR_SPACING);

  const uniqueTeams = [...new Set(teams.map((t) => t.team))];
  const teamSpacing = Math.max(TEAM_MIN_GAP, plotWidth / uniqueTeams.length);
  
  const teamToX = (teamIndex) => teamsStartX + teamIndex * teamSpacing + teamSpacing / 2;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: "100%", height: "auto" }}>
      <defs>
        {teams.map((team, idx) => (
          <linearGradient key={`grad-${idx}`} id={`gradient-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DBDBDB" />
            <stop offset="100%" stopColor="#F6F6F6" />
          </linearGradient>
        ))}
      </defs>

      {/* Dotted year lines */}
      {Array.from({ length: yearRange + 1 }, (_, i) => maxYear - i).map((year) => {
        const y = yearToY(year);
        return (
          <line 
            key={`grid-${year}`} 
            x1={0} 
            y1={y} 
            x2={width} 
            y2={y} 
            stroke="#121212" 
            strokeWidth={LINE_STROKE_WIDTH} 
            strokeDasharray={LINE_DASH_ARRAY} 
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke" // ⭐ Prevents scaling
          />
        );
      })}

      {/* Timeline bars + labels + circles + PROJECT DOTS */}
      {uniqueTeams.map((teamName, teamIdx) => {
        const x = teamToX(teamIdx);
        const teamData = teams.filter((t) => t.team === teamName);
        if (teamData.length === 0) return null;
        
        const firstBar = teamData[0];
        const firstBarStartY = yearToY(firstBar.start);
        const firstBarEndY = yearToY(firstBar.end || maxYear);
        const barTopY = Math.min(firstBarStartY, firstBarEndY);
        const labelY = barTopY - BAR_OVERSHOOT - LABEL_OFFSET_ABOVE_BAR;
        
        const circleOffset = firstBar.designWork ? CIRCLE_OFFSET_DESIGN : CIRCLE_OFFSET_NONDESIGN;
        const circleY = labelY + circleOffset;
        const hasLink = firstBar.link !== null && firstBar.link !== "";
        const circleRadius = firstBar.designWork ? CIRCLE_RADIUS_DESIGN : CIRCLE_RADIUS_NONDESIGN;

        const teamWords = teamName.split(' ');

        const teamProjects = projects.filter((p) => p.team === teamName);
        const projectsByYear = {};
        teamProjects.forEach((p) => {
          if (!projectsByYear[p.year]) projectsByYear[p.year] = [];
          projectsByYear[p.year].push(p);
        });

        return (
          <g key={`team-${teamIdx}`} className="team-group">
            {/* Circle BEHIND bars and labels */}
            {hasLink && (
              <a href={firstBar.link} target="_blank" rel="noopener noreferrer">
                <circle cx={x} cy={circleY} r={circleRadius} fill="#EFEFEF" className="team-circle" style={{ cursor: 'pointer' }} />
              </a>
            )}

            {/* Bars */}
            {teamData.map((team, barIdx) => {
              const startY = yearToY(team.start);
              const endY = yearToY(team.end || maxYear);
              const barHeight = Math.abs(endY - startY);
              const barWidth = team.designWork ? BAR_WIDTH_DESIGN : BAR_WIDTH_NONDESIGN;
              const barRadius = team.designWork ? BAR_RADIUS_DESIGN : BAR_RADIUS_NONDESIGN;

              return (
                <rect
                  key={`bar-${teamIdx}-${barIdx}`}
                  x={x - barWidth / 2}
                  y={Math.min(startY, endY) - BAR_OVERSHOOT}
                  width={barWidth}
                  height={barHeight + (BAR_OVERSHOOT * 2)}
                  fill={`url(#gradient-${teamIdx})`}
                  rx={barRadius}
                />
              );
            })}

            {/* ⭐ Project dots: erstes Projekt hat Priorität */}
            {Object.entries(projectsByYear).map(([year, projs]) => {
              const dotY = yearToY(parseInt(year));

              // 1) Falls mehrere Projekte: zuerst die sekundären, dann das primäre (Index 0) oben
              const secondary = projs.slice(1);
              const primary = projs[0];

              return (
                <g key={`dot-${teamIdx}-${year}`}>
                  {/* Sekundäre (ohne Tooltip/Hover) */}
                  {secondary.map((p, sIdx) => {
                    const posY = dotY + ((sIdx + 1) * PROJECT_STACK_Y);
                    return (
                      <g key={`proj-sec-${sIdx}`} className="project-dot-group secondary-dot">
                        <circle
                          cx={x}
                          cy={posY}
                          r={PROJECT_DOT_RADIUS}
                          fill="#121212"
                          className="project-dot"
                          style={{ cursor: 'default' }}
                        />
                        {/* Keine Tooltip-Elemente für sekundäre */}
                      </g>
                    );
                  })}

                  {/* Primär (Index 0) mit Tooltip/Hover */}
                  {primary && (
                    <g key={`proj-primary`} className="project-dot-group primary-dot">
                      <circle
                        cx={x}
                        cy={dotY}
                        r={PROJECT_DOT_RADIUS}
                        fill="#121212"
                        className="project-dot"
                        style={{ cursor: 'pointer' }}
                      />
                      <rect
                        x={x + PROJECT_TOOLTIP_OFFSET_X - PROJECT_TOOLTIP_BG_PADDING}
                        y={dotY - (PROJECT_TOOLTIP_HEIGHT / 2 - 2)}
                        width={primary.title.length * 7 + (PROJECT_TOOLTIP_BG_PADDING * 2)}
                        height={PROJECT_TOOLTIP_HEIGHT}
                        fill="#ffffff"
                        opacity="0"
                        className="project-tooltip-bg"
                        style={{ pointerEvents: 'none' }}
                      />
                      <text
                        x={x + PROJECT_TOOLTIP_OFFSET_X}
                        y={dotY}
                        fontSize={PROJECT_TOOLTIP_FONT_SIZE}
                        fontFamily="SF Pro Rounded"
                        fontWeight="700"
                        textAnchor="start"
                        fill="#121212"
                        opacity="0"
                        className="project-tooltip"
                        style={{ pointerEvents: 'none' }}
                      >
                        {primary.title}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* ⭐ Label AFTER everything else (on top) */}
            <text x={x} y={labelY} fontSize={LABEL_FONT_SIZE} fontFamily="SF Pro Rounded" fontWeight="700" textAnchor="middle" fill="#121212" opacity="0" className="team-label" style={{ pointerEvents: 'none' }}>
              {teamWords.map((word, wordIdx) => (
                <tspan key={wordIdx} x={x} dy={wordIdx === 0 ? 0 : LABEL_LINE_HEIGHT}>{word}</tspan>
              ))}
              {/* ⭐ Role below team name (multi-line if needed) */}
              {firstBar.role && firstBar.role.split(' ').map((roleWord, roleIdx) => (
                <tspan key={`role-${roleIdx}`} x={x} dy={LABEL_LINE_HEIGHT} fontSize={LABEL_FONT_SIZE} fontWeight="400">
                  {roleWord}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}

      {/* Y-axis labels (years) */}
      {Array.from({ length: yearRange + 1 }, (_, i) => maxYear - i).map((year) => {
        const y = yearToY(year);
        return <text key={`year-${year}`} x={padding.left} y={y - YEAR_LABEL_OFFSET_ABOVE_LINE} fontSize={YEAR_FONT_SIZE} fontFamily="SF Pro Rounded" letterSpacing={`${YEAR_LETTER_SPACING}px`} textAnchor="start" fill="#121212">{year}</text>;
      })}

      <style>{`
        .team-group:hover .team-label { opacity: 1 !important; }
        .team-circle { transition: fill 0.2s ease; }
        .team-circle:hover { fill: #FFFB78 !important; }
        /* Nur der erste (primary) Dot zeigt Tooltip bei Hover */
        .project-dot-group.primary-dot:hover .project-tooltip { opacity: 1 !important; }
        .project-dot_group.primary-dot:hover .project-tooltip_bg { opacity: 1 !important; }
        /* Sekundäre Dots keine Tooltip-Reaktion */
        .project-dot-group.secondary-dot:hover .project-tooltip,
        .project-dot-group.secondary-dot:hover .project-tooltip-bg { opacity: 0 !important; }
        
        /* ⭐ Mobile: Dünnere Linie mit weniger Gap */
        @media (max-width: 768px) {
          line[stroke-dasharray] {
            stroke-width: 1.5px;
            stroke-dasharray: 0.1 4;
          }
        }
      `}</style>
    </svg>
  );
}
