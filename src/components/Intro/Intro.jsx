import { useState, useEffect } from "react";
import "./Intro.css";

export default function Intro({ filter = "skills", page = "home" }) {
  const [introText, setIntroText] = useState(
    "I tend to never finish a sketchbook. (Do you?) So I'd like to let the imperfection speak for itself. Browse through my stuff"
  );

  const API_TOKEN = import.meta.env.VITE_API_TOKEN;
  const NOCO_BASE = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";
  const INTRO_TABLE_ID = "mwsca6xxwu2yl5n";
  const INTRO_API_URL = `${NOCO_BASE}/api/v2/tables/${INTRO_TABLE_ID}/records`;

  useEffect(() => {
    async function fetchIntroText() {
      try {
        const res = await fetch(INTRO_API_URL, {
          headers: { "xc-token": API_TOKEN },
        });
        
        if (!res.ok) return;

        const json = await res.json();
        const rows = json.list || [];

        const searchKey = page === "about" ? "about" : filter === "skills" ? "skill" : filter === "gears" ? "gear" : "team";
        const matchingRow = rows.find(row => row.name?.toLowerCase() === searchKey);
        
        if (matchingRow?.description) {
          setIntroText(matchingRow.description);
        }
      } catch (err) {
        console.error("Failed to load intro text:", err);
      }
    }

    fetchIntroText();
  }, [filter, page, INTRO_API_URL, API_TOKEN]);

  return (
    <section className="flex p-6">
      <div className="flex-1 padding-right">
        <p className="text-2">{introText}</p>
      </div>
      <div className="flex-1"></div>
    </section>
  );
}
