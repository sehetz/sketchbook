// ============================================
// FilterNav.jsx
// ============================================

import "./FilterNav.css";

export default function FilterNav({ filter, setFilter }) {
  return (
    <nav className="filter-nav flex text-2">
      
      {/* SKILLS */}
      <div className="flex-1 axis-left">
        <button
          className={`text-2 filter-button ${
            filter === "skills" ? "filter--active" : ""
          }`}
          onClick={() => setFilter("skills")}
        >
          skills
        </button>
      </div>

      {/* GEAR */}
      <div className="flex-1 axis-center">
        <button
          className={`text-2 filter-button ${
            filter === "gears" ? "filter--active" : ""
          }`}
          onClick={() => setFilter("gears")}
        >
          gear
        </button>
      </div>

      {/* TEAMS */}
      <div className="flex-1 axis-right">
        <button
          className={`text-2 filter-button ${
            filter === "teams" ? "filter--active" : ""
          }`}
          onClick={() => setFilter("teams")}
        >
          teams
        </button>
      </div>

    </nav>
  );
}
