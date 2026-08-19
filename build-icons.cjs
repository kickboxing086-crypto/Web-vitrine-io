const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'public');
if (!fs.existsSync(outDir)) { fs.mkdirSync(outDir, { recursive: true }); }

const sharp = require('sharp');
async function generateIcons() {
  const src = path.join(__dirname, 'public/logo.jpg');
  await sharp(src).resize(192, 192, { fit: 'cover' }).png({ quality: 100 }).toFile(path.join(outDir, 'icon-192.png'));
  await sharp(src).resize(512, 512, { fit: 'cover' }).png({ quality: 100 }).toFile(path.join(outDir, 'icon-512.png'));
  await sharp(src).resize(180, 180, { fit: 'cover' }).png({ quality: 100 }).toFile(path.join(outDir, 'apple-touch-icon.png'));
  await sharp(src).resize(64, 64, { fit: 'cover' }).png({ quality: 100 }).toFile(path.join(outDir, 'favicon.png'));
  await sharp(src).resize(32, 32, { fit: 'cover' }).png({ quality: 100 }).toFile(path.join(outDir, 'favicon-32x32.png'));
  const inner192 = await sharp(src).resize(150, 150, { fit: 'contain' }).toBuffer();
  await sharp({create: {width: 192, height: 192, channels: 4, background: { r: 18, g: 17, b: 20, alpha: 1 }}}).composite([{ input: inner192, gravity: 'center' }]).png({ quality: 100 }).toFile(path.join(outDir, 'icon-maskable-192.png'));
  const inner512 = await sharp(src).resize(400, 400, { fit: 'contain' }).toBuffer();
  await sharp({create: {width: 512, height: 512, channels: 4, background: { r: 18, g: 17, b: 20, alpha: 1 }}}).composite([{ input: inner512, gravity: 'center' }]).png({ quality: 100 }).toFile(path.join(outDir, 'icon-maskable-512.png'));
  fs.copyFileSync(src, path.join(outDir, 'logo.png'));
  // Done generating fresh base images.
  writeV3();
}
function writeV3() {
  const icons = ["icon-192.png","icon-512.png","icon-maskable-192.png","icon-maskable-512.png","apple-touch-icon.png","favicon.png","favicon-32x32.png","favicon.svg","logo.png","logo.jpg"];
  for (const icon of icons) {
    const filePath = path.join(__dirname, 'public', icon);
    const newName = icon.replace(/.png$/, '-v3.png').replace(/.jpg$/, '-v3.jpg').replace(/.svg$/, '-v3.svg');
    if (fs.existsSync(filePath)) {
      if (icon.endsWith('svg')) {
        fs.writeFileSync(path.join(outDir, newName), fs.readFileSync(filePath, 'utf8'));
      } else {
        fs.writeFileSync(path.join(outDir, newName), fs.readFileSync(filePath));
      }
    }
  }
  console.log('Icons v3 generated successfully.');
}
generateIcons().catch(console.error);
