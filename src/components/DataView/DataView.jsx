import { useState, useEffect } from "react";
import CaseContainer from "./CaseContainer/CaseContainer";

export default function DataView() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("skills"); // "skills" | "gears" | "teams"
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const API_TOKEN = import.meta.env.VITE_API_TOKEN;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(API_URL, {
          headers: { "xc-token": API_TOKEN },
        });
        if (!res.ok) throw new Error(`Fehler: ${res.status}`);
        const json = await res.json();
        setData(json.list);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchData();
  }, [API_URL, API_TOKEN]);

  if (error) return <pre>Fehler: {error}</pre>;
  if (!data) return <pre>Lade Daten...</pre>;

  // 🔀 Gruppiere nach aktuellem Filter
  const groupKey =
    filter === "skills"
      ? "nc_3zu8___nc_m2m_nc_3zu8__Projec_Skills"
      : filter === "gears"
      ? "nc_3zu8___nc_m2m_nc_3zu8__Projec_Gears"
      : "nc_3zu8___nc_m2m_nc_3zu8__Projec_Teams";

  const grouped = data.reduce((acc, project) => {
    const rel = project[groupKey];
    if (rel?.length) {
      rel.forEach((item) => {
        const keyName =
          filter === "skills"
            ? item.Skills.Skill
            : filter === "gears"
            ? item.Gear.Gear
            : item.Teams.Team;

        acc[keyName] = acc[keyName] || [];
        acc[keyName].push(project);
      });
    }
    return acc;
  }, {});

  const entries = Object.entries(grouped);

  return (
    <main>
      {entries.map(([key, projects], index) => (
        <CaseContainer
          key={key}
          type={filter}
          label={key}
          projects={projects}
          isLast={index === entries.length - 1}
        />
      ))}
    </main>
  );
}
