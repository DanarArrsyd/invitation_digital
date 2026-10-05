import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

// Text arrows (↗ ↘) render as colour emoji on iOS. Public themes draw
// their action glyphs from src/themes/shared/action-icons.tsx instead.
test("theme markup uses drawn action icons, never text arrows", () => {
  const root = new URL("../src/themes/", import.meta.url);
  const files = readdirSync(root, { recursive: true }).filter((file) => file.endsWith(".tsx") && !file.endsWith("action-icons.tsx"));
  for (const file of files) {
    const source = readFileSync(new URL(file, root), "utf8");
    assert.doesNotMatch(source, />\s*[↗↘↓]\s*</, `${file} renders a text arrow`);
  }
});
