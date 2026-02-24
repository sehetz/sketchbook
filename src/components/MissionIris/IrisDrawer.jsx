// ============================================
// IrisDrawer.jsx – Collapsible lore drawer
// Controlled: isOpen + onToggle from parent.
// simple  → no background, no border on open (Synopsis, Project)
// noPadding → fixed header height, no body padding (World, Characters)
// ============================================

export default function IrisDrawer({ title, children, noPadding = false, simple = false, isOpen, onToggle }) {
  const classes = [
    "iris-drawer",
    isOpen ? "iris-drawer--open" : "",
    noPadding ? "iris-drawer--fixed-header" : "",
    simple ? "iris-drawer--simple" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      {/* Header row – same pattern as case-header */}
      <div
        className="iris-drawer__header case-header flex text-1 p-6"
        onClick={onToggle}
        role="button"
        aria-expanded={isOpen}
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
      >
        <div className="flex-1 axis-left">{title}</div>
      </div>

      {/* Collapsible body – wipe animation (same as main page) */}
      <div className={`wipe${isOpen ? " open" : ""}`}>
        <div className={`iris-drawer__body text-2${noPadding ? "" : " p-6-all"}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
