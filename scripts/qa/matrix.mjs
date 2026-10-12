/**
 * Template QA matrix: renders /qa-matrix/<theme> for every case from
 * matrix-cases.mjs, screenshots the cover and the opened invitation, and
 * reports failed checks. Needs `npm run dev` running and a playwright-core
 * install outside the project (like scripts/demo/images.mjs):
 *
 *   npm run qa:matrix -- [--full] [--theme terra-botanica] [--viewport 375]
 *                        [--base-url http://localhost:3000] [--chromium <path>]
 *
 * Exit 0: every check passed. 1: failures (see summary.md). 2: no server.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";

import { buildCases, caseUrl, evaluate, NAV_ANCHOR_SUFFIX } from "./matrix-cases.mjs";

// Exit 2 for every setup or usage error, so exit 1 always means "checks failed".
function usageError(message) {
  console.error(message);
  process.exit(2);
}

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require(process.env.PLAYWRIGHT_CORE ?? "playwright-core"));
} catch {
  usageError(
    "playwright-core not found. Install it outside the project (e.g. `npm install --prefix ~/.qa-tools playwright-core`) " +
      "and run with PLAYWRIGHT_CORE=~/.qa-tools/node_modules/playwright-core.",
  );
}

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const baseUrl = option("base-url", "http://localhost:3000");
let cases;
try {
  cases = buildCases({ full: args.includes("--full"), theme: option("theme"), viewport: option("viewport") });
} catch (error) {
  usageError(error.message);
}

// Runs inside the page; keep it self-contained.
const PROBE = (suffixes) => {
  const meta = document.querySelector("[data-qa-nav-sections]");
  const nav = document.querySelector('nav[aria-label="Navigasi undangan"]');
  const items = nav ? [...nav.querySelectorAll("a, button")] : [];
  return {
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    navSections: (meta?.getAttribute("data-qa-nav-sections") ?? "").split(",").filter(Boolean),
    presentSections: Object.entries(suffixes)
      .filter(([, suffix]) => document.querySelector(`[id$="-${suffix}"]`))
      .map(([key]) => key),
    navLabels: items.map((item) => item.textContent.trim()),
    navItemHeights: items.map((item) => item.getBoundingClientRect().height),
    cutLabels: items
      .filter((item) => [...item.querySelectorAll("*")].some((el) =>
        el.children.length === 0 && el.textContent.trim() && el.scrollWidth > el.clientWidth + 1))
      .map((item) => item.textContent.trim()),
    brokenImages: [...document.images]
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src),
    bodyText: document.body.innerText,
  };
};

async function preflight() {
  const url = caseUrl(baseUrl, cases[0]);
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    usageError(`Cannot open ${url} (${error.message}). Start "npm run dev" first, or pass --base-url.`);
  }
}

async function runCase(browser, c, outDir) {
  const { width, height } = c.viewport;
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: c.reducedMotion ? "reduce" : "no-preference" });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("requestfailed", (request) => failedRequests.push(`${request.url()} (${request.failure()?.errorText ?? "failed"})`));
  page.on("response", (response) => { if (response.status() >= 400) failedRequests.push(`${response.url()} (HTTP ${response.status()})`); });

  try {
    // Not "networkidle": the Turnstile widget keeps a request open forever.
    await page.goto(caseUrl(baseUrl, c), { waitUntil: "load", timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    // The dev-only Next.js indicator sits over the first nav item.
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
    const open = page.getByRole("button", { name: /buka undangan/i }).first();
    const box = await open.boundingBox();
    const openButtonVisible = Boolean(box && box.y >= 0 && box.y + box.height <= height);
    await page.screenshot({ path: join(outDir, `${c.id}__cover.jpg`), type: "jpeg", quality: 70, caret: "initial" });
    await open.click();
    await page.waitForTimeout(c.reducedMotion ? 400 : 2500);
    // Scroll like a guest and capture each screen. A full-page capture would
    // stretch svh/vh sections to the whole page height and never trigger the
    // in-view reveals or typed labels, so it does not show what guests see.
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const step = Math.round(height * 0.9);
    for (let y = 0, shot = 1; y < total; y += step, shot += 1) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(c.reducedMotion ? 150 : 600);
      await page.screenshot({ path: join(outDir, `${c.id}__open-${String(shot).padStart(2, "0")}.jpg`), type: "jpeg", quality: 70, caret: "initial" });
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    const probe = {
      ...(await page.evaluate(PROBE, NAV_ANCHOR_SUFFIX)),
      origin: new URL(baseUrl).origin,
      consoleErrors,
      failedRequests,
      openButtonVisible,
    };
    return { id: c.id, url: caseUrl(baseUrl, c), failures: evaluate(c, probe) };
  } catch (error) {
    return { id: c.id, url: caseUrl(baseUrl, c), failures: [`run error: ${error.message.split("\n")[0]}`] };
  } finally {
    await context.close();
  }
}

await preflight();
const outDir = join("qa-output", new Date().toISOString().replace(/[:.]/g, "-"));
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch(option("chromium") ? { executablePath: option("chromium") } : {});
const results = [];
try {
  for (const [index, c] of cases.entries()) {
    const result = await runCase(browser, c, outDir);
    results.push(result);
    console.log(`${String(index + 1).padStart(4)}/${cases.length} ${result.failures.length ? "FAIL" : "ok  "} ${c.id}`);
  }
} finally {
  await browser.close();
}

const failed = results.filter((result) => result.failures.length);
await writeFile(join(outDir, "report.json"), JSON.stringify({ baseUrl, total: results.length, failed: failed.length, results }, null, 2));
await writeFile(join(outDir, "summary.md"), [
  `# QA matrix — ${new Date().toISOString()}`,
  "",
  `${results.length} pages, ${failed.length} with failures. Base URL: ${baseUrl}`,
  "",
  ...failed.flatMap((result) => [`## ${result.id}`, `<${result.url}>`, "", ...result.failures.map((f) => `- ${f}`), ""]),
].join("\n"));
console.log(`\n${results.length} pages, ${failed.length} with failures. Report: ${outDir}/summary.md`);
process.exit(failed.length ? 1 : 0);
