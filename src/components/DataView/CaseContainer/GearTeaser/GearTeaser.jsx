// ============================================
// GearTeaser.jsx – Gear-Level Body Teaser
// ============================================

export default function GearTeaser({ gear }) {
  if (!gear) return null;

  const NOCO = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";

  const file = gear["Teaser-Image"]?.[0];
  const teaserImage = file
    ? `${NOCO}/${file.signedPath || file.path}`
    : null;

  return (
    <div className="flex-col gap-6 p-teaser axis-center">
      {/* IMAGE */}
      {teaserImage ? (
        <img
          src={teaserImage}
          alt=""
          className="teaser__image"
        />
      ) : (
        <div className="teaser__image placeholder" />
      )}

      {/* TEXT */}
      <div className="flex-1 text-2 flex axis-center">
        {gear["description"] || ""}
      </div>
    </div>
  );
}
