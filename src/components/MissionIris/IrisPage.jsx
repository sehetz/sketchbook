// ============================================
// IrisPage.jsx – Single comic page row
// 3×4 aspect ratio, centered – same pattern as GearTeaser
// ============================================

export default function IrisPage({ page }) {
  const { number, title, date, imageSrc, alt = "" } = page;

  return (
    <div className="iris-page flex gap-6 p-6-all border-top-dotted">
      {/* COL 1 – metadata left */}
      <div className="axis-left flex-col" style={{ flex: 1 }}>
        <div className="text-3 iris-page__number">#{number}</div>
        <div className="text-3 iris-page__date">{date}</div>
      </div>

      {/* COL 2–3 – image (3×4 aspect ratio, centered) */}
      <div style={{ flex: 2, aspectRatio: "3 / 4" }} className="axis-center">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={alt || title}
            className="iris-page__image"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="iris-page__placeholder"
            style={{
              width: "100%",
              height: "100%",
              background: "var(--color-surface)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-fg)",
              opacity: 0.3,
              fontSize: "var(--text-3-size)",
            }}
          >
            #{number}
          </div>
        )}
      </div>

      {/* COL 4 – title right */}
      <div className="axis-left flex-col" style={{ flex: 1 }}>
        <div className="text-3 iris-page__title">{title}</div>
      </div>
    </div>
  );
}
