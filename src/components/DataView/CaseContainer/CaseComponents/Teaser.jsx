/**
 * Teaser.jsx – Unified Teaser Component
 * 
 * A versatile, single-source-of-truth component that handles all teaser types
 * used throughout the data visualization. By consolidating three previously
 * separate components (CaseTeaser, GearTeaser, TeamTeaser) into one, we achieve:
 * 
 * • Reduced code duplication and maintenance burden
 * • Consistent styling and behavior patterns
 * • Easy to extend with new teaser variants
 * • Clear separation of rendering logic by type
 * 
 * TEASER TYPES:
 * 
 * 1. "case" – Project-Level Collapsible (Skills View)
 *    - Displays project title with toggle interaction
 *    - Shows first gear & team metadata in multi-column layout
 *    - Expands to reveal description, CTA button, and media (video/image/iframe)
 *    - Auto-scrolls to position when opening
 *    - Supports multiple media types: teaserEmbedUrl, teaserVideoFile, teaserImageFile
 * 
 * 2. "gear" – Gear-Level Body Teaser
 *    - Static (non-interactive) presentation
 *    - Fixed 3:4 aspect ratio image with centered layout
 *    - Description text in right column
 *    - Used as "header" before listing projects related to that gear
 * 
 * 3. "team" – Team-Level Body Teaser
 *    - Static (non-interactive) presentation
 *    - Flexible layout with image and right-aligned text
 *    - Similar to gear teaser but different proportions
 *    - Used as "header" before listing projects related to that team
 */

import { useRef, useEffect } from "react";
import MasterMediaImage from "../../../media/MasterMediaImage.jsx";
import ButtonText2 from "../../../media/ButtonText2.jsx";
import { resolveMediaPath } from "../../../../utils/project.js";

/**
 * Main Teaser Component
 * 
 * @param {string} type – Teaser variant: "case" | "gear" | "team"
 * @param {Object} data – Content object (project, gear, or team entity)
 * @param {number} index – Position in list (used for lazy-loading priority)
 * @param {boolean} isOpen – Whether case teaser is expanded (case type only)
 * @param {boolean} skillIsOpen – Whether parent skill group is visible (case type only)
 * @param {Function} onToggle – Callback when user clicks to toggle (case type only)
 * @param {string} filterType – Current filter context ("skills" | "gears" | "teams")
 */
export default function Teaser({
  type = "case", // "case" | "gear" | "team"
  data, // project, gear, or team object
  index,
  isOpen,
  skillIsOpen,
  onToggle,
  filterType, // for determining layout (e.g., "skills" vs. "gear")
}) {
  const caseLineRef = useRef(null);
  const NOCO_BASE_URL = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";

  // ============================================================
  // CASE TYPE: Project-Level Collapsible (Skills View)
  // ============================================================
  // This is the primary interactive teaser used in the skills view.
  // Each skill group contains multiple projects, each with their own
  // expandable case teaser that reveals full details on click.
  // ============================================================
  if (type === "case") {
    const project = data;
    if (!project) return null;

    // Extract CTA (Call-To-Action) from markdown-formatted field
    // Expected format: "[Button Text](https://url.com)"
    // Fallback to plain text if regex doesn't match
    const callToActionData = project["call_to_action"] || "";
    let ctaText = null;
    let ctaHref = null;

    if (callToActionData) {
      const match = callToActionData.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        ctaText = match[1];
        ctaHref = match[2];
      } else {
        ctaText = callToActionData;
      }
    }

    // Extract related metadata: first gear and first team names
    // These appear in the collapsed title row for quick context
    const firstGear =
      project["_nc_m2m_sehetz_gears"]?.[0]?.gear?.Gear || "";
    const firstTeam =
      project["_nc_m2m_sehetz_teams"]?.[0]?.team?.Team || "";

    // Auto-scroll case into view when opened
    // Minimal 120ms delay (~1/3 of CSS transition) ensures smooth perception
    useEffect(() => {
      if (isOpen && caseLineRef.current) {
        const timer = setTimeout(() => {
          const rect = caseLineRef.current.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const targetY = rect.top + scrollTop;

          window.scrollTo({ top: targetY, behavior: "smooth" });
        }, 120);

        return () => clearTimeout(timer);
      }
    }, [isOpen, project.Title]);

    const handleToggle = () => {
      onToggle(index);
    };

    // Resolve video source path (prefers local manifest, falls back to remote NocoDB)
    // This ensures fast loading from build-time manifest when available
    const getVideoSrc = () => {
      if (!project.teaserVideoFile) return null;
      const filename = project.teaserVideoFile.name || project.teaserVideoFile.title;
      if (filename) return resolveMediaPath(filename);
      const remotePath = project.teaserVideoFile.signedPath || project.teaserVideoFile.path;
      return remotePath ? `${NOCO_BASE_URL}/${remotePath}` : null;
    };
    const videoSrc = getVideoSrc();

    return (
      <div className="case-teaser">
        {/* CASE TITLE BAR – always visible, toggles expansion */}
        <div
          ref={caseLineRef}
          className={`case-line ${isOpen ? "case-line--open" : ""} ${index > 0 ? "border-top-dotted" : ""} ${
            !skillIsOpen ? "case-line--hidden" : ""
          }`}
          onClick={handleToggle}
        >
          {/* Multi-column layout when in skills filter view */}
          {filterType === "skills" ? (
            <div className="flex w-full gap-6">
              <div className="flex-1 axis-left text-1 case-line__title">{project.Title}</div>
              <div className="flex-1 axis-center text-1 case-line__gear">{firstGear}</div>
              <div className="flex-1 axis-right text-1 case-line__team">{firstTeam}</div>
            </div>
          ) : (
            <div className="text-1 case-line__title">{project.Title}</div>
          )}
        </div>

        {/* EXPANDABLE CONTENT – slides open/closed with animation */}
        <div className={`teaser-wipe ${isOpen ? "open" : ""}`}>
          <div className="flex gap-16 p-6">
            {/* LEFT COLUMN: Description & CTA Button */}
            <div className="flex-col flex-1">
              <div className="pr-8 text-2">{project["description"]}</div>
              
              {/* CTA Button – renders only if both text and href exist */}
              {ctaText && ctaHref && (
                <div className="mt-6">
                  <ButtonText2 text={ctaText} href={ctaHref} />
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Media (video/image/iframe) or placeholder */}
            {isOpen ? (
              project.teaserEmbedUrl ? (
                // Priority 1: External embed (e.g., Figma, Miro)
                <iframe
                  src={project.teaserEmbedUrl}
                  className={`teaser__iframe${project.teaserEmbedRatio === "16x9" ? " teaser__iframe--wide" : " teaser__image"}`}
                  title={project.Title}
                  loading="lazy"
                />
              ) : project.teaserVideoFile ? (
                // Priority 2: Local/remote video file
                <video
                  src={videoSrc}
                  className="teaser__image"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : project.teaserImageFile ? (
                // Priority 3: Local/remote image file
                <MasterMediaImage
                  file={project.teaserImageFile}
                  alt={project.Title}
                  className="teaser__image"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              ) : (
                // Fallback: empty placeholder maintains layout
                <div className="teaser__image placeholder" />
              )
            ) : (
              // When closed: always show placeholder (prevents layout shift)
              <div className="teaser__image placeholder" />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // GEAR TYPE: Static Body Teaser
  // ============================================================
  // Displays as header before project list for that gear.
  // Fixed 3:4 aspect ratio, image-heavy layout.
  // ============================================================
  if (type === "gear") {
    const gear = data;
    if (!gear) return null;

    // Extract first teaser image from Noco array
    const file = gear["Teaser-Image"]?.[0];

    return (
      <div className="flex gap-6 p-6-all pt-12">
        {/* LEFT SPACER – 1 flex unit for visual balance */}
        <div style={{ flex: 1 }} />

        {/* CENTER: Image with fixed 3:4 aspect ratio */}
        <div style={{ flex: 2, aspectRatio: "3 / 4" }} className="axis-center">
          {file ? (
            <MasterMediaImage
              file={file}
              alt=""
              className="teaser__image_small"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="teaser__image_small placeholder" />
          )}
        </div>

        {/* RIGHT: Description text – 1 flex unit */}
        <div className="axis-left flex-col" style={{ flex: 1 }}>
          <div className="text-3">{gear["description"] || ""}</div>
        </div>
      </div>
    );
  }

  // ============================================================
  // TEAM TYPE: Static Body Teaser
  // ============================================================
  // Displays as header before project list for that team.
  // Flexible layout, right-aligned text.
  // ============================================================
  if (type === "team") {
    const team = data;
    if (!team) return null;

    // Extract first teaser image from Noco array
    const file = team["Teaser-Image"]?.[0];

    return (
      <div className="flex gap-6 p-teaser">
        {/* IMAGE – flexible sizing */}
        {file ? (
          <MasterMediaImage
            file={file}
            alt=""
            className="teaser__image"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="teaser__image placeholder" />
        )}

        {/* DESCRIPTION TEXT – right-aligned, flexible */}
        <div className="flex-1 text-2 text-right">
          {team["description"] || ""}
        </div>
      </div>
    );
  }

  return null;
}
