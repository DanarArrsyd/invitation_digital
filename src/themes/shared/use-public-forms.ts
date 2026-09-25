"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";

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
  const formRef = useRef<HTMLFormElement>(null);
  const submittedData = useRef<FormData | null>(null);
  useEffect(() => {
    if (state.status === "error" && formRef.current && submittedData.current) {
      restoreTextFields(formRef.current, submittedData.current);
    }
  }, [state]);
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    submittedData.current = new FormData(event.currentTarget);
  }
  return { state, formAction, isPending, attendance, setAttendance, formRef, onSubmit };
}

export function useWishForm() {
  const [state, formAction, isPending] = useActionState(
    submitWishAction,
    { status: "idle" } as WishFormState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const submittedData = useRef<FormData | null>(null);
  useEffect(() => {
    if (state.status === "error" && formRef.current && submittedData.current) {
      restoreTextFields(formRef.current, submittedData.current);
    }
  }, [state]);
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    submittedData.current = new FormData(event.currentTarget);
  }
  return { state, formAction, isPending, formRef, onSubmit };
}

function restoreTextFields(form: HTMLFormElement, data: FormData) {
  // React resets action forms even when the action reports an error.
  for (const name of ["guestName", "message"]) {
    const control = form.elements.namedItem(name);
    const value = data.get(name);
    if (control && "value" in control && typeof value === "string") control.value = value;
  }
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
