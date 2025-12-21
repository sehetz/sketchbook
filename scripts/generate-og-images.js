// Generate OG images from teaser images
// - Center crop to 1200x630 (or smaller if original is smaller)
// - Don't upscale, don't distort

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OG_ASPECT = OG_WIDTH / OG_HEIGHT; // 1.905

async function generateOGImages() {
  console.log("🖼️  Generating OG images...\n");

  // Load projects data
  const projectsPath = path.resolve(__dirname, "../public/data/projects.json");
  let projects;
  
  try {
    const content = await fs.readFile(projectsPath, "utf8");
    const data = JSON.parse(content);
    projects = data.list || [];
  } catch (err) {
    console.error("❌ Could not load projects.json:", err.message);
    console.log("   Run 'npm run fetch-static-data' first.");
    return;
  }

  // Load media manifest
  const manifestPath = path.resolve(__dirname, "../public/media-manifest.json");
  let manifest = {};
  try {
    const manifestContent = await fs.readFile(manifestPath, "utf8");
    manifest = JSON.parse(manifestContent);
  } catch (err) {
    console.error("❌ Could not load media-manifest.json:", err.message);
    return;
  }

  // Create output directory
  const ogDir = path.resolve(__dirname, "../public/og");
  await fs.mkdir(ogDir, { recursive: true });

  const results = {
    success: [],
    skipped: [],
    failed: [],
  };

  for (const project of projects) {
    const slug = project.Title?.toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]/g, "")
      .replace(/\-+/g, "-") || "untitled";

    // Get teaser image
    const teaserFile = project.teaserImageFile || project["Teaser-Image"]?.[0];
    if (!teaserFile || !teaserFile.title) {
      results.skipped.push({ slug, reason: "No teaser image" });
      continue;
    }

    // Look up in media manifest
    const localPath = manifest[teaserFile.title];
    if (!localPath) {
      results.skipped.push({ slug, reason: `Not in manifest: ${teaserFile.title}` });
      continue;
    }

    // Remove leading slash and construct full path
    const relativePath = localPath.startsWith('/') ? localPath.slice(1) : localPath;
    const fullPath = path.resolve(__dirname, "../public", relativePath);

    try {
      console.log(`📸 ${project.Title}`);
      console.log(`   Source: ${localPath}`);
      
      // Load image and get metadata
      const image = sharp(fullPath);
      const metadata = await image.metadata();
      const { width, height } = metadata;

      console.log(`   Source: ${width}x${height}`);

      // Calculate output dimensions
      let outputWidth = Math.min(width, OG_WIDTH);
      let outputHeight = Math.min(height, OG_HEIGHT);
      
      // Maintain aspect ratio
      const sourceAspect = width / height;
      
      if (sourceAspect > OG_ASPECT) {
        // Image is wider than OG format
        // Height constrained, adjust width
        outputHeight = Math.min(height, OG_HEIGHT);
        outputWidth = Math.round(outputHeight * sourceAspect);
        outputWidth = Math.min(outputWidth, OG_WIDTH);
        outputHeight = Math.round(outputWidth / sourceAspect);
      } else {
        // Image is taller than OG format
        // Width constrained, adjust height
        outputWidth = Math.min(width, OG_WIDTH);
        outputHeight = Math.round(outputWidth / sourceAspect);
        outputHeight = Math.min(outputHeight, OG_HEIGHT);
        outputWidth = Math.round(outputHeight * sourceAspect);
      }

      console.log(`   Output: ${outputWidth}x${outputHeight}`);

      // Process image: center crop to target aspect ratio, then resize
      const ogPath = path.resolve(ogDir, `${slug}.jpg`);
      
      await image
        .resize(outputWidth, outputHeight, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toFile(ogPath);

      console.log(`   ✅ Saved: /og/${slug}.jpg\n`);
      results.success.push({ slug, size: `${outputWidth}x${outputHeight}` });

    } catch (err) {
      console.log(`   ❌ Failed: ${err.message}\n`);
      results.failed.push({ slug, error: err.message });
    }
  }

  // Print summary
  console.log("=".repeat(80));
  console.log("📊 OG IMAGE GENERATION SUMMARY");
  console.log("=".repeat(80));
  console.log(`✅ Generated:  ${results.success.length}`);
  console.log(`⏭️  Skipped:    ${results.skipped.length}`);
  console.log(`❌ Failed:     ${results.failed.length}`);
  console.log("=".repeat(80));
  console.log();

  if (results.skipped.length > 0) {
    console.log("⏭️  SKIPPED:");
    console.log("-".repeat(80));
    results.skipped.forEach(({ slug, reason }) => {
      console.log(`  ${slug}: ${reason}`);
    });
    console.log();
  }

  if (results.failed.length > 0) {
    console.log("❌ FAILED:");
    console.log("-".repeat(80));
    results.failed.forEach(({ slug, error }) => {
      console.log(`  ${slug}: ${error}`);
    });
    console.log();
  }
}

generateOGImages().catch(console.error);
