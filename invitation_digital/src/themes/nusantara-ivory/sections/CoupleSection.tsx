import { getPersonInstagram, type InstagramProfile } from "@/lib/utils/instagram";
import { EditorialImage } from "../components/EditorialImage";
import { FloralCorner, BotanicalDivider } from "../components/Botanical";
import type { InvitationPerson } from "@/types/invitation";

import { OrnamentCorner } from "../components/Ornament";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";

function PersonPortrait({ person }: { person: InvitationPerson }) {
  return (
    <div className="ni-photo-wrap relative aspect-[4/5] w-full">
      {person.photoUrl ? (
        <EditorialImage src={person.photoUrl} alt={person.fullName} className="ni-photo" />
      ) : (
        <div className="ni-lattice relative flex h-full w-full items-center justify-center bg-[var(--ni-cream)]">
          <span
            className="ni-serif relative text-[clamp(4rem,12vw,7rem)] leading-none"
            style={{ color: "rgba(169,138,92,0.5)" }}
            aria-hidden="true"
          >
            {(person.nickname || person.fullName).charAt(0)}
          </span>
        </div>
      )}
      <OrnamentCorner className="absolute top-3 left-3 size-9 opacity-80" tone="light" />
    </div>
  );
}

function PersonDetails({
  person,
  align,
  instagram,
}: {
  person: InvitationPerson;
  align: "left" | "right";
  instagram?: InstagramProfile | null;
}) {
  const parents = [person.fatherName, person.motherName].filter(Boolean).join(" & ");
  const display = person.nickname || person.fullName;
  const hasSubtitle = Boolean(person.nickname) && person.fullName !== person.nickname;

  return (
    <div
      className={`flex flex-col gap-3 ${align === "right" ? "md:items-end md:text-right" : "items-start text-left"}`}
    >
      <h3 className="ni-display text-[clamp(2.1rem,5vw,3.4rem)] break-words">{display}</h3>

      {hasSubtitle ? (
        <p
          className="text-[0.72rem] tracking-[0.26em] uppercase"
          style={{ color: "var(--ni-gold)" }}
        >
          {person.fullName}
        </p>
      ) : null}

      <span
        className={`block h-px w-14 ${align === "right" ? "md:self-end" : ""}`}
        aria-hidden="true"
        style={{ background: "linear-gradient(90deg, var(--ni-gold), transparent)" }}
      />

      {parents ? (
        <p className="ni-body max-w-[34ch] text-[0.9rem]">
          Putra/i dari <span className="text-[var(--ni-brown)]">{parents}</span>
        </p>
      ) : null}

      {person.bio ? <p className="ni-body max-w-[38ch] text-[0.9rem]">{person.bio}</p> : null}
      {instagram ? (
        <a href={instagram.url} target="_blank" rel="noopener noreferrer" className="ni-social-link" aria-label={`Instagram ${person.fullName}: @${instagram.username} (tab baru)`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" focusable="false">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" />
          </svg>
          <span>@{instagram.username}</span>
        </a>
      ) : null}
    </div>
  );
}

export function CoupleSection({ people, settings }: { people: InvitationPerson[]; settings?: Record<string, unknown> }) {
  if (people.length === 0) return null;

  return (
    <Section id="ni-mempelai" tone="ivory" wide floral>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading title="Mempelai" />
        <Reveal variant="fade"><BotanicalDivider /></Reveal>
      </div>
      <div className="ni-couple-grid">
        {people.map((person, index) => (
          <article key={person.id} className={person.photoUrl ? "ni-person" : "ni-person ni-person-empty"}>
            {person.photoUrl ? <>
              <FloralCorner />
              <Reveal variant="mask" delay={index % 2 * .1}><PersonPortrait person={person} /></Reveal>
              <Reveal className="ni-person-details" delay={.12}>
                <PersonDetails person={person} instagram={getPersonInstagram(settings, person.id)} align={index % 2 ? "right" : "left"} />
              </Reveal>
            </> : <>
              <div className="ni-monogram ni-serif" aria-hidden="true">{(person.nickname || person.fullName).charAt(0)}</div>
              <Reveal><PersonDetails person={person} instagram={getPersonInstagram(settings, person.id)} align="left" /></Reveal>
            </>}
          </article>
        ))}
      </div>
    </Section>
  );
}
