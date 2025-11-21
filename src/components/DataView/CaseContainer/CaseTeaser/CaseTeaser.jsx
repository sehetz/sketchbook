// ============================================
// CaseTeaser.jsx – Project-Level Collapsible
// ============================================

import { useRef, useEffect } from "react";

export default function CaseTeaser({
  project,
  index,
  isOpen,
  skillIsOpen,
  onToggle,
  type // ⭐ ensure parent passes current filter type
}) {
  const caseLineRef = useRef(null);

  // ⭐ Extract first related gear & team (if present)
  const firstGear =
    project["nc_3zu8___nc_m2m_nc_3zu8__Projec_Gears"]?.[0]?.Gear?.Gear || "";
  const firstTeam =
    project["nc_3zu8___nc_m2m_nc_3zu8__Projec_Teams"]?.[0]?.Teams?.Team || "";

  // ⭐ Extract first skill name (for skills view)
  const firstSkill =
    project["nc_3zu8___nc_m2m_nc_3zu8__Projec_Skills"]?.[0]?.Skills?.Skill || "";

  // ⭐ Scroll AFTER opening (minimal perceptible delay)
  useEffect(() => {
    if (isOpen && caseLineRef.current) {
      // Only scroll when OPENING (transitioning from closed to open)
      const timer = setTimeout(() => {
        const rect = caseLineRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = rect.top + scrollTop;

        window.scrollTo({ top: targetY, behavior: "smooth" });
      }, 120); // ⭐ Minimal delay (~1/3 of transition) – kaum spürbar

      return () => clearTimeout(timer);
    }
  }, [isOpen, project.Title]); // ⭐ Re-trigger wenn isOpen wechselt

  const handleToggle = () => {
    onToggle(); // Just toggle - closing happens automatically
  };

  return (
    <div className="case-teaser">
      <div
        ref={caseLineRef}
        className={`case-line ${isOpen ? "case-line--open" : index > 0 ? "border-top-dotted" : ""} ${
          !skillIsOpen ? "case-line--hidden" : ""
        }`}
        onClick={handleToggle}
      >
        {type === "skills" ? (
          <div className="flex w-full  gap-6">
            <div className="flex-1 axis-left text-1">{project.Title}</div>
            <div className="flex-1 axis-center text-1 case-line__gear">{firstGear}</div>
            <div className="flex-1 axis-right text-1 case-line__team">{firstTeam}</div>
          </div>
        ) : (
          <div className="text-1">{project.Title}</div>
        )}
      </div>

      <div className={`teaser-wipe ${isOpen ? "open" : ""}`}>
        <div className="flex gap-6 p-6-all">
          <div className="flex-1 pr-8 text-2">{project["description"]}</div>

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
