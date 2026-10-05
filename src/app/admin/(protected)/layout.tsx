import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ToastListener } from "@/components/admin/toast-listener";
import { getCurrentAdmin } from "@/server/auth/current-admin";

/**
 * Auth gate for every signed-in admin route. Chrome lives one level down in
 * (shell)/layout.tsx so the invitation preview can render full-bleed, the
 * way guests see it, while still requiring a session.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <>
      <Suspense fallback={null}>
        <ToastListener />
      </Suspense>
      {children}
    </>
  );
}
