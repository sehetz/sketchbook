// ============================================
// TeamTeaser.jsx – Team-Level Body Teaser
// ============================================

export default function TeamTeaser({ team }) {
  if (!team) return null;

  const NOCO = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";

  const file = team["Teaser-Image"]?.[0];
  const teaserImage = file
    ? `${NOCO}/${file.signedPath || file.path}`
    : null;

  return (
    <div className="flex gap-6 p-6-all">
      {/* IMAGE LEFT */}
      {teaserImage ? (
        <img
          src={teaserImage}
          alt=""
          className="teaser__image"
        />
      ) : (
        <div className="teaser__image placeholder" />
      )}

      {/* TEXT RIGHT */}
      <div className="text-2 w-1-2 align-top text-right">
        {team["description"] || ""}
      </div>
    </div>
  );
}
