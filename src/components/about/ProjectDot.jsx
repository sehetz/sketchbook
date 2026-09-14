import { useTimeline } from "./TimelineContext.jsx";
import { measureTextWidth } from "./timelineUtils.js";

function ProjectTooltip({ x, y, title }) {
  const { cssVars, tooltipHeight } = useTimeline();
  const font = `${cssVars.projectLabelFontSize}px ${cssVars.fontSans}`;
  const tooltipWidth = measureTextWidth(title, font) + cssVars.tooltipPadding * 1;
  return (
    <rect
      className="project-tooltip-bg"
      x={x - tooltipWidth / 2}
      y={y - tooltipHeight / 2 - cssVars.tooltipPaddingTop}
      width={tooltipWidth}
      height={tooltipHeight}
      fill={cssVars.colorInteraction}
      stroke="none"
    />
  );
}

export default function ProjectDot({ x, y, title, teamIdx, slug, skillSlug }) {
  const {
    cssVars,
    isMobile,
    dotRadius,
    hoveredProjectId,
    setHoveredProjectId,
  } = useTimeline();

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
      <circle
        cx={x}
        cy={y}
        r={dotRadius}
        fill={cssVars.colorDot}
        className="project-dot"
      />
      {!isMobile && (
        <>
          <ProjectTooltip x={x} y={y} title={title} />
          <text
            x={x}
            y={y - cssVars.tooltipPaddingTop + 5}
            fontSize={cssVars.projectLabelFontSize}
            fontFamily={cssVars.fontSans}
            textAnchor="middle"
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
