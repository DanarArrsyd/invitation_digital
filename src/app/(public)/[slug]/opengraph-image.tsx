import { ImageResponse } from "next/og";

import { InvitationBanner, OG_SIZE } from "@/lib/og/banners";
import { loadOgFonts, loadOgImage } from "@/lib/og/assets";
import { getShareStyle } from "@/lib/og/share-styles";
import { getInvitationEyebrow, getInvitationShareData } from "@/lib/share/invitation-share";
import { getPublicInvitationBySlug } from "@/server/public/invitation-loader";

export const alt = "Undangan digital";
export const size = OG_SIZE;
export const contentType = "image/png";

/**
 * The banner chat and social apps show for an invitation link: the
 * invitation's own theme colours, names, date, venue and cover photo.
 * Unpublished or missing slugs get a neutral Temuraya invitation card.
 */
export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getPublicInvitationBySlug(slug);
  const invitation = result.kind === "ok" ? result.invitation : null;
  const share = invitation ? getInvitationShareData(invitation) : null;
  const style = getShareStyle(invitation?.theme.slug);

  const [fonts, photo] = await Promise.all([
    loadOgFonts(style.script),
    loadOgImage(share?.coverImageUrl, { width: 340, height: 476 }),
  ]);

  const primaryName = share?.primaryName ?? "Undangan";
  const secondaryName = share?.secondaryName || null;
  const initials = `${primaryName.charAt(0)}${secondaryName ? secondaryName.charAt(0) : ""}`.toUpperCase();

  return new ImageResponse(
    <InvitationBanner
      style={style}
      eyebrow={invitation ? getInvitationEyebrow(invitation.type) : "Undangan digital"}
      primaryName={primaryName}
      secondaryName={secondaryName}
      dateLabel={share?.dateLabel ?? null}
      venueLabel={share?.venueLabel ?? null}
      photo={photo}
      initials={initials}
    />,
    { ...size, fonts },
  );
}
