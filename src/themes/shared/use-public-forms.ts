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
  const { formRef, onSubmit } = useRecoverableTextFields(state);
  return { state, formAction, isPending, attendance, setAttendance, formRef, onSubmit };
}

export function useWishForm() {
  const [state, formAction, isPending] = useActionState(
    submitWishAction,
    { status: "idle" } as WishFormState,
  );
  const { formRef, onSubmit } = useRecoverableTextFields(state);
  return { state, formAction, isPending, formRef, onSubmit };
}

function useRecoverableTextFields(state: RsvpFormState | WishFormState) {
  const formRef = useRef<HTMLFormElement>(null);
  const submittedData = useRef<FormData | null>(null);
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    function captureEdit(event: Event) {
      const control = event.target as HTMLInputElement | HTMLTextAreaElement;
      if ((control.name === "guestName" || control.name === "message") && submittedData.current) {
        submittedData.current.set(control.name, control.value);
      }
    }
    form.addEventListener("input", captureEdit);
    return () => form.removeEventListener("input", captureEdit);
  }, []);
  useEffect(() => {
    if (state.status === "error" && formRef.current && submittedData.current) {
      restoreTextFields(formRef.current, submittedData.current);
    }
  }, [state]);
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    submittedData.current = new FormData(event.currentTarget);
  }
  return { formRef, onSubmit };
}

function restoreTextFields(form: HTMLFormElement, data: FormData) {
  // React resets action forms even when the action reports an error. That
  // also unchecks a radio group whose controlled state still says "chosen",
  // so attendance is restored too (RadioNodeList.value checks the match).
  for (const name of ["guestName", "message", "attendance"]) {
    const control = form.elements.namedItem(name);
    const value = data.get(name);
    if (control && "value" in control && typeof value === "string") control.value = value;
  }
}

/**
 * The form unmounts on success and its confirmation takes its place; move
 * focus there so keyboard and screen-reader users aren't dropped at the
 * top of the page and the confirmation is announced.
 */
export function useFocusOnSuccess<T extends HTMLElement = HTMLDivElement>(succeeded: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (succeeded) ref.current?.focus();
  }, [succeeded]);
  return ref;
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
