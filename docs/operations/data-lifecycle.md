# Data lifecycle

## Owner decisions (2026-10-16)

- Expiration only closes public access. Invitation content, guest names, RSVP, wishes, and media stay in the database and Storage until an admin deliberately deletes them. No scheduled invitation purge is allowed.
- Raw `analytics_events` rows, including session IDs and guest IDs, are retained for 90 complete UTC days. A daily job folds older rows into anonymous per-day counts and then removes the raw rows in the same database transaction.
- The displayed visitor metric is now **Pengunjung unik harian**: the sum of distinct sessions within each UTC day. One visitor opening on two days contributes two to this metric. The daily aggregate contains no session or guest identifier.

## Rollout

1. The linked Supabase organization is on Free (checked 2026-10-16). [Supabase's production checklist](https://supabase.com/docs/guides/deployment/going-into-prod) says downloadable database backups are unavailable on Free. Before the first non-demo customer, take and restore-test a separate database and Storage backup; do not treat this Cron job as a backup.
2. Apply `supabase/migrations/20261016000001_analytics_retention.sql` before deploying the application query that calls `get_invitation_analytics_summary`. The migration creates the summary table and secured read function, then enables one daily Supabase Cron job at 02:15 UTC.
3. Confirm `cron.job` contains `archive-analytics-events-daily`. Confirm `analytics_events` and `analytics_daily` row counts, and inspect `cron.job_run_details` after its first run. The job only removes analytics rows older than 90 full UTC days.
4. Deploy the application and check the Grand-package Responses page. Other packages must still skip the analytics query.

Do not run the archive function manually against production without first checking a backup and the cutoff. The job's data move is transactional: an aggregate write failure rolls back deletion.

## Routine checks

```sql
select jobid, schedule, command from cron.job
where jobname = 'archive-analytics-events-daily';

select count(*) as raw_rows,
       min(created_at) as oldest_raw_event
from public.analytics_events;

select count(*) as summary_days,
       min(day) as oldest_summary_day
from public.analytics_daily;
```

If the job fails, inspect `cron.job_run_details` and fix the failure before retrying. An application rollback does not remove the Cron job; disable it explicitly if the retention policy must stop. Reversing a successful purge requires a backup, because aggregates cannot recreate individual events.

## Manual deletion

The admin Publish page offers whole-invitation deletion for non-demo invitations after they have been pulled from public access. The admin must type the exact slug in the confirmation dialog. `queue_invitation_deletion` verifies the admin profile, demo flag, status, and slug inside one transaction, then deletes the invitation and inserts a durable Storage cleanup job. Invitation child rows, including RSVP, wishes, and analytics, cascade with the invitation. The public cache is invalidated immediately.

The server then lists and removes every object below `invitations/<id>/`, including unreferenced uploads. It deletes the cleanup job only after Storage removal succeeds. If Storage is unavailable, the job remains visible at `/admin/invitations`, where the admin can retry. Successful retries remove the job. Demo invitations have no delete control and are also rejected by the database function.

Apply `supabase/migrations/20261016000002_invitation_deletion_queue.sql` before deploying the delete UI. The function is not a scheduled purge: it runs only after an admin confirms a specific invitation. Before deleting a real customer's invitation, verify the separate database and Storage backup is restorable; Supabase Free does not provide downloadable database backups.
