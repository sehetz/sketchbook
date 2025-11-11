import { useEffect, useState } from "react";
import ProjectContainer from "../ProjectContainer/ProjectContainer";

export default function DataView() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState("skills"); // später: "gear" | "teams"

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
        setData(json);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchData();
  }, [API_URL, API_TOKEN]);

  if (error) return <pre>Fehler: {error}</pre>;
  if (!data) return <pre>Lade Daten...</pre>;

  // === Gruppierung nach Skill ===
  const skillMap = data.list.reduce((acc, project) => {
    const skills = project.nc_3zu8___nc_m2m_nc_3zu8__Projec_Skills || [];
    skills.forEach((s) => {
      const skillName = s.Skills?.Skill || "Unbekannt";
      if (!acc[skillName]) acc[skillName] = [];
      acc[skillName].push(project);
    });
    return acc;
  }, {});

  const entries = Object.entries(skillMap);

  return (
    <>
      {entries.length > 0 ? (
        entries.map(([skill, projects], index) => (
          <ProjectContainer
            key={skill}
            skill={skill}
            projects={projects}
            isLast={index === entries.length - 1}
          />
        ))
      ) : (
        <p className="text-3">Keine Projekte gefunden.</p>
      )}
    </>
  );
}
