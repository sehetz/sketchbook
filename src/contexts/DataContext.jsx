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
      // Silent error handling
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
      // Silent error handling
    }
  }

  // ============================================
  // LOAD PROJECTS
  // ============================================
  
  async function loadProjects(isInitialLoad = false) {
    let localData = null;

    // 1) SOFORT lokale Daten laden (Cache oder static JSON)
    const cached = loadFromCache(CACHE_KEYS.projects);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      localData = cached;
      setProjects(cached);
      if (isInitialLoad) setIsLoading(false); // Sofort anzeigen
    }

    // 2) Falls kein Cache: Static JSON laden (synchron für User)
    if (!localData) {
      try {
        const res = await fetch("/data/projects.json", { cache: "force-cache" });
        if (res.ok) {
          const json = await res.json();
          const normalized = (json.list || []).map((p) => project_normalize(p, NOCO_BASE));
          if (normalized.length > 0) {
            localData = normalized;
            setProjects(normalized);
            saveToCache(CACHE_KEYS.projects, normalized);
            if (isInitialLoad) setIsLoading(false); // Sofort anzeigen
          }
        }
      } catch (err) {
        // Silent error handling
      }
    }

    // 3) Im Hintergrund: Live-Fetch von NocoDB (immer, auch Production)
    try {
      const include = "include=_nc_m2m_sehetz_skills,_nc_m2m_sehetz_gears,_nc_m2m_sehetz_teams&limit=200";
      const url = `${NOCO_BASE}/api/v2/tables/${PROJECTS_TABLE_ID}/records?${include}`;
      const res = await fetch(url, { 
        headers: { "xc-token": API_TOKEN },
        signal: AbortSignal.timeout(10000) // 10s timeout für langsame Render-Instanz
      });
      
      if (res.ok) {
        const json = await res.json();
        const normalized = (json.list || []).map((p) => project_normalize(p, NOCO_BASE));
        
        // Nur updaten wenn sich was geändert hat
        if (JSON.stringify(normalized) !== JSON.stringify(localData)) {
          setProjects(normalized);
          saveToCache(CACHE_KEYS.projects, normalized);
        }
      }
    } catch (err) {
      // Timeout oder Fehler bei API -> kein Problem, lokale Daten sind ja da
    }
  }

  // ============================================
  // LOAD TEAMS
  // ============================================
  
  async function loadTeams(isInitialLoad = false) {
    let localData = null;

    // 1) SOFORT lokale Daten laden (Cache oder static JSON)
    const cached = loadFromCache(CACHE_KEYS.teams);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      localData = cached;
      setTeams(cached);
    }

    // 2) Falls kein Cache: Static JSON laden
    if (!localData) {
      try {
        const res = await fetch("/data/teams.json", { cache: "force-cache" });
        if (res.ok) {
          const json = await res.json();
          const teamsList = json.list || [];
          if (teamsList.length > 0) {
            localData = teamsList;
            setTeams(teamsList);
            saveToCache(CACHE_KEYS.teams, teamsList);
          }
        }
      } catch (err) {
        // Silent error handling
      }
    }

    // 3) Im Hintergrund: Live-Fetch von NocoDB
    try {
      const url = `${NOCO_BASE}/api/v2/tables/${TEAMS_TABLE_ID}/records`;
      const res = await fetch(url, { 
        headers: { "xc-token": API_TOKEN },
        signal: AbortSignal.timeout(10000)
      });
      
      if (res.ok) {
        const json = await res.json();
        const teamsList = json.list || [];
        
        if (JSON.stringify(teamsList) !== JSON.stringify(localData)) {
          setTeams(teamsList);
          saveToCache(CACHE_KEYS.teams, teamsList);
        }
      }
    } catch (err) {
      // Silent error handling
    }
  }

  // ============================================
  // LOAD INTRO TEXTS
  // ============================================
  
  async function loadIntroTexts(isInitialLoad = false) {
    let localData = null;

    // 1) SOFORT Cache laden
    const cached = loadFromCache(CACHE_KEYS.intro);
    if (cached && Object.keys(cached).length > 0) {
      localData = cached;
      setIntroTexts(cached);
    }

    // 2) Im Hintergrund: Live-Fetch
    try {
      const url = `${NOCO_BASE}/api/v2/tables/${INTRO_TABLE_ID}/records`;
      const res = await fetch(url, { 
        headers: { "xc-token": API_TOKEN },
        signal: AbortSignal.timeout(10000)
      });
      
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
        
        if (JSON.stringify(textsMap) !== JSON.stringify(localData)) {
          setIntroTexts(textsMap);
          saveToCache(CACHE_KEYS.intro, textsMap);
        }
      }
    } catch (err) {
      // Silent error handling
    }
  }

  // ============================================
  // INITIAL DATA LOAD
  // ============================================
  
  useEffect(() => {
    async function loadAllData() {
      setIsLoading(true);
      
      // Alle Daten parallel laden für maximale Performance
      // isInitialLoad=true sorgt dafür, dass lokale Daten sofort angezeigt werden
      await Promise.all([
        loadProjects(true),
        loadTeams(true),
        loadIntroTexts(true),
      ]);
      
      setIsLoading(false);
    }

    loadAllData();

    // Auto-Refresh alle 60 Sekunden (auch in Production für Live-Updates)
    const refreshInterval = setInterval(() => {
      loadProjects(false);
      loadTeams(false);
      loadIntroTexts(false);
    }, 60000);
    
    return () => clearInterval(refreshInterval);
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
