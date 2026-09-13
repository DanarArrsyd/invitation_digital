export type InvitationType =
  | "wedding"
  | "birthday"
  | "engagement"
  | "aqiqah"
  | "graduation"
  | "corporate";

export type InvitationStatus = "draft" | "published" | "expired" | "archived";

export type PersonRole = "bride" | "groom" | "celebrant" | "host" | "speaker";

export interface InvitationPerson {
  id: string;
  role: PersonRole;
  fullName: string;
  nickname: string | null;
  fatherName: string | null;
  motherName: string | null;
  photoUrl: string | null;
  bio: string | null;
  sortOrder: number;
}

export interface InvitationEvent {
  id: string;
  eventType: string | null;
  title: string;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  venueName: string | null;
  address: string | null;
  mapsUrl: string | null;
  livestreamUrl: string | null;
  sortOrder: number;
}

export interface InvitationStory {
  id: string;
  title: string;
  storyDate: string | null;
  yearLabel: string | null;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  caption: string | null;
  altText: string | null;
  sortOrder: number;
}

export interface GiftAccount {
  id: string;
  providerType: "bank" | string;
  providerName: string;
  accountNumber: string;
  accountName: string;
  logoUrl: string | null;
  sortOrder: number;
}

export interface InvitationFeatures {
  music: boolean;
  countdown: boolean;
  maps: boolean;
  story: boolean;
  gallery: boolean;
  livestream: boolean;
  rsvp: boolean;
  wishes: boolean;
  gift: boolean;
  guestPersonalization: boolean;
}

/**
 * Normalized shape handed to a theme component. Themes never see
 * raw database rows or query Supabase directly — see ARCHITECTURE.md sections 5 and 7.
 */
export interface PublicInvitation {
  id: string;
  type: InvitationType;
  slug: string;
  title: string;
  status: "published";
  eventDate: string | null;
  venueSummary: string | null;
  publishedAt: string;
  expiresAt: string | null;

  theme: {
    slug: string;
    settings: Record<string, unknown>;
  };

  people: InvitationPerson[];
  events: InvitationEvent[];
  stories: InvitationStory[];
  gallery: GalleryItem[];
  gifts: GiftAccount[];
  wishes: Wish[];

  content: {
    openingQuote: string | null;
    openingMessage: string | null;
    closingMessage: string | null;
  };

  features: InvitationFeatures;

  media: {
    musicUrl: string | null;
    coverImageUrl: string | null;
  };
}

export interface Guest {
  id: string;
  displayName: string;
  token: string;
  notes: string | null;
}

export type RsvpAttendance = "attending" | "not_attending";

export interface Rsvp {
  id: string;
  guestId: string | null;
  guestName: string | null;
  attendance: RsvpAttendance;
  createdAt: string;
}

export interface Wish {
  id: string;
  guestId: string | null;
  guestName: string;
  message: string;
  isVisible: boolean;
  createdAt: string;
}
