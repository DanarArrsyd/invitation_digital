import { FormMessage } from "@/components/admin/form-message";
import { Panel, PanelBody, PanelFooter, SettingsSection } from "@/components/admin/settings-section";
import { SubmitButton } from "@/components/admin/submit-button";
import { UnsavedHint } from "@/components/admin/unsaved-hint";
import { Badge } from "@/components/ui/badge";
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
  return (
    <SettingsSection
      id="package"
      title="Paket"
      description="Menentukan fitur dan jumlah menu di undangan. Turun paket hanya bisa disimpan setelah konten yang melebihi batas paket dirapikan."
    >
      <FormMessage tone="error">{error}</FormMessage>
      <FormMessage tone="success">{saved ? "Paket tersimpan." : null}</FormMessage>

      <Panel>
        <form action={updatePackageAction}>
          <input type="hidden" name="invitationId" value={invitationId} />
          <PanelBody>
            <fieldset className="grid gap-3 md:grid-cols-3">
              <legend className="sr-only">Pilih paket undangan</legend>
              {PACKAGE_KEYS.map((key) => {
                const definition = PACKAGE_DEFINITIONS[key];
                return (
                  <div key={key} className="flex">
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
                      className="flex w-full cursor-pointer flex-col gap-2 rounded-xl border border-input bg-card p-4 transition-colors hover:border-ring peer-checked:border-primary peer-checked:bg-[color-mix(in_oklch,var(--card),var(--primary)_4%)] peer-checked:shadow-[inset_0_0_0_1px_var(--primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2"
                    >
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-foreground">{definition.label}</span>
                        {definition.recommended ? <Badge variant="secondary">Disarankan</Badge> : null}
                        {key === currentPackage ? <Badge variant="outline">Saat ini</Badge> : null}
                      </span>
                      <span className="text-sm leading-6 text-muted-foreground">{definition.description}</span>
                      <span className="mt-auto flex flex-col gap-0.5 pt-2 text-xs text-foreground">
                        <span>Maks. {definition.limits.maxEvents} acara</span>
                        <span>Maks. {definition.limits.maxGalleryImages} foto galeri</span>
                      </span>
                    </label>
                  </div>
                );
              })}
            </fieldset>
          </PanelBody>
          <PanelFooter>
            <UnsavedHint />
            <SubmitButton>Simpan paket</SubmitButton>
          </PanelFooter>
        </form>
      </Panel>
    </SettingsSection>
  );
}
