import { CircleAlert, CircleCheck, CircleDashed } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { FormMessage } from "@/components/admin/form-message";
import { InvitationStatusBadge } from "@/components/admin/status-badge";
import { SubmitButton } from "@/components/admin/submit-button";
import { getPublishReadiness } from "@/lib/invitations/readiness";
import { effectiveInvitationStatus } from "@/lib/invitations/status";
import type { PackageKey } from "@/lib/packages/entitlements";
import { buildPublishedInvitationPath } from "@/lib/share/invitation-share";
import { getInvitationDetail } from "@/server/invitations/queries";
import { resolveInvitationFeatures } from "@/server/public/normalize";

import { CopyLinkButton } from "../guests/CopyLinkButton";
import { publishAction, unpublishAction } from "./actions";

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  });
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

export default async function PublishPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const detail = await getInvitationDetail(id);
  if (!detail) notFound();

  const { invitation } = detail;
  const status = effectiveInvitationStatus(invitation.status, invitation.expires_at);
  const isPublished = invitation.status === "published";
  const isLive = status === "published";
  const publicLink = isPublished
    ? buildPublishedInvitationPath({ slug: invitation.slug, publishedAt: invitation.published_at })
    : null;

  const monthsAfterPublish =
    (invitation.settings as { expiration?: { monthsAfterPublish?: number } } | null)?.expiration
      ?.monthsAfterPublish ?? 3;

  const readiness = getPublishReadiness({
    features: resolveInvitationFeatures(invitation.package_key as PackageKey, invitation.settings),
    peopleCount: detail.people.length,
    eventCount: detail.events.length,
    hasCoverImage: Boolean(invitation.cover_image_path),
    hasMusic: Boolean(invitation.music_path),
    galleryCount: detail.gallery.length,
    giftCount: detail.gifts.length,
    storyCount: detail.stories.length,
    guestCount: detail.guests.length,
  });
  const missingRequired = readiness.filter((item) => !item.done && item.level === "required").length;
  const missingRecommended = readiness.filter((item) => !item.done && item.level === "recommended").length;

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <FormMessage tone="error">{error}</FormMessage>

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Status</h2>
          <InvitationStatusBadge status={invitation.status} expiresAt={invitation.expires_at} />
        </div>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-muted-foreground">Terakhir diterbitkan</dt>
          <dd className="text-foreground">{formatDateTime(invitation.published_at)}</dd>
          <dt className="text-muted-foreground">Berlaku sampai</dt>
          <dd className="text-foreground">
            {invitation.expires_at ? (
              <>
                {formatDateTime(invitation.expires_at)}
                {isLive ? (
                  <span className="text-muted-foreground"> · {daysUntil(invitation.expires_at)} hari lagi</span>
                ) : null}
              </>
            ) : (
              `${monthsAfterPublish} bulan sejak pertama kali diterbitkan`
            )}
          </dd>
        </dl>
        {publicLink ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              href={publicLink}
              target="_blank"
              className="min-w-0 truncate text-foreground underline underline-offset-2"
            >
              {publicLink}
            </Link>
            <CopyLinkButton link={publicLink} />
          </div>
        ) : null}
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Kesiapan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {missingRequired > 0
              ? `${missingRequired} hal wajib belum lengkap. Undangan tetap bisa diterbitkan, tapi tamu akan melihat bagian yang kosong.`
              : missingRecommended > 0
                ? `Bagian wajib lengkap. ${missingRecommended} hal disarankan masih kosong.`
                : "Semua bagian sudah terisi."}
          </p>
        </div>
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {readiness.map((item) => {
            const Icon = item.done ? CircleCheck : item.level === "required" ? CircleAlert : CircleDashed;
            return (
              <li key={item.key} className="flex items-start gap-3 px-4 py-3">
                <Icon
                  aria-hidden="true"
                  className={`mt-0.5 size-4 shrink-0 ${
                    item.done ? "text-success" : item.level === "required" ? "text-destructive" : "text-muted-foreground"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {item.label}
                    <span className="sr-only">
                      {item.done ? " — sudah" : item.level === "required" ? " — wajib, belum" : " — disarankan, belum"}
                    </span>
                  </p>
                  {!item.done ? <p className="text-sm text-muted-foreground">{item.hint}</p> : null}
                </div>
                {!item.done ? (
                  <Link
                    href={`/admin/invitations/${invitation.id}/${item.section}`}
                    className="shrink-0 text-sm text-foreground underline underline-offset-2"
                  >
                    Lengkapi
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-wrap items-center gap-3">
        {isPublished ? (
          <ConfirmDeleteForm
            action={unpublishAction}
            hiddenFields={{ invitationId: invitation.id }}
            title="Tarik undangan dari publik?"
            description="Link undangan dan semua link personal tamu berhenti bisa dibuka sampai diterbitkan lagi. Data, RSVP dan ucapan tidak dihapus, dan masa berlaku tidak di-reset."
            triggerLabel="Tarik dari publik"
            confirmLabel="Ya, tarik"
            triggerVariant="outline"
            triggerSize="default"
          />
        ) : (
          <form action={publishAction}>
            <input type="hidden" name="invitationId" value={invitation.id} />
            <SubmitButton pendingText="Menerbitkan...">
              {invitation.published_at ? "Terbitkan lagi" : "Terbitkan undangan"}
            </SubmitButton>
          </form>
        )}
        <Link
          href={`/admin/invitations/${invitation.id}/preview`}
          target="_blank"
          className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Lihat pratinjau dulu<span className="sr-only"> (tab baru)</span>
        </Link>
      </section>
    </div>
  );
}
