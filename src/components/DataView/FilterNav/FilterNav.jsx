import "./FilterNav.css";

export default function FilterNav() {
  return (
    <nav className="filter-nav flex">
      <div className="flex-1 axis-left">
        <span className="text-2">skills</span>
      </div>

      <div className="flex-1 axis-center">
        <span className="text-2">gear</span>
      </div>

      <div className="flex-1 axis-right">
        <span className="text-2">teams</span>
      </div>
    </nav>
  );
}
