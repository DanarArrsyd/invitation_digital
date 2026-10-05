/**
 * Share banners (1200 × 630) rendered with next/og. Satori lays these out,
 * so every element with more than one child needs `display: flex` and all
 * styling is inline. Fonts come from loadOgFonts: "Serif" and "Script".
 */
import type { ShareStyle } from "./share-styles";

export const OG_SIZE = { width: 1200, height: 630 };

export function OgMark({ color, accent, height = 40 }: { color: string; accent: string; height?: number }) {
  return (
    <svg width={(height * 42) / 48} height={height} viewBox="11 4 42 48">
      <path d="M13.5 51V33a18.5 18.5 0 0 1 37 0v18" fill="none" stroke={color} strokeOpacity="0.5" strokeWidth="1.8" />
      <path d="M20 51V33a12 12 0 0 1 24 0v18" fill="none" stroke={color} strokeWidth="3.2" />
      <path d="M25.5 34.5h13M32 34.5V51" fill="none" stroke={color} strokeWidth="3.2" />
      <path d="M32 5.5l2.6 3.9L32 13.3l-2.6-3.9z" fill={accent} />
    </svg>
  );
}

function Eyebrow({ text, style }: { text: string; style: ShareStyle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", color: style.muted, fontSize: 19, letterSpacing: 5 }}>
      <span style={{ textTransform: "uppercase" }}>{text}</span>
      <span style={{ width: 72, height: 1.5, background: style.accent, marginLeft: 20 }} />
    </div>
  );
}

function BrandFooter({ style, note }: { style: ShareStyle; note: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", color: style.muted, fontSize: 19 }}>
      <OgMark color={style.ink} accent={style.accent} height={34} />
      <span style={{ marginLeft: 14, fontWeight: 600, color: style.ink, fontSize: 21 }}>Temuraya</span>
      <span style={{ margin: "0 12px", color: style.accent }}>·</span>
      <span style={{ fontStyle: "italic" }}>{note}</span>
    </div>
  );
}

function clip(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** Script size that keeps the longest name on one line in the text column. */
function nameSize(longest: number): number {
  if (longest <= 8) return 112;
  if (longest <= 12) return 96;
  if (longest <= 16) return 80;
  if (longest <= 22) return 64;
  return 52;
}

export function InvitationBanner({
  style,
  eyebrow,
  primaryName,
  secondaryName,
  dateLabel,
  venueLabel,
  photo,
  initials,
}: {
  style: ShareStyle;
  eyebrow: string;
  primaryName: string;
  secondaryName: string | null;
  dateLabel: string | null;
  venueLabel: string | null;
  photo: string | null;
  initials: string;
}) {
  const primary = clip(primaryName, 28);
  const secondary = secondaryName ? clip(secondaryName, 28) : null;
  const size = nameSize(Math.max(primary.length, secondary?.length ?? 0));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: style.background,
        color: style.ink,
        fontFamily: "Serif",
      }}
    >
      <div
        style={{
          width: 680,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 48px 50px 72px",
        }}
      >
        <Eyebrow text={eyebrow} style={style} />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: "Script", fontSize: size, lineHeight: 1.05 }}>{primary}</span>
          {secondary ? (
            <div style={{ display: "flex", alignItems: "center", marginLeft: 36 }}>
              <span style={{ color: style.accent, fontSize: 44, fontStyle: "italic", marginRight: 22 }}>&amp;</span>
              <span style={{ fontFamily: "Script", fontSize: size, lineHeight: 1.05 }}>{secondary}</span>
            </div>
          ) : null}
          <span style={{ width: 200, height: 1.5, background: style.accent, marginTop: 28 }} />
          {dateLabel ? <span style={{ marginTop: 22, fontSize: 32, fontWeight: 600 }}>{dateLabel}</span> : null}
          {venueLabel ? (
            <span style={{ marginTop: 6, fontSize: 24, fontStyle: "italic", color: style.muted }}>
              {clip(venueLabel, 48)}
            </span>
          ) : null}
        </div>

        <BrandFooter style={style} note="undangan digital" />
      </div>

      <div
        style={{
          flex: 1,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: style.panel,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 66,
            width: 388,
            height: 560,
            display: "flex",
            border: `1.5px solid ${style.accent}`,
            borderRadius: "194px 194px 0 0",
            opacity: 0.45,
          }}
        />
        <div
          style={{
            width: 340,
            height: 476,
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderRadius: "170px 170px 14px 14px",
            border: `2px solid ${style.accent}`,
            background: style.background,
            boxShadow: "0 24px 50px rgba(0, 0, 0, 0.22)",
          }}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" src={photo} width={340} height={476} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontFamily: "Script", fontSize: 120, color: style.accent }}>{initials}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function Phone({ src, width, height, style }: { src: string | null; width: number; height: number; style: ShareStyle }) {
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        overflow: "hidden",
        borderRadius: width * 0.16,
        border: `${Math.round(width * 0.035)}px solid #111111`,
        background: style.background,
        boxShadow: "0 30px 60px rgba(0, 0, 0, 0.35)",
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" src={src} width={width} height={height} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
          <OgMark color={style.ink} accent={style.accent} height={width * 0.4} />
        </div>
      )}
    </div>
  );
}

export const PHONE_SCREEN = { width: 214, height: 464 };

export function TemplateBanner({
  style,
  eyebrow,
  name,
  tagline,
  screens,
  note,
}: {
  style: ShareStyle;
  eyebrow: string;
  name: string;
  tagline: string | null;
  /** Up to two screenshots: front, then back. */
  screens: (string | null)[];
  note: string;
}) {
  const [front = null, back = null] = screens;
  const swatches = [style.background, style.panel, style.accent, style.ink];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: style.background,
        color: style.ink,
        fontFamily: "Serif",
      }}
    >
      <div
        style={{
          width: 680,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 48px 50px 72px",
        }}
      >
        <Eyebrow text={eyebrow} style={style} />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: name.length > 16 ? 70 : 84, fontWeight: 600, lineHeight: 1, letterSpacing: -2 }}>
            {clip(name, 32)}
          </span>
          {tagline ? (
            <span style={{ marginTop: 22, fontSize: 29, fontStyle: "italic", color: style.muted, lineHeight: 1.3 }}>
              {clip(tagline, 90)}
            </span>
          ) : null}
          <div style={{ display: "flex", marginTop: 34 }}>
            {swatches.map((color, index) => (
              <span
                key={index}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  background: color,
                  border: `1.5px solid ${style.muted}`,
                  marginRight: 10,
                }}
              />
            ))}
          </div>
        </div>

        <BrandFooter style={style} note={note} />
      </div>

      <div
        style={{
          flex: 1,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: style.panel,
          position: "relative",
        }}
      >
        {back ? (
          <div style={{ position: "absolute", left: 46, top: 120, display: "flex", transform: "rotate(-7deg)" }}>
            <Phone src={back} width={190} height={412} style={style} />
          </div>
        ) : null}
        <div style={{ display: "flex", marginLeft: back ? 140 : 0, marginTop: 60, transform: "rotate(3deg)" }}>
          <Phone src={front} width={PHONE_SCREEN.width} height={PHONE_SCREEN.height} style={style} />
        </div>
      </div>
    </div>
  );
}

export function CatalogueBanner({ style, count, screens }: { style: ShareStyle; count: number; screens: (string | null)[] }) {
  const shown = screens.slice(0, 4);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: style.background,
        color: style.ink,
        fontFamily: "Serif",
      }}
    >
      <div
        style={{
          width: 560,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 40px 50px 72px",
        }}
      >
        <Eyebrow text="Katalog Temuraya" style={style} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 68, fontWeight: 600, lineHeight: 1.02, letterSpacing: -2 }}>Template undangan digital</span>
          <span style={{ marginTop: 22, fontSize: 28, fontStyle: "italic", color: style.muted }}>
            {count > 0 ? `${count} template · lihat demo setiap paket` : "Lihat demo setiap paket"}
          </span>
        </div>
        <BrandFooter style={style} note="pesan lewat WhatsApp" />
      </div>
      <div
        style={{
          flex: 1,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: style.panel,
          paddingTop: 50,
        }}
      >
        {shown.map((src, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              marginLeft: index === 0 ? 0 : -34,
              marginTop: index % 2 === 0 ? 40 : -40,
              transform: `rotate(${index % 2 === 0 ? -4 : 4}deg)`,
            }}
          >
            <Phone src={src} width={156} height={338} style={style} />
          </div>
        ))}
      </div>
    </div>
  );
}
