const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(size) {
  // Simple PNG encoder using Node's zlib
  const width = size;
  const height = size;

  // Raw RGBA buffer
  const buffer = Buffer.alloc(height * (1 + width * 4));
  const cx = width / 2;
  const cy = height / 2;
  const r = width * 0.42;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    buffer[offset++] = 0; // Filter byte: None
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= r) {
        // Gradient / glowing orb
        const t = dist / r;
        // Core color: #4285F4 (66, 133, 244)
        // Center highlight: #8ab4f8
        const rVal = Math.round(138 * (1 - t) + 66 * t);
        const gVal = Math.round(180 * (1 - t) + 133 * t);
        const bVal = Math.round(248 * (1 - t) + 244 * t);
        const alpha = Math.min(255, Math.round(255 * (1 - Math.pow(t, 2.5))));
        
        buffer[offset++] = rVal;
        buffer[offset++] = gVal;
        buffer[offset++] = bVal;
        buffer[offset++] = alpha;
      } else if (dist <= r + 2 && size >= 32) {
        // Subtle outer glow edge
        const t = (dist - r) / 2;
        buffer[offset++] = 66;
        buffer[offset++] = 133;
        buffer[offset++] = 244;
        buffer[offset++] = Math.round(60 * (1 - t));
      } else {
        buffer[offset++] = 0;
        buffer[offset++] = 0;
        buffer[offset++] = 0;
        buffer[offset++] = 0;
      }
    }
  }

  const compressedData = zlib.deflateSync(buffer);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  typeBuf.copy(chunk, 4);
  data.copy(chunk, 8);

  const crc = crc32(Buffer.concat([typeBuf, data]));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

[16, 32, 48, 128].forEach(size => {
  const pngBuf = createPng(size);
  const filePath = path.join(__dirname, 'assets', `icon${size}.png`);
  fs.writeFileSync(filePath, pngBuf);
  console.log(`Generated icon${size}.png (${size}x${size})`);
});
