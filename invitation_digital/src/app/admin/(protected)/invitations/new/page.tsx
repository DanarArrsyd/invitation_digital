import { listActiveThemes } from "@/server/invitations/queries";

import { NewInvitationForm } from "./NewInvitationForm";

export default async function NewInvitationPage() {
  const themes = await listActiveThemes();

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">New Invitation</h1>
      <div className="mt-6">
        <NewInvitationForm themes={themes} />
      </div>
    </div>
  );
}
