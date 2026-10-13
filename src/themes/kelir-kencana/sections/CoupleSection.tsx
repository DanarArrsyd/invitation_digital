import { getPersonInstagram } from "@/lib/utils/instagram";
import { parentLineFor } from "@/themes/shared/event-copy";
import type { InvitationPerson, InvitationType } from "@/types/invitation";

import { GununganRule } from "../components/Gunungan";
import { KelirImage } from "../components/KelirImage";
import { ChapterHeading } from "../components/ChapterHeading";
import { Section } from "../components/Section";
import { WayangFigure, type WayangName } from "../components/WayangFigure";

function roleLabel(role: InvitationPerson["role"]): string | null {
  if (role === "bride") return "Mempelai Wanita";
  if (role === "groom") return "Mempelai Pria";
  return null;
}

// The satria stands beside the groom and the putri beside the bride; other
// roles have no figure.
function figureFor(role: InvitationPerson["role"]): WayangName | null {
  if (role === "groom") return "satria";
  if (role === "bride") return "putri";
  return null;
}

export function CoupleSection({ people, settings, invitationType, eyebrow, heading }: {
  people: InvitationPerson[];
  settings: Record<string, unknown>;
  invitationType: InvitationType;
  eyebrow: string;
  heading: string;
}) {
  if (people.length === 0) return null;
  const wedding = invitationType === "wedding";

  return (
    <Section id="kk-mempelai" labelledBy="kk-couple-heading" className="kk-couple">
      <ChapterHeading
        id="kk-couple-heading"
        act="Jejer"
        eyebrow={eyebrow}
        title={heading}
      />

      <div className="kk-people">
        {people.map((person, index) => {
          const instagram = getPersonInstagram(settings, person.id);
          const parents = [person.fatherName, person.motherName]
            .filter((name): name is string => Boolean(name?.trim()));
          const parentLine = parentLineFor(invitationType, person.role);
          const initial = (person.nickname || person.fullName).trim().charAt(0) || "•";
          const figure = wedding ? figureFor(person.role) : null;
          const role = wedding ? roleLabel(person.role) : null;
          // The figure stands on the outer side and faces the portrait: the
          // satria faces right, so it stands on the left; the putri on the right.
          const figureSide = figure === "satria" ? "left" : "right";

          return (
            <div key={person.id} className="kk-person-wrap">
              {index > 0 ? <GununganRule uid={`kk-couple-rule-${index}`} /> : null}
              <article className="kk-person" data-figure-side={figure ? figureSide : undefined}>
                <div className="kk-person-portrait-row">
                  {figure ? <WayangFigure name={figure} mode="colour" className="kk-person-figure" /> : null}
                  {person.photoUrl ? (
                    <KelirImage
                      src={person.photoUrl}
                      alt={`Potret ${person.fullName}`}
                      sizes="(min-width: 768px) 220px, 40vw"
                      aspectRatio="3 / 4"
                      className="kk-person-portrait"
                    />
                  ) : (
                    <div className="kk-person-monogram" role="img" aria-label={`Potret ${person.fullName} tidak tersedia`}>
                      <span aria-hidden="true">{initial}</span>
                    </div>
                  )}
                </div>

                <div className="kk-person-copy">
                  {role ? <p className="kk-eyebrow">{role}</p> : null}
                  <h3 className="kk-script">{person.fullName}</h3>
                  {parents.length > 0 && parentLine ? (
                    <div className="kk-parents">
                      <p>{parentLine}</p>
                      <p>{parents.map((name, parentIndex) => (
                        <span key={`${person.id}-${parentIndex}`}>
                          {parentIndex > 0 ? <span className="kk-parent-join"> &amp; </span> : null}
                          {name}
                        </span>
                      ))}</p>
                    </div>
                  ) : null}
                  {person.bio?.trim() ? <p className="kk-person-bio">{person.bio}</p> : null}
                  {instagram ? (
                    <a
                      className="kk-instagram"
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
            </div>
          );
        })}
      </div>
    </Section>
  );
}
