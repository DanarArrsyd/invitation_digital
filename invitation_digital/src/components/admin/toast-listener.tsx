"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function ToastListener() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ok = searchParams.get("ok");
  const error = searchParams.get("error");

  useEffect(() => {
    if (!ok && !error) return;

    if (ok) toast.success(ok);
    if (error) toast.error(error);

    const next = new URLSearchParams(searchParams);
    next.delete("ok");
    next.delete("error");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [ok, error, pathname, router, searchParams]);

  return null;
}
