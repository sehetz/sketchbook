// ============================================
// TeamTeaser.jsx – Team-Level Body Teaser
// ============================================

export default function TeamTeaser({ team }) {
  if (!team) return null;

  const NOCO = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";

  const file = team["Teaser-Image"]?.[0];
  const filePath = file?.signedPath || file?.thumbnails?.card_cover?.signedPath || file?.path;
  const teaserImage = filePath ? `${NOCO}/${filePath}` : null;


  return (
    <div className="flex gap-6 p-teaser">
      {/* IMAGE */}
      {teaserImage ? (
        <img
          src={teaserImage}
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
