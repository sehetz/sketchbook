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
    <header className="header" style={{ position: 'relative' }}>
      {/* Left: Sketchbook + View Toggle */}
      <div className="header__left">
        <a href="/" className="text-3">
          <div className="header__link">Sketchbook</div>
        </a>
        <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
      </div>

      {/* Middle: Disco (absolutely centered) */}
      <button
        ref={buttonRef}
        className="header__disco"
        onClick={toggleRave}
        aria-pressed={rave}
        aria-label={rave ? "Stop disco" : "Start disco"}
        title={rave ? "Stop disco (esc)" : "Start disco"}
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10
        }}
      >
        🪩
      </button>

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
