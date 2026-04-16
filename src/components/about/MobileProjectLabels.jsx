import { useMemo } from "react";
import { useTimeline } from "./TimelineContext.jsx";

// Mobile-only: renders pill-shaped project labels as an overlay on top of dots.
export default function MobileProjectLabels() {
  const {
    cssVars,
    isMobile,
    uniqueTeams,
    projectsByTeam,
    yearToY,
    teamToX,
    projectStackY,
    projectLabelFontSize,
  } = useTimeline();

  const measureLabelWidth = useMemo(() => {
    if (!isMobile) return () => 0;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => 0;
    const cache = new Map();
    ctx.font = `${cssVars.projectLabelFontSizeMobile}px ${cssVars.fontSans}`;
    return (text = "") => {
      if (cache.has(text)) return cache.get(text);
      const baseWidth = ctx.measureText(text).width;
      const width = baseWidth + Math.max(0, text.length - 1) * 0.25;
      cache.set(text, width);
      return width;
    };
  }, [isMobile, cssVars.projectLabelFontSizeMobile, cssVars.fontSans]);

  const labelPadding = 18;

  return (
    <g className="project-labels-overlay">
      {uniqueTeams
        .map((teamName, teamIdx) => {
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
              const tooltipWidth =
                measureLabelWidth(p.title) + labelPadding * 2;

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
                    y={
                      posY -
                      cssVars.tooltipHeightMobile / 2 -
                      cssVars.tooltipPaddingTop
                    }
                    width={tooltipWidth}
                    height={cssVars.tooltipHeightMobile}
                    rx={cssVars.tooltipHeightMobile / 2}
                    ry={cssVars.tooltipHeightMobile / 2}
                    fill={cssVars.colorCircle}
                    stroke="none"
                    opacity={1}
                  />
                  <text
                    x={posX}
                    y={posY + 5}
                    fontSize={projectLabelFontSize}
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
        })
        .flat(2)}
    </g>
  );
}
