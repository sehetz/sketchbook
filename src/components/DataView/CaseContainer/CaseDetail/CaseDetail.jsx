import TextBlock from "./Blocks/TextBlock.jsx";
import ImageBlock from "./Blocks/ImageBlock.jsx"; 
import LinkBlock from "./Blocks/LinkBlock.jsx";

export default function CaseDetail({ project }) {
  const blocks = project.blocks || [];

  return (
    <div className="case-detail flex-col w-full">
      {blocks.map((block, i) => {
        if (block.type.includes("_text")) {
          return <TextBlock key={i} text={block.data} />;
        }

        if (
          block.type.includes("_image") ||
          block.type.includes("_images") ||
          block.type.includes("_gallery")
        ) {
          return <ImageBlock key={i} images={block.data} />;
        }

        if (block.type.includes("_links")) {
          return <LinkBlock key={i} text={block.data} />;
        }

        return null;
      })}
    </div>
  );
}
