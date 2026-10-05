import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationsDir = new URL("../supabase/migrations/", import.meta.url);
const migration = readFileSync(new URL("20261005000001_marketing_catalogue.sql", migrationsDir), "utf8");

test("invitations gain a demo flag with at most one demo per theme", () => {
  assert.match(migration, /alter table public\.invitations\s+add column is_demo boolean not null default false/i);
  assert.match(
    migration,
    /create unique index invitations_one_demo_per_theme_idx\s+on public\.invitations \(theme_id\) where is_demo/i,
  );
});

test("themes gain catalogue fields with a valid event-type check", () => {
  for (const column of [
    /add column tagline text/i,
    /add column event_types text\[\] not null default '\{wedding\}'/i,
    /add column screenshot_paths text\[\] not null default '\{\}'/i,
    /add column is_listed boolean not null default false/i,
    /add column sort_order integer not null default 0/i,
  ]) {
    assert.match(migration, column);
  }
  assert.match(
    migration,
    /event_types <@ array\['wedding', 'birthday', 'engagement', 'aqiqah', 'graduation', 'corporate'\]::text\[\]/i,
  );
});

test("no migration adds a second foreign key between themes and invitations", () => {
  // invitations.theme_id -> themes is the only allowed link; a key in the other
  // direction makes PostgREST embeds like theme:themes(*) ambiguous.
  for (const file of readdirSync(migrationsDir).filter((name) => name.endsWith(".sql"))) {
    const sql = readFileSync(new URL(file, migrationsDir), "utf8");
    const themeAlters = sql.match(/alter table public\.themes[\s\S]*?;/gi) ?? [];
    for (const statement of themeAlters) {
      assert.doesNotMatch(statement, /references public\.invitations/i, `${file} links themes back to invitations`);
    }
  }
});

test("package offers and site settings are seeded and readable by the public site", () => {
  assert.match(migration, /create table public\.package_offers/i);
  assert.match(migration, /package_key in \('intimate', 'signature', 'grand'\)/i);
  assert.match(migration, /price_idr integer check \(price_idr >= 0\)/i);
  assert.match(migration, /values \('intimate'\), \('signature'\), \('grand'\)/i);

  assert.match(migration, /create table public\.site_settings/i);
  assert.match(migration, /id boolean primary key default true check \(id\)/i);
  assert.match(migration, /whatsapp_number text check \(whatsapp_number ~ '\^\[1-9\]\[0-9\]\{7,14\}\$'\)/);
  assert.match(migration, /\{template\}[\s\S]*\{paket\}[\s\S]*\{acara\}/);

  for (const table of ["package_offers", "site_settings"]) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
    assert.match(
      migration,
      new RegExp(`create policy "${table}_public_select"\\s+on public\\.${table} for select\\s+to anon, authenticated`, "i"),
    );
    assert.match(
      migration,
      new RegExp(`create policy "${table}_admin_all"\\s+on public\\.${table} for all\\s+to authenticated`, "i"),
    );
  }
  assert.match(migration, /create policy "themes_public_select_listed"[\s\S]*?using \(is_listed = true\)/i);
});
