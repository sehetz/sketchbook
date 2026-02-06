import { useEffect, useState, useMemo } from "react";
import { useData } from "../../contexts/DataContext.jsx";
import "./TimelineViz.css";

// ============================================
// TimelineViz.jsx – SVG-based Team Timeline
// ============================================
// 
// Zeigt Teams auf einer Timeline mit zugehörigen Projects.
// DATEN kommen aus DataContext (teams + projects)
// STYLING kommt aus globalen CSS Tokens (tokens.css + TimelineViz.css)

// Helper function to read CSS custom properties
function getCSSVar(name, element = document.documentElement) {
  return getComputedStyle(element).getPropertyValue(name).trim();
}

function parseCSSValue(value) {
  // getComputedStyle returns computed values in px, so we can safely parse
  // Handle values like "120px", "7.5rem" etc. - getComputedStyle already converts to px
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

function parseCSSValueInPx(name, element = document.documentElement) {
  // This gets the computed pixel value directly
  const value = getComputedStyle(element).getPropertyValue(name).trim();
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

export default function TimelineViz() {
  const [teams, setTeams] = useState([]);
  const [minYear, setMinYear] = useState(null);
  const [maxYear, setMaxYear] = useState(new Date().getFullYear());
  const [projects, setProjects] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredProjectId, setHoveredProjectId] = useState(null);

  // Read CSS variables for colors and dimensions
  const cssVars = useMemo(() => {
    const root = document.documentElement;
    return {
      // Colors
      colorFg: getCSSVar('--color-fg', root),
      colorBg: getCSSVar('--color-bg', root),
      colorCircle: getCSSVar('--color-timeline-circle', root),
      colorGradientStart: getCSSVar('--color-timeline-gradient-start', root),
      colorGradientEnd: getCSSVar('--color-timeline-gradient-end', root),
      
      // Dimensions (using direct pixel computation)
      dotRadiusDesktop: parseCSSValueInPx('--timeline-dot-radius-desktop', root),
      dotRadiusMobile: parseCSSValueInPx('--timeline-dot-radius-mobile', root),
      dotHitArea: parseCSSValueInPx('--timeline-dot-hit-area', root),
      yearSpacingDesktop: parseCSSValueInPx('--timeline-year-spacing-desktop', root),
      yearSpacingMobile: parseCSSValueInPx('--timeline-year-spacing-mobile', root),
      projectStackY: parseCSSValueInPx('--timeline-project-stack-y', root),
      projectStackYMobile: parseCSSValueInPx('--timeline-project-stack-y-mobile', root),
      barWidthDesign: parseCSSValueInPx('--timeline-bar-width-design', root),
      barWidthNondesign: parseCSSValueInPx('--timeline-bar-width-nondesign', root),
      barRadiusDesign: parseCSSValueInPx('--timeline-bar-radius-design', root),
      barRadiusNondesign: parseCSSValueInPx('--timeline-bar-radius-nondesign', root),
      barOvershoot: parseCSSValueInPx('--timeline-bar-overshoot', root),
      circleRadiusDesign: parseCSSValueInPx('--timeline-circle-radius-design', root),
      circleRadiusNondesign: parseCSSValueInPx('--timeline-circle-radius-nondesign', root),
      circleOffset: parseCSSValueInPx('--timeline-circle-offset', root),
      labelOffsetAboveBar: parseCSSValueInPx('--timeline-label-offset-above-bar', root),
      labelLineHeight: parseCSSValueInPx('--timeline-label-line-height', root),
      labelLineHeightMobile: parseCSSValueInPx('--timeline-label-line-height-mobile', root),
      teamsMinGap: parseCSSValueInPx('--timeline-teams-min-gap', root),
      teamsStartX: parseCSSValueInPx('--timeline-teams-start-x', root),
      teamsEndXOffset: parseCSSValueInPx('--timeline-teams-end-x-offset', root),
      tooltipOffsetX: parseCSSValueInPx('--timeline-tooltip-offset-x', root),
      tooltipOffsetXMobile: parseCSSValueInPx('--timeline-tooltip-offset-x-mobile', root),
      tooltipPadding: parseCSSValueInPx('--timeline-tooltip-padding', root),
      tooltipHeight: parseCSSValueInPx('--timeline-tooltip-height', root),
      tooltipHeightMobile: parseCSSValueInPx('--timeline-tooltip-height-mobile', root),
      tooltipPaddingTop: parseCSSValueInPx('--timeline-tooltip-padding-top', root),
      mobileHeaderMargin: parseCSSValueInPx('--timeline-mobile-header-margin', root),
      paddingTop: parseCSSValueInPx('--timeline-padding-top', root),
      paddingRight: parseCSSValueInPx('--timeline-padding-right', root),
      paddingBottom: parseCSSValueInPx('--timeline-padding-bottom', root),
      paddingLeft: parseCSSValueInPx('--timeline-padding-left', root),
      yearFontSize: parseCSSValueInPx('--timeline-year-font-size', root),
      yearFontSizeMobile: parseCSSValueInPx('--timeline-year-font-size-mobile', root),
      labelFontSize: parseCSSValueInPx('--timeline-label-font-size', root),
      labelFontSizeMobile: parseCSSValueInPx('--timeline-label-font-size-mobile', root),
      labelFontWeight: getCSSVar('--timeline-label-font-weight', root),
      labelFontWeightMobile: getCSSVar('--timeline-label-font-weight-mobile', root),
      projectLabelFontSize: parseCSSValueInPx('--timeline-project-label-font-size', root),
      projectLabelFontSizeMobile: parseCSSValueInPx('--timeline-project-label-font-size-mobile', root),
      lineStrokeWidth: parseCSSValueInPx('--line-width', root),
      lineDotSize: parseCSSValueInPx('--line-dot-size', root),
      lineDotGap: parseCSSValueInPx('--line-dot-gap', root),
      fontSans: getCSSVar('--font-sans', root),
    };
  }, []);

  // ============================================
  // DATEN AUS CONTEXT HOLEN (statt fetch)
  // ============================================
  
  const { teams: rawTeams, projects: rawProjects } = useData();

  // Process teams data (wie vorher in timeline_fetch)
  useEffect(() => {
    if (!rawTeams || rawTeams.length === 0) return;

    // Parse year helper
    const parseYear = (val) => {
      if (val == null) return null;
      if (typeof val === "number" && Number.isFinite(val)) return Math.floor(val);
      if (typeof val === "string") {
        const m = val.match(/(\d{4})/);
        if (m) return parseInt(m[1], 10);
      }
      return null;
    };

    // Normalize team data
    const extracted = rawTeams.map((row) => ({
      team: row.Team || "Unknown",
      start: parseYear(row["start-date"]),
      end: parseYear(row["end-date"]),
      designWork: row["design-work"] === 1 || row["design-work"] === true,
      link: row.link || null,
      role: row.role || null,
    }));

    // Filter valid teams
    const validTeams = extracted
      .filter((t) => Number.isInteger(t.start))
      .sort((a, b) => {
        if (a.end === null && b.end === null) return b.start - a.start;
        if (a.end === null) return -1;
        if (b.end === null) return 1;
        return b.end - a.end;
      });

    setTeams(validTeams);

    // Calculate min year
    const startYears = validTeams.map((t) => t.start).filter(Boolean);
    const calculatedMinYear = startYears.length
      ? Math.min(...startYears)
      : new Date().getFullYear();
    setMinYear(calculatedMinYear);
  }, [rawTeams]);

  // Process projects data (wie vorher in timeline_fetch)
  useEffect(() => {
    if (!rawProjects || rawProjects.length === 0) return;

    const parseYear = (val) => {
      if (val == null) return null;
      if (typeof val === "number" && Number.isFinite(val)) return Math.floor(val);
      if (typeof val === "string") {
        const m = val.match(/(\d{4})/);
        if (m) return parseInt(m[1], 10);
      }
      return null;
    };

    const generateSlug = (title) => {
      return title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]/g, "")
        .replace(/\-+/g, "-");
    };

    const projectsExtracted = [];
    rawProjects.forEach((proj) => {
      // Skip offline projects
      if (!proj.is_online) return;
      
      const year = parseYear(proj.Datum);
      if (!year) return;

      // Get the first related skill
      const relSkills = proj._nc_m2m_sehetz_skills || [];
      const skillObj = relSkills[0]?.skill;
      const skillSlug = skillObj?.Skill ? generateSlug(skillObj.Skill) : "all";

      const relTeams = proj._nc_m2m_sehetz_teams || [];
      relTeams.forEach((rel) => {
        const teamObj = rel.team;
        if (!teamObj) return;
        projectsExtracted.push({
          team: teamObj.Team,
          year,
          title: proj.Title || "Untitled",
          slug: generateSlug(proj.Title),
          skillSlug: skillSlug,
        });
      });
    });

    setProjects(projectsExtracted);
  }, [rawProjects]);

  // Responsive mobile detection
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Derived dimensions
  const yearRange = maxYear - minYear;
  const width = 1000; // SVG viewBox width
  const mobileHeaderOffset = isMobile ? cssVars.mobileHeaderMargin : 0;
  const heightContent = yearRange * cssVars.yearSpacingDesktop;
  const height = cssVars.paddingTop + cssVars.paddingBottom + heightContent + mobileHeaderOffset;
  const teamsStartX = cssVars.teamsStartX;
  const teamsEndX = width - cssVars.teamsEndXOffset;
  const plotWidth = teamsEndX - teamsStartX;
  const yearToY = (year) => cssVars.paddingTop + mobileHeaderOffset + ((maxYear - year) * cssVars.yearSpacingDesktop);

  // Memoized computed data
  const uniqueTeams = useMemo(() => [...new Set(teams.map((t) => t.team))], [teams]);
  
  // On mobile, only consider teams with projects for spacing
  const teamsWithProjects = useMemo(() => {
    if (!isMobile) return uniqueTeams;
    return uniqueTeams.filter(teamName => {
      const teamProjects = projects.filter(p => p.team === teamName);
      return teamProjects.length > 0;
    });
  }, [uniqueTeams, projects, isMobile]);
  
  const teamSpacing = Math.max(cssVars.teamsMinGap, (plotWidth || 1) / Math.max(1, teamsWithProjects.length));
  const teamToX = (teamIndex, teamName = null) => {
    // On mobile, use filtered teams for spacing
    if (isMobile && teamName) {
      const filteredIndex = teamsWithProjects.indexOf(teamName);
      if (filteredIndex === -1) return 0; // Should not happen
      return teamsStartX + filteredIndex * teamSpacing + teamSpacing / 2;
    }
    // Desktop: use original teams list
    return teamsStartX + teamIndex * teamSpacing + teamSpacing / 2;
  };

  const projectsByTeam = useMemo(() => {
    const map = {};
    projects.forEach((p) => {
      if (!map[p.team]) map[p.team] = [];
      map[p.team].push(p);
    });
    return map;
  }, [projects]);

  // Responsive config values
  const dotRadius = isMobile ? cssVars.dotRadiusMobile : cssVars.dotRadiusDesktop;
  const projectStackY = isMobile ? cssVars.projectStackYMobile : cssVars.projectStackY;
  const tooltipOffsetX = isMobile ? cssVars.tooltipOffsetXMobile : cssVars.tooltipOffsetX;
  const labelLineHeight = isMobile ? cssVars.labelLineHeightMobile : cssVars.labelLineHeight;
  const labelFontSize = isMobile ? cssVars.labelFontSizeMobile : cssVars.labelFontSize;
  const projectLabelFontSize = isMobile ? cssVars.projectLabelFontSizeMobile : cssVars.projectLabelFontSize;
  const labelFontWeight = isMobile ? cssVars.labelFontWeightMobile : cssVars.labelFontWeight;
  const yearFontSize = isMobile ? cssVars.yearFontSizeMobile : cssVars.yearFontSize;
  const lineDashArray = `${cssVars.lineDotSize} ${cssVars.lineDotGap}`;
  const tooltipHeight = isMobile ? cssVars.tooltipHeightMobile : cssVars.tooltipHeight;

  // Measure mobile label width to keep exact padding (8px per side)
  const measureMobileLabelWidth = useMemo(() => {
    if (!isMobile) return () => 0;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => 0;
    const cache = new Map();
    const fontSize = isMobile ? cssVars.projectLabelFontSizeMobile : cssVars.projectLabelFontSize;
    ctx.font = `${fontSize}px ${cssVars.fontSans}`;
    return (text = "") => {
      if (cache.has(text)) return cache.get(text);
      const baseWidth = ctx.measureText(text).width;
      const width = baseWidth + Math.max(0, text.length - 1) * 0.25;
      cache.set(text, width);
      return width;
    };
  }, [isMobile, cssVars.projectLabelFontSizeMobile, cssVars.projectLabelFontSize, cssVars.fontSans]);

  if (teams.length === 0) return null;

  // ---------- Inner SVG components ----------

  function ProjectTooltip({ x, y, title }) {
    const tooltipWidth = Math.max(80, Math.min(220, title.length * 7 + cssVars.tooltipPadding * 2));
    return (
      <rect
        className="project-tooltip-bg"
        x={x}
        y={y - tooltipHeight / 2 - cssVars.tooltipPaddingTop}
        width={tooltipWidth}
        height={tooltipHeight}
        rx={tooltipHeight / 2}
        ry={tooltipHeight / 2}
        fill={cssVars.colorBg}
        stroke="none"
        opacity={1}
      />
    );
  }

  function ProjectDot({ x, y, title, teamIdx, slug, skillSlug }) {
    const tx = x + tooltipOffsetX - cssVars.tooltipPadding;
    const projectId = `${teamIdx}-${x}-${y}-${title}`;
    
    const handleClick = (e) => {
      e.stopPropagation();
      if (slug && skillSlug) {
        window.location.href = `/skills/${skillSlug}/${slug}`;
      }
    };
    
    return (
      <g 
        className="project-dot-group"
        onMouseEnter={() => setHoveredProjectId(projectId)}
        onMouseLeave={() => setHoveredProjectId(null)}
        onClick={handleClick}
        style={{ pointerEvents: "auto", cursor: slug ? "pointer" : "default" }}
      >
        <circle
          cx={x}
          cy={y}
          r={cssVars.dotHitArea}
          fill="transparent"
          className="project-dot-hit"
        />
        <circle cx={x} cy={y} r={dotRadius} fill={cssVars.colorFg} className="project-dot" />
        {/* Only render tooltip on desktop (on mobile it's in the overlay) */}
        {!isMobile && (
          <>
            <ProjectTooltip x={tx} y={y} title={title} />
            <text
              x={tx + cssVars.tooltipPadding}
              y={y - cssVars.tooltipPaddingTop + 5}
              fontSize={cssVars.projectLabelFontSize}
              fontFamily={cssVars.fontSans}
              textAnchor="start"
              fill={cssVars.colorFg}
              className="project-title"
              style={{ pointerEvents: "none" }}
            >
              {title}
            </text>
          </>
        )}
      </g>
    );
  }

  // Helper: render projects for a given year (non-hovered and hovered separately)
  function renderProjectsForYear(year, projs, teamIdx, dotY) {
    const secondary = projs.slice(1);
    const primary = projs[0];
    const dots = [];
    let hoveredDot = null;

    // Render non-hovered secondary projects
    secondary.forEach((p, sIdx) => {
      const posY = dotY + (sIdx + 1) * projectStackY;
      const posX = teamToX(teamIdx);
      const projectId = `${teamIdx}-${posX}-${posY}-${p.title}`;
      if (hoveredProjectId === projectId) {
        hoveredDot = <ProjectDot key={`sec-${sIdx}`} x={posX} y={posY} title={p.title} teamIdx={teamIdx} slug={p.slug} skillSlug={p.skillSlug} />;
      } else {
        dots.push(<ProjectDot key={`sec-${sIdx}`} x={posX} y={posY} title={p.title} teamIdx={teamIdx} slug={p.slug} skillSlug={p.skillSlug} />);
      }
    });

    // Render non-hovered primary project
    if (primary) {
      const projectId = `${teamIdx}-${teamToX(teamIdx)}-${dotY}-${primary.title}`;
      if (hoveredProjectId === projectId) {
        hoveredDot = <ProjectDot key={`prim`} x={teamToX(teamIdx)} y={dotY} title={primary.title} teamIdx={teamIdx} slug={primary.slug} skillSlug={primary.skillSlug} />;
      } else {
        dots.push(<ProjectDot key={`prim`} x={teamToX(teamIdx)} y={dotY} title={primary.title} teamIdx={teamIdx} slug={primary.slug} skillSlug={primary.skillSlug} />);
      }
    }

    // Return non-hovered first, then hovered on top
    return [...dots, hoveredDot].filter(Boolean);
  }

  function TeamGroup({ teamName, teamIdx }) {
    const x = teamToX(teamIdx);
    const teamData = teams.filter((t) => t.team === teamName);
    if (!teamData.length) return null;

    const firstBar = teamData[0];
    const firstBarStartY = yearToY(firstBar.start);
    const firstBarEndY = yearToY(firstBar.end || maxYear);
    const barTopY = Math.min(firstBarStartY, firstBarEndY);
    const labelY = barTopY - cssVars.barOvershoot - cssVars.labelOffsetAboveBar;
    const circleY = labelY + cssVars.circleOffset;
    const hasLink = Boolean(firstBar.link);
    const circleRadius = firstBar.designWork ? cssVars.circleRadiusDesign : cssVars.circleRadiusNondesign;

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

        {/* Projects: secondary first, primary last, hovered on top */}
        {Object.entries(projectsByYear).map(([year, projs]) => {
          const dotY = yearToY(parseInt(year, 10));
          return (
            <g key={`dots-${teamIdx}-${year}`}>
              {renderProjectsForYear(year, projs, teamIdx, dotY)}
            </g>
          );
        })}

        {/* Team Label (shown on hover via CSS) */}
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
      </g>
    );
  }

  // ---------- Render ----------
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 ${-cssVars.paddingTop - 120} ${width} ${height + 240}`}
      style={{ maxWidth: "100%", height: "auto" }}
    >
      <defs>
        {teams.map((team, idx) => (
          <linearGradient key={`grad-${idx}`} id={`gradient-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={cssVars.colorGradientStart} />
            <stop offset="100%" stopColor={cssVars.colorGradientEnd} />
          </linearGradient>
        ))}
      </defs>

      {/* Year lines (dotted grid) – BACKGROUND */}
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
            stroke={cssVars.colorFg}
            strokeWidth={cssVars.lineStrokeWidth}
            strokeDasharray={lineDashArray}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}

      {/* Team groups (bars + dots + labels) – FOREGROUND */}
      {!isMobile && (
        <>
          {/* Render non-hovered teams first */}
          {uniqueTeams.map((teamName, idx) => {
            const hasHoveredProject = hoveredProjectId?.startsWith(`${idx}-`);
            if (hasHoveredProject) return null;
            return <TeamGroup key={teamName} teamName={teamName} teamIdx={idx} />;
          })}
          
          {/* Render hovered team LAST (on top) */}
          {uniqueTeams.map((teamName, idx) => {
            const hasHoveredProject = hoveredProjectId?.startsWith(`${idx}-`);
            if (!hasHoveredProject) return null;
            return <TeamGroup key={teamName} teamName={teamName} teamIdx={idx} />;
          })}
        </>
      )}

      {/* On mobile: render team circles and labels in header, then main timeline */}
      {isMobile && (
        <>
          {/* Mobile team header - circles and labels in a row at top */}
          <g className="team-header-mobile">
            {uniqueTeams.map((teamName, teamIdx) => {
              const teamData = teams.filter((t) => t.team === teamName);
              const teamProjects = projectsByTeam[teamName] || [];
              // Skip teams without projects on mobile
              if (teamProjects.length === 0) return null;
              if (!teamData.length) return null;
              
              const firstBar = teamData[0];
              const hasLink = Boolean(firstBar.link);
              const circleRadius = firstBar.designWork ? cssVars.circleRadiusDesign : cssVars.circleRadiusNondesign;
              const x = teamToX(teamIdx, teamName);
              const headerY = -32; // Fixed -32px above the timeline
              
              return (
                <g key={`header-${teamIdx}`}>
                  {/* Circle (if has link) */}
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
                  
                  {/* Team label - full name on one line, above circle */}
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

          {/* Mobile timeline - render all teams without circles/labels */}
          {uniqueTeams.map((teamName, idx) => {
            const hasHoveredProject = hoveredProjectId?.startsWith(`${idx}-`);
            if (hasHoveredProject) return null;
            
            const x = teamToX(idx, teamName);
            const teamData = teams.filter((t) => t.team === teamName);
            const teamProjects = projectsByTeam[teamName] || [];
            // Skip teams without projects on mobile
            if (teamProjects.length === 0) return null;
            if (!teamData.length) return null;

            const projectsByYear = {};
            teamProjects.forEach((p) => {
              if (!projectsByYear[p.year]) projectsByYear[p.year] = [];
              projectsByYear[p.year].push(p);
            });

            return (
              <g key={`team-${idx}`}>
                {/* Bars only */}
                {teamData.map((t, i) => {
                  const startY = yearToY(t.start);
                  const endY = yearToY(t.end || maxYear);
                  const barHeight = Math.abs(endY - startY);
                  const barWidth = t.designWork ? cssVars.barWidthDesign : cssVars.barWidthNondesign;
                  const barRadius = t.designWork ? cssVars.barRadiusDesign : cssVars.barRadiusNondesign;
                  return (
                    <rect
                      key={`bar-${idx}-${i}`}
                      x={x - barWidth / 2}
                      y={Math.min(startY, endY) - cssVars.barOvershoot}
                      width={barWidth}
                      height={barHeight + cssVars.barOvershoot * 2}
                      fill={`url(#gradient-${idx})`}
                      rx={barRadius}
                    />
                  );
                })}

                {/* Projects: secondary first, primary last, hovered on top */}
                {Object.entries(projectsByYear).map(([year, projs]) => {
                  const dotY = yearToY(parseInt(year, 10));
                  return (
                    <g key={`dots-${idx}-${year}`}>
                      {renderProjectsForYear(year, projs, idx, dotY)}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Render hovered team LAST (on top) */}
          {uniqueTeams.map((teamName, idx) => {
            const hasHoveredProject = hoveredProjectId?.startsWith(`${idx}-`);
            if (!hasHoveredProject) return null;
            
            const x = teamToX(idx, teamName);
            const teamData = teams.filter((t) => t.team === teamName);
            const teamProjects = projectsByTeam[teamName] || [];
            // Skip teams without projects on mobile
            if (teamProjects.length === 0) return null;
            if (!teamData.length) return null;

            const projectsByYear = {};
            teamProjects.forEach((p) => {
              if (!projectsByYear[p.year]) projectsByYear[p.year] = [];
              projectsByYear[p.year].push(p);
            });

            return (
              <g key={`team-hovered-${idx}`}>
                {/* Bars */}
                {teamData.map((t, i) => {
                  const startY = yearToY(t.start);
                  const endY = yearToY(t.end || maxYear);
                  const barHeight = Math.abs(endY - startY);
                  const barWidth = t.designWork ? cssVars.barWidthDesign : cssVars.barWidthNondesign;
                  const barRadius = t.designWork ? cssVars.barRadiusDesign : cssVars.barRadiusNondesign;
                  return (
                    <rect
                      key={`bar-${idx}-${i}`}
                      x={x - barWidth / 2}
                      y={Math.min(startY, endY) - cssVars.barOvershoot}
                      width={barWidth}
                      height={barHeight + cssVars.barOvershoot * 2}
                      fill={`url(#gradient-${idx})`}
                      rx={barRadius}
                    />
                  );
                })}

                {/* Projects */}
                {Object.entries(projectsByYear).map(([year, projs]) => {
                  const dotY = yearToY(parseInt(year, 10));
                  return (
                    <g key={`dots-${idx}-${year}`}>
                      {renderProjectsForYear(year, projs, idx, dotY)}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </>
      )}

      {/* Year labels – render before project labels */}
      {Array.from({ length: yearRange + 1 }, (_, i) => {
        const year = maxYear - i;
        const y = yearToY(year);
        const yearPaddingLeft = isMobile 
          ? parseCSSValueInPx('--timeline-year-padding-left-mobile')
          : parseCSSValueInPx('--timeline-year-padding-left-desktop');
        return (
          <text
            key={`year-${year}`}
            x={yearPaddingLeft}
            y={y - 12}
            fontSize={yearFontSize}
            fontFamily={cssVars.fontSans}
            fontWeight="500"
            textAnchor="start"
            fill={cssVars.colorFg}
            dominantBaseline="middle"
            style={{ pointerEvents: "none" }}
          >
            {year}
          </text>
        );
      })}

      {/* On mobile: render all project tooltip backgrounds first, then texts on top */}
      {isMobile && (
        <g className="project-labels-overlay">
          {/* Background rects first */}
          {null}
          
          {/* Text labels on top */}
          {uniqueTeams.map((teamName, teamIdx) => {
            const teamProjects = projectsByTeam[teamName] || [];
            const projectsByYear = {};
            teamProjects.forEach((p) => {
              if (!projectsByYear[p.year]) projectsByYear[p.year] = [];
              projectsByYear[p.year].push(p);
            });

            return Object.entries(projectsByYear).map(([year, projs]) => {
              const dotY = yearToY(parseInt(year, 10));
              const posX = teamToX(teamIdx, teamName);

              return projs.map((p, idx) => {
                const posY = dotY + idx * projectStackY;
                const tx = posX; // Center the label on the team column
                const labelPadding = 18;
                const textWidth = isMobile ? measureMobileLabelWidth(p.title) : 0;
                const tooltipWidth = isMobile ? textWidth + labelPadding * 2 : 0;
                
                const handleClick = (e) => {
                  e.stopPropagation();
                  if (p.slug && p.skillSlug) {
                    window.location.href = `/skills/${p.skillSlug}/${p.slug}`;
                  }
                };
                
                return (
                  <g
                    key={`label-${teamIdx}-${year}-${idx}`}
                    className="project-label"
                    onClick={handleClick}
                    style={{ cursor: p.slug ? "pointer" : "default" }}
                  >
                    <rect
                      className="project-tooltip-bg"
                      x={posX - tooltipWidth / 2}
                      y={posY - cssVars.tooltipHeightMobile / 2 - cssVars.tooltipPaddingTop}
                      width={tooltipWidth}
                      height={cssVars.tooltipHeightMobile}
                      rx={cssVars.tooltipHeightMobile / 2}
                      ry={cssVars.tooltipHeightMobile / 2}
                      fill={cssVars.colorCircle}
                      stroke="none"
                      opacity={1}
                    />
                    <text
                      x={tx}
                      y={posY + 5}
                      fontSize={isMobile ? cssVars.projectLabelFontSizeMobile : cssVars.projectLabelFontSize}
                      fontFamily={cssVars.fontSans}
                      textAnchor="middle"
                      fill={cssVars.colorFg}
                      className="project-title"
                    >
                      {p.title}
                    </text>
                  </g>
                );
              });
            });
          }).flat()}
        </g>
      )}
    </svg>
  );
}
