import { useEffect, useRef } from "react";
import { useRotationAnimation } from "../../../utils/ui.js";
import useStrudel from "../../../hooks/useStrudel.js";

export default function Header() {
  const [rave, toggleRave] = useStrudel();
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!buttonRef.current) return;
    return useRotationAnimation(buttonRef.current, rave);
  }, [rave]);

  return (
    <header className="header">
      <a href="/" className="flex-1 text-3 axis-left">
        <div className="header__link">Sketchbook</div>
      </a>

      {/* Disco button in the middle */}
      <div className="header__spacer flex-1 axis-center">
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

      <a
        href="/sarah-heitz"
        className="flex-1 text-3 axis-right"
      >
        <div className="header__link">who dis?</div>
      </a>
    </header>
  );
}
