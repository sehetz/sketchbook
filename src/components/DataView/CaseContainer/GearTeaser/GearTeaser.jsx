// ============================================
// GearTeaser.jsx – Gear-Level Body Teaser
// ============================================

export default function GearTeaser({ gear }) {
  if (!gear) return null;

  const NOCO = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";

  const file = gear["Teaser-Image"]?.[0];
  const teaserImage = file ? `${NOCO}/${file.signedPath || file.path}` : null;

  return (
    <div className="flex gap-6 p-6-all pt-12">
      {/* COL 1 – empty spacer */}
      <div style={{ flex: 1 }} />

      {/* COL 2–3 – IMAGE (2 flex-units, fixed aspect ratio) */}
      <div style={{ flex: 2, aspectRatio: "3 / 4" }} className="axis-center">
        {teaserImage ? (
          <img
            src={teaserImage}
            alt=""
            className="teaser__image_small"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
