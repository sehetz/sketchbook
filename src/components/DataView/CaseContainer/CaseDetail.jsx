import TextBlock from "./Blocks/TextBlock.jsx";
import ImageBlock from "./Blocks/ImageBlock.jsx"; 
import LinkBlock from "./Blocks/LinkBlock.jsx";

export default function CaseDetail({ project }) {
  const blocks = project.blocks || [];
  const projectTitle = project.Title || "";

  return (
    <div className="case-detail flex-col w-full">
      {blocks.map((block, index) => (
        <div key={index} className="block-wrapper">
          {block.type === "text" && <TextBlock block={block} />}
          {block.type === "image" && (
            <ImageBlock block={block} projectTitle={projectTitle} blockIndex={index} />
          )}
          {block.type === "link" && <LinkBlock block={block} />}
        </div>
      ))}
    </div>
  );
}
