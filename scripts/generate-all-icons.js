// Generate complete icon set from apple-touch-icon.png
// Creates favicon.ico, Android icons, and web manifest

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS = [
  // Android/PWA icons
  { size: 192, name: "icon-192.png" },
  { size: 512, name: "icon-512.png" },
  // Favicon for old browsers
  { size: 32, name: "favicon-32x32.png" },
  { size: 16, name: "favicon-16x16.png" },
];

async function generateIcons() {
  const sourcePath = path.resolve(__dirname, "../public/apple-touch-icon.png");
  const outputDir = path.resolve(__dirname, "../public");

  console.log("🎨 Generating complete icon set...\n");

  try {
    // Read source PNG (apple-touch-icon with black background)
    const sourceBuffer = await fs.readFile(sourcePath);
    
    // Generate all icon sizes
    for (const { size, name } of ICONS) {
      const outputPath = path.join(outputDir, name);
      
      await sharp(sourceBuffer)
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ ${name} (${size}x${size})`);
    }

    // Generate favicon.ico (multi-size ICO file)
    console.log("\n📦 Generating favicon.ico...");
    const ico16 = await sharp(sourceBuffer).resize(16, 16).png().toBuffer();
    const ico32 = await sharp(sourceBuffer).resize(32, 32).png().toBuffer();
    
    // For ICO, we'll just use the 32x32 version as modern browsers handle it
    await fs.writeFile(
      path.join(outputDir, "favicon.ico"),
      ico32
    );
    console.log("✅ favicon.ico");

    // Generate web manifest
    console.log("\n📱 Generating site.webmanifest...");
    const manifest = {
      name: "Sehetz Sketchbook",
      short_name: "Sehetz",
      description: "Creative portfolio and project archive by Sarah Heitz",
      icons: [
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ],
      theme_color: "#121212",
      background_color: "#ffffff",
      display: "standalone",
      start_url: "/",
      scope: "/"
    };

    await fs.writeFile(
      path.join(outputDir, "site.webmanifest"),
      JSON.stringify(manifest, null, 2),
      "utf8"
    );
    console.log("✅ site.webmanifest");

    console.log("\n✨ Complete icon set generated successfully!");
    console.log("\n💡 Next steps:");
    console.log("   1. Icons are ready in public/ folder");
    console.log("   2. Update index.html with new icon links");
    
  } catch (err) {
    console.error("❌ Error generating icons:", err.message);
    process.exit(1);
  }
}

generateIcons();
