/**
 * Renders the "Sample N" placeholder photos for every demo template into
 * public/demo/<theme>/. Run with a Chromium-capable playwright install:
 *
 *   node scripts/demo/images.mjs [path-to-chromium]
 */
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";

import { DEMOS, IMAGE_SLOTS, PALETTES } from "./content.mjs";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright-core"));
} catch {
  ({ chromium } = require(process.env.PLAYWRIGHT_CORE ?? "playwright"));
}

const NAMES = {
  "nusantara-ivory": "Nusantara Ivory",
  "terra-botanica": "Terra Botanica",
  "midnight-atelier": "Midnight Atelier",
  "cobalt-riviera": "Cobalt Riviera",
  "kelir-kencana": "Kelir Kencana",
  "rona-cetak": "Rona Cetak",
  "janji-kota": "Janji Kota",
  "benang-sriwijaya": "Benang Sriwijaya",
};

function html({ theme, from, to, ink, label, caption, width, height }) {
  const short = Math.min(width, height);
  if (theme === "benang-sriwijaya") {
    return `<!doctype html><html><head><style>
      html,body{margin:0;width:${width}px;height:${height}px}
      body{position:relative;overflow:hidden;background:${from};color:${ink};font-family:Georgia,serif}
      .rail{position:absolute;top:4%;bottom:4%;left:7%;right:7%;border-inline:2px solid ${to}}
      .rail:before,.rail:after{content:"";position:absolute;top:0;bottom:0;width:1px;background:${ink};opacity:.35}
      .rail:before{left:12px}.rail:after{right:12px}
      .thread{position:absolute;left:50%;top:0;bottom:0;width:2px;background:${to};opacity:.55}
      .cross{position:absolute;left:17%;right:17%;top:48%;height:1px;background:${ink};opacity:.35;box-shadow:0 12px ${to},0 -12px ${to}}
      .text{position:absolute;left:15%;right:15%;top:53%;transform:translateY(-50%);text-align:center}
      .label{font-size:${Math.round(short*.115)}px;font-style:italic;line-height:1}
      .caption{margin-top:${Math.round(short*.04)}px;font:700 ${Math.round(short*.024)}px Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase}
    </style></head><body><div class="rail"></div><div class="thread"></div><div class="cross"></div><div class="text"><div class="label">${label}</div><div class="caption">${caption}</div></div></body></html>`;
  }
  if (theme === "janji-kota") {
    return `<!doctype html><html><head><style>
      html,body{margin:0;width:${width}px;height:${height}px}
      body{position:relative;overflow:hidden;background:${from};color:${ink};font-family:Arial,Helvetica,sans-serif}
      .building{position:absolute;bottom:0;width:36%;height:78%;left:0;background:${to};opacity:.68}
      .building.second{left:auto;right:0;width:22%;height:92%;opacity:.48}
      .window{position:absolute;left:9%;top:13%;width:2px;height:55%;background:${ink};opacity:.42;box-shadow:${Math.round(short*.14)}px 0 ${ink},${Math.round(short*.28)}px 0 ${ink}}
      .horizon{position:absolute;left:0;right:0;top:67%;border-top:2px solid ${ink};opacity:.55}
      .light{position:absolute;right:12%;top:19%;width:${Math.round(short*.13)}px;height:${Math.round(short*.13)}px;border-radius:50%;background:#E6AE4B}
      .label{position:absolute;left:9%;right:9%;bottom:16%;font-size:${Math.round(short*.105)}px;font-weight:700;line-height:.95;letter-spacing:-.075em}
      .caption{position:absolute;left:9%;bottom:9%;font-size:${Math.round(short*.025)}px;letter-spacing:.16em;text-transform:uppercase}
    </style></head><body><div class="building"></div><div class="building second"></div><div class="window"></div><div class="horizon"></div><div class="light"></div><div class="label">${label}</div><div class="caption">${caption}</div></body></html>`;
  }
  if (theme === "rona-cetak") {
    return `<!doctype html><html><head><style>
      html,body{margin:0;width:${width}px;height:${height}px}
      body{display:grid;place-items:center;background:${from};color:${ink};font-family:Arial,Helvetica,sans-serif;overflow:hidden}
      .sheet{position:absolute;inset:${Math.round(short * .055)}px;border:2px solid ${ink}}
      .bar{position:absolute;top:${Math.round(short * .055)}px;right:${Math.round(short * .055)}px;width:${Math.round(short * .12)}px;height:48%;background:${to}}
      .text{position:relative;width:70%;text-align:left}
      .label{font-size:${Math.round(short * .11)}px;line-height:.95;letter-spacing:-.08em;font-weight:900}
      .caption{margin-top:${Math.round(short * .045)}px;padding-top:${Math.round(short * .02)}px;border-top:2px solid ${ink};font-size:${Math.round(short * .024)}px;letter-spacing:.17em;text-transform:uppercase}
    </style></head><body><div class="bar"></div><div class="sheet"></div><div class="text"><div class="label">${label}</div><div class="caption">${caption}</div></div></body></html>`;
  }
  return `<!doctype html><html><head><style>
    html,body{margin:0;width:${width}px;height:${height}px}
    body{display:flex;align-items:center;justify-content:center;
      background:radial-gradient(120% 90% at 30% 20%, ${from} 0%, ${to} 100%);
      font-family:Georgia,'Times New Roman',serif;color:${ink}}
    .frame{position:absolute;inset:${Math.round(short * 0.05)}px;border:2px solid ${ink};opacity:.35}
    .arch{position:absolute;left:50%;top:${Math.round(height * 0.16)}px;width:${Math.round(short * 0.46)}px;
      height:${Math.round(height * 0.68)}px;transform:translateX(-50%);border:2px solid ${ink};
      border-radius:999px 999px 0 0;opacity:.18}
    .text{position:relative;text-align:center}
    .label{font-size:${Math.round(short * 0.12)}px;letter-spacing:.02em;font-style:italic}
    .caption{margin-top:${Math.round(short * 0.03)}px;font-family:Helvetica,Arial,sans-serif;
      font-size:${Math.round(short * 0.032)}px;letter-spacing:.3em;text-transform:uppercase;opacity:.7}
  </style></head><body><div class="frame"></div><div class="arch"></div>
  <div class="text"><div class="label">${label}</div><div class="caption">${caption}</div></div></body></html>`;
}

const browser = await chromium.launch({ executablePath: process.argv[2] || undefined });
const page = await browser.newPage();
for (const demo of DEMOS) {
  if (process.env.DEMO_THEME && demo.theme !== process.env.DEMO_THEME) continue;
  const dir = new URL(`../../public/demo/${demo.theme}/`, import.meta.url);
  await mkdir(dir, { recursive: true });
  const palette = PALETTES[demo.theme];
  for (const [index, slot] of IMAGE_SLOTS.entries()) {
    // These two covers use reviewed fictional editorial portraits, not Sample placeholders.
    if (slot.file === "cover.jpg" && (demo.theme === "nusantara-ivory" || demo.theme === "benang-sriwijaya")) continue;
    const [from, to, ink] = palette[index % palette.length];
    await page.setViewportSize({ width: slot.width, height: slot.height });
    await page.setContent(
      html({ theme: demo.theme, from, to, ink, label: `Sample ${index + 1}`, caption: NAMES[demo.theme], width: slot.width, height: slot.height }),
    );
    await page.screenshot({ path: new URL(slot.file, dir).pathname, type: "jpeg", quality: 80 });
  }
  console.log(`${demo.theme}: ${IMAGE_SLOTS.length} images`);
}
await browser.close();
