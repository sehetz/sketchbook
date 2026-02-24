// ============================================
// IrisSubItem.jsx – Nested row inside an IrisDrawer
// Matches CaseTeaser (skills) layout exactly:
// case-line grows on open, teaser-wipe body,
// text left + 3×4 image right
// ============================================
import { useState } from "react";

export default function IrisSubItem({ title, description, imageSrc, imageAlt = "", index = 0 }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="case-teaser">
      {/* Row header – exactly like case-line */}
      <div
        className={`case-line${isOpen ? " case-line--open" : ""}${index > 0 ? " border-top-dotted" : ""}`}
        onClick={() => setIsOpen((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setIsOpen((v) => !v)}
        aria-expanded={isOpen}
      >
        <div className="flex w-full gap-6">
          <div className="flex-1 axis-left text-1 case-line__title">{title}</div>
        </div>
      </div>

      {/* Body – teaser-wipe (same as CaseTeaser) */}
      <div className={`teaser-wipe${isOpen ? " open" : ""}`}>
        <div className="flex gap-6 p-6-all">
          {/* Text left */}
          <div className="flex-col flex-1">
            <div className="pr-8 text-2">{description}</div>
          </div>

          {/* Image right – 3×4, same as teaser__image */}
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={imageAlt || title}
              className="teaser__image"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="teaser__image placeholder" />
          )}
        </div>
      </div>
    </div>
  );
}
