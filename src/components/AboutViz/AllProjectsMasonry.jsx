import React, { useEffect, useState } from "react";

export default function AllProjectsMasonry() {
  const [projects, setProjects] = useState([]);
  const API_TOKEN = import.meta.env.VITE_API_TOKEN;
  const NOCO_BASE_URL =
    import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";
  const PROJECTS_TABLE_ID = "mieh9d1y7a7ls74";
  const PROJECTS_API_URL = `${NOCO_BASE_URL}/api/v2/tables/${PROJECTS_TABLE_ID}/records`;

  // Replace previous getImageUrl / normalizeUrl with a robust deep finder
  const normalizeUrl = (u) => {
    if (!u) return null;
    const s = String(u).trim();
    if (!s) return null;
    // protocol-relative
    if (s.startsWith("//")) return (window?.location?.protocol || "https:") + s;
    // absolute URL
    if (/^https?:\/\//i.test(s)) return s;
    // treat as relative/signed path -> prefix with our NOCO base
    const base = NOCO_BASE_URL.replace(/\/$/, "");
    return `${base}/${s.replace(/^\//, "")}`;
  };

  const looksLikeImage = (s) =>
    typeof s === "string" &&
    /\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i.test(s.trim());
  const looksLikeVideo = (s) =>
    typeof s === "string" && /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(s.trim());

  const deepFindMedia = (obj) => {
    const seen = new WeakSet();
    let found = { image: null, video: null };

    const tryString = (val) => {
      if (found.image && found.video) return;
      if (typeof val !== "string") return;
      const str = val.trim();
      if (!str) return;
      if (!found.video && looksLikeVideo(str)) found.video = normalizeUrl(str);
      if (!found.image && looksLikeImage(str)) found.image = normalizeUrl(str);
      // also accept protocol-relative / absolute URLs without extension as image candidates (best-effort)
      if (
        !found.image &&
        (str.startsWith("/") ||
          /^https?:\/\//i.test(str) ||
          str.startsWith("//"))
      ) {
        // prefer if has common image ext in query or file name
        if (/\.(jpg|jpeg|png|gif|webp|avif|svg)/i.test(str))
          found.image = normalizeUrl(str);
      }
    };

    const dfs = (node) => {
      if (!node || (typeof node !== "object" && typeof node !== "string"))
        return;
      if (typeof node === "string") {
        tryString(node);
        return;
      }
      if (seen.has(node)) return;
      seen.add(node);

      // common quick-check keys
      const quickKeys = [
        "teaserImage",
        "teaser_image",
        "teaser",
        "image",
        "Image",
        "cover",
        "cover_image",
        "media",
        "files",
        "attachments",
        "images",
        "url",
        "src",
      ];
      for (const k of quickKeys) {
        if (node[k]) dfs(node[k]);
        if (found.image && found.video) return;
      }

      // handle Strapi-like formats
      if (node.formats && typeof node.formats === "object") {
        for (const f of Object.values(node.formats)) {
          if (f && f.url) dfs(f.url);
        }
      }

      // arrays
      if (Array.isArray(node)) {
        for (const it of node) {
          dfs(it);
          if (found.image && found.video) return;
        }
        return;
      }

      // generic traversal
      for (const key in node) {
        if (!Object.prototype.hasOwnProperty.call(node, key)) continue;
        dfs(node[key]);
        if (found.image && found.video) return;
      }
    };

    dfs(obj);
    return found;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(PROJECTS_API_URL, {
          headers: { "xc-token": API_TOKEN },
        });
        if (!res.ok) return;
        const json = await res.json();
        const rows = json.list || [];
        const extracted = rows.map((r) => {
          const media = deepFindMedia(r);
          // DEV: if you need an example of raw object when no image found, we could console.debug one
          // if (!media.image) console.debug("No image found for project (id):", r.id ?? r.record_id, r);
          return {
            id: r.id || r.record_id || Math.random().toString(36).slice(2, 9),
            title: r.Title || r.title || "Untitled",
            description:
              r.description || r.Description || r["description"] || "",
            image: media.image,
            video: media.video,
          };
        });
        if (mounted) setProjects(extracted);
      } catch (err) {
        console.error("AllProjectsMasonry ▶ fetch error", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [PROJECTS_API_URL, API_TOKEN]);

  if (!projects.length) return null;

  return (
    <section className="all-projects-masonry">
      <h2 className="masonry-title text-1">Rummagery</h2>
      <div className="masonry">
        {projects.map((p) => (
          <article key={p.id} className="masonry-item ">
            {p.image ? (
              <div className="masonry-image-wrapper">
                <img
                  src={p.image}
                  alt={p.title}
                  className="masonry-image"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="masonry-image-wrapper masonry-image--placeholder" />
            )}
            <h3 className="masonry-item__title text-3">{p.title}</h3>
            {p.description ? (
              <p className="masonry-item__desc text-3">{p.description}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
