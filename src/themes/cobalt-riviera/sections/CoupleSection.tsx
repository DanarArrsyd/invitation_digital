import { getPersonInstagram } from "@/lib/utils/instagram";
import type { InvitationPerson, InvitationType } from "@/types/invitation";

import { CeramicLine } from "../components/RivieraOrnaments";
import { RivieraImage } from "../components/RivieraImage";
import { Section } from "../components/Section";

function parentLabel(role: InvitationPerson["role"]): string {
  if (role === "bride") return "Putri dari";
  if (role === "groom") return "Putra dari";
  return "Keluarga";
}

export function CoupleSection({ people, settings, invitationType }: {
  people: InvitationPerson[];
  settings: Record<string, unknown>;
  invitationType: InvitationType;
}) {
  if (people.length === 0) return null;

  return (
    <Section id="cr-mempelai" labelledBy="cr-couple-heading" tone="porcelain" className="cr-couple">
      <header className="cr-chapter-heading">
        <p>{invitationType === "wedding" ? "Yang berbahagia" : "Tuan rumah"}</p>
        <h2 id="cr-couple-heading">{invitationType === "wedding" ? "Mempelai" : "Yang mengundang"}</h2>
        <CeramicLine />
      </header>

      <div className="cr-people">
        {people.map((person, index) => {
          const instagram = getPersonInstagram(settings, person.id);
          const parents = [person.fatherName, person.motherName]
            .filter((name): name is string => Boolean(name?.trim()));
          const initial = (person.nickname || person.fullName).trim().charAt(0) || "•";

          return (
            <article
              key={person.id}
              className={`cr-person${person.photoUrl ? "" : " cr-person-text-only"}`}
              data-position={index % 2 === 0 ? "left" : "right"}
            >
              {person.photoUrl ? (
                <RivieraImage
                  src={person.photoUrl}
                  alt={`Potret ${person.fullName}`}
                  sizes="(min-width: 1200px) 36vw, (min-width: 768px) 44vw, 100vw"
                  aspectRatio="4 / 5"
                  className="cr-person-portrait"
                />
              ) : (
                <div className="cr-person-monogram" role="img" aria-label={`Potret ${person.fullName} tidak tersedia`}>
                  <span aria-hidden="true">{initial}</span>
                </div>
              )}

              <div className="cr-person-copy">
                <p className="cr-person-route">Kartu pos {String(index + 1).padStart(2, "0")}</p>
                <h3 className="cr-script">{person.fullName}</h3>
                {parents.length > 0 ? (
                  <div className="cr-parents">
                    <p>{parentLabel(person.role)}</p>
                    <p>{parents.map((name, parentIndex) => (
                      <span key={`${person.id}-${parentIndex}`}>
                        {parentIndex > 0 ? <span className="cr-parent-join"> &amp; </span> : null}
                        {name}
                      </span>
                    ))}</p>
                  </div>
                ) : null}
                {person.bio?.trim() ? <p className="cr-person-bio">{person.bio}</p> : null}
                {instagram ? (
                  <a
                    className="cr-instagram"
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
