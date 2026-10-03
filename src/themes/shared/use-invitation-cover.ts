"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useReducedMotion } from "motion/react";

import { trackCoverOpenedAction } from "@/app/(public)/[slug]/actions";

export async function attemptAudioPlay(audio: Pick<HTMLAudioElement, "play">): Promise<boolean> {
  try {
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

interface InvitationCoverOptions {
  invitationId: string;
  guestToken: string | null;
  musicEnabled: boolean;
  musicUrl: string | null;
}

interface InvitationCoverController {
  opened: boolean;
  playing: boolean;
  canPlayMusic: boolean;
  reducedMotion: boolean;
  audioRef: RefObject<HTMLAudioElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  openInvitation(): void;
  toggleMusic(): void;
}

export function useInvitationCover({
  invitationId,
  guestToken,
  musicEnabled,
  musicUrl,
}: InvitationCoverOptions): InvitationCoverController {
  const contentRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const openedRef = useRef(false);
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;
  const canPlayMusic = musicEnabled && Boolean(musicUrl);

  useEffect(() => {
    if (opened) contentRef.current?.focus({ preventScroll: true });
  }, [opened]);

  function openInvitation() {
    if (openedRef.current) return;
    openedRef.current = true;
    setOpened(true);
    if (canPlayMusic && audioRef.current) {
      void attemptAudioPlay(audioRef.current).then(setPlaying);
    }
    void trackCoverOpenedAction(invitationId, guestToken).catch(() => undefined);
  }

  function toggleMusic() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      void attemptAudioPlay(audioRef.current).then(setPlaying);
    }
  }

  return {
    opened,
    playing,
    canPlayMusic,
    reducedMotion,
    audioRef,
    contentRef,
    openInvitation,
    toggleMusic,
  };
}
