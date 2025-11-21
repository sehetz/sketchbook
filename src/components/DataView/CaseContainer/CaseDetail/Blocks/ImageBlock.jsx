// ============================================
// ImageBlock.jsx – unified grid + 4-per-row with proper aspect ratios
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

  // CASE 1: Single image (16:9 fullwidth)
  if (images.length === 1) {
    const item = images[0];
    return (
      <div className="image-block">
        <div className="image-wrapper image-wrapper--16x9">
          {isVideo(item) ? (
            <video
              className="image-media"
              src={src(item)}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              className="image-media"
              src={src(item)}
              alt="image"
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
      </div>
    );
  }

  // CASE 2: Multiple images (4:5 grid)
  const isFourGrid = images.length >= 4;

  return (
    <div className="image-block">
      <div className={`image-grid ${isFourGrid ? "image-grid--4col" : ""}`}>
        {images.map((item, i) => (
          <div key={i} className="image-wrapper image-wrapper--4x5">
            {isVideo(item) ? (
              <video
                className="image-media"
                src={src(item)}
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img
                className="image-media"
                src={src(item)}
                alt={`image-${i}`}
                loading="lazy"
                decoding="async"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
