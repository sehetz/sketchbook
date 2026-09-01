import { useEffect, useRef, useState } from "react";
import { useRotationAnimation, useStrudel } from "../../../utils/ui.jsx";
import ViewToggle from "./ViewToggle.jsx";

export default function Header({ viewMode = "list", setViewMode }) {
  const [rave, toggleRave] = useStrudel();
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!buttonRef.current) return;
    return useRotationAnimation(buttonRef.current, rave);
  }, [rave]);

  // Check if current page is About page
  const isAboutPage = typeof window !== 'undefined' &&
    (window.location.pathname === '/sarah-heitz' || window.location.pathname === '/about');

  return (
    <header className="header">
      {/* Left: Sketchbook + View Toggle */}
      <div className="header__left">
        <a href="/" className="text-3">
          <div className="header__link">Sketchbook</div>
        </a>
        {!isAboutPage && <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />}
      </div>

      {/* Center: Disco (grid centered) */}
      <div className="header__center">
        <button
          ref={buttonRef}
          className="header__disco"
          onClick={toggleRave}
          aria-pressed={rave}
          aria-label={rave ? "Stop disco" : "Start disco"}
          title={rave ? "Stop disco (esc)" : "Start disco"}
        >
          🪩
        </button>
      </div>

      {/* Right: who dis? */}
      <div className="header__right">
        <a href="/sarah-heitz" className="text-3">
          <div className="header__link">who dis?</div>
        </a>
      </div>
    </header>
  );
}
