import { useEffect, useState, useMemo } from "react";

// ============================================
// TimelineViz.jsx – SVG-based Team Timeline
// ============================================

export default function TimelineViz() {
  const [teams, setTeams] = useState([]);
  const [minYear, setMinYear] = useState(null);
  const [maxYear, setMaxYear] = useState(new Date().getFullYear());
  const [projects, setProjects] = useState([]);

  // 1) STATE: track open tooltip on mobile (add near other useState)
  const [openTooltip, setOpenTooltip] = useState(null); // { teamIdx, year } or null

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

  // derived dimensions
  const yearRange = maxYear - minYear;
  const padding = { top: PADDING_TOP, right: PADDING_RIGHT, bottom: PADDING_BOTTOM, left: PADDING_LEFT };
  const width = SVG_WIDTH;
  const height = padding.top + padding.bottom + (yearRange * YEAR_SPACING);
  const teamsStartX = TEAMS_START_X;
  const teamsEndX = width - TEAMS_END_X_OFFSET;
  const plotWidth = teamsEndX - teamsStartX;
  const yearToY = (year) => padding.top + ((maxYear - year) * YEAR_SPACING);

  // memoized derived data (hooks must run on every render)
  const uniqueTeams = useMemo(() => [...new Set(teams.map((t) => t.team))], [teams]);
  const teamSpacing = Math.max(TEAM_MIN_GAP, (plotWidth || 1) / Math.max(1, uniqueTeams.length));
  const teamToX = (teamIndex) => teamsStartX + teamIndex * teamSpacing + teamSpacing / 2;

  const projectsByTeam = useMemo(() => {
    const map = {};
    projects.forEach((p) => {
      if (!map[p.team]) map[p.team] = [];
      map[p.team].push(p);
    });
    return map;
  }, [projects]);

  // now it's safe to early-return (hooks already registered)
  // Responsive: detect mobile breakpoint and expose derived values
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // derive responsive values (never call hooks conditionally)
  const YEAR_SPACING_D = isMobile ? 90 : YEAR_SPACING; // smaller spacing on mobile
  const PROJECT_STACK_Y_D = isMobile ? 16 : PROJECT_STACK_Y;
  const PROJECT_DOT_RADIUS_D = isMobile ? 8 : PROJECT_DOT_RADIUS;
  const LINE_DASH_ARRAY_D = isMobile ? "0.1 4" : LINE_DASH_ARRAY;
  const PROJECT_TOOLTIP_OFFSET_X_D = isMobile ? 12 : PROJECT_TOOLTIP_OFFSET_X;

  // now it's safe to early-return
   if (teams.length === 0) return null;

  // ---------- small inner components for clarity ----------
  function ProjectTooltip({ x, y, title, visible = false }) {
    const width = Math.max(80, Math.min(220, title.length * 7 + PROJECT_TOOLTIP_BG_PADDING * 2));
    // Use foreignObject to allow wrapping & padding
    return visible ? (
      <>
        <rect x={x} y={y - PROJECT_TOOLTIP_HEIGHT/2} width={width} height={PROJECT_TOOLTIP_HEIGHT} className="project-tooltip-bg" />
        <foreignObject x={x} y={y - PROJECT_TOOLTIP_HEIGHT/2} width={width} height={PROJECT_TOOLTIP_HEIGHT}>
          <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: PROJECT_TOOLTIP_FONT_SIZE, padding: '2px 6px', color: '#121212', fontWeight: 700 }}>
            {title}
          </div>
        </foreignObject>
      </>
    ) : null;
  }

  function ProjectDot({ x, y, title, teamIdx, yearKey }) {
    const tx = x + PROJECT_TOOLTIP_OFFSET_X_D - PROJECT_TOOLTIP_BG_PADDING;
    const handleTap = (e) => {
      // stop SVG default link behaviour if needed
      if (isMobile) {
        const key = `${teamIdx}:${yearKey}`;
        setOpenTooltip((prev) => (prev === key ? null : key));
      }
    };

    return (
      <g className="project-dot-group" onClick={handleTap} role="button" tabIndex={0}>
        {/* invisible larger hit area for touch */}
        <circle cx={x} cy={y} r={Math.max(PROJECT_DOT_RADIUS_D, 14)} fill="transparent" className="project-dot-hit" />
        <circle cx={x} cy={y} r={PROJECT_DOT_RADIUS_D} fill="#121212" className="project-dot" />
        {/* show tooltip if openTooltip matches (inline style or class) */}
        <ProjectTooltip x={tx} y={y} title={title} visible={openTooltip === `${teamIdx}:${yearKey}`} />
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
    const labelY = barTopY - BAR_OVERSHOOT - LABEL_OFFSET_ABOVE_BAR;
    const circleOffset = firstBar.designWork ? CIRCLE_OFFSET_DESIGN : CIRCLE_OFFSET_NONDESIGN;
    const circleY = labelY + circleOffset;
    const hasLink = Boolean(firstBar.link);
    const circleRadius = firstBar.designWork ? CIRCLE_RADIUS_DESIGN : CIRCLE_RADIUS_NONDESIGN;

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
            <circle cx={x} cy={circleY} r={circleRadius} fill="#EFEFEF" className="team-circle" style={{ cursor: "pointer" }} />
          </a>
        )}

        {/* Bars */}
        {teamData.map((t, i) => {
          const startY = yearToY(t.start);
          const endY = yearToY(t.end || maxYear);
          const barHeight = Math.abs(endY - startY);
          const barWidth = t.designWork ? BAR_WIDTH_DESIGN : BAR_WIDTH_NONDESIGN;
          const barRadius = t.designWork ? BAR_RADIUS_DESIGN : BAR_RADIUS_NONDESIGN;
          return (
            <rect
              key={`bar-${teamIdx}-${i}`}
              x={x - barWidth / 2}
              y={Math.min(startY, endY) - BAR_OVERSHOOT}
              width={barWidth}
              height={barHeight + BAR_OVERSHOOT * 2}
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
                const posY = dotY + (sIdx + 1) * PROJECT_STACK_Y_D;
                return <ProjectDot key={`sec-${sIdx}`} x={x} y={posY} title={p.title} teamIdx={teamIdx} yearKey={year} />;
              })}
              {primary && <ProjectDot key={`prim`} x={x} y={dotY} title={primary.title} />}
            </g>
          );
        })}

        {/* Label (shown on hover via CSS) */}
        <text
          x={x}
          y={labelY}
          fontSize={LABEL_FONT_SIZE}
          fontFamily="SF Pro Rounded"
          fontWeight="700"
          textAnchor="middle"
          fill="#121212"
          className="team-label"
          style={{ pointerEvents: "none" }}
        >
          {teamName.split(" ").map((w, idx) => (
            <tspan key={idx} x={x} dy={idx === 0 ? 0 : LABEL_LINE_HEIGHT}>
              {w}
            </tspan>
          ))}
          {firstBar.role &&
            firstBar.role.split(" ").map((rw, rIdx) => (
              <tspan key={`role-${rIdx}`} x={x} dy={LABEL_LINE_HEIGHT} fontSize={LABEL_FONT_SIZE} fontWeight="400">
                {rw}
              </tspan>
            ))}
        </text>
      </g>
    );
  }

  // ---------- render ----------
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

      {/* Year lines */}
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
            strokeWidth={LINE_STROKE_WIDTH}
            strokeDasharray={LINE_DASH_ARRAY_D}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}

      {/* Teams */}
      {uniqueTeams.map((teamName, idx) => (
        <TeamGroup key={teamName} teamName={teamName} teamIdx={idx} />
      ))}

      {/* Year labels */}
      {Array.from({ length: yearRange + 1 }, (_, i) => {
        const year = maxYear - i;
        const y = yearToY(year);
        return (
          <text key={`year-${year}`} x={padding.left} y={y - YEAR_LABEL_OFFSET_ABOVE_LINE} fontSize={YEAR_FONT_SIZE} fontFamily="SF Pro Rounded" letterSpacing={`${YEAR_LETTER_SPACING}px`} textAnchor="start" fill="#121212">
            {year}
          </text>
        );
      })}

      <style>{`
        /* labels hidden by default; show when hovering the team group */
        .team-label { opacity: 0; transition: opacity 160ms ease; fill: #121212; visibility: hidden; }
        .team-group:hover .team-label { opacity: 1; visibility: visible; }

        .team-circle { transition: fill 0.2s ease; }
        .team-circle:hover { fill: #FFFB78; }

        /* tooltip / hover behavior - keep same but better for touch due to larger dots */
        .project-dot-group .project-tooltip,
        .project-dot-group .project-tooltip-bg { transition: opacity 0.18s ease, transform 0.18s ease; opacity: 0; transform: translateX(6px); }
        .project-dot-group:hover .project-tooltip,
        .project-dot-group:hover .project-tooltip-bg { opacity: 1; transform: translateX(0); }

        .project-tooltip-bg { fill: #ffffff; rx: 6; }
        .project-tooltip { fill: #121212; font-weight: 700; dominant-baseline: middle; }
        .project-tooltip, .project-tooltip-bg { pointer-events: none; }

        @media (max-width: 768px) {
          /* smaller visual gaps and ensure touch-friendly dots */
          line[stroke-dasharray] { stroke-width: 1.5px; stroke-dasharray: 0.1 4; }
          .project-dot { /* larger hit area on mobile */ r: ${PROJECT_DOT_RADIUS_D}px; }
        }
      `}</style>
    </svg>
  );
}
