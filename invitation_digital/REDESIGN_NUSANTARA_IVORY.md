# Prompt Claude Code — Redesign Theme #001 `nusantara-ivory`

## 1. Instruksi utama: STOP Phase 7

Hentikan pekerjaan Phase 7 — Marketing Website. Jangan memulai, melanjutkan, atau menyelesaikan Phase 7 dalam task ini. Jangan membuat landing page, pricing page, marketing copy, atau komponen marketing baru.

Prioritas sekarang adalah **visual redesign besar pada Theme #001 `nusantara-ivory`**. Produk undangan utamanya harus memiliki kualitas visual yang kuat sebelum marketing website dikerjakan.

Lakukan implementasi nyata sampai selesai dan tervalidasi. Jangan berhenti pada audit, rekomendasi, mockup, atau rencana. Perubahan harus terasa sebagai art direction baru pada template yang sudah ada, bukan sekadar penyesuaian warna, border radius, dan spacing.

## 2. Baca konteks dan audit sebelum mengedit

Baca dokumen berikut jika tersedia di repository:

- `CLAUDE.md`
- `DESIGN.md`
- `ROADMAP.md`
- `ARCHITECTURE.md`
- `AGENTS.md`
- `SKILL.md` dan skill relevan yang dirujuk repository

Jika dokumen tidak tersedia, catat kekurangannya dan lanjutkan berdasarkan kode serta instruksi ini; jangan mengarang isi dokumen. Ikuti instruksi repository yang relevan. Untuk scope task ini, instruksi STOP Phase 7 berlaku meskipun roadmap sebelumnya mengarahkan ke Phase 7.

Temukan implementasi Theme #001, theme registry, renderer, design tokens, sumber data, feature toggles, dan komponen interaksi yang dipakainya. Gunakan MCP knowledge graph sebagai pilihan pertama untuk penelusuran kode bila tersedia sesuai `AGENTS.md`; gunakan pencarian file bila hasilnya tidak memadai atau untuk dokumen/config.

Jalankan dan lihat template yang ada sebelum mengedit. Catat baseline visual mobile dan desktop, flow Buka Undangan, serta perilaku fitur yang harus dipertahankan. Gunakan data demo/fixture yang tersedia. Jangan mengubah data production.

Sampaikan rencana implementasi singkat, lalu kerjakan tanpa meminta persetujuan ulang untuk keputusan visual rutin dalam brief ini.

## 3. Art direction yang wajib dicapai

**Modern Nusantara Editorial + Romantic Photography + Layered Composition + Cinematic Scroll.**

Pertahankan identitas berikut:

- Ivory dan cream sebagai warna utama.
- Warm brown untuk teks dan kedalaman visual.
- Muted gold sebagai aksen terbatas.
- Elegant serif sebagai display typography, dipasangkan dengan body font yang mudah dibaca.
- Ornamen Nusantara yang subtle, konsisten, dan menyatu dengan komposisi.
- Suasana hangat, romantis, premium, dan editorial.

Visual richness harus datang dari komposisi, fotografi, hierarchy, tekstur ringan, layering, dan ritme section. Hindari dekorasi berlebihan, gold gradients yang mencolok, efek neon, glassmorphism generik, atau animasi yang mengganggu.

## 4. Masalah yang harus benar-benar diselesaikan

- Excessive whitespace yang membuat halaman terasa kosong dan belum selesai.
- Section berulang dengan pola centered heading → divider → narrow vertical stack.
- Hierarchy lemah: judul, nama, tanggal, countdown, dan detail event tidak memiliki prioritas yang jelas.
- Tidak ada layering, overlap, asymmetry, atau kedalaman komposisi.
- Foto pasangan berbentuk lingkaran seperti avatar profil.
- Countdown terlalu kecil dan event section kurang memiliki presence.
- Gallery dan love story terlalu generik.
- Motion terlalu minim atau nyaris tidak terlihat.
- Desktop hanya menampilkan kolom mobile sempit di tengah ruang kosong.

Jangan mengganti whitespace kosong dengan kepadatan tanpa arah. Gunakan negative space secara sengaja untuk mengatur fokus; isi komposisi melalui skala elemen, grid, foto, dan hubungan antarbagian.

## 5. Implementasi visual per bagian

### A. Cover dan transisi Buka Undangan

Pertahankan flow dan logika Buka Undangan, personalisasi nama tamu, serta perilaku audio yang sudah ada. Perbaiki komposisi cover agar terasa seperti pembuka editorial yang selaras dengan isi undangan.

Setelah tombol Buka Undangan ditekan, tampilkan transisi visual yang halus menuju hero fotografi. Jangan menambah langkah, modal, atau loading buatan. Pastikan overlay cover tidak lagi menghalangi scroll, klik, keyboard, atau fokus setelah dibuka.

### B. Hero fotografi setelah Buka Undangan

- Jadikan fotografi sebagai visual utama dengan tinggi sekitar **70–90vh** pada kondisi viewport normal; gunakan unit viewport modern dengan fallback yang sesuai.
- Pada layar pendek atau saat teks membesar, izinkan tinggi mengikuti konten agar informasi dan kontrol tidak terpotong.
- Gunakan crop yang terarah, focal point yang menjaga wajah, dan overlay secukupnya untuk kontras teks.
- Buat nama pasangan dominan dengan elegant serif; atur tanggal dan informasi pendukung sebagai hierarchy sekunder.
- Gunakan placement editorial, framing, atau overlap terukur. Jangan mengembalikan semua elemen ke stack kecil di tengah.
- Hero harus kuat di mobile dan memiliki komposisi yang sengaja dirancang ulang untuk desktop.

### C. Profil pasangan

Hapus foto pasangan berbentuk lingkaran. Gunakan portrait **4:5 atau 3:4**, rectangular dengan sudut tegas atau radius kecil yang konsisten.

- Gunakan komposisi asymmetric: posisi portrait, nama, dan informasi pasangan saling mengimbangi.
- Buat pergeseran vertikal, overlap tipis, frame, atau panel latar yang memberi kedalaman.
- Di desktop, gunakan dua sisi dengan offset yang disengaja; hindari dua kartu avatar identik.
- Di mobile, susun portrait dan teks secara bergantian tanpa mengurangi ukuran foto menjadi thumbnail.
- Pastikan nama panjang dan informasi keluarga tetap terbaca serta tidak bertabrakan dengan ornamen.

### D. Countdown

- Jadikan countdown salah satu focal point halaman dengan **angka serif berukuran besar**.
- Bedakan skala angka dan label waktu; gunakan separator serta spacing yang terukur.
- Beri latar atau hubungan komposisi yang membuatnya memiliki presence, bukan empat kotak kecil yang mengambang.
- Pertahankan sumber waktu, perhitungan tanggal, dan perilaku countdown yang sudah ada, termasuk kondisi setelah tanggal acara.
- Pastikan seluruh unit tetap terbaca pada mobile tanpa horizontal overflow.

### E. Event section

Bangun section acara yang lebih kuat dan terstruktur. Jadikan jenis acara, hari/tanggal, jam, tempat, alamat, dan CTA memiliki hierarchy yang jelas.

- Gunakan panel, grid editorial, atau kontras latar yang memberi bobot visual.
- Untuk beberapa acara, buat pemisahan yang jelas tanpa mengulang kartu generik secara monoton.
- Di desktop, gunakan ruang horizontal untuk menyandingkan informasi yang relevan; di mobile, pertahankan urutan baca yang alami.
- Pertahankan label, data, tautan Maps, kalender, dan seluruh aksi yang sudah tersedia; jangan menciptakan fitur backend baru.
- Tata CTA agar terlihat dan mudah disentuh, bukan terselip di antara dekorasi.

### F. Gallery

Ubah gallery menjadi **editorial collage** dengan variasi ukuran dan proporsi foto yang disengaja.

- Kombinasikan portrait dominan, foto pendukung, dan offset grid untuk membangun ritme.
- Gunakan overlap terbatas hanya jika tidak menutup subjek penting atau area klik.
- Pada mobile, adaptasikan collage menjadi susunan yang tetap rapi dan mudah dinavigasi.
- Pertahankan lightbox atau interaksi gallery yang sudah ada.
- Sediakan layout yang tetap layak untuk jumlah foto sedikit dan gambar gagal dimuat; jangan mewajibkan tambahan field atau jumlah foto tertentu.

### G. Love story

Gunakan **alternating editorial timeline**: milestone berpindah sisi di desktop, dengan tahun/tanggal, judul, narasi, dan foto bila tersedia.

- Gunakan garis, marker, atau ornamen tipis sebagai penghubung; jangan membuat dekorasi lebih dominan daripada cerita.
- Di mobile, gunakan alur satu kolom yang tetap menunjukkan ritme melalui alignment dan hierarchy.
- Pertahankan urutan kronologis dan urutan DOM yang logis. Jangan memaksa pembaca mengikuti urutan visual yang berbeda dari urutan konten.

### H. RSVP, Wishes, dan penutup

Integrasikan RSVP dan Wishes secara visual melalui latar, framing, tipografi, dan spacing yang konsisten dengan section lain. Keduanya harus terasa sebagai bagian dari undangan, bukan form yang ditempel ke halaman kosong.

Pertahankan seluruh field, validasi, error/success/loading states, submission flow, pagination atau pemuatan data yang sudah ada. Pastikan ornamen dan animasi tidak menghalangi input maupun pesan status.

Berikan penutup yang hangat dengan komposisi yang utuh, menggunakan konten yang tersedia tanpa mengarang informasi pasangan.

## 6. Ritme halaman dan responsive layout

Bangun **alternating layout rhythm** dan **background rhythm** secara sadar sepanjang halaman:

- Variasikan full-bleed photography, split layout, editorial grid, panel kontras, dan section teks yang lebih tenang.
- Pergantian latar dapat memakai ivory, cream, warm brown, fotografi, serta tekstur atau ornamen ringan yang harmonis.
- Hindari semua section memakai tinggi, alignment, divider, dan max-width yang sama.
- Gunakan section padding dan gap responsif yang proporsional. Jangan memberi setiap section min-height satu layar tanpa alasan komposisi.
- Desktop harus memakai grid dan container lebih lebar secara efektif, sementara lebar paragraf tetap nyaman dibaca.
- Mobile-first tetap wajib: tidak boleh ada overflow horizontal, foto terlalu kecil, teks terpotong, atau tombol tertutup elemen fixed.
- Semua section opsional harus tetap menyatu ketika section tetangganya dinonaktifkan. Jangan menggantungkan warna, spacing, atau komposisi pada jumlah section yang selalu tetap.

## 7. Motion yang terasa tetapi tasteful

Gunakan **Motion** mengikuti package, versi, dan pola integrasi yang sudah tersedia di repository. Audit dependency sebelum menambah library; hindari library animasi yang menduplikasi kemampuan yang ada.

Implementasikan kombinasi yang relevan:

- Transisi cover ke hero setelah Buka Undangan.
- Reveal foto dengan mask/clip atau opacity dan pergeseran kecil.
- Stagger ringan untuk judul, informasi pasangan, countdown, dan milestone.
- Reveal section saat masuk viewport, umumnya sekali agar tidak berulang secara mengganggu.
- Parallax ringan pada elemen fotografi atau ornamen tertentu bila stabil dan murah dirender.
- Hover/focus feedback dan transisi gallery yang halus.

Gunakan durasi dan easing yang konsisten; sebagai titik awal, sekitar 400–800 ms untuk reveal dan stagger 60–120 ms, lalu sesuaikan berdasarkan hasil visual. Jangan membuat pengguna menunggu animasi untuk membaca atau menggunakan form.

Wajib menghormati `prefers-reduced-motion`: hilangkan parallax dan gerakan besar, tampilkan konten langsung atau dengan transisi minimal. Konten harus tetap tersedia jika animasi gagal atau tidak berjalan. Jangan menggunakan scroll hijacking, custom scrolling yang mengambil alih gesture, atau continuous animation yang membebani perangkat.

## 8. Batas perubahan yang tidak boleh dilanggar

Scope task adalah presentasi Theme #001. Pertahankan identifier **`nusantara-ivory`**, kontrak theme, serta kompatibilitas data undangan yang sudah tersimpan.

**Jangan mengubah:**

- Database, schema, migration, atau data persistence.
- Backend, API contracts, authorization, dan permission checks.
- Logika bisnis RSVP dan Wishes.
- Analytics event names, payloads, triggers, atau semantics.
- Guest architecture, guest token, personalisasi, atau validasi akses.
- Feature-toggle semantics, publish lifecycle, cache/invalidation, atau routing behavior.

Perubahan markup, styling, dan wrapper animasi diperbolehkan selama perilaku tetap sama. Jangan menggandakan event analytics akibat remount, render, atau animation callbacks. Jangan memindahkan fetch/submission logic untuk kepentingan layout.

Utamakan perubahan yang terisolasi pada theme dan komponen presentasinya. Jika perlu menyentuh shared component, pertahankan default behavior dan buktikan tidak ada regresi pada pemakai lain. Jangan melakukan refactor besar, mengganti stack, atau menambah fitur produk yang tidak diminta.

## 9. Asset, accessibility, dan performa

- Gunakan asset yang tersedia atau asset berlisensi jelas dari sumber yang disetujui proyek. Jangan mengambil foto orang secara sembarang atau menganggap placeholder sebagai foto pasangan asli.
- Jangan menambah field foto baru pada schema. Gunakan data yang tersedia dan fallback visual yang sengaja dirancang.
- Tentukan aspect ratio serta ukuran gambar untuk mencegah layout shift. Prioritaskan hero dan lazy-load foto di bawah fold mengikuti kemampuan stack.
- Pertahankan semantic headings, label form, alt text yang relevan, visible focus, dan keyboard navigation.
- Pastikan teks di atas foto memiliki kontras yang cukup dan area sentuh utama setidaknya sekitar 44 × 44 px.
- Ornamen dekoratif tidak boleh menangkap pointer atau dibaca screen reader sebagai konten.
- Hindari animasi properti layout yang mahal dan listener scroll yang tidak diperlukan.

## 10. Validasi wajib sebelum menyatakan selesai

Jalankan aplikasi dan inspeksi **hasil render sebenarnya**, bukan hanya membaca kode. Ambil screenshot sebelum/sesudah dengan data dan viewport yang sebanding.

### Validasi visual

Periksa setidaknya mobile 360–390 px, tablet sekitar 768 px, dan desktop 1440 px. Periksa pula layar pendek, nama panjang, serta konten teks yang lebih panjang.

Buktikan bahwa hero setelah dibuka dominan, portrait tidak lagi bulat, layout memiliki variasi, countdown dan acara memiliki hierarchy kuat, gallery bersifat editorial, love story bergantian, dan desktop tidak lagi berupa kolom sempit yang dikelilingi ruang kosong.

Periksa seluruh halaman pada setiap kelas viewport, bukan hanya hero. Tidak boleh ada clipping, overlap yang merusak keterbacaan, scrollbar horizontal, layout shift yang mengganggu, atau section kosong akibat dekorasi/spacing yang tertinggal.

### Feature toggles dan kondisi data

- Uji setiap section opsional dengan toggle ON dan OFF.
- Uji kombinasi beberapa section dimatikan untuk memeriksa ritme latar dan spacing.
- Uji data minimal, foto sedikit, foto tidak tersedia/gagal dimuat, serta konten panjang menggunakan fixture yang sesuai kontrak saat ini.
- Jangan mengubah aturan fallback atau validasi bisnis hanya agar screenshot tampak lengkap.

### Interaksi dan regresi

Uji Buka Undangan, scroll, audio bila tersedia, gallery/lightbox, CTA Maps/kalender, RSVP, Wishes, dan navigasi keyboard. Verifikasi personalisasi tamu serta perilaku token valid/tidak valid sesuai baseline.

Periksa analytics agar aksi yang sama tetap menghasilkan event yang sama tanpa duplikasi. Periksa reduced motion, loading/error/success states, dan console errors. Jalankan regression checks yang sudah ada untuk permission, publish lifecycle, dan cache jika relevan terhadap jalur yang disentuh.

Jalankan **type check (`tsc` atau script proyek yang ekuivalen), lint, dan production build** menggunakan package manager serta script repository. Laporkan perintah dan hasil sebenarnya. Perbaiki kegagalan yang ditimbulkan perubahan ini; bedakan kegagalan baseline yang sudah ada dengan regresi baru.

Jika tooling tidak dapat menguji suatu interaksi, sebutkan tepat bagian yang belum terverifikasi dan langkah manual yang diperlukan. Jangan mengklaim PASS untuk hal yang tidak dijalankan. Jangan menggunakan keterbatasan satu interaksi sebagai alasan melewatkan validasi lain yang masih dapat dilakukan.

## 11. Kriteria selesai dan batas berhenti

Task selesai ketika redesign sudah diimplementasikan, perubahan visual besar terbukti pada mobile/tablet/desktop, perilaku existing terjaga, dan pemeriksaan wajib sudah dijalankan dengan hasil yang dilaporkan secara jujur.

Jangan menyatakan selesai hanya karena `tsc`, lint, dan build lolos. Kualitas komposisi dan hasil visual adalah acceptance criteria utama bersama bebas regresi.

**Setelah redesign dan validasi, berhenti. Phase 7 tetap ditunda. Jangan otomatis melanjutkan marketing website atau menandai Phase 7 selesai.**

## 12. Report requirements — wajib pada jawaban akhir

Akhiri pekerjaan dengan laporan yang berisi:

1. **Status akhir:** selesai atau belum selesai, beserta hambatan konkret jika ada; nyatakan Phase 7 tetap ditunda.
2. **Ringkasan redesign per section:** jelaskan perubahan cover/hero, pasangan, countdown, acara, gallery, love story, RSVP/Wishes, dan penutup, termasuk masalah visual yang diselesaikan.
3. **File yang diubah:** path dan tujuan perubahan; tandai shared components dan dependency baru jika ada.
4. **Bukti visual:** path/link screenshot sebelum dan sesudah untuk mobile, tablet, dan desktop, dengan viewport serta data pengujian yang digunakan. Jelaskan fallback asset jika foto asli tidak tersedia.
5. **Motion dan accessibility:** animasi yang diterapkan, perilaku reduced motion, serta hasil pemeriksaan keyboard/focus dan keterbacaan.
6. **Matriks validasi:** area/fitur, viewport atau kondisi, hasil PASS/FAIL/NOT TESTED, dan bukti atau catatan. Sertakan feature toggles, existing interactions, guest behavior, serta analytics.
7. **Hasil pemeriksaan teknis:** perintah type check, lint, build, dan tes relevan beserta hasil aktual; bedakan regresi baru dan masalah baseline.
8. **Konfirmasi batas scope:** jelaskan bahwa database, backend, logika RSVP/Wishes, analytics semantics, dan guest architecture tetap dipertahankan; laporkan penyimpangan jika ternyata ada.
9. **Sisa pekerjaan atau keterbatasan:** daftar spesifik, dampaknya, dan langkah manual yang diperlukan. Jika tidak ada, nyatakan secara jelas tanpa mengarang kepastian atas pemeriksaan yang belum dilakukan.

Jangan mengakhiri laporan dengan menjalankan Phase 7. Tunggu instruksi baru untuk pekerjaan setelah redesign ini.
