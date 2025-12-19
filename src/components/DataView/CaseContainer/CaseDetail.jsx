import TextBlock from "./Blocks/TextBlock.jsx";
import ImageBlock from "./Blocks/ImageBlock.jsx"; 
import LinkBlock from "./Blocks/LinkBlock.jsx";

export default function CaseDetail({ project }) {
  const blocks = project.blocks || [];
  const projectTitle = project.Title || "";

  return (
    <div className="case-detail flex-col w-full">
      {blocks.length === 0 ? (
        <div style={{ padding: "var(--space-6)", color: "var(--color-fg)" }}>
          Keine Inhalte für dieses Projekt verfügbar.
        </div>
      ) : (
        blocks.map((block, index) => (
          <div key={index} className="block-wrapper">
            {block.type.includes("text") && <TextBlock block={block} />}
            {block.type.includes("image") && (
              <ImageBlock block={block} projectTitle={projectTitle} blockIndex={index} />
            )}
            {block.type.includes("link") && <LinkBlock block={block} />}
          </div>
        ))
      )}
    </div>
  );
}
