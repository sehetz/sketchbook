import { useEffect, useState } from "react";
import ProjectContainer from "../ProjectContainer/ProjectContainer";
import SkillSection from "./SkillSection";
import GearSection from "./GearSection";
import TeamSection from "./TeamSection";

export default function DataView() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState("skills"); // "skills" | "gear" | "teams"

  const API_URL = import.meta.env.VITE_API_URL;
  const API_TOKEN = import.meta.env.VITE_API_TOKEN;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(API_URL, { headers: { "xc-token": API_TOKEN } });
        if (!res.ok) throw new Error(`Fehler: ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchData();
  }, [API_URL, API_TOKEN]);

  if (error) return <pre>Fehler: {error}</pre>;
  if (!data) return <pre>Lade Daten...</pre>;

  return (
    <main>
      {view === "skills" && <SkillSection data={data} />}
      {view === "gear" && <GearSection data={data} />}
      {view === "teams" && <TeamSection data={data} />}
    </main>
  );
}
