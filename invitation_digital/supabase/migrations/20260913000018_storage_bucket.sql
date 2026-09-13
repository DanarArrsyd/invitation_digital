-- Object layout: invitations/<invitation-id>/{people|gallery|cover|music}/<filename>
-- See ARCHITECTURE.md section 11. Bucket is public-read (invitation photos/music
-- are meant to be publicly viewable once the invitation is published); writes
-- are restricted to authenticated admins.
insert into storage.buckets (id, name, public)
values ('invitation-media', 'invitation-media', true)
on conflict (id) do nothing;

create policy "invitation_media_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'invitation-media');

create policy "invitation_media_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'invitation-media')
  with check (bucket_id = 'invitation-media');

create policy "invitation_media_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'invitation-media');
