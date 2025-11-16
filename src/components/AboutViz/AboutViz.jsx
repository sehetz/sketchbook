import { useEffect, useState } from "react";
import TeamTimeline from "./TeamTimelinie/TeamTimeline.jsx";

export default function AboutViz() {
  const [teams, setTeams] = useState([]);
  const [minYear, setMinYear] = useState(null);
  const [maxYear, setMaxYear] = useState(new Date().getFullYear());
  const [rawData, setRawData] = useState(null);
  const [debug, setDebug] = useState("");

  const API_TOKEN = import.meta.env.VITE_API_TOKEN;
  const API_URL = import.meta.env.VITE_API_URL; // ⭐ Use existing Projects API

  // ⭐ Key path to Teams relation in Projects response:
  // json.list[i]["nc_3zu8___nc_m2m_nc_3zu8__Projec_Teams"][j].Teams
  const TEAM_REL_KEY = "nc_3zu8___nc_m2m_nc_3zu8__Projec_Teams";

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(API_URL, {
          headers: { "xc-token": API_TOKEN },
        });

        if (!res.ok) {
          setDebug(`HTTP ERROR: ${res.status}`);
          return;
        }

        const json = await res.json();
        setRawData(json); // ⭐ Store raw response

        const rows = json.list || [];

        const parseYear = (val) => {
          if (val == null) return null;
          if (typeof val === "number" && Number.isFinite(val)) {
            return Math.floor(val);
          }
          if (typeof val === "string") {
            const m = val.match(/(\d{4})/);
            if (m) return parseInt(m[1], 10);
            const n = Number(val);
            if (!Number.isNaN(n) && Number.isFinite(n)) return Math.floor(n);
            const d = new Date(val);
            if (!Number.isNaN(d)) return d.getFullYear();
          }
          return null;
        };

        const extracted = [];

        rows.forEach((project) => {
          // ⭐ Path: project["nc_3zu8___nc_m2m_nc_3zu8__Projec_Teams"]
          const relTeams = project[TEAM_REL_KEY] || [];

          relTeams.forEach((rel) => {
            // ⭐ Path: rel.Teams (nested object)
            const teamObj = rel.Teams;
            if (!teamObj) return;

            // ⭐ Extract fields:
            // - teamObj.Team → team name
            // - teamObj["start-date"] → start year (number)
            // - teamObj["end-date"] → end year (number or null)
            extracted.push({
              team: teamObj.Team || "Unknown",
              start: parseYear(teamObj["start-date"]),
              end: parseYear(teamObj["end-date"]),
            });
          });
        });

        const valid = extracted.filter((t) => Number.isInteger(t.start));
        setTeams(valid);

        const startYears = valid.map((t) => t.start).filter(Boolean);
        const calculatedMinYear = startYears.length 
          ? Math.min(...startYears) 
          : new Date().getFullYear();
        setMinYear(calculatedMinYear);
      } catch (err) {
        setDebug("❌ ERROR: " + err.message);
      }
    }

    load();
  }, [API_URL, API_TOKEN]);

  return (
    <div className="w-full p-6">
      {/* ⭐ Show raw JSON */}
      <details className="pb-24">
        <summary className="text-3 pb-6" style={{ cursor: "pointer" }}>
          📦 Raw API Response (click to expand)
        </summary>
        <pre className="text-3" style={{
          background: "#f6f6f6",
          padding: "1rem",
          overflow: "auto",
          maxHeight: "400px"
        }}>
          {JSON.stringify(rawData, null, 2)}
        </pre>
      </details>

      {/* ⭐ Show extracted teams for debugging */}
      {teams.length > 0 && (
        <details className="pb-24">
          <summary className="text-3 pb-6" style={{ cursor: "pointer" }}>
            🔍 Extracted Teams (click to expand)
          </summary>
          <pre className="text-3" style={{
            background: "#f6f6f6",
            padding: "1rem",
            overflow: "auto",
            maxHeight: "400px"
          }}>
            {JSON.stringify(teams, null, 2)}
          </pre>
        </details>
      )}

      {teams.length === 0 ? (
        <pre className="text-3">{debug || "Loading..."}</pre>
      ) : (
        <TeamTimeline teams={teams} minYear={minYear} maxYear={maxYear} />
      )}
    </div>
  );
}