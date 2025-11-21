import React, { useEffect, useState } from "react";
import "./AllProjectsMasonry.css";

export default function AllProjectsMasonry() {
  const [projects, setProjects] = useState([]);
  const API_TOKEN = import.meta.env.VITE_API_TOKEN;
  const NOCO_BASE =
    import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";
  const PROJECTS_API_URL = `${NOCO_BASE}/api/v2/tables/ma2nz1h01whlpni/records`;

  // Helper: try many common locations for an image URL/object
  const getImageUrl = (row) => {
    if (!row) return null;

    const asString = (val) =>
      typeof val === "string" && val.trim() ? val.trim() : null;
    const asObjectUrl = (val) =>
      val && typeof val === "object"
        ? val.url || val.src || val.image || null
        : null;

    // direct string fields
    const candidates = [
      row.teaserImage,
      row.teaser_image,
      row.Image,
      row.image,
      row.cover,
      row.cover_image,
      row.teaser,
      row.media,
      row.image_url,
      row.url,
    ];

    for (const c of candidates) {
      const s = asString(c);
      if (s) return normalizeUrl(s);
      const o = asObjectUrl(c);
      if (o) return normalizeUrl(o);
    }

    // arrays of images / attachments
    const arrCandidates = [
      row.images,
      row.Images,
      row.mediaFiles,
      row._attachments,
      row.attachments,
      row.files,
    ];
    for (const arr of arrCandidates) {
      if (Array.isArray(arr) && arr.length) {
        const first = arr[0];
        const s = asString(first);
        if (s) return normalizeUrl(s);
        const o = asObjectUrl(first);
        if (o) return normalizeUrl(o);
      }
    }

    // nested relation fields (common in NoCode exports)
    const nested = [
      row["nc_3zu8___nc_m2m_nc_3zu8__Projec_Media"],
      row["nc_3zu8___nc_m2m_nc_3zu8__Projec_Images"],
      row["nc_3zu8___nc_m2m_nc_3zu8__Projec_Gears"],
    ];
    for (const n of nested) {
      if (Array.isArray(n) && n.length) {
        const maybe = n[0];
        const o = asObjectUrl(
          maybe?.image || maybe?.Image || maybe?.teaser || maybe
        );
        if (o) return normalizeUrl(o);
      }
    }

    return null;
  };

  const normalizeUrl = (u) => {
    if (!u) return null;
    // handle objects accidentally passed
    if (typeof u !== "string") return null;
    const s = u.trim();
    if (s.startsWith("//")) return window?.location?.protocol + s;
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    // relative path -> prefix with base
    if (s.startsWith("/")) return s;
    return s;
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
          const image = getImageUrl(r);
          return {
            id: r.id || r.record_id || Math.random().toString(36).slice(2, 9),
            title: r.Title || r.title || "Untitled",
            description:
              r.description || r.Description || r["description"] || "",
            image,
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
