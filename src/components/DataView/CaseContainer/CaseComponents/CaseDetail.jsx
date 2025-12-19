import TextBlock from "../Blocks/TextBlock.jsx";
import ImageBlock from "../Blocks/ImageBlock.jsx"; 
import LinkBlock from "../Blocks/LinkBlock.jsx";

export default function CaseDetail({ project }) {
  const blocks = project.blocks || [];
  const projectTitle = project.Title || "";

  // Debug: Log blocks to console
  console.log(`CaseDetail for "${projectTitle}":`, { blocks, project });
  blocks.forEach((b, i) => {
    console.log(`  Block ${i}: type="${b.type}", data type="${typeof b.data}", is array=${Array.isArray(b.data)}`);
  });

  return (
    <div className="case-detail flex-col w-full">
      {blocks.length === 0 ? null : (
        blocks.map((block, index) => {
          // Extract data based on block type
          const blockData = block.data;
          
          return (
            <div key={index} className="block-wrapper">
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
