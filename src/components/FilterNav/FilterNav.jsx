import "./FilterNav.css";

export default function FilterNav() {
  return (
    <nav className="filter-nav">
      <div className="filter-nav__section filter-nav__section--left">
        <span className="text-2">skills</span>
      </div>

      <div className="filter-nav__section filter-nav__section--center">
        <span className="text-2">gear</span>
      </div>

      <div className="filter-nav__section filter-nav__section--right">
        <span className="text-2">teams</span>
      </div>
    </nav>
  );
}
