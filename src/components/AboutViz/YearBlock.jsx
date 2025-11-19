// ============================================
// YearBlock.jsx — shows 1 year + all team-bars that span this year
// ============================================

// ⭐ Utility: normalize attachments (image + video) for gallery usage
export function normalizeGalleryAttachments(attachments = [], baseUrl) {
  const root = baseUrl || (import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080");
  return attachments.map(att => {
    const url = `${root}/${att.signedPath || att.path}`;
    const mime = att.mimetype || att.type || "";
    const ext = (att.name || "").toLowerCase();
    const isVideo = mime.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(ext);
    return {
      ...att,
      __url: url,
      __isVideo: isVideo
    };
  });
}

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
