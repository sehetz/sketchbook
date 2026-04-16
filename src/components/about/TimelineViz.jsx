import { useEffect, useState, useMemo } from "react";
import { useCSSVars } from "./useCSSVars.js";
import { useTimelineData } from "./useTimelineData.js";
import { TimelineContext } from "./TimelineContext.jsx";
import { parseCSSValueInPx } from "./timelineUtils.js";
import TeamGroup from "./TeamGroup.jsx";
import MobileTeamHeader from "./MobileTeamHeader.jsx";
import MobileProjectLabels from "./MobileProjectLabels.jsx";
import "./TimelineViz.css";

const SVG_WIDTH = 1000;

export default function TimelineViz() {
  const cssVars = useCSSVars();
  const { teams, minYear, maxYear, projects } = useTimelineData();
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredProjectId, setHoveredProjectId] = useState(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Layout
  const yearRange = maxYear - (minYear ?? maxYear);
  const mobileHeaderOffset = isMobile ? cssVars.mobileHeaderMargin : 0;
  const heightContent = yearRange * cssVars.yearSpacingDesktop;
  const height = cssVars.paddingTop + cssVars.paddingBottom + heightContent + mobileHeaderOffset;
  const teamsStartX = cssVars.teamsStartX;
  const plotWidth = SVG_WIDTH - cssVars.teamsEndXOffset - teamsStartX;
  const yearToY = (year) =>
    cssVars.paddingTop + mobileHeaderOffset + (maxYear - year) * cssVars.yearSpacingDesktop;

  const uniqueTeams = useMemo(() => [...new Set(teams.map((t) => t.team))], [teams]);

  const teamsWithProjects = useMemo(() => {
    if (!isMobile) return uniqueTeams;
    return uniqueTeams.filter((name) => projects.some((p) => p.team === name));
  }, [uniqueTeams, projects, isMobile]);

  const teamSpacing = Math.max(
    cssVars.teamsMinGap,
    (plotWidth || 1) / Math.max(1, teamsWithProjects.length)
  );

  const teamToX = (teamIndex, teamName = null) => {
    if (isMobile && teamName) {
      const filteredIndex = teamsWithProjects.indexOf(teamName);
      if (filteredIndex === -1) return 0;
      return teamsStartX + filteredIndex * teamSpacing + teamSpacing / 2;
    }
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

  // Responsive values
  const dotRadius = isMobile ? cssVars.dotRadiusMobile : cssVars.dotRadiusDesktop;
  const projectStackY = isMobile ? cssVars.projectStackYMobile : cssVars.projectStackY;
  const tooltipOffsetX = isMobile ? cssVars.tooltipOffsetXMobile : cssVars.tooltipOffsetX;
  const tooltipHeight = isMobile ? cssVars.tooltipHeightMobile : cssVars.tooltipHeight;
  const labelLineHeight = isMobile ? cssVars.labelLineHeightMobile : cssVars.labelLineHeight;
  const labelFontSize = isMobile ? cssVars.labelFontSizeMobile : cssVars.labelFontSize;
  const projectLabelFontSize = isMobile ? cssVars.projectLabelFontSizeMobile : cssVars.projectLabelFontSize;
  const labelFontWeight = isMobile ? cssVars.labelFontWeightMobile : cssVars.labelFontWeight;
  const yearFontSize = isMobile ? cssVars.yearFontSizeMobile : cssVars.yearFontSize;
  const lineDashArray = `${cssVars.lineDotSize} ${cssVars.lineDotGap}`;

  const contextValue = {
    cssVars,
    isMobile,
    teams,
    minYear,
    maxYear,
    projects,
    hoveredProjectId,
    setHoveredProjectId,
    yearToY,
    teamToX,
    uniqueTeams,
    teamsWithProjects,
    projectsByTeam,
    dotRadius,
    projectStackY,
    tooltipOffsetX,
    tooltipHeight,
    labelLineHeight,
    labelFontSize,
    projectLabelFontSize,
    labelFontWeight,
    yearFontSize,
    lineDashArray,
  };

  if (teams.length === 0) return null;

  return (
    <TimelineContext.Provider value={contextValue}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 ${-cssVars.paddingTop - 120} ${SVG_WIDTH} ${height + 240}`}
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

        {/* Year grid lines */}
        {Array.from({ length: yearRange + 1 }, (_, i) => {
          const year = maxYear - i;
          const y = yearToY(year);
          return (
            <line
              key={`grid-${year}`}
              x1={0}
              y1={y}
              x2={SVG_WIDTH}
              y2={y}
              stroke={cssVars.colorFg}
              strokeWidth={cssVars.lineStrokeWidth}
              strokeDasharray={lineDashArray}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        {/* Desktop: team groups (non-hovered first, hovered on top) */}
        {!isMobile && (
          <>
            {uniqueTeams.map((teamName, idx) => {
              if (hoveredProjectId?.startsWith(`${idx}-`)) return null;
              return <TeamGroup key={teamName} teamName={teamName} teamIdx={idx} />;
            })}
            {uniqueTeams.map((teamName, idx) => {
              if (!hoveredProjectId?.startsWith(`${idx}-`)) return null;
              return <TeamGroup key={teamName} teamName={teamName} teamIdx={idx} />;
            })}
          </>
        )}

        {/* Mobile: header + bars (non-hovered first, hovered on top) */}
        {isMobile && (
          <>
            <MobileTeamHeader />
            {uniqueTeams.map((teamName, idx) => {
              if (hoveredProjectId?.startsWith(`${idx}-`)) return null;
              return <TeamGroup key={teamName} teamName={teamName} teamIdx={idx} hideLabel />;
            })}
            {uniqueTeams.map((teamName, idx) => {
              if (!hoveredProjectId?.startsWith(`${idx}-`)) return null;
              return <TeamGroup key={`hov-${teamName}`} teamName={teamName} teamIdx={idx} hideLabel />;
            })}
          </>
        )}

        {/* Year labels */}
        {Array.from({ length: yearRange + 1 }, (_, i) => {
          const year = maxYear - i;
          const y = yearToY(year);
          const yearPaddingLeft = isMobile
            ? parseCSSValueInPx("--timeline-year-padding-left-mobile")
            : parseCSSValueInPx("--timeline-year-padding-left-desktop");
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

        {/* Mobile project label overlay */}
        {isMobile && <MobileProjectLabels />}
      </svg>
    </TimelineContext.Provider>
  );
}
