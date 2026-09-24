"use client";

import { useActionState, useState } from "react";

import {
  submitRsvpAction,
  submitWishAction,
  type RsvpFormState,
  type WishFormState,
} from "@/app/(public)/[slug]/actions";

export function useRsvpForm() {
  const [state, formAction, isPending] = useActionState(
    submitRsvpAction,
    { status: "idle" } as RsvpFormState,
  );
  const [attendance, setAttendance] = useState<"attending" | "not_attending" | null>(null);
  return { state, formAction, isPending, attendance, setAttendance };
}

export function useWishForm() {
  const [state, formAction, isPending] = useActionState(
    submitWishAction,
    { status: "idle" } as WishFormState,
  );
  return { state, formAction, isPending };
}

export function nextVisibleWishCount(current: number, total: number, pageSize: number): number {
  return Math.min(total, current + pageSize);
}

export function useWishPagination(total: number, pageSize: number) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  function showMore() {
    setVisibleCount((current) => nextVisibleWishCount(current, total, pageSize));
  }
  return { visibleCount, showMore };
}
