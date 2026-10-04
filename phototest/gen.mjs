// Test photos for DealerLoft's photo upload: one per case the upload code
// handles. Drawn images with a fake GPS location; nothing real.
//   rotated.jpg  4032×3024 pixels stored sideways with EXIF orientation 6
//                (how phones save portrait shots) + GPS → must come out
//                upright, 1536×2048, no GPS
//   keep.jpg     1600×1200, upright, sRGB, small, with GPS + camera EXIF →
//                kept as is, only the EXIF removed
//   p3.jpg       1200×900 with a Display P3 color profile → converted to sRGB
//   alpha.png    1000×800 with transparent corners → transparent becomes white
//   photo.webp   2400×1600 WebP → JPEG, 2048×1365
// Run: node phototest/gen.mjs

import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire("C:/Users/777/dealer-post/package.json");
const sharp = require("sharp");
const OUT = new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");

const gps = {
  IFD0: { Make: "TestCam", Model: "DealerLoft test", Software: "gen.mjs" },
  IFD3: { GPSLatitudeRef: "N", GPSLatitude: "33/1 26/1 54/1", GPSLongitudeRef: "W", GPSLongitude: "112/1 4/1 26/1" },
};

const scene = (w, h, label, fill = "#3a6ea5") => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="#dfe8f1"/>
  <rect x="${w * 0.1}" y="${h * 0.35}" width="${w * 0.8}" height="${h * 0.3}" rx="${w * 0.05}" fill="${fill}"/>
  <polygon points="${w / 2},${h * 0.04} ${w * 0.4},${h * 0.16} ${w * 0.6},${h * 0.16}" fill="#c62828"/>
  <text x="${w / 2}" y="${h * 0.24}" font-family="Arial" font-weight="700" font-size="${Math.round(w / 14)}" text-anchor="middle" fill="#c62828">TOP</text>
  <text x="${w / 2}" y="${h * 0.85}" font-family="Arial" font-size="${Math.round(w / 22)}" text-anchor="middle" fill="#222">${label}</text>
</svg>`);

// Portrait scene, stored rotated 90° counter-clockwise; orientation 6 tells
// viewers to turn it back clockwise.
const portrait = await sharp(scene(3024, 4032, "rotated.jpg · should be upright")).png().toBuffer();
await sharp(portrait).rotate(-90).withExif(gps).withMetadata({ orientation: 6 }).jpeg({ quality: 90 }).toFile(join(OUT, "rotated.jpg"));

await sharp(scene(1600, 1200, "keep.jpg · kept, EXIF removed")).withExif(gps).jpeg({ quality: 85 }).toFile(join(OUT, "keep.jpg"));

await sharp(scene(1200, 900, "p3.jpg · Display P3", "#ff0000")).withIccProfile("p3").jpeg({ quality: 90 }).toFile(join(OUT, "p3.jpg"));

await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="800">
  <circle cx="500" cy="400" r="380" fill="#2e7d32"/>
  <text x="500" y="420" font-family="Arial" font-size="56" text-anchor="middle" fill="#fff">alpha.png · corners white</text>
</svg>`)).png().toFile(join(OUT, "alpha.png"));

await sharp(scene(2400, 1600, "photo.webp")).webp({ quality: 85 }).toFile(join(OUT, "photo.webp"));

for (const f of ["rotated.jpg", "keep.jpg", "p3.jpg", "alpha.png", "photo.webp"]) {
  const m = await sharp(join(OUT, f)).metadata();
  console.log(f, m.format, `${m.width}x${m.height}`, "orientation", m.orientation ?? "-", "exif", m.exif ? m.exif.length + "B" : "-", "icc", m.icc ? m.icc.length + "B" : "-", "alpha", m.hasAlpha, (m.size / 1024).toFixed(0) + "KB");
}
