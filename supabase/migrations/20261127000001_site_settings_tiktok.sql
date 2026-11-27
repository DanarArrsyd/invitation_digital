-- TikTok profile for the marketing footer, edited in admin Situs -> Kontak.
-- Stored normalised as https://www.tiktok.com/@handle, like instagram_url.
alter table public.site_settings
  add column if not exists tiktok_url text;
