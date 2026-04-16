import { useState, useEffect } from "react";
import { useData } from "../../contexts/DataContext.jsx";
import { parseYear, generateSlug } from "./timelineUtils.js";

export function useTimelineData() {
  const [teams, setTeams] = useState([]);
  const [minYear, setMinYear] = useState(null);
  const [maxYear] = useState(new Date().getFullYear());
  const [projects, setProjects] = useState([]);

  const { teams: rawTeams, projects: rawProjects } = useData();

  useEffect(() => {
    if (!rawTeams || rawTeams.length === 0) return;

    const extracted = rawTeams.map((row) => ({
      team: row.Team || "Unknown",
      start: parseYear(row["start-date"]),
      end: parseYear(row["end-date"]),
      designWork: row["design-work"] === 1 || row["design-work"] === true,
      link: row.link || null,
      role: row.role || null,
    }));

    const validTeams = extracted
      .filter((t) => Number.isInteger(t.start))
      .sort((a, b) => {
        if (a.end === null && b.end === null) return b.start - a.start;
        if (a.end === null) return -1;
        if (b.end === null) return 1;
        return b.end - a.end;
      });

    setTeams(validTeams);

    const startYears = validTeams.map((t) => t.start).filter(Boolean);
    setMinYear(
      startYears.length ? Math.min(...startYears) : new Date().getFullYear()
    );
  }, [rawTeams]);

  useEffect(() => {
    if (!rawProjects || rawProjects.length === 0) return;

    const projectsExtracted = [];
    rawProjects.forEach((proj) => {
      if (!proj.is_online) return;
      const year = parseYear(proj.Datum);
      if (!year) return;

      const relSkills = proj._nc_m2m_sehetz_skills || [];
      const skillObj = relSkills[0]?.skill;
      const skillSlug = skillObj?.Skill ? generateSlug(skillObj.Skill) : "all";

      (proj._nc_m2m_sehetz_teams || []).forEach((rel) => {
        const teamObj = rel.team;
        if (!teamObj) return;
        projectsExtracted.push({
          team: teamObj.Team,
          year,
          title: proj.Title || "Untitled",
          slug: generateSlug(proj.Title),
          skillSlug,
        });
      });
    });

    setProjects(projectsExtracted);
  }, [rawProjects]);

  return { teams, minYear, maxYear, projects };
}
