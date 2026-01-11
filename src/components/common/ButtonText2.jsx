// ============================================
// ButtonText2.jsx – Text 2 Link Button
// ============================================

export default function ButtonText2({ text, href, className = "" }) {
  // If no text or href, don't render
  if (!text || !href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-text-2 ${className}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div className="flex w-full">
        <div className="flex-1 text-2">{text}</div>
      </div>
    </a>
  );
}
