import { getPersonInstagram } from "@/lib/utils/instagram";
import { parentLineFor } from "@/themes/shared/event-copy";
import type { InvitationPerson, InvitationType } from "@/types/invitation";

import { AtelierImage } from "../components/AtelierImage";
import { Section } from "../components/Section";
import { Spotlight } from "../components/Spotlight";

export function CoupleSection({ people, settings, invitationType, eyebrow, heading }: {
  people: InvitationPerson[];
  settings: Record<string, unknown>;
  invitationType: InvitationType;
  eyebrow: string;
  heading: string;
}) {
  if (people.length === 0) return null;

  return (
    <Section id="ma-mempelai" labelledBy="ma-couple-heading" tone="pearl" className="ma-couple">
      <Spotlight className="ma-chapter-heading">
        <p>{eyebrow}</p>
        <h2 id="ma-couple-heading">{heading}</h2>
      </Spotlight>

      <div className="ma-people">
        {people.map((person, index) => {
          const instagram = getPersonInstagram(settings, person.id);
          const parents = [person.fatherName, person.motherName].filter((name): name is string => Boolean(name?.trim()));
          const parentLine = parentLineFor(invitationType, person.role);
          const initial = (person.nickname || person.fullName).trim().charAt(0);

          return (
            <article
              key={person.id}
              className={`ma-person${person.photoUrl ? "" : " ma-person-text-only"}`}
              data-position={index % 2 === 0 ? "left" : "right"}
            >
              {person.photoUrl ? (
                <AtelierImage
                  src={person.photoUrl}
                  alt={`Potret ${person.fullName}`}
                  sizes="(min-width: 1100px) 38vw, (min-width: 768px) 44vw, 100vw"
                  aspectRatio="4 / 5"
                  className="ma-person-portrait"
                />
              ) : (
                <div className="ma-person-monogram" aria-hidden="true">{initial}</div>
              )}

              <div className="ma-person-copy">
                <h3 className="ma-script">{person.fullName}</h3>
                {parents.length > 0 && parentLine ? (
                  <div className="ma-parents">
                    <p>{parentLine}</p>
                    <p>{parents.map((name, parentIndex) => (
                      <span key={`${person.id}-${parentIndex}`}>
                        {parentIndex > 0 ? <span className="ma-parent-join"> &amp; </span> : null}
                        {name}
                      </span>
                    ))}</p>
                  </div>
                ) : null}
                {person.bio?.trim() ? <p className="ma-person-bio">{person.bio}</p> : null}
                {instagram ? (
                  <a
                    className="ma-instagram"
                    href={instagram.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Instagram ${person.fullName} @${instagram.username}`}
                  >
                    @{instagram.username}
                  </a>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
