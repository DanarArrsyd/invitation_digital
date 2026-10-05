/**
 * Renders the Temuraya brand files from the gapura mark:
 *   src/app/icon.svg, src/app/apple-icon.png, src/app/opengraph-image.png
 * The same geometry lives in src/components/brand/temuraya-mark.tsx.
 *
 *   node scripts/brand/render-icons.mjs [path-to-chromium]
 */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
const b64 = (f) => "data:font/woff2;base64," + readFileSync(f).toString("base64");
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright-core"));
} catch {
  ({ chromium } = require(process.env.PLAYWRIGHT_CORE ?? "playwright"));
}
const ROOT = new URL("../../", import.meta.url).pathname.replace(/\/$/, "");
const MARK = () => `
  <path d="M13.5 51V33a18.5 18.5 0 0 1 37 0v18" fill="none" stroke="#f4f5f1" stroke-opacity=".5" stroke-width="1.8"/>
  <path d="M20 51V33a12 12 0 0 1 24 0v18" fill="none" stroke="#f4f5f1" stroke-width="3.2"/>
  <path d="M25.5 34.5h13M32 34.5V51" fill="none" stroke="#f4f5f1" stroke-width="3.2"/>
  <path d="M32 5.5l2.6 3.9L32 13.3l-2.6-3.9z" fill="#d6c493"/>`;
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="15" fill="#1f2b25"/>
  <g transform="translate(0 3)">${MARK()}
  </g>
</svg>
`;
writeFileSync(ROOT + "/src/app/icon.svg", icon);

const b = await chromium.launch({ executablePath: process.argv[2] || undefined });
const p = await b.newPage();
// Apple touch icon: full bleed, iOS rounds the corners itself.
await p.setViewportSize({ width: 180, height: 180 });
await p.setContent(`<body style="margin:0;background:#1f2b25"><svg width="180" height="180" viewBox="0 0 64 64" style="display:block"><g transform="translate(6.4 9.4) scale(.8)">${MARK()}</g></svg></body>`);
await p.screenshot({ path: ROOT + "/src/app/apple-icon.png" });

const fonts = ROOT + "/node_modules/@fontsource-variable";
await p.setViewportSize({ width: 1200, height: 630 });
await p.setContent(`<html><head><style>
@font-face{font-family:G;src:url(${b64(fonts + "/familjen-grotesk/files/familjen-grotesk-latin-wght-normal.woff2")});font-weight:400 700}
@font-face{font-family:N;font-style:italic;src:url(${b64(fonts + "/newsreader/files/newsreader-latin-wght-italic.woff2")})}
html,body{margin:0;width:1200px;height:630px;background:#1f2b25;color:#f4f5f1;overflow:hidden}
.arch{position:absolute;border:1.5px solid rgba(244,245,241,.12);border-bottom:0;border-radius:999px 999px 0 0}
.wrap{position:absolute;inset:0;display:flex;align-items:center;padding:0 96px;gap:64px}
.word{font-family:G;font-weight:600;font-size:104px;letter-spacing:-.035em;line-height:1}
.tag{margin-top:22px;font-family:N;font-style:italic;font-size:40px;color:rgba(244,245,241,.78)}
.foot{position:absolute;left:96px;right:96px;bottom:56px;display:flex;justify-content:space-between;font-family:G;font-size:20px;letter-spacing:.2em;white-space:nowrap;text-transform:uppercase;color:rgba(244,245,241,.5);border-top:1px solid rgba(244,245,241,.15);padding-top:22px}
</style></head><body>
<div class="arch" style="right:-60px;top:70px;width:420px;height:700px"></div>
<div class="arch" style="right:40px;top:150px;width:420px;height:700px"></div>
<div class="wrap">
  <svg width="210" height="240" viewBox="11 4 42 48">${MARK()}</svg>
  <div><div class="word">Temuraya</div><div class="tag">Undangan digital untuk setiap perayaan.</div></div>
</div>
<div class="foot"><span>Pernikahan · Aqiqah · Ulang tahun · Acara kantor</span><span>temuraya</span></div>
</body></html>`);
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: ROOT + "/src/app/opengraph-image.png" });
await b.close();
