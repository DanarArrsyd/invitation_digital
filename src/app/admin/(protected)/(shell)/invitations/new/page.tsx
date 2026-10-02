import { PageHeader } from "@/components/admin/page-header";
import { listActiveThemes } from "@/server/invitations/queries";

import { NewInvitationForm } from "./NewInvitationForm";

export default async function NewInvitationPage() {
  const themes = await listActiveThemes();

  return (
    <div>
      <PageHeader title="Undangan baru" />
      <div className="mt-6">
        <NewInvitationForm themes={themes} />
      </div>
    </div>
  );
}
