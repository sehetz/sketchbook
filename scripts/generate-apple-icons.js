// Generate Apple Touch Icons from SVG favicon
// Generates PNG icons in multiple sizes for iOS home screen

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SIZES = [
  { size: 180, name: "apple-touch-icon.png" },         // iPhone/iPad default
  { size: 152, name: "apple-touch-icon-152x152.png" }, // iPad
  { size: 167, name: "apple-touch-icon-167x167.png" }, // iPad Pro
  { size: 120, name: "apple-touch-icon-120x120.png" }, // iPhone Retina
];

async function generateAppleIcons() {
  const svgPath = path.resolve(__dirname, "../public/favicon.svg");
  const outputDir = path.resolve(__dirname, "../public");

  console.log("🍎 Generating Apple Touch Icons...\n");

  try {
    // Read SVG
    const svgBuffer = await fs.readFile(svgPath);
    
    for (const { size, name } of SIZES) {
      const outputPath = path.join(outputDir, name);
      
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 1 } // Black background
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ ${name} (${size}x${size})`);
    }

    console.log("\n✨ Apple Touch Icons generated successfully!");
  } catch (err) {
    console.error("❌ Error generating icons:", err.message);
    process.exit(1);
  }
}

generateAppleIcons();
