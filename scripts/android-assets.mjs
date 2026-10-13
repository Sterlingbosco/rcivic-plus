// Génère les icônes et écrans de démarrage Android à partir du logo RCIVIC+ (même dessin que l'icône PWA).
// Usage : node scripts/android-assets.mjs   (après `npx cap add android`)
import { mkdir, writeFile } from 'node:fs/promises';
import { deflateSync } from 'node:zlib';
import path from 'node:path';

const res = path.resolve('android/app/src/main/res');
const NAVY = [23, 37, 84];
const WHITE = [255, 255, 255];
const BLUE = [175, 201, 255];

function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}
function png(width, height, pixel) {
  const rows = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) rows.set(pixel(x, y), y * (width * 4 + 1) + 1 + x * 4);
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(rows)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Logo dans le carré unité : « C » blanc + « + » bleu, ou null (transparent). */
function logo(px, py) {
  const distance = Math.hypot(px - 0.47, py - 0.53);
  const c = distance > 0.185 && distance < 0.265 && !(px > 0.61 && Math.abs(py - 0.53) < 0.16);
  const plus =
    (Math.abs(px - 0.71) < 0.027 && py > 0.24 && py < 0.44) ||
    (Math.abs(py - 0.34) < 0.027 && px > 0.61 && px < 0.81);
  return plus ? BLUE : c ? WHITE : null;
}
/** Échantillonnage 3×3 pour adoucir les bords ; `shade` renvoie [r,g,b,a] pour un point du canevas. */
function sampled(width, height, shade) {
  return (x, y) => {
    const sum = [0, 0, 0, 0];
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        const [r, g, b, a] = shade((x + (i + 0.5) / 3) / width, (y + (j + 0.5) / 3) / height);
        sum[0] += r * a;
        sum[1] += g * a;
        sum[2] += b * a;
        sum[3] += a;
      }
    return sum[3] === 0
      ? [0, 0, 0, 0]
      : [sum[0] / sum[3], sum[1] / sum[3], sum[2] / sum[3], Math.round((sum[3] / 9) * 255)].map(
          Math.round,
        );
  };
}
const opaque = (color) => [...color, 1];

const out = [];
async function write(relative, buffer) {
  const file = path.join(res, relative);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, buffer);
  out.push(relative);
}

// Icônes héritées (carré et rond) et premier plan de l'icône adaptative.
const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [name, scale] of Object.entries(densities)) {
  const legacy = Math.round(48 * scale);
  const adaptive = Math.round(108 * scale);
  const square = (u, v) => opaque(logo(u, v) ?? NAVY);
  const round = (u, v) => (Math.hypot(u - 0.5, v - 0.5) <= 0.5 ? square(u, v) : [0, 0, 0, 0]);
  await write(
    `mipmap-${name}/ic_launcher.png`,
    png(legacy, legacy, sampled(legacy, legacy, square)),
  );
  await write(
    `mipmap-${name}/ic_launcher_round.png`,
    png(legacy, legacy, sampled(legacy, legacy, round)),
  );
  // Zone sûre de l'icône adaptative : logo dans les 61 % centraux.
  const foreground = (u, v) => {
    const x = (u - 0.2) / 0.6;
    const y = (v - 0.2) / 0.6;
    const color = x >= 0 && x <= 1 && y >= 0 && y <= 1 ? logo(x, y) : null;
    return color ? opaque(color) : [0, 0, 0, 0];
  };
  await write(
    `mipmap-${name}/ic_launcher_foreground.png`,
    png(adaptive, adaptive, sampled(adaptive, adaptive, foreground)),
  );
}

// Écrans de démarrage : fond bleu nuit, logo centré.
const splashSizes = {
  mdpi: [320, 480],
  hdpi: [480, 800],
  xhdpi: [720, 1280],
  xxhdpi: [960, 1600],
  xxxhdpi: [1280, 1920],
};
function splash(width, height) {
  const side = Math.min(width, height) * 0.4;
  return sampled(width, height, (u, v) => {
    const x = (u * width - (width - side) / 2) / side;
    const y = (v * height - (height - side) / 2) / side;
    const color = x >= 0 && x <= 1 && y >= 0 && y <= 1 ? logo(x, y) : null;
    return opaque(color ?? NAVY);
  });
}
await write('drawable/splash.png', png(320, 480, splash(320, 480)));
for (const [name, [w, h]] of Object.entries(splashSizes)) {
  await write(`drawable-port-${name}/splash.png`, png(w, h, splash(w, h)));
  await write(`drawable-land-${name}/splash.png`, png(h, w, splash(h, w)));
}

// Fond de l'icône adaptative.
await writeFile(
  path.join(res, 'values/ic_launcher_background.xml'),
  '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#172554</color>\n</resources>\n',
);
console.log(`${out.length} images Android générées.`);
