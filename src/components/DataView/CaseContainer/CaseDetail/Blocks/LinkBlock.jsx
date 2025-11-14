export default function LinkBlock({ text }) {
  if (!text) return null;

  // Split multiline long text into separate links
  const links = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="w-full flex-col p-text gap-6">
      {links.map((link, i) => (
        <a
          key={i}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex axis-left text-2"
          style={{
            color: "#0037FF",
            textDecoration: "none",
          }}
        >
          🔗 {link}
        </a>
      ))}
    </div>
  );
}
