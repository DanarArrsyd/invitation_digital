import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";

const existingCapacity = new URL("../supabase/migrations/20260923000001_atomic_event_capacity.sql", import.meta.url);
const policyMigration = new URL("../supabase/migrations/20260923000002_package_integrity.sql", import.meta.url);

const firstId = "00000000-0000-4000-8000-000000000001";
const secondId = "00000000-0000-4000-8000-000000000002";

async function makeDb(t) {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(`
    create table public.invitations (
      id uuid primary key,
      package_key text not null check (package_key in ('intimate', 'signature', 'grand')),
      status text not null default 'published',
      settings jsonb not null default '{}'::jsonb
    );
    create table public.invitation_events (
      id uuid primary key,
      invitation_id uuid not null references public.invitations(id) on delete cascade,
      title text not null
    );
    create table public.gallery_items (
      id uuid primary key,
      invitation_id uuid not null references public.invitations(id) on delete cascade,
      image_path text not null
    );
    create table public.wishes (
      id uuid primary key,
      invitation_id uuid not null references public.invitations(id) on delete cascade,
      message text not null
    );
  `);
  await db.exec(readFileSync(existingCapacity, "utf8"));
  if (existsSync(policyMigration)) await db.exec(readFileSync(policyMigration, "utf8"));
  return db;
}

async function packageOf(db, id = firstId) {
  const result = await db.query("select package_key from public.invitations where id = $1", [id]);
  return result.rows[0]?.package_key;
}

test("event edits keep their original invitation even when the target has capacity", async (t) => {
  const db = await makeDb(t);
  await db.exec(`
    insert into public.invitations(id, package_key) values
      ('${firstId}', 'intimate'), ('${secondId}', 'intimate');
    insert into public.invitation_events(id, invitation_id, title) values
      ('00000000-0000-4000-8000-000000000011', '${firstId}', 'Akad');
  `);
  await assert.rejects(
    db.query("update public.invitation_events set invitation_id = $1 where id = $2", [secondId, "00000000-0000-4000-8000-000000000011"]),
    /Acara tidak dapat dipindahkan ke undangan lain/,
  );
  const row = await db.query("select invitation_id from public.invitation_events where title = 'Akad'");
  assert.equal(row.rows[0].invitation_id, firstId);
  await db.query("update public.invitation_events set title = 'Akad baru' where title = 'Akad'");
  assert.equal((await db.query("select title from public.invitation_events")).rows[0].title, "Akad baru");
});

test("downgrade rejects every current conflict and leaves package and content intact", async (t) => {
  const db = await makeDb(t);
  await db.query("insert into public.invitations(id, package_key, settings) values ($1, 'grand', $2)", [firstId, JSON.stringify({ features: { story: true, wishes: true } })]);
  for (let n = 0; n < 3; n += 1) {
    await db.query("insert into public.invitation_events(id, invitation_id, title) values ($1, $2, $3)", [`00000000-0000-4000-8000-00000000002${n}`, firstId, `Event ${n}`]);
  }
  for (let n = 0; n < 9; n += 1) {
    await db.query("insert into public.gallery_items(id, invitation_id, image_path) values ($1, $2, $3)", [`00000000-0000-4000-8000-00000000003${n}`, firstId, `image-${n}`]);
  }
  await assert.rejects(
    db.query("update public.invitations set package_key = 'intimate' where id = $1", [firstId]),
    (error) => {
      assert.match(error.message, /Paket Intimate mendukung maksimal 2 acara/);
      assert.match(error.message, /Paket Intimate mendukung maksimal 8 foto galeri/);
      assert.match(error.message, /Fitur story tidak tersedia di paket Intimate/);
      assert.match(error.message, /Fitur wishes tidak tersedia di paket Intimate/);
      return true;
    },
  );
  assert.equal(await packageOf(db), "grand");
  assert.equal((await db.query("select count(*)::int as n from public.invitation_events")).rows[0].n, 3);
  assert.equal((await db.query("select count(*)::int as n from public.gallery_items")).rows[0].n, 9);
});

test("a compatible downgrade commits; later event, gallery and feature writes cannot bypass it", async (t) => {
  const db = await makeDb(t);
  await db.query("insert into public.invitations(id, package_key, settings) values ($1, 'grand', $2)", [firstId, JSON.stringify({ features: { story: false, wishes: false } })]);
  await db.query("update public.invitations set package_key = 'intimate' where id = $1", [firstId]);
  assert.equal(await packageOf(db), "intimate");
  await assert.rejects(
    db.query("update public.invitations set settings = $1 where id = $2", [JSON.stringify({ features: { story: true } }), firstId]),
    /Fitur Love Story membutuhkan paket Signature/,
  );
  assert.equal((await db.query("select settings from public.invitations where id = $1", [firstId])).rows[0].settings.features.story, false);
  for (let n = 0; n < 2; n += 1) {
    await db.query("insert into public.invitation_events(id, invitation_id, title) values ($1, $2, $3)", [`00000000-0000-4000-8000-00000000004${n}`, firstId, `Event ${n}`]);
  }
  await assert.rejects(
    db.query("insert into public.invitation_events(id, invitation_id, title) values ('00000000-0000-4000-8000-000000000042', $1, 'Third')", [firstId]),
    /Paket Intimate mendukung maksimal 2 acara/,
  );
  for (let n = 0; n < 8; n += 1) {
    await db.query("insert into public.gallery_items(id, invitation_id, image_path) values ($1, $2, $3)", [`00000000-0000-4000-8000-00000000005${n}`, firstId, `image-${n}`]);
  }
  await assert.rejects(
    db.query("insert into public.gallery_items(id, invitation_id, image_path) values ('00000000-0000-4000-8000-000000000058', $1, 'ninth')", [firstId]),
    /Paket Intimate mendukung maksimal 8 foto galeri/,
  );
  await db.query("delete from public.invitation_events where title = 'Event 0'");
  await db.query("delete from public.gallery_items where image_path = 'image-0'");
  assert.equal((await db.query("select count(*)::int as n from public.invitation_events")).rows[0].n, 1);
  assert.equal((await db.query("select count(*)::int as n from public.gallery_items")).rows[0].n, 7);
});

test("Intimate preserves inherited metadata while rejecting new Instagram and Dress Code saves", async (t) => {
  const db = await makeDb(t);
  const saved = { features: { dressCode: false }, personSocials: { person: { instagram: "https://www.instagram.com/old/" } }, dressCode: { description: "Ivory", groups: [] } };
  await db.query("insert into public.invitations(id, package_key, settings) values ($1, 'grand', $2)", [firstId, JSON.stringify(saved)]);
  await db.query("update public.invitations set package_key = 'intimate' where id = $1", [firstId]);
  let row = (await db.query("select settings from public.invitations where id = $1", [firstId])).rows[0];
  assert.deepEqual(row.settings, saved);
  await assert.rejects(
    db.query("update public.invitations set settings = $1 where id = $2", [JSON.stringify({ ...saved, personSocials: { person: { instagram: "https://www.instagram.com/new/" } } }), firstId]),
    /Instagram membutuhkan paket Signature/,
  );
  await assert.rejects(
    db.query("update public.invitations set settings = $1 where id = $2", [JSON.stringify({ ...saved, dressCode: { description: "Blue", groups: [] } }), firstId]),
    /Dress Code membutuhkan paket Signature/,
  );
  row = (await db.query("select settings from public.invitations where id = $1", [firstId])).rows[0];
  assert.deepEqual(row.settings, saved);
  await db.query("update public.invitations set settings = $1 where id = $2", [JSON.stringify({ ...saved, personSocials: { person: {} }, dressCode: { description: null, groups: [] } }), firstId]);
  row = (await db.query("select settings from public.invitations where id = $1", [firstId])).rows[0];
  assert.equal(row.settings.personSocials.person.instagram, undefined);
  assert.equal(row.settings.dressCode.description, null);
});

test("failed downgrade inside a transaction rolls back without partial package changes", async (t) => {
  const db = await makeDb(t);
  await db.query("insert into public.invitations(id, package_key) values ($1, 'grand')", [firstId]);
  await db.query("insert into public.invitation_events(id, invitation_id, title) values ('00000000-0000-4000-8000-000000000061', $1, 'Event')", [firstId]);
  await db.exec("begin");
  await db.query("update public.invitations set package_key = 'signature' where id = $1", [firstId]);
  await assert.rejects(
    db.query("update public.invitations set package_key = 'intimate', settings = $1 where id = $2", [JSON.stringify({ features: { wishes: true } }), firstId]),
    /Fitur wishes tidak tersedia di paket Intimate/,
  );
  await db.exec("rollback");
  assert.equal(await packageOf(db), "grand");
});

test("competing final-slot writes serialize through the parent and cannot exceed either limit", async (t) => {
  const db = await makeDb(t);
  await db.query("insert into public.invitations(id, package_key) values ($1, 'intimate')", [firstId]);
  await db.query("insert into public.invitation_events(id, invitation_id, title) values ('00000000-0000-4000-8000-000000000071', $1, 'First')", [firstId]);
  const events = await Promise.allSettled([
    db.query("insert into public.invitation_events(id, invitation_id, title) values ('00000000-0000-4000-8000-000000000072', $1, 'Second')", [firstId]),
    db.query("insert into public.invitation_events(id, invitation_id, title) values ('00000000-0000-4000-8000-000000000073', $1, 'Third')", [firstId]),
  ]);
  assert.deepEqual(events.map((result) => result.status).sort(), ["fulfilled", "rejected"]);
  assert.equal((await db.query("select count(*)::int as n from public.invitation_events")).rows[0].n, 2);

  for (let n = 0; n < 7; n += 1) {
    await db.query("insert into public.gallery_items(id, invitation_id, image_path) values ($1, $2, $3)", [`00000000-0000-4000-8000-00000000008${n}`, firstId, `image-${n}`]);
  }
  const gallery = await Promise.allSettled([
    db.query("insert into public.gallery_items(id, invitation_id, image_path) values ('00000000-0000-4000-8000-000000000087', $1, 'eighth')", [firstId]),
    db.query("insert into public.gallery_items(id, invitation_id, image_path) values ('00000000-0000-4000-8000-000000000088', $1, 'ninth')", [firstId]),
  ]);
  assert.deepEqual(gallery.map((result) => result.status).sort(), ["fulfilled", "rejected"]);
  assert.equal((await db.query("select count(*)::int as n from public.gallery_items")).rows[0].n, 8);
});

test("migration can be reapplied and invoker trigger observes admin RLS-visible content", async (t) => {
  const db = await makeDb(t);
  await db.exec(readFileSync(policyMigration, "utf8"));
  await db.exec(`
    create role package_test_admin;
    grant usage on schema public to package_test_admin;
    grant select, update, insert on public.invitations to package_test_admin;
    grant select, insert on public.invitation_events to package_test_admin;
    grant select, insert on public.gallery_items to package_test_admin;
    alter table public.invitations enable row level security;
    alter table public.invitation_events enable row level security;
    alter table public.gallery_items enable row level security;
    create policy admin_invitations on public.invitations to package_test_admin using (true) with check (true);
    create policy admin_events on public.invitation_events to package_test_admin using (true) with check (true);
    create policy admin_gallery on public.gallery_items to package_test_admin using (true) with check (true);
    insert into public.invitations(id, package_key) values ('${firstId}', 'grand');
    insert into public.invitation_events(id, invitation_id, title) values
      ('00000000-0000-4000-8000-000000000091', '${firstId}', 'One'),
      ('00000000-0000-4000-8000-000000000092', '${firstId}', 'Two'),
      ('00000000-0000-4000-8000-000000000093', '${firstId}', 'Three');
  `);
  const functions = await db.query(`
    select proname, prosecdef from pg_proc
    where pronamespace = 'public'::regnamespace and proname in (
      'prevent_invitation_event_reparent', 'enforce_invitation_gallery_capacity',
      'enforce_invitation_package_integrity'
    )
  `);
  assert.equal(functions.rows.length, 3);
  assert.ok(functions.rows.every((row) => row.prosecdef === false));
  await db.exec("set role package_test_admin");
  try {
    await assert.rejects(
      db.query("update public.invitations set package_key = 'intimate' where id = $1", [firstId]),
      /Paket Intimate mendukung maksimal 2 acara/,
    );
    assert.equal(await packageOf(db), "grand");
  } finally {
    await db.exec("reset role");
  }
});

test("a wish insert cannot cross a concurrent package or toggle change", async (t) => {
  const db = await makeDb(t);
  await db.query("insert into public.invitations(id, package_key, settings) values ($1, 'signature', $2)", [firstId, JSON.stringify({ features: { wishes: true } })]);
  await db.query("insert into public.wishes(id, invitation_id, message) values ('00000000-0000-4000-8000-000000000101', $1, 'Selamat')", [firstId]);

  await db.query("update public.invitations set settings = $1 where id = $2", [JSON.stringify({ features: { wishes: false } }), firstId]);
  await assert.rejects(
    db.query("insert into public.wishes(id, invitation_id, message) values ('00000000-0000-4000-8000-000000000102', $1, 'Forged')", [firstId]),
    /Ucapan tidak tersedia untuk undangan ini/,
  );
  await db.query("update public.invitations set package_key = 'intimate' where id = $1", [firstId]);
  await assert.rejects(
    db.query("insert into public.wishes(id, invitation_id, message) values ('00000000-0000-4000-8000-000000000103', $1, 'Forged')", [firstId]),
    /Ucapan tidak tersedia untuk undangan ini/,
  );
  await db.query("update public.wishes set message = 'Diperbarui' where id = '00000000-0000-4000-8000-000000000101'");
  assert.equal((await db.query("select message from public.wishes where id = '00000000-0000-4000-8000-000000000101'")).rows[0].message, "Diperbarui");
  await db.query("delete from public.wishes where id = '00000000-0000-4000-8000-000000000101'");
  assert.equal((await db.query("select count(*)::int as n from public.wishes")).rows[0].n, 0);
});
