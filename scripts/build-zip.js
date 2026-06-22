/*
  Builds a clean Chrome Web Store upload zip containing ONLY the runtime files
  (manifest, src, icons) — no docs, scripts, or repo cruft. Stdlib only.
  Run: node scripts/build-zip.js  ->  dist/grimas-bane-store.zip
*/

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const root = path.join(__dirname, "..");
const outDir = path.join(root, "dist");
const outFile = path.join(outDir, "grimas-bane-store.zip");

// Files/dirs to include in the package.
const INCLUDE = ["manifest.json", "src", "icons"];

function walk(rel, acc) {
  const abs = path.join(root, rel);
  const stat = fs.statSync(abs);
  if (stat.isDirectory()) {
    fs.readdirSync(abs).forEach(function (name) {
      walk(path.join(rel, name), acc);
    });
  } else {
    acc.push(rel.split(path.sep).join("/")); // zip uses forward slashes
  }
  return acc;
}

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

// Minimal ZIP writer (deflate method, no data descriptors, fixed timestamp).
function buildZip(entries) {
  const DOS_TIME = 0; // fixed — keeps builds reproducible without Date
  const DOS_DATE = 0x21; // 1980-01-01
  const locals = [];
  const centrals = [];
  let offset = 0;

  entries.forEach(function (e) {
    const nameBuf = Buffer.from(e.name, "utf8");
    const crc = crc32(e.data);
    const compressed = zlib.deflateRawSync(e.data, { level: 9 });
    const useDeflate = compressed.length < e.data.length;
    const stored = useDeflate ? compressed : e.data;
    const method = useDeflate ? 8 : 0;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0, 6); // flags
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(DOS_TIME, 10);
    local.writeUInt16LE(DOS_DATE, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(stored.length, 18);
    local.writeUInt32LE(e.data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, nameBuf, stored);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(DOS_TIME, 12);
    central.writeUInt16LE(DOS_DATE, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(stored.length, 20);
    central.writeUInt32LE(e.data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBuf);

    offset += local.length + nameBuf.length + stored.length;
  });

  const centralStart = offset;
  const centralBuf = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(centralStart, 16);

  return Buffer.concat(locals.concat([centralBuf, end]));
}

const files = INCLUDE.reduce(function (acc, item) {
  return walk(item, acc);
}, []);

const entries = files.map(function (rel) {
  return { name: rel, data: fs.readFileSync(path.join(root, rel)) };
});

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, buildZip(entries));
console.log("Packed " + entries.length + " files -> " + outFile);
files.forEach(function (f) { console.log("  " + f); });
