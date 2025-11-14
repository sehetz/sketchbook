// ============================================
// GearTeaser.jsx – Gear-Level Teaser
// ============================================

export default function GearTeaser({ gear }) {
  if (!gear) return null;

  const NOCO = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";

  const teaserFile = gear["Teaser-Image"]?.[0];
  const teaserImage = teaserFile
    ? `${NOCO}/${teaserFile.signedPath || teaserFile.path}`
    : null;

  return (
    <div
      className="case-line"
      style={{ height: "var(--space-24)" }} // 96px
    >
      {/* DESCRIPTION */}
      <div className="text-1 flex-1 axis-left">
        {gear["description"] || ""}
      </div>

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
    </div>
  );
}
