import "./Header.css";
import { useEffect } from "react";
import useStrudel from "./useStrudel";

export default function Header() {
  // useStrudel returns [raveActive, toggleRave]
  const [rave, toggleRave] = useStrudel();

  return (
    <header className="header">
      <a href="/" className="header__link text-3 hover-bold">
        Sketchbook
      </a>

      {/* Disco button in the middle */}
      {/* <button
        className={`header__disco ${rave ? "header__disco--on" : ""}`}
        onClick={toggleRave}
        aria-pressed={rave}
        aria-label={rave ? "Stop disco" : "Start disco"}
        title={rave ? "Stop disco (esc)" : "Start disco"}
      >
        🪩
      </button> */}

      <a href="/about" className="header__link text-3 hover-bold">
        who dis?
      </a>
    </header>
  );
}
