/*
  Generates the extension icons with Node stdlib only (zlib for PNG deflate).
  Design: a "prohibited" sign (red ring + diagonal slash) on a dark field —
  the shut mouth. Run: node scripts/generate-icons.js
*/

const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

const CRC_TABLE = (function () {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

// Grima's Bane mark: a red forked serpent tongue (Wormtongue's whisper) rising
// and splitting near the top, cut by a single bone-white diagonal stroke — the
// bane that silences it. Dark field, blood-red tongue, bone-white cut.
function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  const qx = ax + t * dx;
  const qy = ay + t * dy;
  return { d: Math.hypot(px - qx, py - qy), t: t };
}

function draw(n) {
  const buf = Buffer.alloc(n * n * 4);
  const cx = (n - 1) / 2;

  const BG = [18, 3, 3];
  const TONGUE = [210, 24, 24];
  const OUTLINE = [12, 2, 2];
  const BANE = [242, 236, 222];

  // Tongue geometry.
  const forkX = cx, forkY = 0.46 * n;     // where the tongue splits
  const baseX = cx, baseY = 0.93 * n;     // bottom root
  const tipLX = cx - 0.20 * n, tipLY = 0.15 * n; // left prong tip
  const tipRX = cx + 0.20 * n, tipRY = 0.15 * n; // right prong tip
  const stemHalf = 0.105 * n;             // stem half-thickness
  const prongBase = 0.095 * n;            // prong half-thickness at the fork
  const prongTip = 0.6;                   // prong half-thickness at the tip (near a point)

  // Bane: a single diagonal stroke cutting the tongue silent. Endpoints run past
  // the canvas so the caps fall off-frame — it reads as a clean slash, not a pill.
  const bAx = -0.08 * n, bAy = 0.27 * n;
  const bBx = 1.08 * n, bBy = 0.73 * n;
  const baneHalf = Math.max(1.3, 0.072 * n);

  function plot(buf, i, c) {
    buf[i] = c[0];
    buf[i + 1] = c[1];
    buf[i + 2] = c[2];
    buf[i + 3] = 255;
  }

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const i = (y * n + x) * 4;
      let col = BG;

      // Stem (rounded caps via segment distance).
      if (distSeg(x, y, baseX, baseY, forkX, forkY).d <= stemHalf) col = TONGUE;
      // Forked prongs, tapering to a point at each tip.
      const pl = distSeg(x, y, forkX, forkY, tipLX, tipLY);
      if (pl.d <= prongBase * (1 - pl.t) + prongTip * pl.t) col = TONGUE;
      const pr = distSeg(x, y, forkX, forkY, tipRX, tipRY);
      if (pr.d <= prongBase * (1 - pr.t) + prongTip * pr.t) col = TONGUE;

      // The bane: dark outline, then bone-white core, laid over everything.
      const b = distSeg(x, y, bAx, bAy, bBx, bBy).d;
      if (b <= baneHalf + 1.6) col = OUTLINE;
      if (b <= baneHalf) col = BANE;

      plot(buf, i, col);
    }
  }
  return buf;
}

const outDir = path.join(__dirname, "..", "icons");
fs.mkdirSync(outDir, { recursive: true });

[16, 32, 48, 128].forEach(function (size) {
  const png = encodePng(size, size, draw(size));
  const file = path.join(outDir, "icon" + size + ".png");
  fs.writeFileSync(file, png);
  console.log("wrote", file, png.length + "b");
});
