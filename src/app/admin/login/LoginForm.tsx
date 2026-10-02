"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { login, type LoginActionState } from "./actions";

const initialState: LoginActionState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const errorId = "admin-login-error";

  return (
    <form action={formAction} aria-label="Form masuk admin" className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? errorId : undefined}
          className="h-12 rounded-xl bg-white px-4"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Kata sandi</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? errorId : undefined}
          className="h-12 rounded-xl bg-white px-4"
        />
      </div>

      {state.error ? (
        <p id={errorId} role="alert" aria-live="polite" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isPending}
        className="mt-1 h-12 rounded-xl bg-[#1f2b25] text-white hover:bg-[#34443b]"
      >
        {isPending ? "Memeriksa akun…" : "Masuk ke dashboard"}
      </Button>
    </form>
  );
}
