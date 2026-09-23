import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PACKAGE_DEFINITIONS,
  PACKAGE_KEYS,
  type PackageKey,
} from "@/lib/packages/entitlements";

import { updateInvitationPackageAction as updatePackageAction } from "./package-actions";

export function PackageForm({
  invitationId,
  currentPackage,
  error,
  saved,
}: {
  invitationId: string;
  currentPackage: PackageKey;
  error?: string;
  saved?: boolean;
}) {
  const currentDefinition = PACKAGE_DEFINITIONS[currentPackage];

  return (
    <section className="flex max-w-2xl flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-neutral-900">Paket</h2>
        <p className="text-sm text-neutral-600">
          Paket saat ini: {currentDefinition.label}
        </p>
      </div>

      {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
      {saved ? <p role="status" className="text-sm text-green-600">Paket tersimpan.</p> : null}

      <form action={updatePackageAction} className="flex flex-col gap-4">
        <input type="hidden" name="invitationId" value={invitationId} />

        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">Pilih paket undangan</legend>
          {PACKAGE_KEYS.map((key) => {
            const definition = PACKAGE_DEFINITIONS[key];
            return (
              <div key={key}>
                <input
                  id={`package-${key}`}
                  type="radio"
                  name="packageKey"
                  value={key}
                  defaultChecked={key === currentPackage}
                  className="peer sr-only"
                />
                <label
                  htmlFor={`package-${key}`}
                  className="flex cursor-pointer flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-400 peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-neutral-900">{definition.label}</span>
                    {definition.recommended ? <Badge variant="secondary">Recommended</Badge> : null}
                    {key === currentPackage ? <Badge variant="outline">Current selection</Badge> : null}
                  </span>
                  <span className="text-sm text-neutral-600">{definition.description}</span>
                  <span className="grid gap-2 text-sm text-neutral-700 sm:grid-cols-2">
                    <span>Maksimal {definition.limits.maxEvents} acara</span>
                    <span>Maksimal {definition.limits.maxGalleryImages} foto galeri</span>
                  </span>
                </label>
              </div>
            );
          })}
        </fieldset>

        <p className="text-sm text-amber-700">
          Downgrade hanya dapat disimpan setelah semua konflik paket diselesaikan.
        </p>

        <Button type="submit" className="w-fit">
          Simpan paket
        </Button>
      </form>
    </section>
  );
}
