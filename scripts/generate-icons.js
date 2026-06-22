/*
  Generates the extension icons with Node stdlib only (zlib for PNG deflate).
  Design: a hooded shade on a dark disc — grey cloak, black face void, two dead
  red X eyes (the silenced whisperer). Run: node scripts/generate-icons.js
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

// Grima's Bane mark: a hooded shade on a dark disc — grey cloak/hood, black face
// void, two dead red X eyes. The silenced whisperer. Coordinates are in 0..1
// (fractions of the icon) so the design is resolution-independent; rendered with
// 4x supersampling for clean anti-aliased edges and transparent corners.

// Hood/cloak outer silhouette (closed polygon, clockwise from the peak).
var HOOD = [
  [0.50, 0.105],
  [0.590, 0.150], [0.668, 0.232], [0.720, 0.340], [0.748, 0.460], [0.752, 0.560],
  [0.792, 0.648], [0.828, 0.738], [0.815, 0.800],
  [0.730, 0.792], [0.640, 0.788], [0.560, 0.802], [0.50, 0.778],
  [0.440, 0.802], [0.360, 0.788], [0.270, 0.792], [0.185, 0.800],
  [0.172, 0.738], [0.208, 0.648], [0.248, 0.560],
  [0.252, 0.460], [0.280, 0.340], [0.332, 0.232], [0.410, 0.150]
];

// Inner face opening (black void where the eyes sit).
var FACE = [
  [0.50, 0.300],
  [0.566, 0.365], [0.610, 0.450], [0.625, 0.535], [0.600, 0.618], [0.553, 0.682], [0.50, 0.718],
  [0.447, 0.682], [0.400, 0.618], [0.375, 0.535], [0.390, 0.450], [0.434, 0.365]
];

function pointInPoly(px, py, poly) {
  var inside = false;
  for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    var xi = poly[i][0], yi = poly[i][1];
    var xj = poly[j][0], yj = poly[j][1];
    if (((yi > py) !== (yj > py)) &&
        (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

function segDist(px, py, ax, ay, bx, by) {
  var dx = bx - ax, dy = by - ay;
  var len2 = dx * dx + dy * dy;
  var t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function draw(n) {
  const buf = Buffer.alloc(n * n * 4);
  const SS = 4; // supersampling factor per axis

  const BG = [24, 26, 28];    // dark disc behind the figure
  const HOODC = [96, 100, 105]; // grey cloak
  const FACEC = [9, 9, 11];   // black face void
  const EYE = [226, 34, 34];  // dead red X eyes

  const cx = 0.5, cy = 0.5, rDisc = 0.485; // disc kept tight so the head dominates
  const eyeL = [0.430, 0.508], eyeR = [0.570, 0.508];
  const eHalf = 0.058, eThick = 0.030;

  function eyeHit(fx, fy, e) {
    var d = Math.min(
      segDist(fx, fy, e[0] - eHalf, e[1] - eHalf, e[0] + eHalf, e[1] + eHalf),
      segDist(fx, fy, e[0] - eHalf, e[1] + eHalf, e[0] + eHalf, e[1] - eHalf)
    );
    return d <= eThick / 2;
  }

  function sample(fx, fy) {
    var dxc = fx - cx, dyc = fy - cy;
    if (dxc * dxc + dyc * dyc > rDisc * rDisc) return null; // transparent corner
    if (eyeHit(fx, fy, eyeL) || eyeHit(fx, fy, eyeR)) return EYE;
    if (pointInPoly(fx, fy, FACE)) return FACEC;
    if (pointInPoly(fx, fy, HOOD)) return HOODC;
    return BG;
  }

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let r = 0, g = 0, b = 0, hits = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const fx = (x + (sx + 0.5) / SS) / n;
          const fy = (y + (sy + 0.5) / SS) / n;
          const c = sample(fx, fy);
          if (c) { r += c[0]; g += c[1]; b += c[2]; hits++; }
        }
      }
      const i = (y * n + x) * 4;
      const total = SS * SS;
      if (hits === 0) {
        buf[i] = buf[i + 1] = buf[i + 2] = buf[i + 3] = 0;
      } else {
        buf[i] = Math.round(r / hits);
        buf[i + 1] = Math.round(g / hits);
        buf[i + 2] = Math.round(b / hits);
        buf[i + 3] = Math.round((hits / total) * 255);
      }
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
