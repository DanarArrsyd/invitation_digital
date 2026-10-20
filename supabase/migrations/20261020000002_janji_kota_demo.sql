-- Add only Janji Kota's fictional showcase invitation after its theme row exists.
-- Unlike the developer seed, this never deletes or recreates other demos.
-- Safe to rerun: an existing slug is preserved along with its child records.

-- Pernikahan Lani & Arga (janji-kota)
do $$
declare
  inv_id uuid;
begin
  -- A slug collision is left untouched; this migration only creates its own demo.
  if not exists (select 1 from public.invitations where slug = 'demo-janji-kota') then
    insert into public.invitations (
      type, title, slug, theme_id, status, event_date, venue_summary, package_key, is_demo,
      published_at, expires_at, cover_image_path, opening_quote, opening_message, closing_message, settings
    )
    select 'wedding', 'Pernikahan Lani & Arga', 'demo-janji-kota', t.id, 'published', '2027-12-11', 'Ruang Kota Sample, Jakarta',
      'grand', true, now(), null, '/demo/janji-kota/cover.jpg',
      'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan dari jenismu sendiri, supaya kamu merasa tenteram kepadanya. (QS. Ar-Rum: 21)', 'Dengan memohon rahmat Tuhan Yang Maha Esa, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada hari bahagia kami.', 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir. Terima kasih atas doa dan restunya.', '{"features":{"music":false,"countdown":true,"maps":true,"story":true,"gallery":true,"dressCode":true,"livestream":true,"rsvp":true,"wishes":true,"gift":true,"guestPersonalization":true},"timeZone":"Asia/Jakarta","dressCode":{"description":"Busana rapi dalam warna netral dengan aksen hangat.","groups":[{"label":"Tamu","colors":["#24303A","#AAB8BB","#E6AE4B"]}]}}'::jsonb
    from public.themes t where t.slug = 'janji-kota'
    returning id into inv_id;

    insert into public.invitation_people (invitation_id, role, full_name, nickname, father_name, mother_name, photo_path, bio, sort_order)
    values
      (inv_id, 'bride', 'Lani Prameswari', 'Lani', 'Bapak Sample Surya', 'Ibu Sample Nita', '/demo/janji-kota/person-1.jpg', 'Putri pertama', 0),
      (inv_id, 'groom', 'Arga Mahendra', 'Arga', 'Bapak Sample Rudi', 'Ibu Sample Wina', '/demo/janji-kota/person-2.jpg', 'Putra kedua', 1);

    insert into public.invitation_events (invitation_id, event_type, title, event_date, start_time, end_time, venue_name, address, maps_url, livestream_url, sort_order)
    values
      (inv_id, 'Sakral', 'Akad Nikah', '2027-12-11', '09:00', '10:30', 'Masjid Sample', 'Jl. Contoh No. 10, Jakarta', 'https://www.google.com/maps/search/?api=1&query=Masjid%20Sample%2C%20Jl.%20Contoh%20No.%2010%2C%20Jakarta', null, 0),
      (inv_id, 'Perayaan', 'Resepsi', '2027-12-11', '13:00', '16:00', 'Ruang Kota Sample', 'Jl. Contoh No. 42, Jakarta', 'https://www.google.com/maps/search/?api=1&query=Ruang%20Kota%20Sample%2C%20Jl.%20Contoh%20No.%2042%2C%20Jakarta', 'https://www.youtube.com/', 1),
      (inv_id, 'Pertemuan', 'Makan Malam Keluarga', '2027-12-11', '19:00', '21:00', 'Ruang Keluarga Sample', 'Jl. Contoh No. 7, Jakarta', 'https://www.google.com/maps/search/?api=1&query=Ruang%20Keluarga%20Sample%2C%20Jl.%20Contoh%20No.%207%2C%20Jakarta', null, 2);

    insert into public.invitation_stories (invitation_id, title, year_label, description, image_path, sort_order)
    values
      (inv_id, 'Pertama bertemu', '2019', 'Cerita contoh: kami bertemu di sebuah acara kampus dan mulai berbincang tanpa henti.', '/demo/janji-kota/story-1.jpg', 0),
      (inv_id, 'Menjalin cerita', '2022', 'Cerita contoh: dari teman dekat menjadi pasangan yang saling menguatkan.', '/demo/janji-kota/story-2.jpg', 1),
      (inv_id, 'Melangkah bersama', '2026', 'Cerita contoh: dengan restu keluarga, kami memutuskan untuk melangkah ke jenjang berikutnya.', '/demo/janji-kota/story-3.jpg', 2);

    insert into public.gallery_items (invitation_id, image_path, alt_text, aspect_ratio, sort_order)
    values
      (inv_id, '/demo/janji-kota/gallery-01.jpg', 'Foto contoh 1', 'portrait_3_4', 0),
      (inv_id, '/demo/janji-kota/gallery-02.jpg', 'Foto contoh 2', 'landscape_4_3', 1),
      (inv_id, '/demo/janji-kota/gallery-03.jpg', 'Foto contoh 3', 'square_1_1', 2),
      (inv_id, '/demo/janji-kota/gallery-04.jpg', 'Foto contoh 4', 'portrait_4_5', 3),
      (inv_id, '/demo/janji-kota/gallery-05.jpg', 'Foto contoh 5', 'landscape_16_9', 4),
      (inv_id, '/demo/janji-kota/gallery-06.jpg', 'Foto contoh 6', 'portrait_3_4', 5),
      (inv_id, '/demo/janji-kota/gallery-07.jpg', 'Foto contoh 7', 'square_1_1', 6),
      (inv_id, '/demo/janji-kota/gallery-08.jpg', 'Foto contoh 8', 'landscape_4_3', 7),
      (inv_id, '/demo/janji-kota/gallery-09.jpg', 'Foto contoh 9', 'portrait_4_5', 8),
      (inv_id, '/demo/janji-kota/gallery-10.jpg', 'Foto contoh 10', 'portrait_3_4', 9),
      (inv_id, '/demo/janji-kota/gallery-11.jpg', 'Foto contoh 11', 'landscape_16_9', 10),
      (inv_id, '/demo/janji-kota/gallery-12.jpg', 'Foto contoh 12', 'square_1_1', 11);

    insert into public.gift_accounts (invitation_id, provider_type, provider_name, account_number, account_name, sort_order)
    values
      (inv_id, 'bank', 'Bank Sample', '1234567890', 'Nama Mempelai Sample', 0),
      (inv_id, 'ewallet', 'Dompet Digital Sample', '081200000000', 'Nama Mempelai Sample', 1);

    insert into public.wishes (invitation_id, guest_name, message, is_visible, created_at)
    values
      (inv_id, 'Tamu Sample 1', 'Selamat menempuh hidup baru! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.', true, now() - interval '5 hours'),
      (inv_id, 'Tamu Sample 2', 'Bahagia selalu untuk kalian berdua. Semoga langgeng sampai kakek nenek.', true, now() - interval '10 hours'),
      (inv_id, 'Tamu Sample 3', 'Turut berbahagia! Maaf belum bisa hadir, doa terbaik dari jauh.', true, now() - interval '15 hours'),
      (inv_id, 'Tamu Sample 4', 'Semoga cinta kalian terus tumbuh setiap hari. Selamat!', true, now() - interval '20 hours');
  end if;
end $$;
