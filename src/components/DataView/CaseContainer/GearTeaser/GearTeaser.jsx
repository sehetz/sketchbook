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
    <div className="flex-col pt-6 w-full axis-center">

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

      {/* TEXT in gleicher Breite wie IMAGE */}
      <div
        className="p-text text-2 axis-center"
        style={{ width: "50%" }}   // ⭐ gleiche Breite wie teaser__image
      >
        {gear["description"] || ""}
      </div>
    </div>
  );
}
