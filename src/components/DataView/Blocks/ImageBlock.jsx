// ============================================
// YearBlock.jsx — shows 1 year + all team-bars that span this year
// ============================================

export default function YearBlock({ year, teams }) {
  // Teams die in diesem Jahr aktiv sind
  const activeTeams = teams.filter((t) => {
    return t.start <= year && (t.end === null || t.end >= year);
  });

  return (
    <div className=" w-full">
      {/* YEAR LABEL */}
      <div className="YearBlock  axis-left align-end">
        <div className="p-6-all text-3">{year}</div>
      </div>
      {/* YEAR DIVIDER */}
      <div className="border-bottom-dotted" />
    </div>
  );
}

// ============================================
// ImageBlock.jsx — shows images or videos with autoplay + loop without controls
// ============================================

export function ImageBlock({ attachments }) {
  return (
    <div className="image-block">
      {attachments.map((att, i) =>
        att.__isVideo ? (
          <video
            key={i}
            src={att.__url}
            className="image-block__media"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <img
            key={i}
            src={att.__url}
            alt={att.name || ""}
            className="image-block__media"
          />
        )
      )}
    </div>
  );
}