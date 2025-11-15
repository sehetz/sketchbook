// ============================================
// buildYearsFromTeams.js — zentrale Logik für Jahres-Achse
// ============================================

export default function buildYearsFromTeams(teams, nowYear) {
  const startYears = teams
    .map((t) => t.start)
    .filter(Boolean);

  const endYears = teams
    .map((t) => t.end)
    .filter(Boolean);

  const minYear = Math.min(...startYears);
  const maxDataYear = endYears.length ? Math.max(...endYears) : nowYear;
  const maxYear = Math.max(maxDataYear, nowYear);

  const arr = [];
  for (let y = maxYear; y >= minYear; y--) {
    arr.push(y);
  }

  return arr;
}
