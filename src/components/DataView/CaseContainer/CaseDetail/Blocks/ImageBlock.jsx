// ============================================
// ImageBlock.jsx — unified grid + 4-per-row logic
// ============================================

export default function ImageBlock({ images }) {
  if (!images?.length) return null;

  const NOCO = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";
  const src = (img) => `${NOCO}/${img.signedPath || img.path}`;

  // --------------------------------------------
  // CASE 1 → Single Image (fullwidth 16:9)
  // --------------------------------------------
  if (images.length === 1) {
    return (
      <div className="image-block">
        <img className="image-16x9" src={src(images[0])} alt="image-0" />
      </div>
    );
  }

  // --------------------------------------------
  // CASE 2 → Grid (2 or more images)
  // Modifier: from 4 images onward, use 4-column grid
  // --------------------------------------------
  const isFourGrid = images.length >= 4;

  return (
    <div
      className={
        "image-block image-grid" + (isFourGrid ? " image-grid-4" : "")
      }
    >
      {images.map((img, i) => (
        <img
          key={i}
          className="image-4x5"
          src={src(img)}
          alt={`image-${i}`}
        />
      ))}
    </div>
  );
}
