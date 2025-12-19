export default function LinkBlock({ text }) {
  if (!text) return null;

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Parse Markdown: [label](url)
  const parseMarkdownLink = (str) => {
    const match = str.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (match) {
      return { label: match[1], url: match[2] };
    }
    // fallback: plain URL
    return { label: str, url: str };
  };

  return (
    <div className="w-full flex-col p-text gap-6">
      {lines.map((line, i) => {
        const { label, url } = parseMarkdownLink(line);

        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex axis-left text-2 link-block__link"
          >
            <div>🔗</div>
            <span className="link-block__text">{label}</span>
          </a>
        );
      })}
    </div>
  );
}
