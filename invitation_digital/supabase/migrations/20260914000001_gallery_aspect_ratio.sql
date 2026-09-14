alter table public.gallery_items
  add column aspect_ratio text not null default 'portrait_4_5'
  check (aspect_ratio in (
    'square_1_1',
    'portrait_4_5',
    'portrait_3_4',
    'landscape_16_9',
    'landscape_4_3'
  ));
