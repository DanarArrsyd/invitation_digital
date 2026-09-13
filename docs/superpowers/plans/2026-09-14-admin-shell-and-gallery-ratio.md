# Admin Shell & Gallery Ratio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the admin shell (navigation, dashboard, invitations list, login, toast/confirm feedback pattern) and ship the gallery per-photo aspect-ratio feature end to end (schema → admin UI → public theme render), using shadcn/ui primitives per CLAUDE.md.

**Architecture:** Split the outer admin shell from the per-invitation editor shell; introduce three shared client components (`SubmitButton`, `ConfirmDeleteForm`, `EmptyState`) plus a `ToastListener` that turns the existing `redirect(...?ok=|error=)` server-action convention into Sonner toasts without touching every action's signature. Gallery ratio is theme-agnostic data (`gallery_items.aspect_ratio`) consumed by the `nusantara-ivory` theme's CSS via a `data-ratio` attribute.

**Tech Stack:** Next.js 16 App Router, React 19, shadcn/ui (sidebar, alert-dialog, sonner, skeleton), Tailwind 4, Supabase (Postgres + Storage), Zod, native HTML5 drag-and-drop (no new DnD dependency).

## Global Constraints

- Do not replace the stack (Next 16/shadcn/Supabase/Zod stay as-is) — CLAUDE.md.
- Admin and public invitation remain separate design systems — CLAUDE.md section 3. Nothing in this plan changes public art direction except the gallery grid's ratio-awareness (Task 10).
- No new DnD dependency (`dnd-kit` etc.) — approved design decision, native HTML5 `draggable`.
- Themes must not query Supabase or hardcode customer data — CLAUDE.md section 2. `aspectRatio` reaches the theme only through the normalized `PublicInvitation` shape.
- Server inputs validated with Zod; admin mutations require an authenticated user (existing RLS already covers `gallery_items` — see `supabase/migrations/20260913000014_rls_policies.sql` lines 122-138, unaffected by a new column).
- Every server action continues the existing pattern: plain mutation function in `src/server/invitations/mutations.ts` returns `{ error: string } | null`, the `"use server"` action in the route's `actions.ts` calls it and redirects — this plan only adds a `?ok=` message on success redirects, it does not change that shape.
- This is a UI-heavy plan with no component-test infra in the repo (only `node --test` over pure logic, see `tests/person-socials.test.mjs`). New pure logic (Task 9's reorder helper) gets a `node:test` unit test; everything else is verified manually via the Browser pane dev server per task.
- Scope note: this plan covers the admin **shell** (nav/dashboard/list/login/feedback pattern) and the **gallery** feature end to end. Applying the new `SubmitButton`/`ConfirmDeleteForm`/`Card` pattern to the remaining tab pages (people/events/content/features/gifts/guests/responses/publish/general) is a separate follow-up plan — those pages keep working exactly as they do today until that plan runs.

---

### Task 1: Add shadcn primitives + mount global Toaster

**Files:**
- Create (via CLI): `src/components/ui/sidebar.tsx`, `src/components/ui/sheet.tsx`, `src/components/ui/alert-dialog.tsx`, `src/components/ui/sonner.tsx`, `src/components/ui/skeleton.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: `<Toaster />` mounted globally; `toast` from `"sonner"` usable anywhere; shadcn `Sidebar*` and `AlertDialog*` components usable by later tasks.

- [ ] **Step 1: Install the shadcn components**

Run:
```bash
npx shadcn@latest add sidebar sonner alert-dialog skeleton
```
Expected: creates `src/components/ui/sidebar.tsx`, `src/components/ui/sheet.tsx` (sidebar's dependency), `src/components/ui/sonner.tsx`, `src/components/ui/alert-dialog.tsx`, `src/components/ui/skeleton.tsx`, and adds `sonner` to `package.json` dependencies.

- [ ] **Step 2: Mount the Toaster in the root layout**

Modify `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Invitation Platform",
  description: "Reusable digital invitation platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify it builds**

Run: `npm run build`
Expected: build succeeds (no type errors, no missing-module errors for the new `ui/*` files).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/components/ui/sidebar.tsx src/components/ui/sheet.tsx src/components/ui/alert-dialog.tsx src/components/ui/sonner.tsx src/components/ui/skeleton.tsx src/app/layout.tsx
git commit -m "feat(admin): add shadcn sidebar/alert-dialog/sonner/skeleton primitives"
```

---

### Task 2: Shared admin components (SubmitButton, ConfirmDeleteForm, EmptyState, ToastListener)

**Files:**
- Create: `src/components/admin/submit-button.tsx`
- Create: `src/components/admin/confirm-delete-form.tsx`
- Create: `src/components/admin/empty-state.tsx`
- Create: `src/components/admin/toast-listener.tsx`

**Interfaces:**
- Produces: `SubmitButton` (drop-in for `<Button type="submit">` inside any `<form>`, shows pending state via `useFormStatus`), `ConfirmDeleteForm` (renders its own `<form>` + trigger button + confirm dialog, calls the passed server action on confirm), `EmptyState` (title/description/action), `ToastListener` (reads `?ok=`/`?error=` from the URL, fires a toast, strips the params).
- Consumes: `Button` from `@/components/ui/button`, `AlertDialog*` from `@/components/ui/alert-dialog`, `cn` from `@/lib/utils`, `toast` from `sonner`.

- [ ] **Step 1: `SubmitButton`**

Create `src/components/admin/submit-button.tsx`:

```tsx
"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function SubmitButton({
  children,
  pendingText = "Menyimpan...",
  ...props
}: ComponentProps<typeof Button> & { pendingText?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || props.disabled} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
```

- [ ] **Step 2: `EmptyState`**

Create `src/components/admin/empty-state.tsx`:

```tsx
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center",
        className,
      )}
    >
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
```

- [ ] **Step 3: `ConfirmDeleteForm`**

Create `src/components/admin/confirm-delete-form.tsx`:

```tsx
"use client";

import { useRef } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function ConfirmDeleteForm({
  action,
  hiddenFields,
  title,
  description,
  triggerLabel = "Hapus",
}: {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: Record<string, string>;
  title: string;
  description: string;
  triggerLabel?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action}>
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="destructive" size="sm">
            {triggerLabel}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => formRef.current?.requestSubmit()}>
              Ya, hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
```

- [ ] **Step 4: `ToastListener`**

Create `src/components/admin/toast-listener.tsx`:

```tsx
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
```

- [ ] **Step 5: Verify it builds**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/
git commit -m "feat(admin): add SubmitButton, ConfirmDeleteForm, EmptyState, ToastListener"
```

---

### Task 3: Wire ToastListener into the admin shell + add `?ok=` to gallery/guests actions

**Files:**
- Modify: `src/app/admin/(protected)/layout.tsx`
- Modify: `src/app/admin/(protected)/invitations/[id]/gallery/actions.ts`
- Modify: `src/app/admin/(protected)/invitations/[id]/guests/actions.ts`

**Interfaces:**
- Consumes: `ToastListener` from Task 2.
- Produces: gallery and guests success redirects now carry `?ok=<message>`, picked up by `ToastListener`. (Other tabs' actions keep their current `?saved=`/no-param convention until the follow-up plan touches them — see Global Constraints.)

- [ ] **Step 1: Mount `ToastListener` in the protected layout**

Modify `src/app/admin/(protected)/layout.tsx` (add the import and the listener, wrapped in Suspense since it reads `useSearchParams`):

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { ToastListener } from "@/components/admin/toast-listener";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { logout } from "./actions";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <ToastListener />
      </Suspense>
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-foreground">Invitation Admin</span>
          <Link href="/admin/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/admin/invitations" className="text-sm text-muted-foreground hover:text-foreground">
            Invitations
          </Link>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
```

(This also swaps the ad hoc `neutral-*` classes for the design-token classes — `bg-background`/`bg-card`/`border-border`/`text-foreground`/`text-muted-foreground` — already defined in `src/app/globals.css`, so the shell now uses the same tokens the rest of shadcn does.)

- [ ] **Step 2: Add `?ok=` to gallery action success redirects**

Modify `src/app/admin/(protected)/invitations/[id]/gallery/actions.ts` — replace the three bare-success `redirect(path(invitationId))` calls:

```ts
  await revalidateInvitation(invitationId);
  redirect(path(invitationId, `ok=${encodeURIComponent("Foto diunggah")}`));
```
(in `uploadGalleryItemAction`, replacing `redirect(path(invitationId));`)

```ts
  await revalidateInvitation(invitationId);
  redirect(path(invitationId, `ok=${encodeURIComponent("Perubahan disimpan")}`));
```
(in `updateGalleryItemAction`, replacing `redirect(path(invitationId));`)

```ts
  await revalidateInvitation(invitationId);
  redirect(path(invitationId, `ok=${encodeURIComponent("Foto dihapus")}`));
```
(in `deleteGalleryItemAction`, replacing `redirect(path(invitationId));`)

- [ ] **Step 3: Add `?ok=` to guests action success redirects**

Read `src/app/admin/(protected)/invitations/[id]/guests/actions.ts` first (not shown in this plan) — it follows the identical `redirect(path(invitationId))` / `redirect(path(invitationId, 'error=...'))` convention as gallery's actions (confirmed: same author, same `path()` helper shape). Apply the same edit: on every bare success redirect (`createGuestAction`, `deleteGuestAction`), append `?ok=<message>` — `"Tamu ditambahkan"` for create, `"Tamu dihapus"` for delete.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, open `/admin/invitations/<id>/gallery` in the Browser pane, upload a photo, delete a photo. Expected: a green success toast appears top-right after each action, the URL has no `?ok=` visible after the toast fires (stripped), and no console errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/\(protected\)/layout.tsx src/app/admin/\(protected\)/invitations/\[id\]/gallery/actions.ts src/app/admin/\(protected\)/invitations/\[id\]/guests/actions.ts
git commit -m "feat(admin): toast feedback for gallery/guests actions via ToastListener"
```

---

### Task 4: Rebuild admin navigation — sidebar with grouped tabs

**Files:**
- Delete: `src/app/admin/(protected)/invitations/[id]/AdminTabs.tsx`
- Create: `src/app/admin/(protected)/invitations/[id]/AdminSidebar.tsx`
- Modify: `src/app/admin/(protected)/invitations/[id]/layout.tsx`

**Interfaces:**
- Produces: `AdminSidebar({ invitationId }: { invitationId: string })` — a client component rendering the grouped shadcn `Sidebar`.
- Consumes: `Sidebar*` from `@/components/ui/sidebar` (Task 1), `Badge`/`Button` from existing `ui/`.

- [ ] **Step 1: Write `AdminSidebar`**

Create `src/app/admin/(protected)/invitations/[id]/AdminSidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const GROUPS = [
  {
    label: "Konten",
    tabs: [
      { slug: "general", label: "General" },
      { slug: "people", label: "People" },
      { slug: "events", label: "Events" },
      { slug: "content", label: "Content" },
      { slug: "features", label: "Features" },
    ],
  },
  {
    label: "Media & Gifts",
    tabs: [
      { slug: "gallery", label: "Gallery" },
      { slug: "gifts", label: "Gifts" },
    ],
  },
  {
    label: "Tamu & Respons",
    tabs: [
      { slug: "guests", label: "Guests" },
      { slug: "responses", label: "Responses" },
    ],
  },
  {
    label: "Publikasi",
    tabs: [{ slug: "publish", label: "Publish" }],
  },
] as const;

export function AdminSidebar({ invitationId }: { invitationId: string }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas" className="top-[57px] h-[calc(100svh-57px)]">
      <SidebarContent>
        {GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.tabs.map((tab) => {
                  const href = `/admin/invitations/${invitationId}/${tab.slug}`;
                  return (
                    <SidebarMenuItem key={tab.slug}>
                      <SidebarMenuButton asChild isActive={pathname === href}>
                        <Link href={href}>{tab.label}</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
```

- [ ] **Step 2: Delete the old flat tabs component**

```bash
rm "src/app/admin/(protected)/invitations/[id]/AdminTabs.tsx"
```

- [ ] **Step 3: Rewire the invitation editor layout to use the sidebar**

Replace `src/app/admin/(protected)/invitations/[id]/layout.tsx` with:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { AdminSidebar } from "./AdminSidebar";
import { publishAction, unpublishAction } from "./publish/actions";

export default async function InvitationEditLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: invitation } = await supabase
    .from("invitations")
    .select("id, title, status")
    .eq("id", id)
    .maybeSingle();

  if (!invitation) {
    notFound();
  }

  return (
    <SidebarProvider>
      <AdminSidebar invitationId={id} />
      <SidebarInset>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <Link href="/admin/invitations" className="text-sm text-muted-foreground hover:text-foreground">
              Invitations
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-lg font-semibold text-foreground">{invitation.title}</h1>
            <Badge variant={invitation.status === "published" ? "default" : "secondary"}>
              {invitation.status}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/invitations/${id}/preview`}
              target="_blank"
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Preview
            </Link>

            {invitation.status === "published" ? (
              <form action={unpublishAction}>
                <input type="hidden" name="invitationId" value={id} />
                <Button type="submit" variant="outline" size="sm">
                  Unpublish
                </Button>
              </form>
            ) : (
              <form action={publishAction}>
                <input type="hidden" name="invitationId" value={id} />
                <Button type="submit" size="sm">
                  Publish
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="px-6 py-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

- [ ] **Step 4: Verify it builds and renders**

Run: `npm run build`
Expected: build succeeds — no leftover import of the deleted `AdminTabs.tsx`.

Then run `npm run dev`, open `/admin/invitations/<id>/general` in the Browser pane. Expected: left sidebar with 4 grouped sections, active tab highlighted, a hamburger trigger that collapses it, breadcrumb + status badge + Preview/Publish buttons in the top bar.

- [ ] **Step 5: Commit**

```bash
git add "src/app/admin/(protected)/invitations/[id]/"
git commit -m "feat(admin): replace flat tab bar with grouped sidebar navigation"
```

---

### Task 5: Rebuild the invitations list — card grid with status filter

**Files:**
- Modify: `src/server/invitations/queries.ts`
- Modify: `src/app/admin/(protected)/invitations/page.tsx`

**Interfaces:**
- Modifies: `listInvitations()` — now also selects a cover thumbnail candidate (first gallery item's `image_path`) and accepts an optional status filter.
- Consumes: `EmptyState` from Task 2, `getMediaPublicUrl` from `@/lib/supabase/storage`.

- [ ] **Step 1: Extend `listInvitations` with a status filter + cover thumbnail**

Modify `src/server/invitations/queries.ts` — replace the `InvitationListItem` type and `listInvitations` function:

```ts
export type InvitationListItem = Pick<
  Tables<"invitations">,
  "id" | "title" | "slug" | "type" | "status" | "event_date"
> & {
  theme: Pick<Tables<"themes">, "name" | "slug"> | null;
  gallery_items: Pick<Tables<"gallery_items">, "image_path">[];
};

export async function listInvitations(status?: string): Promise<InvitationListItem[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("invitations")
    .select(
      "id, title, slug, type, status, event_date, theme:themes(name, slug), gallery_items(image_path)",
    )
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
```

- [ ] **Step 2: Rebuild the list page as a card grid**

Replace `src/app/admin/(protected)/invitations/page.tsx`:

```tsx
import Link from "next/link";

import { EmptyState } from "@/components/admin/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getMediaPublicUrl } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";
import { listInvitations } from "@/server/invitations/queries";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "expired", label: "Expired" },
] as const;

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  draft: "secondary",
  published: "default",
  expired: "outline",
  archived: "outline",
};

export default async function InvitationsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "all" } = await searchParams;
  const invitations = await listInvitations(status);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Invitations</h1>
        <Link href="/admin/invitations/new" className={buttonVariants()}>
          New Invitation
        </Link>
      </div>

      <div className="mt-4 flex gap-1 border-b border-border">
        {STATUS_FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={filter.value === "all" ? "/admin/invitations" : `/admin/invitations?status=${filter.value}`}
            className={cn(
              "rounded-t-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground",
              status === filter.value && "border-b-2 border-primary text-foreground",
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {invitations.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="Belum ada invitation"
          description="Buat invitation pertama untuk mulai mengatur tema, konten, dan tamu."
          action={
            <Link href="/admin/invitations/new" className={buttonVariants({ size: "sm" })}>
              Buat invitation pertama
            </Link>
          }
        />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {invitations.map((invitation) => {
            const coverPath = invitation.gallery_items[0]?.image_path ?? null;
            const coverUrl = getMediaPublicUrl(coverPath);

            return (
              <Card key={invitation.id} className="overflow-hidden">
                <div className="aspect-[16/10] w-full bg-muted">
                  {coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      Belum ada foto
                    </div>
                  )}
                </div>
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-foreground">{invitation.title}</p>
                    <Badge variant={STATUS_VARIANT[invitation.status] ?? "outline"}>
                      {invitation.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {invitation.event_date ?? "Tanggal belum diatur"} · {invitation.theme?.name ?? "—"}
                  </p>
                </CardContent>
                <CardFooter className="justify-between gap-2 bg-transparent">
                  <Link
                    href={`/admin/invitations/${invitation.id}/general`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Edit
                  </Link>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/invitations/${invitation.id}/preview`}
                      target="_blank"
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      Preview
                    </Link>
                    {invitation.status === "published" ? (
                      <Link
                        href={`/${invitation.slug}`}
                        target="_blank"
                        className={buttonVariants({ variant: "ghost", size: "sm" })}
                      >
                        Buka link
                      </Link>
                    ) : null}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Manual verification**

Run `npm run dev`, open `/admin/invitations`. Expected: card grid renders, status filter tabs work (`?status=draft` etc. filters server-side), empty state shows if a filter has zero matches, "New Invitation" and per-card Edit/Preview links work.

- [ ] **Step 4: Commit**

```bash
git add src/server/invitations/queries.ts "src/app/admin/(protected)/invitations/page.tsx"
git commit -m "feat(admin): card grid + status filter for invitations list"
```

---

### Task 6: Rebuild the dashboard — status summary + expiring-soon list

**Files:**
- Create: `src/server/invitations/dashboard.ts`
- Modify: `src/app/admin/(protected)/dashboard/page.tsx`

**Interfaces:**
- Produces: `getDashboardSummary(): Promise<DashboardSummary>` where
  ```ts
  interface DashboardSummary {
    counts: { draft: number; published: number; expired: number; archived: number; total: number };
    expiringSoon: { id: string; title: string; slug: string; expiresAt: string }[];
  }
  ```

- [ ] **Step 1: Write the summary query**

Create `src/server/invitations/dashboard.ts`:

```ts
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface DashboardSummary {
  counts: {
    draft: number;
    published: number;
    expired: number;
    archived: number;
    total: number;
  };
  expiringSoon: { id: string; title: string; slug: string; expiresAt: string }[];
}

const EXPIRING_SOON_WINDOW_DAYS = 14;

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("invitations")
    .select("id, title, slug, status, expires_at");

  if (error) {
    throw new Error(error.message);
  }

  const counts = { draft: 0, published: 0, expired: 0, archived: 0, total: data.length };
  for (const row of data) {
    if (row.status in counts) {
      (counts as Record<string, number>)[row.status] += 1;
    }
  }

  const now = Date.now();
  const windowMs = EXPIRING_SOON_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  const expiringSoon = data
    .filter((row) => {
      if (row.status !== "published" || !row.expires_at) return false;
      const expiresAt = new Date(row.expires_at).getTime();
      return expiresAt > now && expiresAt - now <= windowMs;
    })
    .map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      expiresAt: row.expires_at as string,
    }))
    .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());

  return { counts, expiringSoon };
}
```

- [ ] **Step 2: Rebuild the dashboard page**

Replace `src/app/admin/(protected)/dashboard/page.tsx`:

```tsx
import Link from "next/link";

import { EmptyState } from "@/components/admin/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardSummary } from "@/server/invitations/dashboard";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { dateStyle: "medium" });
}

export default async function AdminDashboardPage() {
  const { counts, expiringSoon } = await getDashboardSummary();

  const metrics = [
    { label: "Total", value: counts.total },
    { label: "Draft", value: counts.draft },
    { label: "Published", value: counts.published },
    { label: "Expired", value: counts.expired },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ringkasan seluruh invitation.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="gap-1">
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className="text-2xl font-semibold text-foreground">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-foreground">
          Perlu perhatian — expired dalam 14 hari
        </h2>

        {expiringSoon.length === 0 ? (
          <EmptyState
            className="mt-3"
            title="Tidak ada invitation yang akan expired"
            description="Invitation published yang mendekati masa expired (≤14 hari) akan muncul di sini."
          />
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {expiringSoon.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex-row items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">Expired {formatDate(item.expiresAt)}</p>
                  </div>
                  <Link
                    href={`/admin/invitations/${item.id}/publish`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Kelola
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Link href="/admin/invitations" className={`${buttonVariants({ variant: "outline" })} w-fit`}>
        Lihat semua invitations
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: Manual verification**

Run `npm run dev`, open `/admin/dashboard`. Expected: 4 metric cards with correct counts, expiring-soon section shows empty state (pilot invitation isn't published yet or isn't within 14 days) or lists correctly if it is.

- [ ] **Step 4: Commit**

```bash
git add src/server/invitations/dashboard.ts "src/app/admin/(protected)/dashboard/page.tsx"
git commit -m "feat(admin): dashboard summary with status counts and expiring-soon list"
```

---

### Task 7: Restyle the login page

**Files:**
- Modify: `src/app/admin/login/page.tsx`

**Interfaces:**
- No behavior change — `LoginForm`/`actions.ts` untouched.

- [ ] **Step 1: Restyle the login page shell**

Replace `src/app/admin/login/page.tsx`:

```tsx
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { LoginForm } from "./LoginForm";

export default async function AdminLoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Invitation Admin</CardTitle>
          <CardDescription>Sign in to manage invitations.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
```

- [ ] **Step 2: Manual verification**

Run `npm run dev`, open `/admin/login` logged out. Expected: centered card, no visual regression, sign-in still works.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/login/page.tsx
git commit -m "style(admin): restyle login card with design tokens"
```

---

### Task 8: Gallery aspect-ratio schema + types + normalization

**Files:**
- Create: `supabase/migrations/20260914000001_gallery_aspect_ratio.sql`
- Modify: `src/types/database.ts`
- Modify: `src/types/invitation.ts`
- Modify: `src/server/public/normalize.ts`

**Interfaces:**
- Produces: `GalleryAspectRatio` union type, `GALLERY_ASPECT_RATIOS` const list (`{ value, label, css }[]`), `GALLERY_ASPECT_RATIO_CSS: Record<GalleryAspectRatio, string>`, `GalleryItem.aspectRatio: GalleryAspectRatio`.

- [ ] **Step 1: Write and apply the migration**

Create `supabase/migrations/20260914000001_gallery_aspect_ratio.sql`:

```sql
alter table public.gallery_items
  add column aspect_ratio text not null default 'portrait_4_5'
  check (aspect_ratio in (
    'square_1_1',
    'portrait_4_5',
    'portrait_3_4',
    'landscape_16_9',
    'landscape_4_3'
  ));
```

Apply it with the Supabase MCP tool `apply_migration` (name: `gallery_aspect_ratio`, pass the SQL above), or `supabase db push` if working against local Supabase CLI. Expected: no error; `gallery_items` now has an `aspect_ratio` column defaulting to `portrait_4_5` for existing rows.

- [ ] **Step 2: Update the generated database types**

Modify `src/types/database.ts` — in the `gallery_items` table block, add `aspect_ratio` to `Row`, `Insert`, and `Update`:

```ts
      gallery_items: {
        Row: {
          alt_text: string | null
          aspect_ratio: string
          caption: string | null
          created_at: string
          id: string
          image_path: string
          invitation_id: string
          sort_order: number
        }
        Insert: {
          alt_text?: string | null
          aspect_ratio?: string
          caption?: string | null
          created_at?: string
          id?: string
          image_path: string
          invitation_id: string
          sort_order?: number
        }
        Update: {
          alt_text?: string | null
          aspect_ratio?: string
          caption?: string | null
          created_at?: string
          id?: string
          image_path?: string
          invitation_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "gallery_items_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
```

(If the Supabase MCP `generate_typescript_types` tool is available, run it instead and confirm the regenerated file matches this shape — the hand-edit above is the fallback so this task never blocks on tooling availability.)

- [ ] **Step 3: Add the ratio type + constants to `src/types/invitation.ts`**

Modify `src/types/invitation.ts` — replace the `GalleryItem` interface and add the new exports right above it:

```ts
export const GALLERY_ASPECT_RATIOS = [
  { value: "square_1_1", label: "Persegi (1:1)", css: "1 / 1" },
  { value: "portrait_4_5", label: "Potret 4:5", css: "4 / 5" },
  { value: "portrait_3_4", label: "Potret 3:4", css: "3 / 4" },
  { value: "landscape_16_9", label: "Landscape 16:9", css: "16 / 9" },
  { value: "landscape_4_3", label: "Landscape 4:3", css: "4 / 3" },
] as const;

export type GalleryAspectRatio = (typeof GALLERY_ASPECT_RATIOS)[number]["value"];

export const GALLERY_ASPECT_RATIO_CSS: Record<GalleryAspectRatio, string> = Object.fromEntries(
  GALLERY_ASPECT_RATIOS.map((r) => [r.value, r.css]),
) as Record<GalleryAspectRatio, string>;

export interface GalleryItem {
  id: string;
  imageUrl: string;
  caption: string | null;
  altText: string | null;
  aspectRatio: GalleryAspectRatio;
  sortOrder: number;
}
```

- [ ] **Step 4: Map `aspect_ratio` in the public normalizer**

Modify `src/server/public/normalize.ts` — in the `gallery:` mapping, add the field:

```ts
    gallery: (galleryRes.data ?? []).map((g) => ({
      id: g.id,
      imageUrl: getMediaPublicUrl(g.image_path) ?? "",
      caption: g.caption,
      altText: g.alt_text,
      aspectRatio: g.aspect_ratio as GalleryItem["aspectRatio"],
      sortOrder: g.sort_order,
    })),
```

And add `GalleryItem` to the existing type import at the top of the file:

```ts
import type { GalleryItem, InvitationFeatures, PublicInvitation } from "@/types/invitation";
```

- [ ] **Step 5: Verify it builds**

Run: `npm run build`
Expected: build succeeds — no type errors from the new `aspectRatio` field.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260914000001_gallery_aspect_ratio.sql src/types/database.ts src/types/invitation.ts src/server/public/normalize.ts
git commit -m "feat(gallery): add per-photo aspect_ratio column, types, and normalization"
```

---

### Task 9: Gallery reorder helper (pure logic + unit test)

**Files:**
- Create: `src/lib/utils/gallery-order.ts`
- Test: `tests/gallery-order.test.mjs`

**Interfaces:**
- Produces: `reorderIds(ids: string[], fromIndex: number, toIndex: number): string[]` — pure array move, used by `GalleryGrid` (Task 10) to compute the new order on drop before calling the reorder server action.

- [ ] **Step 1: Write the failing test**

Create `tests/gallery-order.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";

import { reorderIds } from "../src/lib/utils/gallery-order.ts";

test("moves an item forward", () => {
  assert.deepEqual(reorderIds(["a", "b", "c", "d"], 0, 2), ["b", "c", "a", "d"]);
});

test("moves an item backward", () => {
  assert.deepEqual(reorderIds(["a", "b", "c", "d"], 3, 1), ["a", "d", "b", "c"]);
});

test("no-op when from equals to", () => {
  assert.deepEqual(reorderIds(["a", "b", "c"], 1, 1), ["a", "b", "c"]);
});

test("does not mutate the input array", () => {
  const input = ["a", "b", "c"];
  reorderIds(input, 0, 2);
  assert.deepEqual(input, ["a", "b", "c"]);
});
```

This test imports the `.ts` source directly — check how the existing suite runs `.ts` imports from a `.test.mjs` file:

Run: `cat package.json | grep -A5 '"scripts"'` and `grep -rn "loader\|register\|tsx\|ts-node" package.json .node* 2>/dev/null`

If no test script exists yet (confirmed earlier — `package.json` only has `dev`/`build`/`start`/`lint`), add one. Modify `package.json`'s `scripts` block:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "node --experimental-strip-types --test tests/*.test.mjs"
  },
```

Node 20+ supports `--experimental-strip-types` for plain `.ts` imports without a transform step; this project's own `tests/person-socials.test.mjs` instead hand-transpiles with the `typescript` package (already a transitive dep via Next) — use that same proven approach instead of relying on a Node flag that may not match the CI Node version. Rewrite the test to hand-transpile like the existing suite does:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

const source = ts.transpileModule(
  readFileSync(new URL("../src/lib/utils/gallery-order.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;

const exports = {};
vm.runInNewContext(source, { exports, module: { exports } });
const { reorderIds } = exports;

test("moves an item forward", () => {
  assert.deepEqual(reorderIds(["a", "b", "c", "d"], 0, 2), ["b", "c", "a", "d"]);
});

test("moves an item backward", () => {
  assert.deepEqual(reorderIds(["a", "b", "c", "d"], 3, 1), ["a", "d", "b", "c"]);
});

test("no-op when from equals to", () => {
  assert.deepEqual(reorderIds(["a", "b", "c"], 1, 1), ["a", "b", "c"]);
});

test("does not mutate the input array", () => {
  const input = ["a", "b", "c"];
  reorderIds(input, 0, 2);
  assert.deepEqual(input, ["a", "b", "c"]);
});
```

Add the test script (plain `node --test`, no experimental flag needed since transpilation happens in-file):

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "node --test tests/*.test.mjs"
  },
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL — `reorderIds is not a function` (module doesn't exist yet).

- [ ] **Step 3: Implement `reorderIds`**

Create `src/lib/utils/gallery-order.ts`:

```ts
export function reorderIds(ids: string[], fromIndex: number, toIndex: number): string[] {
  const next = [...ids];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}
```

- [ ] **Step 4: Run it to confirm it passes**

Run: `npm test`
Expected: all 4 tests pass, plus the two pre-existing test files still pass.

- [ ] **Step 5: Commit**

```bash
git add package.json tests/gallery-order.test.mjs src/lib/utils/gallery-order.ts
git commit -m "feat(gallery): add reorderIds helper with unit tests, wire up npm test"
```

---

### Task 10: Gallery admin UI — ratio picker, drag-drop reorder, multi-upload

**Files:**
- Modify: `src/server/media/upload.ts`
- Modify: `src/server/invitations/mutations.ts`
- Modify: `src/app/admin/(protected)/invitations/[id]/gallery/actions.ts`
- Create: `src/app/admin/(protected)/invitations/[id]/gallery/GalleryGrid.tsx`
- Modify: `src/app/admin/(protected)/invitations/[id]/gallery/page.tsx`

**Interfaces:**
- Consumes: `reorderIds` (Task 9), `GALLERY_ASPECT_RATIOS`/`GalleryAspectRatio` (Task 8), `SubmitButton`/`ConfirmDeleteForm`/`EmptyState` (Task 2).
- Produces: `uploadGalleryItems(invitationId, files: File[]): Promise<{ error: string } | null>`, `updateGalleryItemRatio({ id, aspectRatio }): Promise<{ error: string } | null>`, `reorderGalleryItems({ invitationId, orderedIds }): Promise<{ error: string } | null>`.

- [ ] **Step 1: Multi-file upload in `src/server/media/upload.ts`**

Modify `src/server/media/upload.ts` — replace `uploadGalleryItem` with a multi-file version (keep the single-item logic, loop over files):

```ts
export async function uploadGalleryItems(
  invitationId: string,
  files: File[],
): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();

  const { count } = await supabase
    .from("gallery_items")
    .select("id", { count: "exact", head: true })
    .eq("invitation_id", invitationId);

  let nextSortOrder = count ?? 0;

  for (const file of files) {
    const result = await uploadObject(invitationId, "gallery", file);
    if ("error" in result) {
      return { error: `${file.name}: ${result.error}` };
    }

    const { error } = await supabase.from("gallery_items").insert({
      invitation_id: invitationId,
      image_path: result.path,
      caption: null,
      alt_text: null,
      sort_order: nextSortOrder,
    });

    if (error) {
      await removeObject(result.path);
      return { error: `${file.name}: ${error.message}` };
    }

    nextSortOrder += 1;
  }

  return null;
}
```

Delete the old `uploadGalleryItem` function (the one it replaces, immediately above where you add this).

- [ ] **Step 2: Ratio + reorder mutations in `src/server/invitations/mutations.ts`**

Modify `src/server/invitations/mutations.ts` — in the `// --- Gallery item metadata` section, keep `deleteGalleryItem` as-is, replace `updateGalleryItemMeta`'s `sortOrder` param (sort is now managed by drag, not this form) and add two new functions:

```ts
export async function updateGalleryItemMeta(input: {
  id: string;
  caption: string | null;
  altText: string | null;
}): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("gallery_items")
    .update({ caption: input.caption, alt_text: input.altText })
    .eq("id", input.id);

  return error ? { error: error.message } : null;
}

export async function updateGalleryItemRatio(input: {
  id: string;
  aspectRatio: string;
}): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("gallery_items")
    .update({ aspect_ratio: input.aspectRatio })
    .eq("id", input.id);

  return error ? { error: error.message } : null;
}

export async function reorderGalleryItems(input: {
  invitationId: string;
  orderedIds: string[];
}): Promise<{ error: string } | null> {
  const supabase = await createSupabaseServerClient();

  const updates = input.orderedIds.map((id, index) =>
    supabase.from("gallery_items").update({ sort_order: index }).eq("id", id).eq("invitation_id", input.invitationId),
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);

  return failed?.error ? { error: failed.error.message } : null;
}
```

- [ ] **Step 3: Rewrite `gallery/actions.ts`**

Replace `src/app/admin/(protected)/invitations/[id]/gallery/actions.ts`:

```ts
"use server";

import { redirect } from "next/navigation";

import {
  deleteGalleryItem,
  reorderGalleryItems,
  updateGalleryItemMeta,
  updateGalleryItemRatio,
} from "@/server/invitations/mutations";
import { revalidateInvitation } from "@/server/invitations/revalidate";
import { uploadGalleryItems } from "@/server/media/upload";

function path(id: string, query?: string) {
  return `/admin/invitations/${id}/gallery${query ? `?${query}` : ""}`;
}

export async function uploadGalleryItemsAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    redirect(path(invitationId, `error=${encodeURIComponent("Pilih minimal 1 foto")}`));
  }

  const result = await uploadGalleryItems(invitationId, files);

  if (result?.error) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  await revalidateInvitation(invitationId);
  redirect(path(invitationId, `ok=${encodeURIComponent(`${files.length} foto diunggah`)}`));
}

export async function updateGalleryItemAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));
  const id = String(formData.get("id"));
  const caption = String(formData.get("caption") ?? "");
  const altText = String(formData.get("altText") ?? "");

  const result = await updateGalleryItemMeta({ id, caption: caption || null, altText: altText || null });

  if (result?.error) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  await revalidateInvitation(invitationId);
  redirect(path(invitationId, `ok=${encodeURIComponent("Perubahan disimpan")}`));
}

export async function updateGalleryItemRatioAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));
  const id = String(formData.get("id"));
  const aspectRatio = String(formData.get("aspectRatio"));

  const result = await updateGalleryItemRatio({ id, aspectRatio });

  if (result?.error) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  await revalidateInvitation(invitationId);
  redirect(path(invitationId, `ok=${encodeURIComponent("Rasio diperbarui")}`));
}

export async function reorderGalleryItemsAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));
  const orderedIds = String(formData.get("orderedIds")).split(",").filter(Boolean);

  const result = await reorderGalleryItems({ invitationId, orderedIds });

  if (result?.error) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  await revalidateInvitation(invitationId);
  redirect(path(invitationId, `ok=${encodeURIComponent("Urutan disimpan")}`));
}

export async function deleteGalleryItemAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));
  const id = String(formData.get("id"));
  const imagePath = String(formData.get("imagePath"));

  const result = await deleteGalleryItem(id, imagePath);

  if (result?.error) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  await revalidateInvitation(invitationId);
  redirect(path(invitationId, `ok=${encodeURIComponent("Foto dihapus")}`));
}
```

- [ ] **Step 4: `GalleryGrid` client component (ratio select + drag reorder)**

Create `src/app/admin/(protected)/invitations/[id]/gallery/GalleryGrid.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";

import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reorderIds } from "@/lib/utils/gallery-order";
import { GALLERY_ASPECT_RATIOS, type GalleryAspectRatio } from "@/types/invitation";

import {
  deleteGalleryItemAction,
  reorderGalleryItemsAction,
  updateGalleryItemAction,
  updateGalleryItemRatioAction,
} from "./actions";

export interface GalleryGridItem {
  id: string;
  imageUrl: string;
  imagePath: string;
  caption: string | null;
  altText: string | null;
  aspectRatio: GalleryAspectRatio;
}

export function GalleryGrid({
  invitationId,
  items,
}: {
  invitationId: string;
  items: GalleryGridItem[];
}) {
  const [order, setOrder] = useState(items.map((item) => item.id));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const byId = new Map(items.map((item) => [item.id, item]));
  const orderedItems = order.map((id) => byId.get(id)).filter((item): item is GalleryGridItem => Boolean(item));

  function commitOrder(nextOrder: string[]) {
    setOrder(nextOrder);
    startTransition(() => {
      const formData = new FormData();
      formData.set("invitationId", invitationId);
      formData.set("orderedIds", nextOrder.join(","));
      reorderGalleryItemsAction(formData);
    });
  }

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) return;
    const fromIndex = order.indexOf(draggingId);
    const toIndex = order.indexOf(targetId);
    commitOrder(reorderIds(order, fromIndex, toIndex));
    setDraggingId(null);
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {orderedItems.map((item) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => setDraggingId(item.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(item.id)}
          className="cursor-grab rounded-lg border border-border bg-card p-3 active:cursor-grabbing"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.altText ?? item.caption ?? ""}
            className="aspect-square w-full rounded-md object-cover"
          />

          <div className="mt-3 flex flex-col gap-2">
            <Label>Rasio foto</Label>
            <Select
              defaultValue={item.aspectRatio}
              onValueChange={(value) => {
                startTransition(() => {
                  const formData = new FormData();
                  formData.set("invitationId", invitationId);
                  formData.set("id", item.id);
                  formData.set("aspectRatio", value);
                  updateGalleryItemRatioAction(formData);
                });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GALLERY_ASPECT_RATIOS.map((ratio) => (
                  <SelectItem key={ratio.value} value={ratio.value}>
                    {ratio.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <form action={updateGalleryItemAction} className="mt-3 flex flex-col gap-2">
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="invitationId" value={invitationId} />
            <Input name="caption" placeholder="Caption" defaultValue={item.caption ?? ""} />
            <Input name="altText" placeholder="Alt text" defaultValue={item.altText ?? ""} />
            <div className="flex justify-between gap-2">
              <SubmitButton variant="outline" size="sm" pendingText="Menyimpan...">
                Simpan caption
              </SubmitButton>
              <ConfirmDeleteForm
                action={deleteGalleryItemAction}
                hiddenFields={{ id: item.id, invitationId, imagePath: item.imagePath }}
                title="Hapus foto ini?"
                description="Foto akan hilang permanen dari galeri undangan. Tindakan ini tidak bisa dibatalkan."
              />
            </div>
          </form>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Rewrite `gallery/page.tsx`**

Replace `src/app/admin/(protected)/invitations/[id]/gallery/page.tsx`:

```tsx
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/admin/empty-state";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMediaPublicUrl } from "@/lib/supabase/storage";
import { getInvitationDetail } from "@/server/invitations/queries";

import { uploadGalleryItemsAction } from "./actions";
import { GalleryGrid, type GalleryGridItem } from "./GalleryGrid";

export default async function GalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const detail = await getInvitationDetail(id);
  if (!detail) notFound();

  const { invitation, gallery } = detail;

  const items: GalleryGridItem[] = gallery.map((item) => ({
    id: item.id,
    imageUrl: getMediaPublicUrl(item.image_path) ?? "",
    imagePath: item.image_path,
    caption: item.caption,
    altText: item.alt_text,
    aspectRatio: item.aspect_ratio as GalleryGridItem["aspectRatio"],
  }));

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        {gallery.length} foto (target pilot: 8) · drag foto untuk mengubah urutan
      </p>

      {items.length === 0 ? (
        <EmptyState
          title="Belum ada foto"
          description="Upload foto untuk mengisi galeri undangan."
        />
      ) : (
        <GalleryGrid invitationId={invitation.id} items={items} />
      )}

      <form
        action={uploadGalleryItemsAction}
        className="flex max-w-md flex-col gap-3 rounded-lg border border-dashed border-border p-4"
      >
        <input type="hidden" name="invitationId" value={invitation.id} />

        <div className="flex flex-col gap-2">
          <Label>Foto (bisa pilih banyak sekaligus)</Label>
          <Input type="file" name="files" accept="image/png,image/jpeg,image/webp" multiple required />
        </div>

        <SubmitButton className="w-fit" pendingText="Mengunggah...">
          Upload
        </SubmitButton>
      </form>
    </div>
  );
}
```

- [ ] **Step 6: Verify it builds**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 7: Manual verification**

Run `npm run dev`, open `/admin/invitations/<id>/gallery`. Expected:
- Multi-file upload adds all selected photos.
- Changing a photo's ratio Select immediately persists (revalidates, toast "Rasio diperbarui").
- Dragging a photo card to a new position reorders and persists (toast "Urutan disimpan").
- Delete opens a confirm dialog; confirming removes the photo and shows a toast.
- Empty state shows when gallery has 0 photos.

- [ ] **Step 8: Commit**

```bash
git add src/server/media/upload.ts src/server/invitations/mutations.ts "src/app/admin/(protected)/invitations/[id]/gallery/"
git commit -m "feat(gallery): admin UI for per-photo ratio, drag reorder, multi-upload"
```

---

### Task 11: Public theme render — ratio-aware gallery grid

**Files:**
- Modify: `src/themes/nusantara-ivory/sections/GallerySection.tsx`
- Modify: `src/themes/nusantara-ivory/ThemeStyles.tsx`

**Interfaces:**
- Consumes: `GalleryItem.aspectRatio` (Task 8).

- [ ] **Step 1: Pass `data-ratio` through `GallerySection`**

Modify `src/themes/nusantara-ivory/sections/GallerySection.tsx`:

```tsx
import type { GalleryItem } from "@/types/invitation";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";
import { EditorialImage } from "../components/EditorialImage";

export function GallerySection({ gallery }: { gallery: GalleryItem[] }) {
  if (gallery.length === 0) return null;
  return (
    <Section tone="ivory" wide floral>
      <SectionHeading title="Galeri" />
      <div className="ni-gallery-grid">
        {gallery.map((item, index) => (
          <Reveal key={item.id} variant="mask" delay={(index % 2) * .1}>
            <figure className="group" data-ratio={item.aspectRatio}>
              <div className="ni-photo-wrap ni-gallery-photo" data-ratio={item.aspectRatio}>
                <EditorialImage src={item.imageUrl} alt={item.altText ?? item.caption ?? ""} className="ni-photo transition-transform duration-700 group-hover:scale-[1.035] motion-reduce:transform-none" />
              </div>
              {item.caption ? <figcaption className="ni-gallery-caption">{item.caption}</figcaption> : null}
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: Replace the position-based grid CSS with ratio-driven rules**

Modify `src/themes/nusantara-ivory/ThemeStyles.tsx` — replace the existing gallery grid block (currently lines ~169-194, the `.ni-gallery-grid` rules) with:

```css
.ni-gallery-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 1rem; align-items: start; margin-top: 3rem; grid-auto-flow: dense; }
.ni-gallery-grid > :only-child { max-width: 960px; width: 100%; margin-inline: auto; }

.ni-gallery-photo { aspect-ratio: 4 / 5; }
.ni-gallery-photo[data-ratio="square_1_1"] { aspect-ratio: 1 / 1; }
.ni-gallery-photo[data-ratio="portrait_3_4"] { aspect-ratio: 3 / 4; }
.ni-gallery-photo[data-ratio="landscape_16_9"] { aspect-ratio: 16 / 9; }
.ni-gallery-photo[data-ratio="landscape_4_3"] { aspect-ratio: 4 / 3; }

.ni-gallery-grid > figure[data-ratio="landscape_16_9"],
.ni-gallery-grid > figure[data-ratio="landscape_4_3"] { grid-column: span 2; }

@media (min-width: 900px) {
  .ni-gallery-grid { grid-template-columns: repeat(12,minmax(0,1fr)); gap: 2rem; }
  .ni-gallery-grid > figure { grid-column: span 4; }
  .ni-gallery-grid > figure[data-ratio="landscape_16_9"],
  .ni-gallery-grid > figure[data-ratio="landscape_4_3"] { grid-column: span 8; }
  .ni-gallery-grid > :only-child { grid-column: 1/-1; }
  .ni-gallery-grid > :only-child .ni-gallery-photo { aspect-ratio: 16/10; }
}
```

This keeps the same visual intent as the old fixed pattern (landscape photos span wider, portrait/square stay narrower, `grid-auto-flow: dense` fills gaps) but the span/aspect now come from the admin-chosen ratio per photo instead of the photo's position in the array — so re-ordering or adding photos never breaks the layout.

- [ ] **Step 3: Manual verification**

Run `npm run dev`, open the public `/[slug]` page (or `/admin/invitations/<id>/preview`) for the pilot invitation after assigning a mix of ratios in the gallery admin (Task 10). Expected: landscape photos visibly span wider than portrait/square ones, no gaps in the grid, layout stays coherent at mobile width (2-column) and desktop width (12-column).

- [ ] **Step 4: Commit**

```bash
git add src/themes/nusantara-ivory/sections/GallerySection.tsx src/themes/nusantara-ivory/ThemeStyles.tsx
git commit -m "feat(gallery): render public gallery grid from per-photo aspect ratio"
```

---

### Task 12: Full-flow manual verification

**Files:** none (verification only)

- [ ] **Step 1: Run the automated checks**

Run: `npm run build && npm test`
Expected: both succeed.

- [ ] **Step 2: Browser walkthrough**

Using the Browser pane against `npm run dev`:
1. `/admin/login` → sign in.
2. `/admin/dashboard` → metric cards + expiring-soon section render.
3. `/admin/invitations` → card grid, status filter, empty state (temporarily filter to a status with 0 results).
4. Open the pilot invitation → sidebar nav (4 groups), active-tab highlight, mobile collapse via `SidebarTrigger`.
5. `/gallery` tab → multi-upload 2+ photos, change ratios, drag-reorder, delete one with confirm dialog — toast after each action.
6. `/[slug]` public page → gallery renders with ratio-aware spans, rest of the page unaffected (per CLAUDE.md, no other section touched).

- [ ] **Step 3: Report**

No commit for this task — it's a verification gate. If any step fails, fix inline in the relevant earlier task's files and re-run this checklist before considering the plan complete.
