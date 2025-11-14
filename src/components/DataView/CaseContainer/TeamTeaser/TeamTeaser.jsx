// ============================================
// TeamTeaser.jsx – Team-Level Teaser
// ============================================

export default function TeamTeaser({ team }) {
  if (!team) return null;

  const NOCO = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";

  const teaserFile = team["Teaser-Image"]?.[0];
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
        {team["description"] || ""}
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
