import TextBlock from "../Blocks/TextBlock.jsx";
import ImageBlock from "../Blocks/ImageBlock.jsx"; 
import LinkBlock from "../Blocks/LinkBlock.jsx";

export default function CaseDetail({ project }) {
  const blocks = project.blocks || [];
  const projectTitle = project.Title || "";

  const hasLinkBlock = blocks.some((block) => block.type.includes("link"));

  blocks.forEach((b, i) => {
  });

  return (
    <div className="case-detail flex-col w-full">
      {blocks.length === 0 ? null : (
        blocks.map((block, index) => {
          // Extract data based on block type
          const blockData = block.data;
          
          return (
            <div
              key={index}
              className={`block-wrapper ${!hasLinkBlock && index === blocks.length - 1 ? "block-wrapper--final-no-links" : ""}`}
            >
              {(block.type.includes("text")) && <TextBlock text={blockData} />}
              {(block.type.includes("image") || block.type.includes("gallery")) && (
                <ImageBlock images={blockData} projectTitle={projectTitle} blockIndex={index} />
              )}
              {(block.type.includes("link")) && <LinkBlock text={blockData} />}
            </div>
          );
        })
      )}
    </div>
  );
}
