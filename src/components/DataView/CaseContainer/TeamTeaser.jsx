// ============================================
// TeamTeaser.jsx – Team-Level Body Teaser
// ============================================

import MasterMediaImage from "../../common/MasterMediaImage.jsx";

export default function TeamTeaser({ team }) {
  if (!team) return null;

  const file = team["Teaser-Image"]?.[0];

  return (
    <div className="flex gap-6 p-teaser">
      {/* IMAGE */}
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

      {/* TEXT */}
      <div className="flex-1 text-2 text-right">
        {team["description"] || ""}
      </div>
    </div>
  );
}
