// ============================================
// IrisPageViewer.jsx
// Single-page viewer with prev/next nav and
// a collapsible masonry overview of all pages.
// ============================================
import { useState } from "react";
import IrisPage from "./IrisPage.jsx";

function Thumbnail({ page, isCurrent, onClick }) {
  const { number, title, imageSrc } = page;
  return (
    <button
      className={`iris-thumb ${isCurrent ? "iris-thumb--current" : ""}`}
      onClick={onClick}
      title={`#${number} ${title}`}
      aria-label={`Go to page ${number}: ${title}`}
    >
      <div style={{ aspectRatio: "3 / 4", width: "100%" }}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="iris-thumb__placeholder">
            #{number}
          </div>
        )}
      </div>
    </button>
  );
}

export default function IrisPageViewer({ pages }) {
  // pages are passed newest-first; index 0 = latest
  const sorted = [...pages].reverse(); // oldest → newest for index logic
  const total = sorted.length;

  // Start on the newest (last in sorted = highest number)
  const [currentIndex, setCurrentIndex] = useState(total - 1);
  const [overviewOpen, setOverviewOpen] = useState(false);

  if (total === 0) {
    return (
      <div className="iris-pages__empty flex p-6-all text-3 axis-center">
        No pages yet — check back soon.
      </div>
    );
  }

  const current = sorted[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < total - 1;

  const goTo = (i) => {
    setCurrentIndex(i);
    // keep overview open
  };

  return (
    <div className="iris-viewer">
      {/* ── Active page ── */}
      <IrisPage page={current} />

      {/* ── Nav bar ── */}
      <div className={`iris-viewer__nav flex text-3${overviewOpen ? " iris-viewer__nav--open" : ""}`}>
        <button
          className="iris-viewer__nav-btn flex-1 axis-left p-6"
          onClick={() => hasPrev && setCurrentIndex((i) => i - 1)}
          disabled={!hasPrev}
          aria-label="Previous page"
        >
          ← prev
        </button>

        {/* Overview toggle – center */}
        <button
          className="iris-viewer__nav-btn flex-1 axis-center p-6"
          onClick={() => setOverviewOpen((v) => !v)}
          aria-expanded={overviewOpen}
          aria-label="Toggle page overview"
        >
          <span className="iris-nav__counter-group">
            <span className="iris-nav__counter-arrow iris-nav__counter-arrow--mirror" aria-hidden="true">{overviewOpen ? "↑" : "↓"}</span>
            <span className="iris-nav__counter">
              <span className="iris-nav__counter-left">{currentIndex + 1}</span>
              <span className="iris-nav__counter-pipe">|</span>
              <span className="iris-nav__counter-right">{total}</span>
            </span>
            <span className="iris-nav__counter-arrow">{overviewOpen ? "↑" : "↓"}</span>
          </span>
        </button>

        <button
          className="iris-viewer__nav-btn flex-1 axis-right p-6"
          onClick={() => hasNext && setCurrentIndex((i) => i + 1)}
          disabled={!hasNext}
          aria-label="Next page"
        >
          next →
        </button>
      </div>

      {/* ── Masonry overview drawer ── */}
      {overviewOpen && (
        <div className="iris-overview p-6-all">
          <div className="iris-overview__grid">
            {sorted.map((page, i) => (
              <Thumbnail
                key={page.number}
                page={page}
                isCurrent={i === currentIndex}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
