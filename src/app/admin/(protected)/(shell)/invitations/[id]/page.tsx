import { redirect } from "next/navigation";

export default async function InvitationEditIndexPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/invitations/${id}/general`);
}
