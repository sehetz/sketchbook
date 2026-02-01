// ============================================
// Intro.jsx – Dynamische Intro-Texte
// ============================================
//
// Zeigt kontext-basierte Intro-Texte (für Skills, Gears, Teams, About).
// DATEN kommen aus DataContext (introTexts)
// ============================================

import { useData } from "../../contexts/DataContext.jsx";

export default function Intro({ filter = "skills", page = "home" }) {
  // ============================================
  // DATEN AUS CONTEXT HOLEN
  // ============================================
  
  const { getIntroText, getAboutIntro } = useData();

  // ============================================
  // TEXT BASIEREND AUF PAGE/FILTER ERMITTELN
  // ============================================
  
  // About-Seite hat eigenen Text
  const introText = page === "about" 
    ? getAboutIntro() 
    : getIntroText(filter);

  // Fallback wenn kein Text vorhanden
  const displayText = introText || "Do you ever finish a sketchbook? This page is not about perfection, it's an continiously growing archive of my body of work. Explore my skills, learn from my mistakes & findings!";

  // ============================================
  // RENDER
  // ============================================
  
  return (
    <section className="flex p-6 intro-section">
      <div className="flex-1 padding-right">
        <p className="text-2">{displayText}</p>
      </div>
      <div className="flex-1"></div>
    </section>
  );
}
