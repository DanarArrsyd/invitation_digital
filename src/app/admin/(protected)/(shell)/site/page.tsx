import { redirect } from "next/navigation";

export default function SiteIndexPage() {
  redirect("/admin/site/catalog");
}
