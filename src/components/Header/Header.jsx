// TODO: State über mehrere Pages hinweg speichern
// Visualization auf dark mode anpassen
// Soundtrack schreiben


import "./Header.css";
import { useEffect } from "react";
import useStrudel from "./useStrudel";

export default function Header() {
  const [rave, toggleRave] = useStrudel();

  return (
    <header className="header">
      <a href="/" className=" w-full text-3 axis-left">
        <div className="header__link">Sketchbook</div>
      </a>

      {/* Disco button in the middle */}
      <div className="header__spacer w-full axis-center">
        <button
          className={`header__disco ${rave ? "header__disco--on" : ""}`}
          onClick={toggleRave}
          aria-pressed={rave}
          aria-label={rave ? "Stop disco" : "Start disco"}
          title={rave ? "Stop disco (esc)" : "Start disco"}
        >
          🪩
        </button>
      </div>

      <a
        href="/about"
        className=" w-full text-3 axis-right"
      >
        <div className="header__link">who dis?</div>
      </a>
    </header>
  );
}
