// ============================================
// ImageBlock.jsx — unified grid + 4-per-row logic
// ============================================

export default function ImageBlock({ images }) {
  if (!images?.length) return null;

  const NOCO = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";
  const src = (att) => `${NOCO}/${att.signedPath || att.path}`;
  const isVideo = (att) => {
    const mime = att.mimetype || att.type || "";
    const name = (att.name || "").toLowerCase();
    return mime.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(name);
  };

  // --------------------------------------------
  // CASE 1 → Single Image/Video (fullwidth 16:9)
  // --------------------------------------------
  if (images.length === 1) {
    const item = images[0];
    return (
      <div className="image-block">
        {isVideo(item) ? (
          <video
            className="image-16x9"
            src={src(item)}
            autoPlay
            loop
            muted
            playsInline
            preload="none"
          />
        ) : (
          <img
            className="image-16x9"
            src={src(item)}
            alt="image-0"
            loading="lazy"
            decoding="async"
          />
        )}
      </div>
    );
  }

  // --------------------------------------------
  // CASE 2 → Grid (2 or more items)
  // Modifier: from 4 images onward → 4-column grid
  // --------------------------------------------
  const isFourGrid = images.length >= 4;

  return (
    <div
      className={
        "image-block image-grid" + (isFourGrid ? " image-grid-4" : "")
      }
    >
      {images.map((item, i) =>
        isVideo(item) ? (
          <video
            key={i}
            className="image-4x5"
            src={src(item)}
            autoPlay
            loop
            muted
            playsInline
            preload="none"
          />
        ) : (
          <img
            key={i}
            className="image-4x5"
            src={src(item)}
            alt={`image-${i}`}
            loading="lazy"
            decoding="async"
          />
        )
      )}
    </div>
  );
}
