import { getPersonInstagram } from "@/lib/utils/instagram";
import { parentLineFor } from "@/themes/shared/event-copy";
import type { InvitationPerson, InvitationType } from "@/types/invitation";
import { EditorialImage } from "../components/EditorialImage";
import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";

export function CoupleSection({ people, settings, invitationType, heading }: {
  people: InvitationPerson[];
  settings: Record<string, unknown>;
  invitationType: InvitationType;
  heading: string;
}) {
  if (people.length === 0) return null;
  return (
    <Section id="tb-mempelai" labelledBy="tb-couple-heading" className="tb-couple">
      <SectionHeading id="tb-couple-heading" title={heading} />
      <div className="tb-people">
        {people.map((person) => {
          const instagram = getPersonInstagram(settings, person.id);
          const parents = [person.fatherName, person.motherName].filter((name) => name?.trim());
          const parentLine = parentLineFor(invitationType, person.role);
          return (
            <article key={person.id} className={`tb-person${person.photoUrl ? "" : " tb-person-text-only"}`}>
              {person.photoUrl ? <EditorialImage src={person.photoUrl} alt={`Potret ${person.fullName}`} sizes="(min-width: 1360px) 520px, (min-width: 768px) 42vw, 88vw" className="tb-person-portrait" /> : null}
              <div className="tb-person-copy">
                <h3 className="tb-script">{person.fullName}</h3>
                {parents.length > 0 && parentLine ? (
                  <div className="tb-parents">
                    <p>{parentLine}</p>
                    <p>{parents.map((name, index) => <span key={index}>{index > 0 ? <span className="tb-parent-join"> &amp; </span> : null}{name}</span>)}</p>
                  </div>
                ) : null}
                {person.bio?.trim() ? <p className="tb-person-bio">{person.bio}</p> : null}
                {instagram ? <a className="tb-instagram" href={instagram.url} target="_blank" rel="noopener noreferrer" aria-label={`Instagram ${person.fullName} @${instagram.username}`}>@{instagram.username}</a> : null}
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
