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

/**
 * `copied` flashes for `durationMs` after a successful copy. `failed` stays
 * set until the next attempt, so a theme can offer a manual fallback when
 * the clipboard is unavailable (in-app browsers, denied permission).
 */
export function useCopyFeedback(durationMs = 1500) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  async function copy(text: string): Promise<boolean> {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const success = await attemptClipboardCopy(text);
    setCopied(success);
    setFailed(!success);
    if (success) {
      timeoutRef.current = setTimeout(() => setCopied(false), durationMs);
    }
    return success;
  }

  return { copied, failed, copy };
}
