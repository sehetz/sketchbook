import { useTimeline } from "./TimelineContext.jsx";

function ProjectTooltip({ x, y, title }) {
  const { cssVars, tooltipHeight } = useTimeline();
  const tooltipWidth = Math.max(
    80,
    Math.min(220, title.length * 7 + cssVars.tooltipPadding * 2),
  );
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

export default function ProjectDot({ x, y, title, teamIdx, slug, skillSlug }) {
  const {
    cssVars,
    isMobile,
    dotRadius,
    tooltipOffsetX,
    hoveredProjectId,
    setHoveredProjectId,
  } = useTimeline();

  const projectId = `${teamIdx}-${x}-${y}-${title}`;
  const tx = x + tooltipOffsetX - cssVars.tooltipPadding;

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
        fill={cssVars.colorFg}
        className="project-dot"
      />
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
