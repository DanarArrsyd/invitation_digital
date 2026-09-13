# Admin FE Revamp + Gallery Ratio Design

Date: 2026-09-14
Status: Approved (pending spec review sign-off)

## Goal

Rombak total tampilan & behavior admin (semua halaman: dashboard, list invitations,
login, semua tab editor invitation) agar mudah dipakai dan mudah dimanage. Sekaligus
tambah fitur: admin bisa atur aspect ratio per foto galeri, tersusun rapi di tema
publik.

Admin dan public invitation tetap dua design system terpisah (per CLAUDE.md) — revamp
ini hanya menyentuh `src/app/admin/**` dan `src/components/ui/**`. Public theme
(`src/themes/**`) hanya disentuh untuk render grid galeri yang menghormati ratio baru.

## Non-goals

- Tidak mengganti stack (tetap Next 16 App Router, shadcn/ui, Zod, Supabase).
- Tidak menambah dependency drag-and-drop (dnd-kit dll) — reorder pakai native
  HTML5 `draggable`.
- Tidak mengubah struktur data invitation/people/events/dll di luar gallery_items.
- Tidak menyentuh public invitation art direction, kecuali grid layout galeri.

## Architecture

### 1. Layout split

- `src/app/admin/(protected)/layout.tsx` — outer shell: top bar (logo/app name,
  user menu/logout), tidak lagi menaruh nav invitation-specific.
- `src/app/admin/(protected)/invitations/[id]/layout.tsx` — inner shell: sidebar
  kiri (persistent desktop, `Sheet` overlay di mobile) dengan grup:
  - **Konten**: General, People, Events, Content, Features
  - **Media & Gifts**: Gallery, Gifts
  - **Tamu & Respons**: Guests, Responses
  - **Publikasi**: Publish
  - Sidebar header: invitation title + status badge + link balik ke list.
  - `AdminTabs.tsx` diganti/di-refactor jadi `AdminSidebar.tsx` (client component,
    tetap pakai `usePathname` buat active state).

### 2. Dashboard & list invitations

- `(protected)/dashboard/page.tsx`: ringkasan — total invitations, breakdown per
  status (draft/published/expired), daftar invitation yang expired dalam ≤14 hari
  (butuh perhatian), shortcut ke list & "New Invitation".
- `(protected)/invitations/page.tsx`: card grid (bukan table). Tiap card:
  - Cover thumbnail: gallery item pertama (sort_order terkecil) via
    `getMediaPublicUrl`, fallback placeholder ivory bila kosong.
  - Title/couple, event date, status badge (draft=secondary, published=default
    dengan dot hijau, expired=outline muted), nama theme kecil di footer card.
  - Quick actions (icon buttons): Edit → tab general, Preview → `/[slug]` di tab
    baru, Copy public link (hanya kalau `status === 'published'`).
  - Filter tabs di atas: All/Draft/Published/Expired (query param `?status=`,
    filter di server, bukan client state).
  - Empty state: ilustrasi ringan (SVG sederhana, bukan gambar berat) + CTA "Buat
    invitation pertama".

### 3. Pola form & feedback (dipakai semua tab editor)

- Tambah shadcn components baru: `Dialog`, `Sheet`, `Sonner` (toast), `Skeleton`
  (untuk loading state ringan bila perlu). Install via `npx shadcn add` — hanya
  menambah file component, tidak mengganti stack.
- Setiap form section dibungkus `Card` (sudah ada di deps).
- Toast (`sonner`) untuk feedback server action sukses/gagal — ganti pola
  `redirect(...?error=...)` yang sekarang dipakai gallery/lainnya. Server action
  tetap validasi & redirect on success (revalidate path), tapi pesan sukses/gagal
  disampaikan via toast yang dibaca dari search param sekali lalu dibersihkan, ATAU
  (lebih baik) via client wrapper yang memanggil action dan menampilkan toast dari
  return value — pilih pola return-value karena tidak butuh query param di URL.
  Artinya: server actions berbentuk `async function action(formData): Promise<{ok:boolean; message:string}>`
  dipanggil dari client form wrapper (`"use client"`) yang men-toast hasilnya,
  bukan `<form action={serverAction}>` langsung untuk aksi yang butuh feedback.
  Form yang cuma redirect (misal create invitation baru) tetap boleh pola lama.
- Dialog konfirmasi untuk aksi destruktif: delete gallery item, delete wish, delete
  guest, delete gift account.
- Tombol submit pakai `useFormStatus`/`useActionState` untuk pending state +
  disable saat submit (cegah double-submit).
- Empty state konsisten (komponen kecil reusable `EmptyState`) untuk guests/
  gifts/responses/gallery kosong.

### 4. Gallery: ratio per foto + reorder + multi-upload

**Migration** (`supabase/migrations/<timestamp>_gallery_aspect_ratio.sql`):

```sql
alter table public.gallery_items
  add column aspect_ratio text not null default 'portrait_4_5'
  check (aspect_ratio in (
    'square_1_1', 'portrait_4_5', 'portrait_3_4',
    'landscape_16_9', 'landscape_4_3'
  ));
```

Regenerate `src/types/database.ts` setelah migration (via mcp Supabase
`generate_typescript_types` atau `supabase gen types`).

**Admin UI** (`invitations/[id]/gallery/page.tsx` + `GalleryGrid.tsx` client
component baru):
- Tiap card: thumbnail preview dengan `aspect-ratio` CSS sesuai `aspect_ratio`
  item (live), `Select` untuk ganti ratio (5 preset, label Indonesia manusiawi),
  caption/alt text input tetap ada.
- Ganti input `sortOrder` manual dengan native HTML5 drag-and-drop di grid
  (`draggable`, `onDragStart/onDragOver/onDrop`), submit satu server action
  `reorderGalleryItemsAction(invitationId, orderedIds: string[])` yang update
  semua `sort_order` sekaligus dalam satu transaction/batch update.
- Upload form: `<input type="file" multiple accept="image/png,image/jpeg,image/webp">`,
  action `uploadGalleryItemsAction` menerima banyak file, loop upload ke storage +
  insert row per file (default `aspect_ratio='portrait_4_5'`, `sort_order` =
  max(sort_order)+1 increasing). Progress ditampilkan via toast per-file selesai
  atau summary "3/5 uploaded".
- Ratio & caption/alt text tetap auto-save per field-change (server action +
  toast), bukan satu form besar.
- Counter "X foto (target: 8)" dipertahankan sebagai info, bukan hard limit.

**Theme render** (`src/themes/nusantara-ivory/sections/GallerySection.tsx` +
`ThemeStyles.tsx`):
- `GalleryItem` type nambah field `aspectRatio` (mapped dari `aspect_ratio`).
- CSS grid diubah dari pola `nth-child` fixed jadi data-driven:
  - Tiap `.ni-gallery-photo` pakai inline CSS var `style={{ '--ni-ratio': ratioToCssValue(item.aspectRatio) }}`
    dan class CSS pakai `aspect-ratio: var(--ni-ratio)`.
  - Item dengan ratio landscape (`landscape_16_9`, `landscape_4_3`) otomatis
    `grid-column: span 2` di breakpoint ≥ sm agar "makan" lebar row, portrait/square
    tetap span 1. Ini logic generik berbasis ratio, bukan posisi index — jadi rapi
    berapapun urutan fotonya.
  - Grid pakai `grid-auto-flow: dense` supaya gap dari span-2 item terisi otomatis.
- Perilaku ini spesifik ke tema `nusantara-ivory` (implementasi CSS-nya), tapi
  data (`aspectRatio`) theme-agnostic — tema lain bebas render sendiri sesuai
  art direction masing-masing (sesuai prinsip "themes are presentation layers").

## Data flow

```
Admin edit ratio/reorder/upload
  → client component calls server action (src/server/... atau colocated actions.ts)
  → Zod validate input
  → Supabase update/insert (RLS: admin authenticated only)
  → revalidatePath(invitation editor route)
  → return {ok, message} → client shows toast
```

Public read path tidak berubah (queries.ts sudah normalize data), hanya nambah
field `aspectRatio` di mapping.

## Error handling

- Server actions validasi via Zod, return `{ok: false, message}` on failure —
  ditangkap client wrapper → toast merah, form state tidak berubah (optimistic
  update di-revert bila dipakai).
- Upload: file type/size divalidasi server-side (sudah ada aturan di
  CLAUDE.md/security) sebelum insert row; file yang gagal upload tidak membuat
  row orphan.
- Reorder: batch update dibungkus try/catch, kalau gagal di tengah, tidak ada
  partial state terlihat oleh user (refetch/revalidate setelah selesai, bukan
  optimistic permanent).

## Testing

- Manual verification via Browser pane: buka `/admin/invitations/[id]/gallery`,
  test upload multi-file, ganti ratio tiap foto, drag reorder, cek render di
  `/[slug]` publik ratio & span sesuai.
- Cek responsive (mobile sidebar via Sheet) dan dark/light tidak relevan (admin
  belum punya dark mode — di luar scope ini, tetap light neutral shadcn default).
- Cek RLS: aksi gallery tetap hanya bisa dilakukan authenticated admin (sudah ada
  policy existing, hanya kolom baru ditambah — pastikan policy tidak butuh
  perubahan karena scope kolom, bukan tabel/relasi baru).

## Open items resolved during brainstorming

- Scope: semua halaman admin (bukan cuma tab editor).
- Nav: sidebar + grouping (bukan top tabs restyle).
- List invitations: card grid + status badge (bukan table restyle).
- Gallery ratio: per-foto (bukan satu ratio untuk seluruh gallery).
- Ratio options: preset list 5 opsi (bukan custom manual W:H).
- Gallery UX: drag-drop reorder + multi-upload (bukan tetap manual).
