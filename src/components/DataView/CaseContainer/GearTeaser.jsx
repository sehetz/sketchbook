// ============================================
// GearTeaser.jsx – Gear-Level Body Teaser
// ============================================

import MasterMediaImage from "../../common/MasterMediaImage.jsx";

export default function GearTeaser({ gear }) {
  if (!gear) return null;

  const file = gear["Teaser-Image"]?.[0];

  return (
    <div className="flex gap-6 p-6-all pt-12">
      {/* COL 1 – empty spacer */}
      <div style={{ flex: 1 }} />

      {/* COL 2–3 – IMAGE (2 flex-units, fixed aspect ratio) */}
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

      {/* COL 4 – TEXT (1 flex-unit) */}

      <div className="axis-left flex-col" style={{ flex: 1 }}>
        <div className="text-3">{gear["description"] || ""}</div>
      </div>
    </div>
  );
}
