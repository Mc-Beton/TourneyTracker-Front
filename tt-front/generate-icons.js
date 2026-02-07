const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const sizes = [
  { name: "icon-72x72.png", size: 72 },
  { name: "icon-96x96.png", size: 96 },
  { name: "icon-128x128.png", size: 128 },
  { name: "icon-144x144.png", size: 144 },
  { name: "icon-152x152.png", size: 152 },
  { name: "icon-192x192.png", size: 192 },
  { name: "icon-384x384.png", size: 384 },
  { name: "icon-512x512.png", size: 512 },
];

const inputFile = path.join(__dirname, "public", "logo.png");
const outputDir = path.join(__dirname, "public");

async function generateIcons() {
  console.log("🎨 Generating PWA icons...\n");

  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error("❌ Error: logo.png not found in public folder");
    process.exit(1);
  }

  // Get input image info
  const metadata = await sharp(inputFile).metadata();
  console.log(`📷 Source image: ${metadata.width}x${metadata.height}\n`);

  // Generate icons
  for (const { name, size } of sizes) {
    const outputFile = path.join(outputDir, name);

    try {
      await sharp(inputFile)
        .resize(size, size, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png()
        .toFile(outputFile);

      const stats = fs.statSync(outputFile);
      console.log(`✅ ${name} (${(stats.size / 1024).toFixed(1)} KB)`);
    } catch (error) {
      console.error(`❌ Error generating ${name}:`, error.message);
    }
  }

  console.log("\n🎉 PWA icons generated successfully!");
}

generateIcons().catch(console.error);
