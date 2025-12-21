// Generate static HTML pages for each project with OG meta tags
// This ensures Facebook/Twitter crawlers see the correct meta tags without executing JS

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateStaticPages() {
  console.log("📄 Generating static project pages...\n");

  try {
    // Read projects data
    const projectsPath = path.resolve(__dirname, "../public/data/projects.json");
    const projectsData = JSON.parse(await fs.readFile(projectsPath, "utf8"));
    const projects = projectsData.list || [];

    // Read base HTML template
    const distIndexPath = path.resolve(__dirname, "../dist/index.html");
    let baseHtml = await fs.readFile(distIndexPath, "utf8");

    let generated = 0;

    for (const project of projects) {
      if (!project.is_online) continue;
      
      const projectSlug = slugify(project.Title || "");
      if (!projectSlug) continue;

      // Get first skill for URL structure
      const skills = project._nc_m2m_sehetz_skills || [];
      if (skills.length === 0) continue;
      
      const skillName = skills[0]?.skill?.Skill || "";
      const skillSlug = slugify(skillName);
      
      // Extract description from blocks
      const blocks = project.blocks || [];
      const textBlock = blocks.find(b => b.type?.includes('text'));
      let description = "Explore this project in the Sehetz creative portfolio.";
      if (textBlock?.data) {
        const text = textBlock.data.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        description = text.substring(0, 160) + (text.length > 160 ? '...' : '');
      }

      const title = `${project.Title} – Sehetz Sketchbook`;
      const url = `https://sehetz.ch/skills/${skillSlug}/${projectSlug}`;
      const ogImage = `https://sehetz.ch/og/${projectSlug}.jpg`;

      // Create HTML with meta tags
      let projectHtml = baseHtml;
      
      // Update title
      projectHtml = projectHtml.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
      
      // Add OG meta tags before </head>
      const metaTags = `
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImage}" />
    
    <!-- Standard Meta Tags -->
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${url}" />
  </head>`;
      
      projectHtml = projectHtml.replace(/<\/head>/, metaTags);

      // Create directory structure: skills/{skillSlug}/{projectSlug}/
      const outputDir = path.resolve(__dirname, `../dist/skills/${skillSlug}/${projectSlug}`);
      await fs.mkdir(outputDir, { recursive: true });
      
      const outputPath = path.join(outputDir, "index.html");
      await fs.writeFile(outputPath, projectHtml, "utf8");
      
      console.log(`✅ /skills/${skillSlug}/${projectSlug}/`);
      generated++;
    }

    console.log(`\n✨ Generated ${generated} static project pages!`);
  } catch (err) {
    console.error("❌ Error generating static pages:", err.message);
    process.exit(1);
  }
}

generateStaticPages();
