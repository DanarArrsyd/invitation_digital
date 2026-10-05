import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";

import { getSiteUrl } from "@/lib/marketing/site-url";

import type { ShareScript } from "./share-styles";

type OgFont = { name: string; data: ArrayBuffer; weight: 400 | 600 | 700; style: "normal" | "italic" };

const FONT_DIR = join(process.cwd(), "assets", "og-fonts");

const SCRIPT_FILES: Record<ShareScript, { file: string; weight: 400 | 700 }> = {
  "great-vibes": { file: "great-vibes-latin-400-normal.woff", weight: 400 },
  "herr-von-muellerhoff": { file: "herr-von-muellerhoff-latin-400-normal.woff", weight: 400 },
  "imperial-script": { file: "imperial-script-latin-400-normal.woff", weight: 400 },
  corinthia: { file: "corinthia-latin-700-normal.woff", weight: 700 },
};

const fontCache = new Map<string, Promise<ArrayBuffer>>();

function readFont(file: string): Promise<ArrayBuffer> {
  let pending = fontCache.get(file);
  if (!pending) {
    pending = readFile(join(FONT_DIR, file)).then(
      (buffer) => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer,
    );
    fontCache.set(file, pending);
  }
  return pending;
}

/** Spectral (serif text) plus the given script face, named "Serif" and "Script". */
export async function loadOgFonts(script: ShareScript): Promise<OgFont[]> {
  const scriptFile = SCRIPT_FILES[script];
  const [regular, italic, semibold, scriptData] = await Promise.all([
    readFont("spectral-latin-400-normal.woff"),
    readFont("spectral-latin-400-italic.woff"),
    readFont("spectral-latin-600-normal.woff"),
    readFont(scriptFile.file),
  ]);
  return [
    { name: "Serif", data: regular, weight: 400, style: "normal" },
    { name: "Serif", data: italic, weight: 400, style: "italic" },
    { name: "Serif", data: semibold, weight: 600, style: "normal" },
    { name: "Script", data: scriptData, weight: scriptFile.weight, style: "normal" },
  ];
}

async function readSource(src: string): Promise<Buffer | null> {
  if (src.startsWith("/") && !src.startsWith("//")) {
    // App files in public/ (demo photos): read from disk, else ask the site.
    const publicDir = join(process.cwd(), "public");
    const file = join(publicDir, decodeURIComponent(src.split("?")[0]));
    if (!file.startsWith(`${publicDir}/`)) return null;
    try {
      return await readFile(file);
    } catch {
      src = `${getSiteUrl()}${src}`;
    }
  }
  try {
    const response = await fetch(src, { signal: AbortSignal.timeout(4000) });
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}

/**
 * A banner-sized JPEG data URL for a photo or screenshot, or null when it
 * can't be loaded. Re-encoding through sharp handles WebP uploads (which
 * the banner renderer can't read) and keeps the render small.
 */
export async function loadOgImage(
  src: string | null | undefined,
  { width, height, position = "centre" }: { width: number; height: number; position?: "centre" | "top" },
): Promise<string | null> {
  if (!src) return null;
  const source = await readSource(src);
  if (!source) return null;
  try {
    const jpeg = await sharp(source)
      .rotate()
      .resize(width * 2, height * 2, { fit: "cover", position })
      .jpeg({ quality: 82 })
      .toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return null;
  }
}
