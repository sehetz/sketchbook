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

  return (
    <header className="header">
      {/* Left: Disco + Sketchbook */}
      <div className="flex-1 axis-left" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
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
        <a href="/" className="text-3">
          <div className="header__link">Sketchbook</div>
        </a>
      </div>

      {/* Middle: View Toggle (list/feed) */}
      <div className="flex-1 axis-center">
        <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
      </div>

      {/* Right: who dis? */}
      <a
        href="/sarah-heitz"
        className="flex-1 text-3 axis-right"
      >
        <div className="header__link">who dis?</div>
      </a>
    </header>
  );
}
