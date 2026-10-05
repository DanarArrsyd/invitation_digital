import { AdminPageSkeleton } from "@/components/admin/page-skeleton";

/** Only the section body reloads; the editor header and tabs stay. */
export default function InvitationSectionLoading() {
  return <AdminPageSkeleton withHeader={false} />;
}
