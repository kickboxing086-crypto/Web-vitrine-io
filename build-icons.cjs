const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.join(__dirname, 'public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const svgStandard = (size) => Buffer.from(`
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F3E5AB" />
      <stop offset="50%" stop-color="#D4AF37" />
      <stop offset="100%" stop-color="#996515" />
    </linearGradient>
    <linearGradient id="dark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18171C" />
      <stop offset="100%" stop-color="#0D0D0F" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#dark)" />
  <rect x="${size * 0.03}" y="${size * 0.03}" width="${size * 0.94}" height="${size * 0.94}" rx="${size * 0.2}" fill="none" stroke="url(#gold)" stroke-width="${size * 0.025}" />
  <path d="M ${size * 0.28} ${size * 0.38} L ${size * 0.36} ${size * 0.65} L ${size * 0.5} ${size * 0.44} L ${size * 0.64} ${size * 0.65} L ${size * 0.72} ${size * 0.38} L ${size * 0.78} ${size * 0.68} Q ${size * 0.78} ${size * 0.72} ${size * 0.72} ${size * 0.72} L ${size * 0.28} ${size * 0.72} Q ${size * 0.22} ${size * 0.72} ${size * 0.22} ${size * 0.68} Z" fill="url(#gold)" />
  <circle cx="${size * 0.28}" cy="${size * 0.33}" r="${size * 0.035}" fill="url(#gold)" />
  <circle cx="${size * 0.5}" cy="${size * 0.3}" r="${size * 0.045}" fill="url(#gold)" />
  <circle cx="${size * 0.72}" cy="${size * 0.33}" r="${size * 0.035}" fill="url(#gold)" />
</svg>
`);

const svgMaskable = (size) => Buffer.from(`
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F3E5AB" />
      <stop offset="50%" stop-color="#D4AF37" />
      <stop offset="100%" stop-color="#996515" />
    </linearGradient>
    <linearGradient id="dark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18171C" />
      <stop offset="100%" stop-color="#0D0D0F" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#dark)" />
  <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.36}" fill="none" stroke="url(#gold)" stroke-width="${size * 0.02}" />
  <path d="M ${size * 0.32} ${size * 0.4} L ${size * 0.38} ${size * 0.62} L ${size * 0.5} ${size * 0.46} L ${size * 0.62} ${size * 0.62} L ${size * 0.68} ${size * 0.4} L ${size * 0.73} ${size * 0.65} L ${size * 0.27} ${size * 0.65} Z" fill="url(#gold)" />
  <circle cx="${size * 0.32}" cy="${size * 0.36}" r="${size * 0.03}" fill="url(#gold)" />
  <circle cx="${size * 0.5}" cy="${size * 0.33}" r="${size * 0.038}" fill="url(#gold)" />
  <circle cx="${size * 0.68}" cy="${size * 0.36}" r="${size * 0.03}" fill="url(#gold)" />
</svg>
`);

async function generateIcons() {
  await sharp(svgStandard(192)).png().toFile(path.join(outDir, 'icon-192.png'));
  await sharp(svgStandard(192)).png().toFile(path.join(outDir, 'icon-192-v5.png'));
  await sharp(svgStandard(512)).png().toFile(path.join(outDir, 'icon-512.png'));
  await sharp(svgStandard(512)).png().toFile(path.join(outDir, 'icon-512-v5.png'));
  await sharp(svgStandard(512)).png().toFile(path.join(outDir, 'logo.png'));
  await sharp(svgStandard(512)).png().toFile(path.join(outDir, 'logo-v5.png'));
  await sharp(svgStandard(180)).png().toFile(path.join(outDir, 'apple-touch-icon.png'));
  await sharp(svgStandard(180)).png().toFile(path.join(outDir, 'apple-touch-icon-v5.png'));
  await sharp(svgStandard(64)).png().toFile(path.join(outDir, 'favicon.png'));
  await sharp(svgStandard(64)).png().toFile(path.join(outDir, 'favicon-v5.png'));
  await sharp(svgStandard(32)).png().toFile(path.join(outDir, 'favicon-32x32.png'));
  await sharp(svgMaskable(192)).png().toFile(path.join(outDir, 'icon-maskable-192.png'));
  await sharp(svgMaskable(192)).png().toFile(path.join(outDir, 'icon-maskable-192-v5.png'));
  await sharp(svgMaskable(512)).png().toFile(path.join(outDir, 'icon-maskable-512.png'));
  await sharp(svgMaskable(512)).png().toFile(path.join(outDir, 'icon-maskable-512-v5.png'));

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#121114"/><text x="50" y="58" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="bold" fill="#E5C378" text-anchor="middle" dominant-baseline="middle">W</text></svg>`;
  fs.writeFileSync(path.join(outDir, 'favicon.svg'), svgContent);
  fs.writeFileSync(path.join(outDir, 'favicon-v5.svg'), svgContent);

  console.log('PWA Icons generated successfully!');
}

generateIcons().catch(console.error);
