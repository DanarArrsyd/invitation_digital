# Review redesign Nusantara Ivory — 14 September 2026

Implementasi presentation layer dan pemeriksaan teknis selesai. **Sample komersial final masih memerlukan foto pelanggan dan uji submit langsung dengan Turnstile valid.** Phase 7 / Marketing Website tetap ditunda. Tidak ada deployment atau perubahan publish status.

## Audit dan perubahan

- **Cover / hero:** cover ivory dengan melati engraving dan frame lengkung; hero fotografi 84svh dengan teks besar, scrim, dan parallax. Tinggi boleh bertambah untuk teks panjang. Tanpa foto, nama dan botanical menjadi komposisi editorial yang utuh.
- **Pasangan:** mengganti dua blok vertikal yang panjang menjadi dua portrait 4:5 bertingkat pada desktop, nama sedikit overlap, dan framing floral. Foto kosong memakai monogram ringkas sehingga tidak menghasilkan bidang kosong sebesar portrait. Nama dan orang tua panjang tetap wrap.
- **Acara:** frame ganda, tanggal serif besar, garis vertikal, serta hierarchy judul, waktu, venue, alamat, Maps. Hanya venue ditampilkan bila event belum diisi; tidak ada waktu/alamat karangan.
- **Countdown:** angka serif lebih besar, divider botanical, latar espresso. Kalkulasi dan kondisi selesai tidak diubah.
- **Story:** tahun lebih kuat, gambar dan teks berada dalam baris grid yang sama, bergantian sisi di desktop. Tetap mengikuti urutan DOM/data.
- **Gallery:** collage 12 kolom pada desktop; pola anchor dan pasangan foto yang rapat di mobile. Caption selalu tersedia pada layar sentuh. Rasio dan ruang gambar tetap disediakan saat loading; kegagalan gambar menampilkan fallback.
- **Quote, RSVP, Wishes, closing:** spacing diselaraskan; form memakai kertas dengan border tipis, state pilihan berkontras lebih baik, focus outline, serta dekorasi pada tepi. Wishes kosong memiliki ajakan singkat dan ornament; penutup terhubung dengan bahasa botanical yang sama.

## Design system dan motion

Warna utama tetap ivory #FCFAF5, cream #EFE5D4, sand #DCCCB0, brown #4A3F34, muted gold #A98A5C; Cormorant Garamond dan Jost dipertahankan. Section padding 64–112px, container maksimum 1440px, gutter responsif. Penempatan melati bervariasi antar section; paper grain dan lattice tetap tipis.

Primitives baru: `FloralCorner`, `BotanicalDivider`, dan `EditorialImage`. SVG digambar dalam kode, tanpa gambar eksternal atau dependency tambahan. Ornamen aria-hidden dan tidak menangkap pointer.

Motion memakai cover exit, entrance stagger, section reveal, image clip reveal, dan parallax foto. Delay `Reveal` kini diterapkan pada transition variant yang benar. Gerakan kontinu cover dihapus. Reduced motion menghilangkan gerakan besar/parallax dan delay dekoratif. Render awal cover diperbaiki untuk menghilangkan hydration mismatch reduced-motion yang ditemukan pada baseline. Fokus keyboard berpindah ke region isi setelah dibuka.

## Bukti visual

Pilot memakai data database yang sama: Rayhana & Febri, 20 Oktober 2026, Puri Nirwaran Residence. Data aktual belum berisi foto hero/portrait/gallery, record acara lengkap, maupun bank/musik final. Teks seperti “Opening Quote 1”, “Opening Message 1”, dan story singkat merupakan isi database existing, tidak diganti atau dikarang.

Fixture memakai SVG geometris berlabel **QA / Not customer photography**, dua orang uji, dua acara uji, tiga story, delapan gambar, dan ucapan sintetis. Ini menguji komposisi, bukan menggantikan foto pelanggan. Route dan media sementara telah dihapus sebelum production build. Screenshot fixture berasal dari dev build; pilot sesudah berasal dari production build lokal. Screenshot baseline masih dapat menampilkan indikator dev/hydration lama.

| Viewport | Pilot database | Fixture fotografi geometris |
|---|---|---|
| 390 × 900 | [Sebelum](</Users/ekadanararrasyid/VS Code/invitation_digital/docs/visual-review/nusantara-ivory-2026-09-14/pilot-before-390.png>) / [Sesudah](</Users/ekadanararrasyid/VS Code/invitation_digital/docs/visual-review/nusantara-ivory-2026-09-14/pilot-after-390.png>) | [Sebelum](</Users/ekadanararrasyid/VS Code/invitation_digital/docs/visual-review/nusantara-ivory-2026-09-14/fixture-before-390.png>) / [Sesudah](</Users/ekadanararrasyid/VS Code/invitation_digital/docs/visual-review/nusantara-ivory-2026-09-14/fixture-after-390.png>) |
| 768 × 900 | [Sebelum](</Users/ekadanararrasyid/VS Code/invitation_digital/docs/visual-review/nusantara-ivory-2026-09-14/pilot-before-768.png>) / [Sesudah](</Users/ekadanararrasyid/VS Code/invitation_digital/docs/visual-review/nusantara-ivory-2026-09-14/pilot-after-768.png>) | [Sebelum](</Users/ekadanararrasyid/VS Code/invitation_digital/docs/visual-review/nusantara-ivory-2026-09-14/fixture-before-768.png>) / [Sesudah](</Users/ekadanararrasyid/VS Code/invitation_digital/docs/visual-review/nusantara-ivory-2026-09-14/fixture-after-768.png>) |
| 1440 × 900 | [Sebelum](</Users/ekadanararrasyid/VS Code/invitation_digital/docs/visual-review/nusantara-ivory-2026-09-14/pilot-before-1440.png>) / [Sesudah](</Users/ekadanararrasyid/VS Code/invitation_digital/docs/visual-review/nusantara-ivory-2026-09-14/pilot-after-1440.png>) | [Sebelum](</Users/ekadanararrasyid/VS Code/invitation_digital/docs/visual-review/nusantara-ivory-2026-09-14/fixture-before-1440.png>) / [Sesudah](</Users/ekadanararrasyid/VS Code/invitation_digital/docs/visual-review/nusantara-ivory-2026-09-14/fixture-after-1440.png>) |

## Matriks validasi

| Area | Hasil | Bukti / batas pengujian |
|---|---|---|
| Halaman penuh 320, 375, 390, 768, 1440px | PASS | Pilot + fixture; tidak ada overflow atau elemen teks/form melewati viewport. `results.json` |
| Production public route | PASS | Build lokal; HTTP 200 dan screenshot pilot. `production-results.json` |
| Nama orang/tamu/orang tua/venue panjang | PASS | Fixture 320px; long copy dan wrapping |
| Data minimal, foto kosong, null waktu/alamat/story image | PASS | Fixture minimal/null; section kosong tidak meninggalkan blok dekorasi |
| Gallery 1, 3, 8, 11 gambar | PASS | 1/3/8 mobile; 11 pada 320 dan 1440px; collage tetap usable |
| Gambar gagal / lambat | PASS | Fixture error; geometri hero tidak berubah setelah gambar lambat selesai |
| Semua feature toggle OFF sendiri / gabungan | PASS | Music, countdown, maps, story, gallery, livestream, RSVP, Wishes, gift, guest personalization. `interactions.json` |
| Buka Undangan, keyboard, focus | PASS | Tab/Enter; cover hilang; fokus pindah; outline tersedia |
| Motion normal / reduced | PASS | Semua heading terlihat setelah scroll; tanpa console error pada pemeriksaan interaksi akhir |
| Music | PASS, fixture | WAV uji: setelah buka bermain; pause/resume. Lagu pelanggan belum tersedia |
| Maps, copy bank | PASS, fixture | Href tetap; clipboard menyalin string akun uji; feedback Tersalin |
| RSVP / Wishes validasi server | PASS | Server asli menolak token Turnstile kosong; tidak menyimpan respons uji |
| RSVP / Wishes success UI | PASS, simulasi | Respons action disimulasikan; pilihan hadir/tidak, disabled guard, sukses, pagination teruji |
| RSVP / Wishes persistence + challenge nyata | NOT TESTED | Perlu menyelesaikan Turnstile valid; belum membuktikan insert database/revalidation ucapan baru |
| Guest invalid pada public route | PASS | Token invalid tidak menghasilkan personalisasi |
| Guest valid pada public route | NOT TESTED | Tidak ada record guest pilot existing; rendering guest diuji fixture, lookup diuji mock loader |
| Draft / archived / expired / published / valid & invalid guest loader | PASS, mock | Source loader aktual dengan mock Supabase reads. `loader-results.json` |
| Publish admin, RLS, cache end-to-end | NOT TESTED | Tidak dimutasi; di luar perubahan presentasi |
| Analytics action invocation | PASS, intercept | Satu cover action; scroll tidak menduplikasi. Payload/triggers/business source tetap. Persistence event tidak diaudit |

## Pemeriksaan teknis

- `npm run lint` — PASS, exit 0.
- `npm run build` — PASS, exit 0, production routes selesai dibuat.
- `npx tsc --noEmit` — PASS, exit 0 setelah build.
- Build awal gagal karena `.next/dev/types/validator.ts` masih mereferensikan route QA yang dihapus. File generated stale dibersihkan; build ulang lolos. Bukan perubahan backend.

## File penting

- [ThemeStyles.tsx](</Users/ekadanararrasyid/VS Code/invitation_digital/src/themes/nusantara-ivory/ThemeStyles.tsx>) — token, responsive composition, texture, focus, reduced motion.
- [CoverGate.tsx](</Users/ekadanararrasyid/VS Code/invitation_digital/src/themes/nusantara-ivory/CoverGate.tsx>) — cover floral, entrance, hydration, keyboard focus.
- [components/Botanical.tsx](</Users/ekadanararrasyid/VS Code/invitation_digital/src/themes/nusantara-ivory/components/Botanical.tsx>) — original melati engraving dan divider.
- [components/EditorialImage.tsx](</Users/ekadanararrasyid/VS Code/invitation_digital/src/themes/nusantara-ivory/components/EditorialImage.tsx>) — loading dan error presentation.
- [components/Section.tsx](</Users/ekadanararrasyid/VS Code/invitation_digital/src/themes/nusantara-ivory/components/Section.tsx>) — shell serta optional decoration.
- [components/Reveal.tsx](</Users/ekadanararrasyid/VS Code/invitation_digital/src/themes/nusantara-ivory/components/Reveal.tsx>) — perbaikan delay transition.
- [sections/HeroSection.tsx](</Users/ekadanararrasyid/VS Code/invitation_digital/src/themes/nusantara-ivory/sections/HeroSection.tsx>) — hero photo dan fallback.
- [sections/CoupleSection.tsx](</Users/ekadanararrasyid/VS Code/invitation_digital/src/themes/nusantara-ivory/sections/CoupleSection.tsx>) — portrait offset dan monogram.
- [sections/EventsSection.tsx](</Users/ekadanararrasyid/VS Code/invitation_digital/src/themes/nusantara-ivory/sections/EventsSection.tsx>) — frame acara dan hierarchy.
- [sections/GallerySection.tsx](</Users/ekadanararrasyid/VS Code/invitation_digital/src/themes/nusantara-ivory/sections/GallerySection.tsx>) — collage dan caption.
- [sections/StorySection.tsx](</Users/ekadanararrasyid/VS Code/invitation_digital/src/themes/nusantara-ivory/sections/StorySection.tsx>) — alternating timeline.
- [sections/RsvpSection.tsx](</Users/ekadanararrasyid/VS Code/invitation_digital/src/themes/nusantara-ivory/sections/RsvpSection.tsx>) — form presentation.
- [sections/WishesSection.tsx](</Users/ekadanararrasyid/VS Code/invitation_digital/src/themes/nusantara-ivory/sections/WishesSection.tsx>) — form, empty state, long-name wrapping.
- [sections/CountdownSection.tsx](</Users/ekadanararrasyid/VS Code/invitation_digital/src/themes/nusantara-ivory/sections/CountdownSection.tsx>) — angka dan divider.
- [sections/QuoteSection.tsx](</Users/ekadanararrasyid/VS Code/invitation_digital/src/themes/nusantara-ivory/sections/QuoteSection.tsx>) — section rhythm.
- [sections/ClosingSection.tsx](</Users/ekadanararrasyid/VS Code/invitation_digital/src/themes/nusantara-ivory/sections/ClosingSection.tsx>) — botanical finale.

Pada tahap redesign awal, seluruh perubahan aplikasi berada dalam theme. Tambahan Instagram yang diminta kemudian dijelaskan di bawah. Dependencies, schema, authentication, actions RSVP/Wishes, analytics semantics, guest architecture, publishing, serta theme registry tetap dipertahankan. Tidak ada data customer hardcoded. Mengunjungi public route saat QA tetap dapat menghasilkan analytics open melalui mekanisme existing.

## Keterbatasan dan langkah berikutnya

Foto asli hero, portrait, serta gallery diperlukan untuk menilai crop wajah dan hasil premium fotografi final. Lengkapi waktu, alamat, parent names, love story, bank, track musik, dan livestream hanya dari customer/admin. Jalankan satu RSVP dan satu Wishes dengan verifikasi Turnstile valid, cek hasil admin dan ucapan langsung muncul; tambahkan guest pilot untuk uji token valid end-to-end. Challenge Turnstile nyata juga perlu diperiksa pada 320px. Tidak ada lightbox atau kalender pada baseline; redesign mempertahankan kemampuan existing tanpa menambah fitur tersebut.


## Tambahan sesuai permintaan: Instagram dan penerima cover

- Cover selalu menampilkan “Kepada Yth.” dan pesan undangan. Token valid menggunakan nama tamu; tanpa personalisasi memakai “Bapak/Ibu/Saudara/i”. Frame cover menyesuaikan tinggi konten panjang.
- Instagram opsional tersedia per profil yang sudah disimpan melalui **Admin / Invitations / People / Instagram**. Mendukung username, @username, atau URL profil HTTPS Instagram.
- Data disimpan di kolom `invitations.settings` yang sudah ada, pada `personSocials[personId].instagram`. Tidak ada migration atau kolom tambahan. Normalizer existing sudah meneruskan settings kepada theme.
- Simpan memeriksa sesi admin dan keanggotaan person terhadap invitation, mempertahankan settings lainnya, serta mendeteksi perubahan concurrent melalui `updated_at`. Revalidation menggunakan fungsi existing.
- Tautan tampil di bawah profil, punya icon dan target sentuh 44px, membuka tab baru dengan `noopener noreferrer`. Nilai kosong/invalid tidak dirender.
- Akun Rayhana dan Febri tetap kosong sesuai permintaan. Tidak ada akun QA yang disimpan ke Supabase. Screenshot tambahan menggunakan handle sintetis pada data runtime; perubahan data pilot lain yang terlihat berasal dari data existing saat screenshot diambil.

File tambahan di luar theme untuk kebutuhan penyimpanan yang diminta:

- `src/lib/utils/instagram.ts` — normalisasi URL dan pembacaan metadata.
- `src/lib/validation/people.ts` — validasi input admin.
- `src/server/invitations/person-socials.ts` — update settings melalui client authenticated existing.
- `src/app/admin/(protected)/invitations/[id]/people/page.tsx` dan `actions.ts` — field admin, save, feedback, revalidation.
- `DATABASE.md` — dokumentasi metadata optional.
- `tests/instagram.test.mjs`, `tests/person-socials.test.mjs` — tujuh tes unit.

Validasi tambahan: `node --test tests/*.test.mjs` PASS (7/7; URL, izin, kepemilikan person, preserve settings, clear, concurrent update). Service diuji dengan mock Supabase; save melalui sesi admin nyata belum dijalankan karena akun diminta tetap kosong. Browser 320/390/768/1440px PASS untuk link, nama panjang, target sentuh, hidden empty state; keyboard pada layar 320×568px PASS. Bukti: `social-results.json`, `social-cover-*.png`, dan `social-profile-*.png`. Route fixture sudah dihapus.


## Prewedding hero update

Hero now uses an arched 4:5 portrait beside names on desktop; stacked on mobile. Botanical artwork moved behind names at 10–13% opacity. Empty cover displays an ivory placeholder; gallery no longer implicitly supplies hero media. Admin General exposes “Foto prewedding — hero undangan” first, using existing cover_image_path upload and Supabase storage. No schema changes. Reduced-motion reveal explicitly resets clipping/translation.

16 browser checks passed across 320/390/768/1440, empty/populated synthetic media and reduced/normal motion: no overflow, full frame revealed. Screenshots prewed-*.png use a synthetic illustration for photo QA, not customer data. Actual customer upload has not been performed. This supersedes the earlier full-width hero composition.
