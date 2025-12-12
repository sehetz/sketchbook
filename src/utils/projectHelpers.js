// ============================================
// Project Helper Functions
// ============================================

const CONTENT_MASTER = [
  "content_01_text",
  "content_02_image",
  "content_03_text",
  "content_04_images",
  "content_05_text",
  "content_06_gallery",
  "content_07_links",
];

export function buildContentBlocks(project) {
  return CONTENT_MASTER.filter((field) => {
    const value = project[field];
    if (!value) return false;
    if (typeof value === "string") return value.trim() !== "";
    if (Array.isArray(value)) return value.length > 0;
    return false;
  }).map((field) => ({ type: field, data: project[field] }));
}

export function normalizeProject(project, NOCO_BASE_URL) {
  const file = project["Teaser-Image"]?.[0];
  let teaserImage = null;
  let teaserVideo = null;

  if (file) {
    const fullPath = `${NOCO_BASE_URL}/${file.signedPath || file.path}`;
    const mime = file.mimetype || file.type || "";
    const ext = (file.name || "").toLowerCase();
    if (mime.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(ext)) {
      teaserVideo = fullPath;
    } else {
      teaserImage = fullPath;
    }
  }

  const blocks = buildContentBlocks(project).map(b => {
    if (Array.isArray(b.data)) {
      return {
        ...b,
        data: b.data.map(att => {
          const mime = att.mimetype || att.type || "";
          const ext = (att.name || "").toLowerCase();
          const url = `${NOCO_BASE_URL}/${att.signedPath || att.path}`;
          const isVideo = mime.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(ext);
          return { ...att, __url: url, __isVideo: isVideo };
        })
      };
    }
    if (typeof b.data === "object" && b.data?.path) {
      const mime = b.data.mimetype || b.data.type || "";
      const ext = (b.data.name || "").toLowerCase();
      const url = `${NOCO_BASE_URL}/${b.data.signedPath || b.data.path}`;
      const isVideo = mime.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(ext);
      return { ...b, data: { ...b.data, __url: url, __isVideo: isVideo } };
    }
    return b;
  });

  return { ...project, teaserImage, teaserVideo, blocks };
}
