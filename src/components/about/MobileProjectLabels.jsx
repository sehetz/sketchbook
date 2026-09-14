import { useMemo } from "react";
import { useTimeline } from "./TimelineContext.jsx";
import { measureTextWidth } from "./timelineUtils.js";

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
    const font = `${cssVars.projectLabelFontSizeMobile}px ${cssVars.fontSans}`;
    return (text = "") =>
      measureTextWidth(text, font) + Math.max(0, text.length - 1) * 0.25;
  }, [isMobile, cssVars.projectLabelFontSizeMobile, cssVars.fontSans]);

  const labelPadding = cssVars.tooltipPadding;
  const safetyGap = cssVars.labelSafetyGapMobile;

  const labels = useMemo(() => {
    const collected = [];
    uniqueTeams.forEach((teamName, teamIdx) => {
      const teamProjects = projectsByTeam[teamName] || [];
      const projectsByYear = {};
      teamProjects.forEach((p) => {
        if (!projectsByYear[p.year]) projectsByYear[p.year] = [];
        projectsByYear[p.year].push(p);
      });

      Object.entries(projectsByYear).forEach(([year, projs]) => {
        const dotY = yearToY(parseInt(year, 10));
        const posX = teamToX(teamIdx, teamName);

        projs.forEach((p, idx) => {
          collected.push({
            key: `label-${teamIdx}-${year}-${idx}`,
            x: posX,
            y: dotY + idx * projectStackY,
            width: measureLabelWidth(p.title) + labelPadding * 2,
            title: p.title,
            slug: p.slug,
            skillSlug: p.skillSlug,
          });
        });
      });
    });

    // Labels have variable, text-based widths, so two labels can end up
    // closer than they look. Sweep top-to-bottom and push any label that
    // would come within `safetyGap` of an already-placed, horizontally
    // overlapping label further down — labels only ever dodge vertically.
    const sorted = [...collected].sort((a, b) => a.y - b.y);
    for (let i = 0; i < sorted.length; i++) {
      for (let j = 0; j < i; j++) {
        const a = sorted[j];
        const b = sorted[i];
        const horizontalOverlap =
          Math.abs(a.x - b.x) < a.width / 2 + b.width / 2 + safetyGap;
        if (!horizontalOverlap) continue;
        const minVerticalDistance = cssVars.tooltipHeightMobile + safetyGap;
        if (b.y - a.y < minVerticalDistance) {
          b.y = a.y + minVerticalDistance;
        }
      }
    }

    return sorted;
  }, [
    uniqueTeams,
    projectsByTeam,
    yearToY,
    teamToX,
    projectStackY,
    measureLabelWidth,
    labelPadding,
    safetyGap,
    cssVars.tooltipHeightMobile,
  ]);

  return (
    <g className="project-labels-overlay">
      {labels.map((label) => {
        const handleClick = (e) => {
          e.stopPropagation();
          if (label.slug && label.skillSlug) {
            window.location.href = `/skills/${label.skillSlug}/${label.slug}`;
          }
        };

        return (
          <g
            key={label.key}
            className="project-label"
            onClick={handleClick}
            style={{ cursor: label.slug ? "pointer" : "default" }}
          >
            <rect
              className="project-tooltip-bg"
              x={label.x - label.width / 2}
              y={
                label.y -
                cssVars.tooltipHeightMobile / 2 -
                cssVars.tooltipPaddingTopMobile
              }
              width={label.width}
              height={cssVars.tooltipHeightMobile}
              fill={cssVars.colorInteraction}
              stroke="none"
              opacity={1}
            />
            <text
              x={label.x}
              y={label.y + 5}
              fontSize={projectLabelFontSize}
              fontFamily={cssVars.fontSans}
              textAnchor="middle"
              fill={cssVars.colorFg}
              className="project-title"
            >
              {label.title}
            </text>
          </g>
        );
      })}
    </g>
  );
}
