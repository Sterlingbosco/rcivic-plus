import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? 'dist');

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
function icon(size) {
  const rows = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x / size;
      const py = y / size;
      const distance = Math.hypot(px - 0.47, py - 0.53);
      const c = distance > 0.185 && distance < 0.265 && !(px > 0.61 && Math.abs(py - 0.53) < 0.16);
      const plus =
        (Math.abs(px - 0.71) < 0.027 && py > 0.24 && py < 0.44) ||
        (Math.abs(py - 0.34) < 0.027 && px > 0.61 && px < 0.81);
      const color = plus ? [175, 201, 255] : c ? [255, 255, 255] : [23, 37, 84];
      const offset = y * (size * 3 + 1) + x * 3 + 1;
      rows.set(color, offset);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(rows)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
for (const size of [192, 512]) await writeFile(path.join(root, `icon-${size}.png`), icon(size));
async function list(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await list(full)));
    else if (!entry.name.endsWith('.map') && entry.name !== 'sw.js') files.push(full);
  }
  return files;
}
if (!process.argv.includes('--icons-only')) {
  const files = await list(root);
  const hash = createHash('sha256');
  for (const file of files.sort()) hash.update(await readFile(file));
  const version = hash.digest('hex').slice(0, 12);
  const urls = files.map((file) => `./${path.relative(root, file).replaceAll('\\', '/')}`);
  const worker = `const CACHE = 'civic-plus-${version}';
const ASSETS = ${JSON.stringify(urls)};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('civic-plus-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(new URL('./index.html', self.registration.scope))).then(response => response || fetch(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
`;
  await writeFile(path.join(root, 'sw.js'), worker);
  console.log(
    `PWA : ${urls.length} ressources précachées, version ${version}, icônes 192/512 générées.`,
  );
}
