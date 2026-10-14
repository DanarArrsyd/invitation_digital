# Rona Cetak — Theme Design

**Date:** 15 October 2026
**Status:** Implemented on `codex/rona-cetak-theme` for review

## Direction

Rona Cetak is a contemporary printed invitation for a warm, expressive wedding. Its visual metaphor is a small suite of two-colour paper pieces: an invitation sheet, an event programme, photo prints, a reply slip and a closing note. It is distinct from the existing palace, botanical, ballroom, Riviera and wayang themes.

The page uses warm paper (`#FFF8F0`), dark ink (`#29242A`), raspberry (`#792342`), coral (`#DC735F`) and pale blush (`#F2D5D5`). Contrast-bearing text uses dark ink or white, never coral on paper. Archivo carries bold display and practical text; Instrument Serif italic supplies a restrained handwritten-feeling accent. Avoid fake paper shadows, torn edges, busy collage, confetti and decorative gradients.

## Storyboard

1. Two offset paper panels frame a text-first cover with a clear open button and a personal greeting. Opening slides the front sheet aside once.
2. An editorial title and a 3:4 photo lead the invitation; missing photography leaves a confident typographic composition.
3. People and event details read as a programme, with numbered entries and ample whitespace.
4. Stories and the gallery use rectangular print crops; the gallery opens the shared accessible lightbox.
5. RSVP resembles a reply slip, wishes a note column, gifts a simple account list. Forms keep the shared action, Turnstile and error behavior.
6. A raspberry closing sheet ends the sequence.

All 18 public capabilities remain available through the shared normalized contract. All six invitation types use the shared event-copy deck. Navigation respects the invitation's supplied stops and optional content. Motion is limited to the cover and small entrance transitions, with a still reduced-motion state. Long and missing content must work at 320px, 390px, tablet and desktop.

## Release boundary

The migration only registers an idempotent theme catalogue row. Applying it remotely and merging the PR are separate production steps. Demo rows and assets are fictional samples and must never be treated as customer data.
