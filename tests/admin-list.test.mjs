import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

function loadTs(path, dependencies = {}) {
  const output = ts.transpileModule(readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports, module: { exports }, Date, Intl,
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error(`Unexpected import in ${path}: ${name}`);
    },
  });
  return exports;
}

test("acara terdekat lists upcoming events first, then undated, then past ones newest first", () => {
  const { sortByUpcomingEvent } = loadTs("server/invitations/queries.ts", {
    react: { cache: (fn) => fn },
    "@/lib/supabase/server": {},
  });
  const items = [
    { id: "past-old", event_date: "2026-01-10" },
    { id: "far", event_date: "2027-03-01" },
    { id: "undated", event_date: null },
    { id: "soon", event_date: "2026-10-20" },
    { id: "past-recent", event_date: "2026-09-30" },
    { id: "today", event_date: "2026-10-05" },
  ];
  assert.deepEqual(
    [...sortByUpcomingEvent(items, "2026-10-05")].map((item) => item.id),
    ["today", "soon", "far", "undated", "past-recent", "past-old"],
  );
});

test("event countdown labels count days in Jakarta", () => {
  const { eventCountdownLabel } = loadTs("components/admin/format.ts");
  // 23:30 WIB on 4 Oct is still 4 Oct in Jakarta (16:30 UTC).
  const now = new Date("2026-10-04T16:30:00Z");
  assert.equal(eventCountdownLabel("2026-10-16", now), "H-12");
  assert.equal(eventCountdownLabel("2026-10-04", now), "Hari H");
  assert.equal(eventCountdownLabel("2026-10-01", now), "Selesai");
  assert.equal(eventCountdownLabel(null, now), null);
});
