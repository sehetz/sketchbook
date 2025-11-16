import { useState, useEffect } from "react";
import "./SehetzTeaser.css";

export default function SehetzTeaser() {
  const [sehetz, setSehetz] = useState(null);

  const API_TOKEN = import.meta.env.VITE_API_TOKEN;
  const NOCO_BASE = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";
  const SEHETZ_TABLE_ID = "mf6q8r82vjc42kt";
  const SEHETZ_API_URL = `${NOCO_BASE}/api/v2/tables/${SEHETZ_TABLE_ID}/records`;

  useEffect(() => {
    async function fetchSehetz() {
      try {
        const res = await fetch(SEHETZ_API_URL, {
          headers: { "xc-token": API_TOKEN },
        });
        
        if (!res.ok) return;

        const json = await res.json();
        const row = json.list?.[0];

        if (row) {
          const imageFile = row.image?.[0];
          const teaserImage = imageFile
            ? `${NOCO_BASE}/${imageFile.signedPath || imageFile.path}`
            : null;

          setSehetz({
            title: row.title || "sehetz",
            description: row.description || "",
            image: teaserImage,
          });
        }
      } catch (err) {
        console.error("Failed to load sehetz:", err);
      }
    }

    fetchSehetz();
  }, [SEHETZ_API_URL, API_TOKEN, NOCO_BASE]);

  if (!sehetz) return null;

  return (
    <div className="sehetz-teaser">
      <div className="sehetz-teaser__title text-1">{sehetz.title}</div>
      
      <div className="flex gap-6 p-6-all">
        <div className="flex-1 pr-8 text-2">
          {sehetz.description}
        </div>

        {sehetz.image ? (
          <img
            src={sehetz.image}
            alt={sehetz.title}
            className="teaser__image"
          />
        ) : (
          <div className="teaser__image placeholder" />
        )}
      </div>
    </div>
  );
}
