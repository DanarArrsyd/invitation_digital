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
    <Section id="rc-mempelai" labelledBy="rc-couple-heading" className="rc-couple">
      <SectionHeading id="rc-couple-heading" title={heading} />
      <div className="rc-people">
        {people.map((person) => {
          const instagram = getPersonInstagram(settings, person.id);
          const parents = [person.fatherName, person.motherName].filter((name) => name?.trim());
          const parentLine = parentLineFor(invitationType, person.role);
          return (
            <article key={person.id} className={`rc-person${person.photoUrl ? "" : " rc-person-text-only"}`}>
              {person.photoUrl ? <EditorialImage src={person.photoUrl} alt={`Potret ${person.fullName}`} sizes="(min-width: 1360px) 520px, (min-width: 768px) 42vw, 88vw" className="rc-person-portrait" /> : null}
              <div className="rc-person-copy">
                <h3 className="rc-script">{person.fullName}</h3>
                {parents.length > 0 && parentLine ? (
                  <div className="rc-parents">
                    <p>{parentLine}</p>
                    <p>{parents.map((name, index) => <span key={index}>{index > 0 ? <span className="rc-parent-join"> &amp; </span> : null}{name}</span>)}</p>
                  </div>
                ) : null}
                {person.bio?.trim() ? <p className="rc-person-bio">{person.bio}</p> : null}
                {instagram ? <a className="rc-instagram" href={instagram.url} target="_blank" rel="noopener noreferrer" aria-label={`Instagram ${person.fullName} @${instagram.username}`}>@{instagram.username}</a> : null}
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
