// ============================================
// IrisDrawer.jsx – Collapsible lore drawer
// Same visual language as CaseContainer / CaseHeader
// ============================================
import { useState } from "react";

export default function IrisDrawer({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`iris-drawer ${isOpen ? "iris-drawer--open" : ""}`}>
      {/* Header row – same pattern as case-header */}
      <div
        className="iris-drawer__header case-header flex text-1 p-6"
        onClick={() => setIsOpen((v) => !v)}
        role="button"
        aria-expanded={isOpen}
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setIsOpen((v) => !v)}
      >
        <div className="flex-1 axis-left">{title}</div>
        <div className="iris-drawer__arrow axis-right" aria-hidden="true">
          {isOpen ? "↑" : "↓"}
        </div>
      </div>

      {/* Collapsible body */}
      {isOpen && (
        <div className="iris-drawer__body p-6-all text-3">
          {children}
        </div>
      )}
    </div>
  );
}
