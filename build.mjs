// Builds the Sunset Motors test dealer site for DealerLoft's website import.
// A made-up dealership: every page says so, and robots.txt lets only
// DealerLoftBot in. Run: node build.mjs  (writes into this folder)
//
// To test updates, change a car below (price, mileage, sold: true) or remove
// one, run the build again, commit and push.

import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const require = createRequire("C:/Users/777/dealer-post/package.json");
const sharp = require("sharp");

const SITE = "https://xenpain-source.github.io";
const OUT = new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const DEALER = { name: "Sunset Motors (test)", phone: "(602) 555-0142" };

const CARS = [
  { stock: "SM1024", vin: "1HGCV1F35MA012345", year: 2021, make: "Honda", model: "Accord", trim: "Sport", body: "Sedan", color: "Crystal Black Pearl", trans: "Automatic (CVT)", drive: "FWD", fuel: "Gasoline", miles: 48231, price: 22995, hue: 220,
    notes: "One owner, clean title. Sport trim with 19-inch wheels, backup camera and Apple CarPlay. New front tires.", sold: false },
  { stock: "SM1025", vin: "5NMS2DAJXMH123456", year: 2021, make: "Hyundai", model: "Santa Fe", trim: "SEL", body: "SUV", color: "Quartz White", trans: "Automatic (8-speed)", drive: "AWD", fuel: "Gasoline", miles: 61442, price: 21495, hue: 30,
    notes: "Clean title. AWD, heated front seats, blind-spot monitoring. Serviced at our shop.", sold: false },
  { stock: "SM1026", vin: "1FMCU9BZ8MUA23456", year: 2021, make: "Ford", model: "Escape", trim: "SE Hybrid", body: "SUV", color: "Iconic Silver Metallic", trans: "Automatic (eCVT)", drive: "AWD", fuel: "Hybrid", miles: 54108, price: 20995, hue: 190,
    notes: "One owner, clean title. Hybrid AWD, about 40 mpg combined. Two keys.", sold: false },
  { stock: "SM1027", vin: "3CZRU5H50MM345678", year: 2021, make: "Honda", model: "HR-V", trim: "EX", body: "SUV", color: "Aegean Blue Metallic", trans: "Automatic (CVT)", drive: "FWD", fuel: "Gasoline", miles: 39821, price: 23495, hue: 205,
    notes: "Clean title. Sunroof, heated seats, Honda Sensing. Low miles.", sold: false },
  { stock: "SM1028", vin: "1G1ZD5ST8MF456789", year: 2021, make: "Chevrolet", model: "Malibu", trim: "LT", body: "Sedan", color: "Summit White", trans: "Automatic (CVT)", drive: "FWD", fuel: "Gasoline", miles: 67903, price: 17995, hue: 0,
    notes: "Clean title. Remote start, 8-inch touchscreen, rear camera.", sold: false },
];

const PHOTOS_PER_CAR = 4;
const slug = (c) => `used-${c.year}-${c.make}-${c.model}-${c.trim}-${c.stock}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const name = (c) => `${c.year} ${c.make} ${c.model} ${c.trim}`;
const money = (n) => "$" + n.toLocaleString("en-US");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// A drawn sample photo: sky, ground, a simple car shape in the car's color
// family, and a label. The first photo of the first car is large (3000 px)
// so the importer's resizing gets exercised.
async function photo(c, i, file) {
  const big = c === CARS[0] && i === 1;
  const [w, h] = big ? [3000, 2250] : [1600, 1200];
  const views = ["Front 3/4", "Side", "Rear 3/4", "Interior"];
  const body = c.hue === 0 ? "#e8e8e8" : c.hue === 30 ? "#f2efe8" : `hsl(${c.hue},45%,${c.color.includes("Black") ? 15 : 45}%)`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="0 0 1600 1200">
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc8ee"/><stop offset="1" stop-color="#e6f1fa"/></linearGradient></defs>
  <rect width="1600" height="760" fill="url(#s)"/><rect y="760" width="1600" height="440" fill="#8a8f96"/>
  <path d="M260 760 Q270 620 420 600 L560 470 Q620 430 760 430 L1040 430 Q1130 430 1190 500 L1280 600 Q1360 615 1360 700 L1360 760 Z" fill="${body}" stroke="#222" stroke-width="6"/>
  <path d="M600 590 L660 495 Q690 470 760 470 L880 470 L880 590 Z M910 590 L910 470 L1030 470 Q1090 470 1130 520 L1180 590 Z" fill="#2c3e50" opacity="0.85"/>
  <circle cx="480" cy="770" r="95" fill="#1d1d1d"/><circle cx="480" cy="770" r="45" fill="#aaa"/>
  <circle cx="1150" cy="770" r="95" fill="#1d1d1d"/><circle cx="1150" cy="770" r="45" fill="#aaa"/>
  <rect x="0" y="1010" width="1600" height="190" fill="#000" opacity="0.55"/>
  <text x="60" y="1090" font-family="Arial" font-size="56" font-weight="700" fill="#fff">${esc(name(c))}</text>
  <text x="60" y="1160" font-family="Arial" font-size="40" fill="#ddd">Sample photo ${i} of ${PHOTOS_PER_CAR} · ${views[i - 1]} · ${c.stock} · test site</text>
</svg>`;
  await sharp(Buffer.from(svg)).resize(w, h).jpeg({ quality: 88 }).toFile(file);
}

const STYLE = `body{margin:0;font-family:system-ui,Arial,sans-serif;color:#1d2330;background:#f6f7f9}
.banner{background:#ffd54a;padding:10px 16px;font-weight:600;text-align:center}
header,main,footer{max-width:1040px;margin:0 auto;padding:16px}
header a{color:inherit;text-decoration:none;font-size:22px;font-weight:800}
.grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.card{background:#fff;border:1px solid #dde1e7;border-radius:10px;overflow:hidden;color:inherit;text-decoration:none}
.card img,.gallery img{width:100%;display:block;aspect-ratio:4/3;object-fit:cover}
.card div{padding:10px 12px}.price{font-size:20px;font-weight:700}
.gallery{display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
dl{display:grid;grid-template-columns:max-content 1fr;gap:6px 16px}dt{color:#667}
.sold{background:#c62828;color:#fff;padding:2px 8px;border-radius:4px;font-size:14px}`;

const page = (title, body, extraHead = "") => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${esc(title)}</title><style>${STYLE}</style>${extraHead}</head>
<body><div class="banner">Test site — not a real dealership. Made-up cars for testing DealerLoft's website import.</div>
<header><a href="/">${DEALER.name}</a></header>
<main>${body}</main>
<footer><p>${DEALER.name} · ${DEALER.phone} (fictional number) · <a href="/inventory/">Inventory</a></p></footer>
</body></html>`;

const card = (c) => `<a class="card" href="/inventory/${slug(c)}/"><img src="/photos/${c.stock}/1.jpg" alt="${esc(name(c))}" loading="lazy">
<div><b>${esc(name(c))}</b>${c.sold ? ' <span class="sold">Sold</span>' : ""}<div class="price">${money(c.price)}</div><small>${c.miles.toLocaleString("en-US")} mi · Stock ${c.stock}</small></div></a>`;

function jsonLd(c) {
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: name(c),
    description: c.notes,
    vehicleIdentificationNumber: c.vin,
    sku: c.stock,
    brand: { "@type": "Brand", name: c.make },
    model: c.model,
    vehicleConfiguration: c.trim,
    vehicleModelDate: String(c.year),
    bodyType: c.body,
    color: c.color,
    vehicleTransmission: c.trans,
    driveWheelConfiguration: c.drive,
    fuelType: c.fuel,
    itemCondition: "https://schema.org/UsedCondition",
    mileageFromOdometer: { "@type": "QuantitativeValue", value: c.miles, unitCode: "SMI" },
    image: Array.from({ length: PHOTOS_PER_CAR }, (_, i) => `${SITE}/photos/${c.stock}/${i + 1}.jpg`),
    url: `${SITE}/inventory/${slug(c)}/`,
    offers: {
      "@type": "Offer",
      price: c.price,
      priceCurrency: "USD",
      availability: c.sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      seller: { "@type": "AutoDealer", name: DEALER.name, telephone: DEALER.phone },
    },
  };
}

for (const dir of ["inventory", "photos"]) rmSync(join(OUT, dir), { recursive: true, force: true });

for (const c of CARS) {
  const dir = join(OUT, "photos", c.stock);
  mkdirSync(dir, { recursive: true });
  for (let i = 1; i <= PHOTOS_PER_CAR; i++) await photo(c, i, join(dir, `${i}.jpg`));

  const ld = `<script type="application/ld+json">${JSON.stringify(jsonLd(c)).replace(/</g, "\\u003c")}</script>`;
  const body = `<p><a href="/inventory/">← All inventory</a></p>
<h1>${esc(name(c))}${c.sold ? ' <span class="sold">Sold</span>' : ""}</h1>
<p class="price">${money(c.price)}</p>
<div class="gallery">${Array.from({ length: PHOTOS_PER_CAR }, (_, i) => `<img src="/photos/${c.stock}/${i + 1}.jpg" alt="${esc(name(c))} photo ${i + 1}">`).join("")}</div>
<h2>Details</h2>
<dl><dt>Mileage</dt><dd>${c.miles.toLocaleString("en-US")} mi</dd><dt>VIN</dt><dd>${c.vin}</dd><dt>Stock #</dt><dd>${c.stock}</dd>
<dt>Body</dt><dd>${c.body}</dd><dt>Color</dt><dd>${esc(c.color)}</dd><dt>Transmission</dt><dd>${esc(c.trans)}</dd><dt>Drive</dt><dd>${c.drive}</dd><dt>Fuel</dt><dd>${c.fuel}</dd></dl>
<h2>Notes</h2><p>${esc(c.notes)}</p>`;
  mkdirSync(join(OUT, "inventory", slug(c)), { recursive: true });
  writeFileSync(join(OUT, "inventory", slug(c), "index.html"), page(`${name(c)} — ${DEALER.name}`, body, ld));
}

writeFileSync(join(OUT, "inventory", "index.html"), page(`Inventory — ${DEALER.name}`, `<h1>Used cars in stock</h1><div class="grid">${CARS.map(card).join("")}</div>`));
writeFileSync(join(OUT, "index.html"), page(DEALER.name, `<h1>Quality used cars in Phoenix (not really)</h1><p><a href="/inventory/">See all ${CARS.length} cars in stock</a></p><div class="grid">${CARS.slice(0, 3).map(card).join("")}</div>`));
writeFileSync(join(OUT, "robots.txt"), `# Test site: only DealerLoft's importer may read it.\nUser-agent: DealerLoftBot\nAllow: /\n\nUser-agent: *\nDisallow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
const urls = ["/", "/inventory/", ...CARS.map((c) => `/inventory/${slug(c)}/`)];
writeFileSync(join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join("\n")}\n</urlset>\n`);
writeFileSync(join(OUT, ".nojekyll"), "");
console.log(`Built ${CARS.length} cars, ${CARS.length * PHOTOS_PER_CAR} photos.`);
