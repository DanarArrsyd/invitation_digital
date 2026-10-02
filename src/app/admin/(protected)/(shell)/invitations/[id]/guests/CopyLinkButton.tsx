"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { toAbsoluteInvitationUrl } from "@/lib/share/invitation-share";

export function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        const absoluteLink = toAbsoluteInvitationUrl(link, window.location.origin);
        await navigator.clipboard.writeText(absoluteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "Tersalin" : "Salin link"}
    </Button>
  );
}
