import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#059669;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0d9488;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="110" fill="#020617"/>
  <rect x="24" y="24" width="464" height="464" rx="90" fill="url(#grad)" fill-opacity="0.15" stroke="#059669" stroke-width="8"/>
  <g transform="translate(106, 106) scale(0.6)">
    <!-- Circuit / Machine icon -->
    <rect x="80" y="80" width="340" height="340" rx="40" fill="url(#grad)"/>
    <!-- CPU Chip Core -->
    <rect x="150" y="150" width="200" height="200" rx="20" fill="#020617"/>
    <text x="250" y="270" font-family="Arial, sans-serif" font-weight="900" font-size="70" fill="#34d399" text-anchor="middle">OP</text>
    <text x="250" y="320" font-family="Arial, sans-serif" font-weight="700" font-size="28" fill="#a7f3d0" text-anchor="middle">ASIST</text>
    <!-- Pins -->
    <rect x="230" y="30" width="40" height="50" rx="8" fill="#34d399"/>
    <rect x="230" y="420" width="40" height="50" rx="8" fill="#34d399"/>
    <rect x="30" y="230" width="50" height="40" rx="8" fill="#34d399"/>
    <rect x="420" y="230" width="50" height="40" rx="8" fill="#34d399"/>
  </g>
</svg>
`;

async function generate() {
  const svgBuffer = Buffer.from(svgIcon);

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));

  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  console.log('PWA icons created successfully!');
}

generate().catch(console.error);
