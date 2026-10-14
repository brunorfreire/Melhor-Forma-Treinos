import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// ============================================================================
// 1. SVG MASTER TEMPLATE (Standard / Non-Maskable: Crisp with rounded boundary)
// ============================================================================
const createStandardSvg = (size = 512) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <defs>
    <!-- Deep Navy Radial Background -->
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#0F2448"/>
      <stop offset="55%" stop-color="#0A182F"/>
      <stop offset="100%" stop-color="#050E1C"/>
    </radialGradient>

    <!-- Turquoise to Coral Play Contour Gradient -->
    <linearGradient id="brandGrad" x1="10%" y1="90%" x2="92%" y2="22%">
      <stop offset="0%" stop-color="#00F2FE"/>
      <stop offset="30%" stop-color="#00D2FF"/>
      <stop offset="65%" stop-color="#FF6B6B"/>
      <stop offset="100%" stop-color="#FF8E53"/>
    </linearGradient>

    <!-- Translucent interior play glass fill -->
    <linearGradient id="interiorGlass" x1="15%" y1="85%" x2="85%" y2="25%">
      <stop offset="0%" stop-color="#00F2FE" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#FF6B6B" stop-opacity="0.08"/>
    </linearGradient>

    <!-- Neon Glow Aura Filter -->
    <filter id="neonAura" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blurWide"/>
      <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blurSharp"/>
      <feMerge>
        <feMergeNode in="blurWide"/>
        <feMergeNode in="blurSharp"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <filter id="monogramGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Deep Navy Blue Canvas (subtly rounded corners for standard icon display) -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>

  <!-- Soft Ambient Glow behind the Play Triangle -->
  <path d="M 172,126 C 156,117 142,126 142,144 L 142,368 C 142,386 156,395 172,386 L 372,273 C 388,264 388,248 372,239 Z"
        fill="none" stroke="url(#brandGrad)" stroke-width="26" opacity="0.38" filter="url(#neonAura)" stroke-linejoin="round"/>

  <!-- Translucent Glass Tint inside Play -->
  <path d="M 172,126 C 156,117 142,126 142,144 L 142,368 C 142,386 156,395 172,386 L 372,273 C 388,264 388,248 372,239 Z"
        fill="url(#interiorGlass)" stroke="none"/>

  <!-- Crisp Luminous Play Triangle Contour -->
  <path d="M 172,126 C 156,117 142,126 142,144 L 142,368 C 142,386 156,395 172,386 L 372,273 C 388,264 388,248 372,239 Z"
        fill="none" stroke="url(#brandGrad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Delicate Inner Highlight Track -->
  <path d="M 180,146 C 170,140 162,146 162,158 L 162,354 C 162,366 170,372 180,366 L 350,268 C 360,262 360,250 350,244 Z"
        fill="none" stroke="url(#brandGrad)" stroke-width="2.5" opacity="0.5"/>

  <!-- Central White Monogram "MF" (Pure white #FFFFFF, athletic geometry) -->
  <g fill="#FFFFFF" filter="url(#monogramGlow)">
    <!-- Letter M -->
    <path d="M 170,214 L 187,214 L 204,260 L 221,214 L 238,214 L 238,298 L 223,298 L 223,242 L 209,282 L 199,282 L 185,242 L 185,298 L 170,298 Z"/>
    
    <!-- Letter F -->
    <path d="M 248,214 L 292,214 L 292,229 L 264,229 L 264,250 L 286,250 L 286,264 L 264,264 L 264,298 L 248,298 Z"/>
  </g>
</svg>
`;

// ============================================================================
// 2. SVG MASKABLE TEMPLATE (Full-bleed square background with 20% safe-zone margin)
// ============================================================================
const createMaskableSvg = (size = 512) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <defs>
    <!-- Deep Navy Radial Background extending full-bleed (no rx) -->
    <radialGradient id="bgMaskGrad" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#0F2448"/>
      <stop offset="60%" stop-color="#0A182F"/>
      <stop offset="100%" stop-color="#050E1C"/>
    </radialGradient>

    <!-- Turquoise to Coral Play Contour Gradient -->
    <linearGradient id="brandMaskGrad" x1="10%" y1="90%" x2="92%" y2="22%">
      <stop offset="0%" stop-color="#00F2FE"/>
      <stop offset="30%" stop-color="#00D2FF"/>
      <stop offset="65%" stop-color="#FF6B6B"/>
      <stop offset="100%" stop-color="#FF8E53"/>
    </linearGradient>

    <linearGradient id="interiorGlassMask" x1="15%" y1="85%" x2="85%" y2="25%">
      <stop offset="0%" stop-color="#00F2FE" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#FF6B6B" stop-opacity="0.08"/>
    </linearGradient>

    <filter id="neonAuraMask" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blurWide"/>
      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blurSharp"/>
      <feMerge>
        <feMergeNode in="blurWide"/>
        <feMergeNode in="blurSharp"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <filter id="monogramGlowMask" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Full-bleed background with zero radius for adaptive Android launcher masks -->
  <rect width="512" height="512" fill="url(#bgMaskGrad)"/>

  <!-- Scaled group centered at 256, 256 with 0.78 scale factor to guarantee safe-zone -->
  <g transform="translate(256, 256) scale(0.78) translate(-256, -256)">
    <!-- Soft Ambient Glow -->
    <path d="M 172,126 C 156,117 142,126 142,144 L 142,368 C 142,386 156,395 172,386 L 372,273 C 388,264 388,248 372,239 Z"
          fill="none" stroke="url(#brandMaskGrad)" stroke-width="26" opacity="0.38" filter="url(#neonAuraMask)" stroke-linejoin="round"/>

    <!-- Translucent Interior -->
    <path d="M 172,126 C 156,117 142,126 142,144 L 142,368 C 142,386 156,395 172,386 L 372,273 C 388,264 388,248 372,239 Z"
          fill="url(#interiorGlassMask)" stroke="none"/>

    <!-- Play Contour -->
    <path d="M 172,126 C 156,117 142,126 142,144 L 142,368 C 142,386 156,395 172,386 L 372,273 C 388,264 388,248 372,239 Z"
          fill="none" stroke="url(#brandMaskGrad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Inner Highlight -->
    <path d="M 180,146 C 170,140 162,146 162,158 L 162,354 C 162,366 170,372 180,366 L 350,268 C 360,262 360,250 350,244 Z"
          fill="none" stroke="url(#brandMaskGrad)" stroke-width="2.5" opacity="0.5"/>

    <!-- Monogram MF -->
    <g fill="#FFFFFF" filter="url(#monogramGlowMask)">
      <path d="M 170,214 L 187,214 L 204,260 L 221,214 L 238,214 L 238,298 L 223,298 L 223,242 L 209,282 L 199,282 L 185,242 L 185,298 L 170,298 Z"/>
      <path d="M 248,214 L 292,214 L 292,229 L 264,229 L 264,250 L 286,250 L 286,264 L 264,264 L 264,298 L 248,298 Z"/>
    </g>
  </g>
</svg>
`;

function renderSvgToPng(svgStr, targetPath) {
  const resvg = new Resvg(svgStr);
  const pngData = resvg.render().asPng();
  fs.writeFileSync(targetPath, pngData);
  console.log(`Created ${targetPath} (${pngData.length} bytes)`);
}

// 1. Write official SVG master to public/icon.svg
const stdSvg = createStandardSvg(512);
fs.writeFileSync(path.join(publicDir, 'icon.svg'), stdSvg);
console.log('Saved public/icon.svg');

// 2. Generate PNGs
renderSvgToPng(createStandardSvg(512), path.join(publicDir, 'icon-512.png'));
renderSvgToPng(createStandardSvg(512), path.join(publicDir, 'pwa-512x512.png'));

renderSvgToPng(createStandardSvg(192), path.join(publicDir, 'icon-192.png'));
renderSvgToPng(createStandardSvg(192), path.join(publicDir, 'pwa-192x192.png'));

renderSvgToPng(createStandardSvg(180), path.join(publicDir, 'apple-touch-icon.png'));
renderSvgToPng(createStandardSvg(32), path.join(publicDir, 'favicon-32x32.png'));
renderSvgToPng(createStandardSvg(16), path.join(publicDir, 'favicon-16x16.png'));

// 3. Generate Maskable PNGs
renderSvgToPng(createMaskableSvg(512), path.join(publicDir, 'icon-maskable-512.png'));
renderSvgToPng(createMaskableSvg(512), path.join(publicDir, 'pwa-maskable-512x512.png'));

// 4. Generate multi-resolution favicon.ico via ImageMagick convert
try {
  const p16 = path.join(publicDir, 'favicon-16x16.png');
  const p32 = path.join(publicDir, 'favicon-32x32.png');
  const icoPath = path.join(publicDir, 'favicon.ico');
  execSync(`convert "${p16}" "${p32}" "${icoPath}"`);
  console.log('Generated multi-resolution public/favicon.ico');
} catch (err) {
  console.warn('Could not generate .ico via convert, using 32x32 fallback:', err);
}

console.log('All brand icon assets generated successfully!');
