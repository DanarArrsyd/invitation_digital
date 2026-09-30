"use client";

import { useEffect, useRef, useState } from "react";

export async function attemptClipboardCopy(
  text: string,
  clipboard: Pick<Clipboard, "writeText"> | undefined = navigator.clipboard,
): Promise<boolean> {
  try {
    if (!clipboard) return false;
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function useCopyFeedback(durationMs = 1500) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  async function copy(text: string): Promise<void> {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const success = await attemptClipboardCopy(text);
    setCopied(success);
    if (success) {
      timeoutRef.current = setTimeout(() => setCopied(false), durationMs);
    }
  }

  return { copied, copy };
}
