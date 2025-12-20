import { useState, useEffect } from "react";

export default function SehetzTeaser() {
  const [sehetz, setSehetz] = useState(null);
  const [fillFullWidth, setFillFullWidth] = useState(false);

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

  useEffect(() => {
    setFillFullWidth(false);
  }, [sehetz?.image]);

  const handleImageLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.target;
    if (!naturalWidth || !naturalHeight) return;

    const ratio = naturalWidth / naturalHeight;
    const targetRatio = 3 / 4;
    const tolerance = 0.08;

    if (Math.abs(ratio - targetRatio) > tolerance) {
      setFillFullWidth(true);
    }
  };

  if (!sehetz) return null;

  return (
    <div className="sehetz-teaser">
      <div className="sehetz-teaser__title text-1">{sehetz.title}</div>
      
      <div className={`flex gap-6 p-6-all${fillFullWidth ? " sehetz-teaser__layout--full" : ""}`}>
        <div className="sehetz-teaser__description flex-1 pr-8 text-2">
          {sehetz.description}
        </div>

        {sehetz.image ? (
          <img
            src={sehetz.image}
            alt={sehetz.title}
            className={`teaser__image sehetz-teaser__image${fillFullWidth ? " teaser__image--full sehetz-teaser__image--full" : ""}`}
            onLoad={handleImageLoad}
          />
        ) : (
          <div className="teaser__image sehetz-teaser__image placeholder" />
        )}
      </div>
    </div>
  );
}
