import { useEffect, useState } from "react";
import TeamTimeline from "./TeamTimelinie/TeamTimeline.jsx";

export default function AboutViz() {
  const [teams, setTeams] = useState([]);
  const [debug, setDebug] = useState(""); // ⭐ to show what's happening

  const API_URL = import.meta.env.VITE_API_URL;
  const API_TOKEN = import.meta.env.VITE_API_TOKEN;

  const TEAM_REL_KEY = "nc_3zu8___nc_m2m_nc_3zu8__Projec_Teams";

  useEffect(() => {
    async function load() {
      try {
        let log = "";

        log += `📡 FETCH FROM: ${API_URL}\n`;

        const res = await fetch(API_URL, {
          headers: { "xc-token": API_TOKEN },
        });

        log += `HTTP STATUS: ${res.status}\n`;

        if (!res.ok) {
          setDebug(log);
          return;
        }

        const json = await res.json();
        log += `JSON KEYS: ${Object.keys(json).join(", ")}\n`;

        const rows = json.list || [];
        log += `ROWS LENGTH: ${rows.length}\n`;

        if (rows.length > 0) {
          log += `ROW[0]: ${JSON.stringify(rows[0], null, 2)}\n`;
        }

        const extracted = [];

        rows.forEach((project) => {
          const relTeams = project[TEAM_REL_KEY] || [];

          relTeams.forEach((rel) => {
            const teamObj = rel.Teams;
            if (!teamObj) return;

            const start = parseInt(teamObj["start-date"], 10);
            const end = teamObj["end-date"]
              ? parseInt(teamObj["end-date"], 10)
              : null;

            extracted.push({
              team: teamObj.Team,
              start,
              end,
            });
          });
        });

        log += `EXTRACTED TEAMS: ${JSON.stringify(extracted, null, 2)}\n`;

        const valid = extracted.filter((t) => Number.isInteger(t.start));
        log += `VALID TEAMS: ${valid.length}\n`;

        setDebug(log);
        setTeams(valid);
      } catch (err) {
        setDebug("❌ ERROR: " + err.message);
      }
    }

    load();
  }, [API_URL, API_TOKEN]);

  return (
    <div className="w-full">
      {/* If timeline empty, show debug info */}
      {teams.length === 0 ? (
        <pre className="text-3">{debug}</pre>
      ) : (
        <TeamTimeline teams={teams} />
      )}
    </div>
  );
}
