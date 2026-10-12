import { DEFAULT_INVITATION_TIME_ZONE } from "@/lib/invitations/time-zones";
import {
  PACKAGE_DEFINITIONS,
  resolveEffectiveInvitationFeatures,
  type PackageKey,
} from "@/lib/packages/entitlements";
import { NAV_SECTIONS_BY_PACKAGE } from "@/lib/packages/nav-sections";
import type {
  GalleryItem,
  Guest,
  InvitationFeatures,
  InvitationPerson,
  InvitationType,
  PersonRole,
  PublicInvitation,
} from "@/types/invitation";

/**
 * Local QA fixtures (src/app/qa-matrix): the demo content rendered as any
 * package, invitation type and data condition. Packages go through the same
 * functions production uses, so only `type` and `condition` change data on
 * purpose. Never used for a real invitation.
 */

export const QA_CONDITIONS = ["lengkap", "minim", "panjang"] as const;
export type QaCondition = (typeof QA_CONDITIONS)[number];

export const QA_DEFAULT_GUEST = "Nama Tamu Anda";

export interface QaDemoSource {
  theme: string;
  title: string;
  eventDate: string;
  venue: string;
  opening_quote: string | null;
  opening_message: string | null;
  closing_message: string | null;
  people: ReadonlyArray<{ role: string; fullName: string; nickname: string; father: string; mother: string; bio: string }>;
  events: ReadonlyArray<{
    type: string;
    title: string;
    date: string;
    start: string;
    end: string;
    venue: string;
    address: string;
    livestream?: string;
  }>;
  dressCode?: unknown;
}

export interface QaDemoLibrary {
  stories: ReadonlyArray<{ title: string; year: string; description: string }>;
  gifts: ReadonlyArray<{ type: string; provider: string; number: string; name: string }>;
  wishes: ReadonlyArray<{ name: string; message: string }>;
  imageSlots: ReadonlyArray<{ file: string; aspectRatio?: string }>;
  imagePath: (theme: string, file: string) => string;
}

export interface QaFixtureOptions {
  packageKey: PackageKey;
  type: InvitationType;
  condition: QaCondition;
  guestName: string | null;
}

// Same switches as the demo seed (scripts/demo/build-seed.mjs); no music file exists.
const REQUESTED_FEATURES: InvitationFeatures = {
  music: false,
  countdown: true,
  maps: true,
  story: true,
  gallery: true,
  dressCode: true,
  livestream: true,
  rsvp: true,
  wishes: true,
  gift: true,
  guestPersonalization: true,
};

/** Who a non-wedding invitation is about; engagement keeps the couple. */
const SOLO_ROLE: Partial<Record<InvitationType, PersonRole>> = {
  birthday: "celebrant",
  aqiqah: "celebrant",
  graduation: "celebrant",
  corporate: "host",
};

/** Neutral sample copy per type, free of wedding-only words. */
const TYPE_COPY: Record<Exclude<InvitationType, "wedding">, { noun: string; events: readonly [string, string, string] }> = {
  engagement: { noun: "Lamaran", events: ["Lamaran", "Ramah tamah", "Syukuran keluarga"] },
  birthday: { noun: "Ulang Tahun", events: ["Tiup lilin", "Makan malam", "Pesta kebun"] },
  aqiqah: { noun: "Aqiqah", events: ["Pembacaan doa", "Syukuran", "Ramah tamah"] },
  graduation: { noun: "Wisuda", events: ["Prosesi wisuda", "Syukuran", "Makan malam"] },
  corporate: { noun: "Peluncuran", events: ["Pembukaan", "Sesi utama", "Jamuan malam"] },
};

// The demo's wishes, love story and event eyebrows ("Sakral", "Adat") are
// wedding copy; other types get neutral samples so the audit only sees the
// theme's own words.
const NEUTRAL_EVENT_LABELS = ["Acara utama", "Perayaan", "Ramah tamah"] as const;
const NEUTRAL_WISHES = [
  { name: "Tamu Sample 1", message: "Selamat dan sukses selalu! Semoga acaranya berjalan lancar." },
  { name: "Tamu Sample 2", message: "Turut berbahagia, doa terbaik untuk keluarga." },
  { name: "Tamu Sample 3", message: "Maaf belum bisa hadir, doa terbaik dari jauh." },
  { name: "Tamu Sample 4", message: "Semoga selalu diberi kesehatan dan kebahagiaan." },
] as const;
const MILESTONE_STORIES = [
  { title: "Awal perjalanan", year: "2019", description: "Cerita contoh: langkah pertama yang dikenang keluarga." },
  { title: "Tumbuh bersama", year: "2022", description: "Cerita contoh: tahun-tahun penuh pelajaran dan teman baru." },
  { title: "Hari ini", year: "2026", description: "Cerita contoh: momen yang ingin dirayakan bersama orang terdekat." },
] as const;

const LONG_WORD = "Kusumawardhaniprameswaridewantarisekararum";
const LONG = {
  name: `Raden Ajeng ${LONG_WORD}`,
  venue: "Gedung Serbaguna Sample dengan Nama yang Sangat Panjang Sekali",
  address: "Jl. Contoh Panjang Sekali No. 123, RT 004/RW 011, Kelurahan Sample, Kecamatan Sample, Kabupaten Sample",
  wish: "Doa terbaik untuk hari yang istimewa ini. ".repeat(8).trim(),
  guest: "Bapak Raden Mas Haryo Wicaksono Adiningrat beserta keluarga besar",
};

const PUBLISHED_AT = "2026-10-01T00:00:00.000Z";

export function buildQaFixture(
  source: QaDemoSource,
  library: QaDemoLibrary,
  options: QaFixtureOptions,
): { invitation: PublicInvitation; guest: Guest | null } {
  const { packageKey, type, condition } = options;
  const definition = PACKAGE_DEFINITIONS[packageKey];
  const wedding = type === "wedding";
  const copy = type === "wedding" ? null : TYPE_COPY[type];
  const minimal = condition === "minim";
  const long = condition === "panjang";
  const image = (file: string) => library.imagePath(source.theme, file);

  const soloRole = SOLO_ROLE[type];
  const cast = soloRole ? source.people.slice(0, 1) : source.people;
  const people: InvitationPerson[] = cast.map((person, index) => ({
    id: `qa-person-${index + 1}`,
    role: soloRole ?? (person.role as PersonRole),
    fullName: long ? (index === 0 ? LONG.name : `${person.fullName} ${LONG_WORD}`) : person.fullName,
    nickname: person.nickname,
    fatherName: minimal ? null : person.father,
    motherName: minimal ? null : person.mother,
    photoUrl: image(`person-${index + 1}.jpg`),
    bio: wedding ? person.bio : null,
    sortOrder: index,
  }));

  const events = source.events
    .slice(0, minimal ? 1 : definition.limits.maxEvents)
    .map((event, index) => {
      const venueName = long ? LONG.venue : event.venue;
      const address = long ? LONG.address : event.address;
      return {
        id: `qa-event-${index + 1}`,
        eventType: wedding ? event.type : NEUTRAL_EVENT_LABELS[index % NEUTRAL_EVENT_LABELS.length],
        title: copy ? copy.events[index % copy.events.length] : event.title,
        eventDate: event.date,
        startTime: `${event.start}:00`,
        endTime: `${event.end}:00`,
        venueName,
        address,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venueName}, ${address}`)}`,
        livestreamUrl: event.livestream ?? null,
        sortOrder: index,
      };
    });

  const gallery: GalleryItem[] = minimal
    ? []
    : library.imageSlots
        .filter((slot) => slot.aspectRatio)
        .slice(0, definition.limits.maxGalleryImages)
        .map((slot, index) => ({
          id: `qa-gallery-${index + 1}`,
          imageUrl: image(slot.file),
          caption: null,
          altText: `Sample ${index + 1}`,
          aspectRatio: slot.aspectRatio as GalleryItem["aspectRatio"],
          sortOrder: index,
        }));

  const stories = minimal
    ? []
    : (soloRole ? MILESTONE_STORIES : library.stories).map((story, index) => ({
        id: `qa-story-${index + 1}`,
        title: story.title,
        storyDate: null,
        yearLabel: story.year,
        description: story.description,
        imageUrl: image(`story-${index + 1}.jpg`),
        sortOrder: index,
      }));

  const gifts = minimal
    ? []
    : library.gifts.map((gift, index) => ({
        id: `qa-gift-${index + 1}`,
        providerType: gift.type,
        providerName: gift.provider,
        accountNumber: gift.number,
        accountName: people[0]?.fullName ?? gift.name,
        logoUrl: null,
        sortOrder: index,
      }));

  const wishes = minimal
    ? []
    : (wedding ? library.wishes : NEUTRAL_WISHES).map((wish, index) => ({
        id: `qa-wish-${index + 1}`,
        guestId: null,
        guestName: wish.name,
        message: long && index === 0 ? LONG.wish : wish.message,
        isVisible: true,
        createdAt: new Date(Date.UTC(2026, 9, 1, 12 - index)).toISOString(),
      }));

  const features = resolveEffectiveInvitationFeatures(packageKey, REQUESTED_FEATURES);
  const settings: Record<string, unknown> = { features, timeZone: DEFAULT_INVITATION_TIME_ZONE };
  if (definition.invitationFeatures.dressCode && source.dressCode) settings.dressCode = source.dressCode;

  const invitation: PublicInvitation = {
    id: `qa-${source.theme}`,
    type,
    navSections: NAV_SECTIONS_BY_PACKAGE[packageKey],
    slug: `qa-${source.theme}`,
    title: copy ? `${copy.noun} ${people[0]?.nickname ?? ""}`.trim() : source.title,
    status: "published",
    eventDate: source.eventDate,
    venueSummary: long ? LONG.venue : source.venue,
    publishedAt: PUBLISHED_AT,
    expiresAt: null,
    timeZone: DEFAULT_INVITATION_TIME_ZONE,
    theme: { slug: source.theme, settings },
    people,
    events,
    stories,
    gallery,
    gifts,
    wishes,
    content: {
      openingQuote: wedding && !minimal ? source.opening_quote : null,
      openingMessage: source.opening_message,
      closingMessage: source.closing_message,
    },
    features,
    media: { musicUrl: null, coverImageUrl: image("cover.jpg") },
  };

  const guest: Guest | null = options.guestName === null
    ? null
    : { id: "qa-guest", displayName: long ? LONG.guest : options.guestName, token: "", notes: null };

  return { invitation, guest };
}
