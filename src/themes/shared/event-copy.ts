import type { InvitationType, PersonRole } from "@/types/invitation";

/**
 * Guest-facing copy that changes with the event type. Every type has its
 * own sentences; a birthday is never a wedding with the noun swapped.
 * Themes keep their identity accents (Terra's specimen, Midnight's
 * "Dua insan") and their neutral headings; admin messages are data and
 * never come from here.
 */
export interface EventCopy {
  /** Short event noun: "Pagelaran {eventName}", Midnight/Cobalt cover intro. */
  eventName: string;
  coverEyebrow: string;
  peopleEyebrow: string;
  peopleHeading: string;
  /** At most 8 characters so the 320 px nav keeps it whole. */
  peopleNavLabel: string;
  storyHeading: string;
  countdownHeading: string;
  wishesPrompt: string;
  giftIntro: string;
  /** Used only when the admin leaves the closing message empty. */
  closingLine: string;
}

const HONOUR = "Merupakan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan";
const GIFT_INFO = "informasinya ada di bawah ini.";

const EVENT_COPY: Record<InvitationType, EventCopy> = {
  wedding: {
    eventName: "Pernikahan",
    coverEyebrow: "The Wedding Of",
    peopleEyebrow: "Yang berbahagia",
    peopleHeading: "Mempelai",
    peopleNavLabel: "Mempelai",
    storyHeading: "Perjalanan Kami",
    countdownHeading: "Menuju hari bahagia",
    wishesPrompt: "Titipkan doa untuk kedua mempelai.",
    giftIntro: `Doa restu Anda adalah hadiah terindah. Bila berkenan memberi tanda kasih, ${GIFT_INFO}`,
    closingLine: `${HONOUR} memberikan doa restu.`,
  },
  engagement: {
    eventName: "Lamaran",
    coverEyebrow: "Lamaran",
    peopleEyebrow: "Dua hati",
    peopleHeading: "Pasangan",
    peopleNavLabel: "Pasangan",
    storyHeading: "Kisah Kami",
    countdownHeading: "Menuju hari lamaran",
    wishesPrompt: "Doakan langkah kami berikutnya.",
    giftIntro: `Doa Anda untuk langkah kami sudah lebih dari cukup. Bila berkenan memberi tanda kasih, ${GIFT_INFO}`,
    closingLine: `${HONOUR} mendoakan langkah kami.`,
  },
  birthday: {
    eventName: "Ulang Tahun",
    coverEyebrow: "Merayakan Ulang Tahun",
    peopleEyebrow: "Yang dirayakan",
    peopleHeading: "Yang Berulang Tahun",
    peopleNavLabel: "Profil",
    storyHeading: "Lembar Kenangan",
    countdownHeading: "Menuju hari istimewa",
    wishesPrompt: "Tuliskan ucapan dan harapan untuknya.",
    giftIntro: `Kehadiran Anda adalah kado terbaik. Bila ingin berbagi kebahagiaan, ${GIFT_INFO}`,
    closingLine: `${HONOUR} merayakan bersama kami.`,
  },
  aqiqah: {
    eventName: "Tasyakuran Aqiqah",
    coverEyebrow: "Tasyakuran Aqiqah",
    peopleEyebrow: "Buah hati kami",
    peopleHeading: "Ananda",
    peopleNavLabel: "Ananda",
    storyHeading: "Kisah Kelahiran",
    countdownHeading: "Menuju syukuran",
    wishesPrompt: "Kirimkan doa terbaik untuk Ananda.",
    giftIntro: `Doa untuk Ananda adalah hadiah paling berharga. Bila berkenan berbagi, ${GIFT_INFO}`,
    closingLine: `${HONOUR} turut mendoakan Ananda.`,
  },
  graduation: {
    eventName: "Wisuda",
    coverEyebrow: "Merayakan Kelulusan",
    peopleEyebrow: "Yang diwisuda",
    peopleHeading: "Wisudawan",
    peopleNavLabel: "Profil",
    storyHeading: "Jejak Perjuangan",
    countdownHeading: "Menuju hari wisuda",
    wishesPrompt: "Beri ucapan selamat dan semangat.",
    giftIntro: `Ucapan selamat Anda sudah sangat berarti. Bila ingin memberi hadiah, ${GIFT_INFO}`,
    closingLine: `${HONOUR} merayakan pencapaian ini.`,
  },
  corporate: {
    eventName: "Perayaan",
    coverEyebrow: "Undangan",
    peopleEyebrow: "Tuan rumah",
    peopleHeading: "Penyelenggara",
    peopleNavLabel: "Profil",
    storyHeading: "Tentang Kami",
    countdownHeading: "Menuju acara",
    wishesPrompt: "Tinggalkan pesan untuk kami.",
    giftIntro: `Bila Anda ingin memberi dukungan, ${GIFT_INFO}`,
    closingLine: "Kami menantikan kehadiran Bapak/Ibu/Saudara/i.",
  },
};

/** Stored rows may carry a type added later; they read as a neutral event. */
export function eventCopy(type: InvitationType): EventCopy {
  return EVENT_COPY[type] ?? EVENT_COPY.corporate;
}

/** The label before the parents' names, or null when the type hides parents. */
export function parentLineFor(type: InvitationType, role: PersonRole): string | null {
  if (type === "wedding" || type === "engagement") {
    if (role === "bride") return "Putri dari";
    if (role === "groom") return "Putra dari";
    return "Putra/putri dari";
  }
  if (type === "birthday" || type === "graduation") return "Putra/putri dari";
  if (type === "aqiqah") return "Buah hati dari";
  return null;
}
