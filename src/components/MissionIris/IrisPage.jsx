// ============================================
// IrisPage.jsx – Single comic page row
// 3×4 aspect ratio, centered – same pattern as GearTeaser
// ============================================

export default function IrisPage({ page }) {
  const { number, title, date, imageSrc, alt = "" } = page;

  const imageContent = imageSrc ? (
    <img
      src={imageSrc}
      alt={alt || title}
      className="iris-page__image"
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      loading="lazy"
      decoding="async"
    />
  ) : (
    <div className="iris-page__placeholder" />
  );

  return (
    <div className="iris-page border-top-solid p-6-all">
      <div className="iris-page__inner">
        <div className="iris-page__left">
          <div className="text-1">Mission Iris</div>
        </div>
        <div className="iris-page__center" style={{ aspectRatio: "3 / 4" }}>
          {imageContent}
        </div>
        <div className="iris-page__right">
          <div className="text-3 iris-page__title">{title}</div>
          <div className="text-3 iris-page__date">{date}</div>
        </div>
      </div>
    </div>
  );
}
