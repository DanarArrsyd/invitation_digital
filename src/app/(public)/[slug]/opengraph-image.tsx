import { ImageResponse } from "next/og";

import { getInvitationShareData, type InvitationShareData } from "@/lib/share/invitation-share";
import { getPublicInvitationBySlug } from "@/server/public/invitation-loader";

export const alt = "Undangan pernikahan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fallbackShare: InvitationShareData = {
  displayName: "Undangan Pernikahan",
  primaryName: "Undangan",
  secondaryName: "Pernikahan",
  title: "Undangan Pernikahan",
  description: "Undangan pernikahan digital",
  dateLabel: null,
  venueLabel: null,
  coverImageUrl: null,
};

function BotanicalBranch({ flip = false }: { flip?: boolean }) {
  return (
    <svg width="210" height="210" viewBox="0 0 210 210">
      <g transform={flip ? "rotate(180 105 105)" : undefined}>
        <path d="M18 190 C58 148 84 105 106 20" fill="none" stroke="#A7895E" strokeWidth="2" />
        <path d="M54 151 C30 146 18 126 20 106 C44 110 58 128 54 151Z" fill="none" stroke="#A7895E" strokeWidth="2" />
        <path d="M76 116 C101 108 115 88 112 68 C88 74 74 94 76 116Z" fill="none" stroke="#A7895E" strokeWidth="2" />
        <path d="M93 72 C70 64 59 47 62 28 C84 34 97 52 93 72Z" fill="none" stroke="#A7895E" strokeWidth="2" />
        <circle cx="112" cy="21" r="8" fill="none" stroke="#A7895E" strokeWidth="2" />
        <circle cx="112" cy="21" r="3" fill="#A7895E" />
      </g>
    </svg>
  );
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPublicInvitationBySlug(slug);
  const share = result.kind === "ok" ? getInvitationShareData(result.invitation) : fallbackShare;
  const initials = `${share.primaryName.charAt(0)}${share.secondaryName.charAt(0)}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#F8F2E7",
        color: "#2B2520",
        padding: "28px",
        fontFamily: "serif",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "stretch",
          border: "2px solid #A7895E",
          padding: "12px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            border: "1px solid rgba(167, 137, 94, 0.52)",
            background: "#FFFDF8",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "61%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "58px 44px 54px 72px",
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", left: "-44px", bottom: "-48px", opacity: 0.28, display: "flex" }}>
              <BotanicalBranch />
            </div>

            <div style={{ display: "flex", alignItems: "center", color: "#766453", fontSize: 22, letterSpacing: 3 }}>
              <span>Undangan Pernikahan</span>
              <span style={{ width: 92, height: 1, background: "#A7895E", marginLeft: 22 }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", marginTop: 27, lineHeight: 0.88 }}>
              <span style={{ fontSize: 84, letterSpacing: -3 }}>{share.primaryName}</span>
              {share.secondaryName ? (
                <div style={{ display: "flex", alignItems: "center", marginLeft: 30 }}>
                  <span style={{ color: "#A7895E", fontSize: 43, fontStyle: "italic", marginRight: 18 }}>&amp;</span>
                  <span style={{ fontSize: 84, letterSpacing: -3 }}>{share.secondaryName}</span>
                </div>
              ) : null}
            </div>

            <div style={{ width: 230, height: 1, background: "#A7895E", marginTop: 40 }} />
            <div style={{ display: "flex", flexDirection: "column", color: "#766453", fontFamily: "sans-serif", marginTop: 20 }}>
              {share.dateLabel ? <span style={{ fontSize: 25 }}>{share.dateLabel}</span> : null}
              {share.venueLabel ? <span style={{ fontSize: 18, marginTop: 8 }}>{share.venueLabel}</span> : null}
            </div>
          </div>

          <div
            style={{
              width: "39%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "34px 42px 34px 10px",
              background: "#F3E9DA",
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", right: "-56px", top: "-56px", opacity: 0.32, display: "flex" }}>
              <BotanicalBranch flip />
            </div>
            <div
              style={{
                width: 360,
                height: 475,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(167, 137, 94, 0.8)",
                borderRadius: "180px 180px 18px 18px",
                overflow: "hidden",
                background: "#E6D9C6",
                boxShadow: "0 18px 44px rgba(69, 59, 49, 0.16)",
              }}
            >
              {share.coverImageUrl ? (
                <img
                  alt=""
                  src={share.coverImageUrl}
                  width="360"
                  height="475"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#7C8069" }}>
                  <span style={{ fontSize: 78, letterSpacing: 10 }}>{initials}</span>
                  <span style={{ width: 84, height: 1, background: "#A7895E", marginTop: 20 }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
