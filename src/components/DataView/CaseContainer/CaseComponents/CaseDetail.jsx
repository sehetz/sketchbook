import { useEffect } from "react";
import { useHead } from "../../../../utils/useHead.js";
import { schema_inject, schema_getCreativeWork } from "../../../../utils/structuredData.js";
import { desc_extractFirst } from "../../../../utils/seoHelpers.js";
import { text_labelToSlug } from "../../../../utils/urlRouting.js";
import TextBlock from "../Blocks/TextBlock.jsx";
import ImageBlock from "../Blocks/ImageBlock.jsx"; 
import LinkBlock from "../Blocks/LinkBlock.jsx";

export default function CaseDetail({ project }) {
  const blocks = project.blocks || [];
  const projectTitle = project.Title || "";
  const projectSlug = text_labelToSlug(projectTitle);
  const description = desc_extractFirst(blocks);
  
  // Update meta tags when project opens
  useEffect(() => {
    if (projectTitle) {
      // Get current URL from browser (includes filter + containerLabel + projectSlug)
      const currentUrl = typeof window !== 'undefined' 
        ? window.location.href.replace(/^http:\/\/localhost:\d+/, 'https://sehetz.ch')
        : `https://sehetz.ch/${projectSlug}`;
      
      useHead({
        title: `${projectTitle} – Sehetz Sketchbook`,
        description: description || `«${projectTitle}»—Wow! Isn’t that a new draft in the Sehetz sketchbook? Check it out!`,
        url: currentUrl,
        slug: projectSlug
      });

      // Inject CreativeWork schema for this project
      schema_inject(schema_getCreativeWork(project));
    }
  }, [projectTitle, projectSlug, description, project]);

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
