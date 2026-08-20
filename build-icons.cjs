const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.join(__dirname, 'public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function generateIcons() {
  const src = path.join(__dirname, 'public/logo-master.jpg');
  
  // Create all icons with -v5 suffix
  await sharp(src).resize(192, 192, { fit: 'cover' }).png({ quality: 100 }).toFile(path.join(outDir, 'icon-192-v5.png'));
  await sharp(src).resize(512, 512, { fit: 'cover' }).png({ quality: 100 }).toFile(path.join(outDir, 'icon-512-v5.png'));
  await sharp(src).resize(180, 180, { fit: 'cover' }).png({ quality: 100 }).toFile(path.join(outDir, 'apple-touch-icon-v5.png'));
  await sharp(src).resize(64, 64, { fit: 'cover' }).png({ quality: 100 }).toFile(path.join(outDir, 'favicon-v5.png'));
  
  // Maskable icons (add some padding/background)
  const inner192 = await sharp(src).resize(150, 150, { fit: 'contain' }).toBuffer();
  await sharp({create: {width: 192, height: 192, channels: 4, background: { r: 18, g: 17, b: 20, alpha: 1 }}})
    .composite([{ input: inner192, gravity: 'center' }])
    .png({ quality: 100 })
    .toFile(path.join(outDir, 'icon-maskable-192-v5.png'));
    
  const inner512 = await sharp(src).resize(400, 400, { fit: 'contain' }).toBuffer();
  await sharp({create: {width: 512, height: 512, channels: 4, background: { r: 18, g: 17, b: 20, alpha: 1 }}})
    .composite([{ input: inner512, gravity: 'center' }])
    .png({ quality: 100 })
    .toFile(path.join(outDir, 'icon-maskable-512-v5.png'));

  // SVG Favicon fallback
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#121114"/><text x="50" y="50" font-family="Arial" font-size="40" fill="#E5C378" text-anchor="middle" dominant-baseline="middle">W</text></svg>`;
  fs.writeFileSync(path.join(outDir, 'favicon-v5.svg'), svgContent);

  console.log('Icons v5 generated successfully.');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
