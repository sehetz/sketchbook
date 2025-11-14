import "./FilterNav.css";

export default function FilterNav() {
  return (
    <nav className="filter-nav flex">
      <div className="filter-nav__section axis-left">
        <span className="text-2">skills</span>
      </div>

      <div className="filter-nav__section flex axis-center">
        <span className="text-2">gear</span>
      </div>

      <div className="filter-nav__section flex axis-right">
        <span className="text-2">teams</span>
      </div>
    </nav>
  );
}
