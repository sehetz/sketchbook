import { useEffect, useState, useMemo } from "react";
import { timeline_fetch } from "../../utils/timelineHelpers.js";
import "./TimelineViz.css";

// ============================================
// TimelineViz.jsx – SVG-based Team Timeline
// ============================================

// 🎨 TWEAKABLE VALUES – All design constants in one place
// These are LOCAL to this component. Adjust here without affecting global tokens.

const TWEAK_LIGHT = {
  // 🎨 COLORS (Light Mode)
  text: "#121212",                // Year labels, team names, project titles
  line: "#121212",                // Dotted grid lines
  circle: "#EFEFEF",              // Link circles
  gradientStart: "#DBDBDB",       // Bar gradient top
  gradientEnd: "#F6F6F6",         // Bar gradient bottom
  tooltipBg: "#ffffff",           // Tooltip background (will be updated by component)
  tooltipStroke: "none",          // Tooltip border
  tooltipOpacity: 1,              // Tooltip opacity on hover
  projectLabelText: "#121212",    // Project label text color (dark on light background)
};

const TWEAK_DARK = {
  // 🎨 COLORS (Dark Mode)
  text: "#ffffff",                // Year labels, team names, project titles
  line: "#ffffff",                // Dotted grid lines
  circle: "#3a3a3a",              // Link circles
  gradientStart: "#2a2a2a",       // Bar gradient top
  gradientEnd: "#1f1f1f",         // Bar gradient bottom
  tooltipBg: "#121212",           // Tooltip background (black for dark mode)
  tooltipStroke: "none",          // Tooltip border
  tooltipOpacity: 1,              // Tooltip opacity on hover
  projectLabelText: "#ffffff",    // Project label text color (white, visible on black)
};

const TWEAK = {
  // 📊 DOT SIZES
  dots: {
    radiusDesktop: 4,    // Project dot size on desktop
    radiusMobile: 2,     // Project dot size on mobile
    hitAreaRadius: 14,   // Invisible hit area for better clickability
    spacingMobile: 20,   // Horizontal spacing between dots on mobile
  },

  // 🏷 PROJECT LABELS (Projekt-Namen/Titel in Tooltips)
  projectLabels: {
    fontSizeDesktop: 12,     // Font size on desktop
    fontSizeMobile: 32,      // Font size on mobile
    bgPadding: 8,            // Padding inside tooltip background
    bgHeight: 24,            // Height of tooltip background rect on desktop
    bgHeightMobile: 52,      // Height of tooltip background rect on mobile (increased)
    paddingTop: 6,           // Padding above tooltip background
    offsetX: 24,             // Horizontal distance from dot to label
    offsetXMobile: 12,       // Horizontal distance from dot to label on mobile
  },

  // 🔤 FONT SIZES (typography) – OTHER
  fonts: {
    yearDesktop: 24,     // Year label size
    yearMobile: 20,      // Year label size mobile (if needed)
    labelDesktop: 12,    // Team label font size
    labelMobile: 24,     // Team label font size mobile
  },

  // 📏 SPACING & DIMENSIONS
  spacing: {
    padding: { top: 120, right: 96, bottom: 60, left: 24 },
    yearSpacingDesktop: 96,    // Vertical distance between years
    yearSpacingMobile: 120,      // Vertical distance between years on mobile
    projectStackY: 24,          // Vertical stacking distance between multiple project dots per year
    projectStackYMobile: 64,    // Vertical stacking distance on mobile (more space)
    projectStackX: 0,           // Horizontal stacking distance between dots (desktop - no offset)
    projectStackXMobile: 0,     // Horizontal stacking distance on mobile - no offset, only vertical
    projectVerticalMargin: 16,  // Vertical margin above and below dots from year lines
    mobileHeaderBottomMargin: 64, // Margin below mobile team header
  },

  // 📐 BAR STYLING
  bars: {
    widthDesign: 32,        // Design work bar width
    widthNondesign: 12,     // Non-design work bar width
    radiusDesign: 18,       // Border radius for design bars
    radiusNondesign: 8,     // Border radius for non-design bars
    overshoot: 12,          // Extra padding above/below bars
  },

  // 🔗 LINK CIRCLES
  circles: {
    radiusDesign: 28,          // Circle size for design work
    radiusNondesign: 12,       // Circle size for non-design work
    offsetDesign: 32,          // Distance above bar for design circles
    offsetNondesign: 32,       // Distance above bar for non-design circles
  },

  // 🎯 TEAM LABELS
  labels: {
    offsetAboveBar: 32,    // Distance above bar to show team name
    lineHeight: 14,        // Line height between team name lines (desktop)
    lineHeightMobile: 24,  // Line height between team name lines (mobile)
  },

  // 📊 GRID LINES
  lines: {
    strokeWidth: 3,        // Width of dotted grid lines
    dashArrayDesktop: "0.1 8",  // Dash pattern on desktop
    dashArrayMobile: "0.1 4",   // Dash pattern on mobile
  },

  // 📐 SVG LAYOUT
  svgWidth: 1000,          // SVG viewBox width
  teamsMinGap: 12,         // Minimum gap between teams
  teamsStartX: 96,         // Left edge of team plotting area
  teamsEndXOffset: 96,     // Right edge offset

  // 🔤 YEAR LABEL LETTER SPACING
  yearLetterSpacing: 0.12,  // Letter spacing for year labels
  letterSpacingMobile: 1.0, // Extra letter spacing for all text on mobile
};

export default function TimelineViz() {
  const [teams, setTeams] = useState([]);
  const [minYear, setMinYear] = useState(null);
  const [maxYear, setMaxYear] = useState(new Date().getFullYear());
  const [projects, setProjects] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredProjectId, setHoveredProjectId] = useState(null);
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Create colors object from theme constants
  const colors = useMemo(() => {
    return isDark ? TWEAK_DARK : TWEAK_LIGHT;
  }, [isDark]);

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
  const width = TWEAK.svgWidth;
  const mobileHeaderOffset = isMobile ? TWEAK.spacing.mobileHeaderBottomMargin : 0;
  const height = TWEAK.spacing.padding.top + TWEAK.spacing.padding.bottom + (yearRange * TWEAK.spacing.yearSpacingDesktop) + mobileHeaderOffset;
  const teamsStartX = TWEAK.teamsStartX;
  const teamsEndX = width - TWEAK.teamsEndXOffset;
  const plotWidth = teamsEndX - teamsStartX;
  const yearToY = (year) => TWEAK.spacing.padding.top + mobileHeaderOffset + ((maxYear - year) * TWEAK.spacing.yearSpacingDesktop);

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
  
  const teamSpacing = Math.max(TWEAK.teamsMinGap, (plotWidth || 1) / Math.max(1, teamsWithProjects.length));
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
  const yearSpacingD = isMobile ? TWEAK.spacing.yearSpacingMobile : TWEAK.spacing.yearSpacingDesktop;
  const projectStackYD = isMobile ? TWEAK.spacing.projectStackYMobile : TWEAK.spacing.projectStackY;
  const projectStackXD = isMobile ? TWEAK.spacing.projectStackXMobile : TWEAK.spacing.projectStackX;
  const projectDotRadiusD = isMobile ? TWEAK.dots.radiusMobile : TWEAK.dots.radiusDesktop;
  const lineDashArrayD = isMobile ? TWEAK.lines.dashArrayMobile : TWEAK.lines.dashArrayDesktop;
  const tooltipOffsetXD = isMobile ? TWEAK.projectLabels.offsetXMobile : TWEAK.projectLabels.offsetX;
  const labelLineHeight = isMobile ? TWEAK.labels.lineHeightMobile : TWEAK.labels.lineHeight;
  const letterSpacingMobile = `${TWEAK.letterSpacingMobile}px`;
  const letterSpacingD = isMobile ? letterSpacingMobile : undefined;
  const yearLetterSpacingD = isMobile ? letterSpacingMobile : `${TWEAK.yearLetterSpacing}px`;
  const teamLabelWeight = isMobile ? "400" : "800";

  // Measure mobile label width to keep exact padding (8px per side)
  const measureMobileLabelWidth = useMemo(() => {
    if (!isMobile) return () => 0;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => 0;
    const cache = new Map();
    const fontSize = TWEAK.projectLabels.fontSizeMobile;
    const letterSpacing = TWEAK.letterSpacingMobile;
    ctx.font = `${fontSize}px SF Pro Rounded`;
    return (text = "") => {
      if (cache.has(text)) return cache.get(text);
      const baseWidth = ctx.measureText(text).width;
      const width = baseWidth + Math.max(0, text.length - 1) * letterSpacing;
      cache.set(text, width);
      return width;
    };
  }, [isMobile]);

  if (teams.length === 0) return null;

  // ---------- Inner SVG components ----------

  function ProjectTooltip({ x, y, title, colors }) {
    const tooltipWidth = Math.max(80, Math.min(220, title.length * 7 + TWEAK.projectLabels.bgPadding * 2));
    const bgHeightD = isMobile ? TWEAK.projectLabels.bgHeightMobile : TWEAK.projectLabels.bgHeight;
    return (
      <rect
        className="project-tooltip-bg"
        x={x}
        y={y - bgHeightD / 2 - TWEAK.projectLabels.paddingTop}
        width={tooltipWidth}
        height={bgHeightD}
        rx={bgHeightD / 2}
        ry={bgHeightD / 2}
        fill={colors.tooltipBg}
        stroke={colors.tooltipStroke}
        opacity={colors.tooltipOpacity}
      />
    );
  }

  function ProjectDot({ x, y, title, teamIdx, slug, skillSlug }) {
    const tx = x + tooltipOffsetXD - TWEAK.projectLabels.bgPadding;
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
          r={TWEAK.dots.hitAreaRadius}
          fill="transparent"
          className="project-dot-hit"
        />
        <circle cx={x} cy={y} r={projectDotRadiusD} fill={colors.text} className="project-dot" />
        {/* Only render tooltip on desktop (on mobile it's in the overlay) */}
        {!isMobile && (
          <>
            <ProjectTooltip x={tx} y={y} title={title} colors={colors} />
            <text
              x={tx + TWEAK.projectLabels.bgPadding}
              y={y - TWEAK.projectLabels.paddingTop + 5}
              fontSize={isMobile ? TWEAK.projectLabels.fontSizeMobile : TWEAK.projectLabels.fontSizeDesktop}
              fontFamily="'SF Pro Rounded', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
              fontWeight={TWEAK.projectLabels.fontWeight}
              textAnchor="start"
              fill={colors.projectLabelText}
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
      const posY = dotY + (sIdx + 1) * projectStackYD;
      const posX = teamToX(teamIdx) + (sIdx + 1) * projectStackXD;
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
    const labelY = barTopY - TWEAK.bars.overshoot - TWEAK.labels.offsetAboveBar;
    const circleOffset = firstBar.designWork ? TWEAK.circles.offsetDesign : TWEAK.circles.offsetNondesign;
    const circleY = labelY + circleOffset;
    const hasLink = Boolean(firstBar.link);
    const circleRadius = firstBar.designWork ? TWEAK.circles.radiusDesign : TWEAK.circles.radiusNondesign;

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
              fill={colors.circle}
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
          const barWidth = t.designWork ? TWEAK.bars.widthDesign : TWEAK.bars.widthNondesign;
          const barRadius = t.designWork ? TWEAK.bars.radiusDesign : TWEAK.bars.radiusNondesign;
          return (
            <rect
              key={`bar-${teamIdx}-${i}`}
              x={x - barWidth / 2}
              y={Math.min(startY, endY) - TWEAK.bars.overshoot}
              width={barWidth}
              height={barHeight + TWEAK.bars.overshoot * 2}
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
          fontSize={isMobile ? TWEAK.fonts.labelMobile : TWEAK.fonts.labelDesktop}
          fontFamily="'SF Pro Rounded', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          fontWeight={teamLabelWeight}
          textAnchor="middle"
          fill={colors.text}
          className="team-label"
          letterSpacing={letterSpacingD}
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
                fontSize={isMobile ? TWEAK.fonts.labelMobile : TWEAK.fonts.labelDesktop}
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
            <stop offset="0%" stopColor={colors.gradientStart} />
            <stop offset="100%" stopColor={colors.gradientEnd} />
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
            stroke={colors.line}
            strokeWidth={TWEAK.lines.strokeWidth}
            strokeDasharray={lineDashArrayD}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}

      {/* Year labels – BACKGROUND */}
      {Array.from({ length: yearRange + 1 }, (_, i) => {
        const year = maxYear - i;
        const y = yearToY(year);
        return (
          <text
            key={`year-${year}`}
            x={TWEAK.spacing.padding.left}
            y={y - TWEAK.spacing.yearSpacingDesktop / 5}
            fontSize={isMobile ? TWEAK.fonts.yearMobile : TWEAK.fonts.yearDesktop}
            fontFamily="'SF Pro Rounded', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            letterSpacing={yearLetterSpacingD}
            textAnchor="start"
            fill={colors.text}
          >
            {year}
          </text>
        );
      })}

      {/* Team groups (bars + dots + labels) – FOREGROUND */}
      {/* On desktop: render teams normally with circles positioned above bars */}
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
          <g className="team-header-mobile" style={{ transform: `translateY(0)` }}>
            {uniqueTeams.map((teamName, teamIdx) => {
              const teamData = teams.filter((t) => t.team === teamName);
              const teamProjects = projectsByTeam[teamName] || [];
              // Skip teams without projects on mobile
              if (teamProjects.length === 0) return null;
              if (!teamData.length) return null;
              
              const firstBar = teamData[0];
              const hasLink = Boolean(firstBar.link);
              const circleRadius = firstBar.designWork ? TWEAK.circles.radiusDesign : TWEAK.circles.radiusNondesign;
              const x = teamToX(teamIdx, teamName);
              const headerY = 100; // Fixed position at top (more space)
              
              return (
                <g key={`header-${teamIdx}`}>
                  {/* Circle (if has link) */}
                  {hasLink && (
                    <a href={firstBar.link} target="_blank" rel="noopener noreferrer">
                      <circle
                        cx={x}
                        cy={headerY}
                        r={circleRadius}
                        fill={colors.circle}
                        className="team-circle"
                        style={{ cursor: "pointer" }}
                      />
                    </a>
                  )}
                  
                  {/* Team label */}
                  <text
                    x={x}
                    y={headerY - 12}
                    fontSize={TWEAK.fonts.labelMobile}
                    fontFamily="'SF Pro Rounded', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    fontWeight={teamLabelWeight}
                    textAnchor="middle"
                    fill={colors.text}
                    className="team-label"
                    letterSpacing={letterSpacingMobile}
                    style={{ pointerEvents: "none" }}
                  >
                    {teamName.split(" ").map((w, idx) => (
                      <tspan key={idx} x={x} dy={idx === 0 ? 0 : labelLineHeight}>
                        {w}
                      </tspan>
                    ))}
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
                  const barWidth = t.designWork ? TWEAK.bars.widthDesign : TWEAK.bars.widthNondesign;
                  const barRadius = t.designWork ? TWEAK.bars.radiusDesign : TWEAK.bars.radiusNondesign;
                  return (
                    <rect
                      key={`bar-${idx}-${i}`}
                      x={x - barWidth / 2}
                      y={Math.min(startY, endY) - TWEAK.bars.overshoot}
                      width={barWidth}
                      height={barHeight + TWEAK.bars.overshoot * 2}
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
                  const barWidth = t.designWork ? TWEAK.bars.widthDesign : TWEAK.bars.widthNondesign;
                  const barRadius = t.designWork ? TWEAK.bars.radiusDesign : TWEAK.bars.radiusNondesign;
                  return (
                    <rect
                      key={`bar-${idx}-${i}`}
                      x={x - barWidth / 2}
                      y={Math.min(startY, endY) - TWEAK.bars.overshoot}
                      width={barWidth}
                      height={barHeight + TWEAK.bars.overshoot * 2}
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
                const posY = dotY + idx * projectStackYD;
                const tx = posX; // Center the label on the team column
                const labelPadding = 16;
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
                      y={posY - TWEAK.projectLabels.bgHeightMobile / 2 - TWEAK.projectLabels.paddingTop}
                      width={tooltipWidth}
                      height={TWEAK.projectLabels.bgHeightMobile}
                      rx={TWEAK.projectLabels.bgHeightMobile / 2}
                      ry={TWEAK.projectLabels.bgHeightMobile / 2}
                      fill={colors.circle}
                      stroke={colors.tooltipStroke}
                      opacity={colors.tooltipOpacity}
                    />
                    <text
                      x={tx}
                      y={posY + 5}
                      fontSize={TWEAK.projectLabels.fontSizeMobile}
                      fontFamily="'SF Pro Rounded', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      textAnchor="middle"
                      fill={colors.projectLabelText}
                      className="project-title"
                      letterSpacing={letterSpacingMobile}
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
