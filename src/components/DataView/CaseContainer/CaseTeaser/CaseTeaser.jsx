// ============================================
// CaseTeaser.jsx – Project-Level Collapsible
// ============================================

export default function CaseTeaser({
  project,
  index,
  isOpen,
  skillIsOpen,
  onToggle
}) {
  return (
    <div className="case-teaser">
      <div
        className={`case-line border-top-dotted ${isOpen ? "case-line--open" : ""} ${!skillIsOpen ? "case-line--hidden" : ""}`}
        onClick={onToggle}
      >
        <div className="text-1">{project.Title}</div>
      </div>

      <div className={`teaser-wipe ${isOpen ? "open" : ""}`}>
        <div className="flex gap-6 p-6-all">
          <div className="flex-1 pr-8 text-2">
            {project["description"]}
          </div>

          {isOpen ? (
            project.teaserVideo ? (
              <video
                src={project.teaserVideo}
                className="teaser__image"
                autoPlay
                loop
                muted
                playsInline
                preload="none"
              />
            ) : project.teaserImage ? (
              <img
                src={project.teaserImage}
                alt={project.Title}
                className="teaser__image"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="teaser__image placeholder" />
            )
          ) : (
            <div className="teaser__image placeholder" />
          )}
        </div>
      </div>
    </div>
  );
}
