import { EVENT_TYPE_LABELS, EVENT_TYPES, type EventType } from "@/lib/marketing/event-types";
import { SERVICE_TERMS_ANSWER } from "@/lib/marketing/service-terms";

export interface FaqItem {
  question: string;
  answer: string;
}

/** "A", "A dan B", "A, B, dan C". */
function joinIndonesian(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} dan ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, dan ${items[items.length - 1]}`;
}

/**
 * Built from the catalogue, so it stays true as templates gain event types.
 * Templates that differ in what they support get one sentence each.
 */
export function describeNonWeddingTemplates(templates: { name: string; eventTypes: readonly EventType[] }[]): string {
  const ask = "Tanyakan lewat WhatsApp untuk kebutuhan Anda.";
  const groups = new Map<string, { names: string[]; types: EventType[] }>();
  for (const template of templates) {
    const types = EVENT_TYPES.filter((type) => type !== "wedding" && template.eventTypes.includes(type));
    if (types.length === 0) continue;
    const key = types.join(",");
    const group = groups.get(key) ?? { names: [], types };
    group.names.push(template.name);
    groups.set(key, group);
  }
  if (groups.size === 0) {
    return `Template untuk lamaran, ulang tahun, aqiqah, wisuda, dan acara kantor sedang disiapkan. ${ask}`;
  }

  const sentences = [...groups.values()].map(({ names, types }) => {
    const labels = joinIndonesian(types.map((type) => EVENT_TYPE_LABELS[type].toLowerCase()));
    return `Template ${joinIndonesian(names)} bisa dipakai untuk ${labels}.`;
  });
  const weddingOnly = templates.some((template) =>
    template.eventTypes.every((type) => type === "wedding"),
  );
  return ["Ada.", ...sentences, weddingOnly ? "Template lain khusus pernikahan." : null, ask]
    .filter(Boolean)
    .join(" ");
}

/** Answers stay factual: only what the product does today. */
export function buildFaqItems(templates: { name: string; eventTypes: readonly EventType[] }[]): FaqItem[] {
  return [
    {
      question: "Berapa lama pengerjaannya?",
      answer: SERVICE_TERMS_ANSWER,
    },
    {
      question: "Berapa lama undangan bisa dibuka?",
      answer: "Undangan aktif selama 3 bulan sejak diterbitkan. Setelah itu link menampilkan pemberitahuan bahwa undangan sudah berakhir.",
    },
    {
      question: "Bisa menampilkan nama tamu satu per satu?",
      answer: "Bisa. Dari daftar tamu yang Anda kirim, setiap tamu mendapat link sendiri dan namanya tampil di halaman pembuka.",
    },
    {
      question: "Apakah tamu perlu memasang aplikasi?",
      answer: "Tidak. Undangan dibuka langsung di browser HP, cukup dari link yang dibagikan lewat WhatsApp.",
    },
    {
      question: "Bagaimana tamu mengonfirmasi kehadiran?",
      answer: "Tamu menekan Hadir atau Tidak Hadir di bagian RSVP. Setiap jawaban langsung tercatat.",
    },
    {
      question: "Kalau ada data yang berubah setelah terbit?",
      answer: "Isi undangan tetap bisa diperbarui, misalnya jam atau lokasi acara. Link yang sudah dibagikan tidak berubah.",
    },
    {
      question: "Boleh memakai lagu pilihan sendiri?",
      answer: "Boleh. Kirim file lagu (mp3) yang ingin dipakai. Musik baru diputar setelah tamu membuka undangan.",
    },
    {
      question: "Ada undangan untuk acara selain pernikahan?",
      answer: describeNonWeddingTemplates(templates),
    },
  ];
}
