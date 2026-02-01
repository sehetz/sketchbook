// ============================================
// DataContext.jsx – Zentrale Datenverwaltung
// ============================================
// 
// Dieser Context lädt ALLE Daten einmal beim App-Start und
// stellt sie über useData() Hook allen Components zur Verfügung.
//
// VORTEILE:
// - Daten werden nur 1x geladen (nicht in jeder Component)
// - Zentrales Cache-Management
// - Einfacher zu warten & debuggen
// - Weniger Code-Duplikation
//
// VERWENDUNG IN COMPONENTS:
//   const { projects, teams, introTexts, isLoading } = useData();
// ============================================

import { createContext, useContext, useState, useEffect } from "react";
import { project_normalize } from "../utils/project.js";

// ============================================
// CONTEXT SETUP
// ============================================

const DataContext = createContext(null);

// Custom Hook für einfachen Zugriff in Components
export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData muss innerhalb von DataProvider verwendet werden");
  }
  return context;
}

// ============================================
// DATA PROVIDER COMPONENT
// ============================================

export function DataProvider({ children }) {
  // ============================================
  // STATE
  // ============================================
  
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [introTexts, setIntroTexts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================
  // ENVIRONMENT VARIABLES
  // ============================================
  
  const API_TOKEN = import.meta.env.VITE_API_TOKEN;
  const NOCO_BASE = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";
  
  // Table IDs aus NocoDB
  const PROJECTS_TABLE_ID = "mieh9d1y7a7ls74";
  const TEAMS_TABLE_ID = "mpz7ywybfxm3isa";
  const INTRO_TABLE_ID = "m1usrhdmzjt7qo8";

  // Cache Keys für sessionStorage
  const CACHE_KEYS = {
    projects: "sehetz-projects-cache-v2",
    teams: "sehetz-teams-cache-v1",
    intro: "sehetz-intro-cache-v1",
  };

  // ============================================
  // HELPER: Load from sessionStorage
  // ============================================
  
  function loadFromCache(key) {
    try {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.warn(`[DataContext] Cache read failed for ${key}:`, err);
    }
    return null;
  }

  // ============================================
  // HELPER: Save to sessionStorage
  // ============================================
  
  function saveToCache(key, data) {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn(`[DataContext] Cache write failed for ${key}:`, err);
    }
  }

  // ============================================
  // LOAD PROJECTS
  // ============================================
  
  async function loadProjects() {
    // 1) Versuche Cache
    const cached = loadFromCache(CACHE_KEYS.projects);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      setProjects(cached);
    }

    // 2) Versuche static JSON (für Production)
    try {
      const res = await fetch("/data/projects.json", { cache: "force-cache" });
      if (res.ok) {
        const json = await res.json();
        const normalized = (json.list || []).map((p) => project_normalize(p, NOCO_BASE));
        if (normalized.length > 0) {
          setProjects(normalized);
          saveToCache(CACHE_KEYS.projects, normalized);
          return; // Static data geladen, fertig
        }
      }
    } catch (err) {
      console.warn("[DataContext] Static projects.json failed:", err);
    }

    // 3) Live-Fetch von NocoDB (nur in Development)
    if (import.meta.env.DEV) {
      try {
        const include = "include=_nc_m2m_sehetz_skills,_nc_m2m_sehetz_gears,_nc_m2m_sehetz_teams&limit=200";
        const url = `${NOCO_BASE}/api/v2/tables/${PROJECTS_TABLE_ID}/records?${include}`;
        const res = await fetch(url, { headers: { "xc-token": API_TOKEN } });
        
        if (res.ok) {
          const json = await res.json();
          const normalized = (json.list || []).map((p) => project_normalize(p, NOCO_BASE));
          setProjects(normalized);
          saveToCache(CACHE_KEYS.projects, normalized);
          console.log(`[DataContext] ✅ Loaded ${normalized.length} projects from API`);
        }
      } catch (err) {
        console.warn("[DataContext] Live projects fetch failed:", err);
        setError("Konnte Projekte nicht laden");
      }
    }
  }

  // ============================================
  // LOAD TEAMS
  // ============================================
  
  async function loadTeams() {
    // 1) Versuche Cache
    const cached = loadFromCache(CACHE_KEYS.teams);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      setTeams(cached);
    }

    // 2) Versuche static JSON
    try {
      const res = await fetch("/data/teams.json", { cache: "force-cache" });
      if (res.ok) {
        const json = await res.json();
        const teamsList = json.list || [];
        if (teamsList.length > 0) {
          setTeams(teamsList);
          saveToCache(CACHE_KEYS.teams, teamsList);
          return;
        }
      }
    } catch (err) {
      console.warn("[DataContext] Static teams.json failed:", err);
    }

    // 3) Live-Fetch (nur Development)
    if (import.meta.env.DEV) {
      try {
        const url = `${NOCO_BASE}/api/v2/tables/${TEAMS_TABLE_ID}/records`;
        const res = await fetch(url, { headers: { "xc-token": API_TOKEN } });
        
        if (res.ok) {
          const json = await res.json();
          const teamsList = json.list || [];
          setTeams(teamsList);
          saveToCache(CACHE_KEYS.teams, teamsList);
          console.log(`[DataContext] ✅ Loaded ${teamsList.length} teams from API`);
        }
      } catch (err) {
        console.warn("[DataContext] Live teams fetch failed:", err);
      }
    }
  }

  // ============================================
  // LOAD INTRO TEXTS
  // ============================================
  
  async function loadIntroTexts() {
    // 1) Versuche Cache
    const cached = loadFromCache(CACHE_KEYS.intro);
    if (cached && Object.keys(cached).length > 0) {
      setIntroTexts(cached);
    }

    // 2) Live-Fetch (immer, da kleine Datenmenge)
    try {
      const url = `${NOCO_BASE}/api/v2/tables/${INTRO_TABLE_ID}/records`;
      const res = await fetch(url, { headers: { "xc-token": API_TOKEN } });
      
      if (res.ok) {
        const json = await res.json();
        const rows = json.list || [];
        
        // Konvertiere Array zu Object: { "skill": "text", "gear": "text", ... }
        const textsMap = {};
        rows.forEach(row => {
          if (row.name && row.description) {
            textsMap[row.name.toLowerCase()] = row.description;
          }
        });
        
        setIntroTexts(textsMap);
        saveToCache(CACHE_KEYS.intro, textsMap);
        console.log(`[DataContext] ✅ Loaded ${Object.keys(textsMap).length} intro texts`);
      }
    } catch (err) {
      console.warn("[DataContext] Intro texts fetch failed:", err);
    }
  }

  // ============================================
  // INITIAL DATA LOAD
  // ============================================
  
  useEffect(() => {
    async function loadAllData() {
      setIsLoading(true);
      
      // Alle Daten parallel laden für maximale Performance
      await Promise.all([
        loadProjects(),
        loadTeams(),
        loadIntroTexts(),
      ]);
      
      setIsLoading(false);
      console.log("[DataContext] 🎉 Alle Daten geladen");
    }

    loadAllData();

    // Auto-Refresh in Development alle 30 Sekunden
    if (import.meta.env.DEV) {
      const refreshInterval = setInterval(() => {
        console.log("[DataContext] 🔄 Refreshing data...");
        loadProjects();
      }, 30000);
      
      return () => clearInterval(refreshInterval);
    }
  }, []);

  // ============================================
  // CONTEXT VALUE
  // ============================================
  
  const value = {
    // Daten
    projects,
    teams,
    introTexts,
    
    // Status
    isLoading,
    error,
    
    // Helper: Hole Intro-Text für bestimmten Filter
    getIntroText: (filter) => {
      const key = filter === "skills" ? "skill" 
                : filter === "gears" ? "gear" 
                : "team";
      return introTexts[key] || "Do you ever finish a sketchbook? This page is not about perfection, it's an continiously growing archive of my body of work.";
    },
    
    // Helper: Hole About-Seite Intro
    getAboutIntro: () => {
      return introTexts["about"] || "";
    },
  };

  // ============================================
  // RENDER
  // ============================================
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
