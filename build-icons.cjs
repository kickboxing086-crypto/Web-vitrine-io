const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.join(__dirname, 'public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function generateIcons() {
  const src = path.join(__dirname, 'public/logo-master.jpg');
  if (!fs.existsSync(src)) {
    console.error('Logo master not found at:', src);
    return;
  }
  
  // 192x192
  const img192 = await sharp(src).resize(192, 192, { fit: 'cover' }).png({ quality: 100 }).toBuffer();
  fs.writeFileSync(path.join(outDir, 'icon-192.png'), img192);
  fs.writeFileSync(path.join(outDir, 'icon-192-v5.png'), img192);

  // 512x512
  const img512 = await sharp(src).resize(512, 512, { fit: 'cover' }).png({ quality: 100 }).toBuffer();
  fs.writeFileSync(path.join(outDir, 'icon-512.png'), img512);
  fs.writeFileSync(path.join(outDir, 'icon-512-v5.png'), img512);
  fs.writeFileSync(path.join(outDir, 'logo.png'), img512);
  fs.writeFileSync(path.join(outDir, 'logo-v5.png'), img512);

  // 180x180 Apple touch icon
  const img180 = await sharp(src).resize(180, 180, { fit: 'cover' }).png({ quality: 100 }).toBuffer();
  fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), img180);
  fs.writeFileSync(path.join(outDir, 'apple-touch-icon-v5.png'), img180);

  // 64x64 / 32x32 Favicon
  const img64 = await sharp(src).resize(64, 64, { fit: 'cover' }).png({ quality: 100 }).toBuffer();
  fs.writeFileSync(path.join(outDir, 'favicon.png'), img64);
  fs.writeFileSync(path.join(outDir, 'favicon-v5.png'), img64);

  const img32 = await sharp(src).resize(32, 32, { fit: 'cover' }).png({ quality: 100 }).toBuffer();
  fs.writeFileSync(path.join(outDir, 'favicon-32x32.png'), img32);

  // Maskable 192
  const inner192 = await sharp(src).resize(150, 150, { fit: 'contain' }).toBuffer();
  const maskable192 = await sharp({
    create: { width: 192, height: 192, channels: 4, background: { r: 18, g: 17, b: 20, alpha: 1 } }
  }).composite([{ input: inner192, gravity: 'center' }]).png({ quality: 100 }).toBuffer();
  fs.writeFileSync(path.join(outDir, 'icon-maskable-192.png'), maskable192);
  fs.writeFileSync(path.join(outDir, 'icon-maskable-192-v5.png'), maskable192);

  // Maskable 512
  const inner512 = await sharp(src).resize(400, 400, { fit: 'contain' }).toBuffer();
  const maskable512 = await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 18, g: 17, b: 20, alpha: 1 } }
  }).composite([{ input: inner512, gravity: 'center' }]).png({ quality: 100 }).toBuffer();
  fs.writeFileSync(path.join(outDir, 'icon-maskable-512.png'), maskable512);
  fs.writeFileSync(path.join(outDir, 'icon-maskable-512-v5.png'), maskable512);

  // SVG Favicons
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#121114"/><text x="50" y="58" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="bold" fill="#E5C378" text-anchor="middle" dominant-baseline="middle">W</text></svg>`;
  fs.writeFileSync(path.join(outDir, 'favicon.svg'), svgContent);
  fs.writeFileSync(path.join(outDir, 'favicon-v5.svg'), svgContent);

  console.log('All icons generated successfully with both standard and v5 paths.');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
