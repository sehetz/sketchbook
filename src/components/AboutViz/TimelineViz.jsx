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
  },

  // 🏷 PROJECT LABELS (Projekt-Namen/Titel in Tooltips)
  projectLabels: {
    fontSizeDesktop: 12,     // Font size on desktop
    fontSizeMobile: 11,      // Font size on mobile
    fontWeight: 700,         // Font weight (400-900)
    bgPadding: 8,            // Padding inside tooltip background
    bgHeight: 24,            // Height of tooltip background rect
    paddingTop: 0,           // Padding above tooltip background
    offsetX: 24,             // Horizontal distance from dot to label
    offsetXMobile: 12,       // Horizontal distance from dot to label on mobile
  },

  // 🔤 FONT SIZES (typography) – OTHER
  fonts: {
    yearDesktop: 24,     // Year label size
    yearMobile: 20,      // Year label size mobile (if needed)
    labelDesktop: 12,    // Team label font size
    labelMobile: 11,     // Team label font size mobile
  },

  // 📏 SPACING & DIMENSIONS
  spacing: {
    padding: { top: 80, right: 96, bottom: 40, left: 24 },
    yearSpacingDesktop: 96,    // Vertical distance between years
    yearSpacingMobile: 120,      // Vertical distance between years on mobile
    projectStackY: 24,          // Vertical stacking distance between multiple project dots per year
    projectStackYMobile: 16,    // Vertical stacking distance on mobile
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
    lineHeight: 14,        // Line height between team name lines
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
  const height = TWEAK.spacing.padding.top + TWEAK.spacing.padding.bottom + (yearRange * TWEAK.spacing.yearSpacingDesktop);
  const teamsStartX = TWEAK.teamsStartX;
  const teamsEndX = width - TWEAK.teamsEndXOffset;
  const plotWidth = teamsEndX - teamsStartX;
  const yearToY = (year) => TWEAK.spacing.padding.top + ((maxYear - year) * TWEAK.spacing.yearSpacingDesktop);

  // Memoized computed data
  const uniqueTeams = useMemo(() => [...new Set(teams.map((t) => t.team))], [teams]);
  const teamSpacing = Math.max(TWEAK.teamsMinGap, (plotWidth || 1) / Math.max(1, uniqueTeams.length));
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
  const yearSpacingD = isMobile ? TWEAK.spacing.yearSpacingMobile : TWEAK.spacing.yearSpacingDesktop;
  const projectStackYD = isMobile ? TWEAK.spacing.projectStackYMobile : TWEAK.spacing.projectStackY;
  const projectDotRadiusD = isMobile ? TWEAK.dots.radiusMobile : TWEAK.dots.radiusDesktop;
  const lineDashArrayD = isMobile ? TWEAK.lines.dashArrayMobile : TWEAK.lines.dashArrayDesktop;
  const tooltipOffsetXD = isMobile ? TWEAK.projectLabels.offsetXMobile : TWEAK.projectLabels.offsetX;

  if (teams.length === 0) return null;

  // ---------- Inner SVG components ----------

  function ProjectTooltip({ x, y, title, colors }) {
    const tooltipWidth = Math.max(80, Math.min(220, title.length * 7 + TWEAK.projectLabels.bgPadding * 2));
    return (
      <rect
        className="project-tooltip-bg"
        x={x}
        y={y - TWEAK.projectLabels.bgHeight / 2 - TWEAK.projectLabels.paddingTop}
        width={tooltipWidth}
        height={TWEAK.projectLabels.bgHeight}
        rx={TWEAK.projectLabels.bgHeight / 2}
        ry={TWEAK.projectLabels.bgHeight / 2}
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
        <ProjectTooltip x={tx} y={y} title={title} colors={colors} />
        <text
          x={tx + TWEAK.projectLabels.bgPadding}
          y={y - TWEAK.projectLabels.paddingTop + 5}
          fontSize={isMobile ? TWEAK.projectLabels.fontSizeMobile : TWEAK.projectLabels.fontSizeDesktop}
          fontFamily="SF Pro Rounded"
          fontWeight={TWEAK.projectLabels.fontWeight}
          textAnchor="start"
          fill={colors.projectLabelText}
          className="project-title"
          style={{ pointerEvents: "none" }}
        >
          {title}
        </text>
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
      const projectId = `${teamIdx}-${teamToX(teamIdx)}-${posY}-${p.title}`;
      if (hoveredProjectId === projectId) {
        hoveredDot = <ProjectDot key={`sec-${sIdx}`} x={teamToX(teamIdx)} y={posY} title={p.title} teamIdx={teamIdx} slug={p.slug} skillSlug={p.skillSlug} />;
      } else {
        dots.push(<ProjectDot key={`sec-${sIdx}`} x={teamToX(teamIdx)} y={posY} title={p.title} teamIdx={teamIdx} slug={p.slug} skillSlug={p.skillSlug} />);
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
          fontFamily="SF Pro Rounded"
          fontWeight="900"
          textAnchor="middle"
          fill={colors.text}
          className="team-label"
          style={{ pointerEvents: "none" }}
        >
          {teamName.split(" ").map((w, idx) => (
            <tspan key={idx} x={x} dy={idx === 0 ? 0 : TWEAK.labels.lineHeight}>
              {w}
            </tspan>
          ))}
          {firstBar.role &&
            firstBar.role.split(" ").map((rw, rIdx) => (
              <tspan
                key={`role-${rIdx}`}
                x={x}
                dy={TWEAK.labels.lineHeight}
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
            fontFamily="SF Pro Rounded"
            letterSpacing={`${TWEAK.yearLetterSpacing}px`}
            textAnchor="start"
            fill={colors.text}
          >
            {year}
          </text>
        );
      })}

      {/* Team groups (bars + dots + labels) – FOREGROUND */}
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
    </svg>
  );
}
