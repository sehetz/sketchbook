// ============================================
// IrisHeader.jsx – Header for Mission Iris
// Psst smiley toggles read mode (muted grey)
// ============================================

export default function IrisHeader({ readMode, onToggle }) {
  return (
    <header className="header">
      <a href="/" className="flex-1 text-3 axis-left">
        <div className="header__link">Sketchbook</div>
      </a>

      <div className="header__spacer flex-1 axis-center">
        <button
          className="header__disco"
          onClick={onToggle}
          aria-pressed={readMode}
          aria-label={readMode ? "Switch to dark mode" : "Switch to read mode"}
          title={readMode ? "dark mode" : "read mode"}
          >
            {readMode ? <span style={{filter: 'grayscale(100%)'}}>🤫</span> : '🤫'}
        </button>
      </div>

      <a href="/sarah-heitz" className="flex-1 text-3 axis-right">
        <div className="header__link">who dis?</div>
      </a>
    </header>
  );
}
