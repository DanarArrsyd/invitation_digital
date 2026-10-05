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
};

function html({ from, to, ink, label, caption, width, height }) {
  const short = Math.min(width, height);
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
  const dir = new URL(`../../public/demo/${demo.theme}/`, import.meta.url);
  await mkdir(dir, { recursive: true });
  const palette = PALETTES[demo.theme];
  for (const [index, slot] of IMAGE_SLOTS.entries()) {
    const [from, to, ink] = palette[index % palette.length];
    await page.setViewportSize({ width: slot.width, height: slot.height });
    await page.setContent(
      html({ from, to, ink, label: `Sample ${index + 1}`, caption: NAMES[demo.theme], width: slot.width, height: slot.height }),
    );
    await page.screenshot({ path: new URL(slot.file, dir).pathname, type: "jpeg", quality: 80 });
  }
  console.log(`${demo.theme}: ${IMAGE_SLOTS.length} images`);
}
await browser.close();
