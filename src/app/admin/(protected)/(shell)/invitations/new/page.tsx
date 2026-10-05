import { PageHeader } from "@/components/admin/page-header";
import { listActiveThemes } from "@/server/invitations/queries";

import { NewInvitationForm } from "./NewInvitationForm";

export default async function NewInvitationPage() {
  const themes = await listActiveThemes();

  return (
    <div>
      <PageHeader
        title="Undangan baru"
        description="Isi dasarnya dulu. Mempelai, acara, foto dan tamu bisa dilengkapi setelah undangan dibuat."
      />
      <div className="mt-6">
        <NewInvitationForm themes={themes} />
      </div>
    </div>
  );
}
