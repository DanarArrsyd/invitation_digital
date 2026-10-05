/**
 * Demo invitations for the marketing site: one per template, rich enough that
 * every package shows its differences (3 events, 12 gallery photos, stories,
 * gifts, wishes, dress code). Names and places are fictional samples; images
 * are the "Sample N" placeholders generated into public/demo/<theme>/.
 *
 * Used by scripts/demo/build-seed.mjs (SQL) and scripts/demo/images.mjs.
 */

/** Gradient pairs + text colour per template, taken from each theme's palette. */
export const PALETTES = {
  "nusantara-ivory": [
    ["#F2E8D6", "#E2D3B8", "#5A3A24"],
    ["#A87A3D", "#6B3E26", "#F8F1E4"],
    ["#2F4A3A", "#1D3026", "#F2E8D6"],
    ["#7A2E22", "#4B1A13", "#F2E8D6"],
  ],
  "terra-botanica": [
    ["#F2EBDD", "#E5D8C0", "#4A3426"],
    ["#B5653E", "#8A4526", "#FBF7EE"],
    ["#4E5B3A", "#353F27", "#FBF7EE"],
    ["#D9A441", "#B3812A", "#4A3426"],
  ],
  "midnight-atelier": [
    ["#2A2433", "#14121A", "#D8C08A"],
    ["#5E1A22", "#3A0F15", "#EDE6DA"],
    ["#1E1A24", "#0E0C12", "#EDE6DA"],
    ["#D8C08A", "#B49C62", "#14121A"],
  ],
  "cobalt-riviera": [
    ["#1D3E9E", "#142C72", "#F7F4EC"],
    ["#F7F4EC", "#E9E2D0", "#1D3E9E"],
    ["#E8743B", "#C95A24", "#F7F4EC"],
    ["#8EC5D6", "#5FA3B8", "#0E2350"],
  ],
  "kelir-kencana": [
    ["#F2E7D0", "#E8D7B4", "#3D2314"],
    ["#3D2314", "#1C1510", "#C09435"],
    ["#8E2B1F", "#5E1C14", "#F2E7D0"],
    ["#C09435", "#84601D", "#1C1510"],
  ],
};

/** Image slots per template, in "Sample N" order. */
export const IMAGE_SLOTS = [
  { file: "cover.jpg", width: 900, height: 1200 },
  { file: "person-1.jpg", width: 800, height: 1000 },
  { file: "person-2.jpg", width: 800, height: 1000 },
  { file: "story-1.jpg", width: 1200, height: 900 },
  { file: "story-2.jpg", width: 1200, height: 900 },
  { file: "story-3.jpg", width: 1200, height: 900 },
  ...[
    ["portrait_3_4", 900, 1200],
    ["landscape_4_3", 1200, 900],
    ["square_1_1", 1000, 1000],
    ["portrait_4_5", 800, 1000],
    ["landscape_16_9", 1280, 720],
    ["portrait_3_4", 900, 1200],
    ["square_1_1", 1000, 1000],
    ["landscape_4_3", 1200, 900],
    ["portrait_4_5", 800, 1000],
    ["portrait_3_4", 900, 1200],
    ["landscape_16_9", 1280, 720],
    ["square_1_1", 1000, 1000],
  ].map(([aspectRatio, width, height], index) => ({
    file: `gallery-${String(index + 1).padStart(2, "0")}.jpg`,
    width,
    height,
    aspectRatio,
  })),
];

export const imagePath = (theme, file) => `/demo/${theme}/${file}`;

const common = {
  type: "wedding",
  package_key: "grand",
  status: "published",
  opening_quote:
    "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan dari jenismu sendiri, supaya kamu merasa tenteram kepadanya. (QS. Ar-Rum: 21)",
  opening_message:
    "Dengan memohon rahmat Tuhan Yang Maha Esa, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada hari bahagia kami.",
  closing_message:
    "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir. Terima kasih atas doa dan restunya.",
};

export const DEMOS = [
  {
    theme: "nusantara-ivory",
    sortOrder: 1,
    tagline: "Editorial Nusantara yang tenang, gading dan emas.",
    description:
      "Nuansa gading dengan aksen emas dan detail Nusantara yang halus. Pembuka dengan melati yang berguguran, tipografi klasik, dan tata letak bergaya majalah.\n\nCocok untuk akad dan resepsi adat yang ingin tampil anggun dan bersahaja.",
    title: "Pernikahan Sekar & Damar",
    eventDate: "2027-05-15",
    venue: "Pendopo Sample, Yogyakarta",
    people: [
      { role: "bride", fullName: "Sekar Ayu Larasati", nickname: "Sekar", father: "Bapak Sample Wiryo", mother: "Ibu Sample Ratna", bio: "Putri pertama" },
      { role: "groom", fullName: "Damar Prakoso", nickname: "Damar", father: "Bapak Sample Hadi", mother: "Ibu Sample Sri", bio: "Putra kedua" },
    ],
    events: [
      { type: "Sakral", title: "Akad Nikah", date: "2027-05-15", start: "08:00", end: "10:00", venue: "Masjid Sample", address: "Jl. Contoh No. 1, Yogyakarta" },
      { type: "Perayaan", title: "Resepsi", date: "2027-05-15", start: "11:00", end: "14:00", venue: "Pendopo Sample", address: "Jl. Contoh No. 12, Yogyakarta", livestream: "https://www.youtube.com/" },
      { type: "Syukuran", title: "Ngunduh Mantu", date: "2027-05-22", start: "10:00", end: "13:00", venue: "Rumah Keluarga Sample", address: "Jl. Contoh No. 7, Magelang" },
    ],
    dressCode: { description: "Busana batik atau kebaya dengan nuansa hangat.", groups: [{ label: "Tamu", colors: ["#A87A3D", "#E9DCC4", "#2F4A3A"] }] },
  },
  {
    theme: "terra-botanica",
    sortOrder: 2,
    tagline: "Herbarium cinta di antara daun dan bunga kering.",
    description:
      "Seperti jurnal botani: tinta cokelat, sulur yang tumbuh saat digulir, dan benih yang mekar ketika undangan dibuka.\n\nCocok untuk pernikahan outdoor, garden party, dan konsep rustic.",
    title: "Pernikahan Alya & Bima",
    eventDate: "2027-06-19",
    venue: "Kebun Sample, Bogor",
    people: [
      { role: "bride", fullName: "Alya Kirana Putri", nickname: "Alya", father: "Bapak Sample Rahman", mother: "Ibu Sample Dewi", bio: "Putri kedua" },
      { role: "groom", fullName: "Bima Aditya Nugraha", nickname: "Bima", father: "Bapak Sample Joko", mother: "Ibu Sample Lestari", bio: "Putra pertama" },
    ],
    events: [
      { type: "Sakral", title: "Akad Nikah", date: "2027-06-19", start: "08:00", end: "10:00", venue: "Masjid Sample", address: "Jl. Contoh No. 3, Bogor" },
      { type: "Perayaan", title: "Resepsi", date: "2027-06-19", start: "11:00", end: "14:00", venue: "Kebun Sample", address: "Jl. Contoh No. 21, Bogor", livestream: "https://www.youtube.com/" },
      { type: "Pesta kebun", title: "Garden Party", date: "2027-06-20", start: "16:00", end: "19:00", venue: "Rumah Kaca Sample", address: "Jl. Contoh No. 5, Bogor" },
    ],
    dressCode: { description: "Nuansa alam: hijau daun, terakota, dan krem.", groups: [{ label: "Tamu", colors: ["#4E5B3A", "#B5653E", "#F2EBDD"] }] },
  },
  {
    theme: "midnight-atelier",
    sortOrder: 3,
    tagline: "Malam di ballroom, lampu sorot, dan kartu dansa.",
    description:
      "Gelap dan berkelas: tinta malam, aksen sampanye, dan lampu sorot yang mengikuti pembacaan. Ada toast sampanye dan kartu dansa untuk tamu yang hadir.\n\nCocok untuk resepsi malam dan pesta formal.",
    title: "Pernikahan Nadia & Reza",
    eventDate: "2027-08-21",
    venue: "Ballroom Sample, Jakarta",
    people: [
      { role: "bride", fullName: "Nadia Salsabila", nickname: "Nadia", father: "Bapak Sample Arif", mother: "Ibu Sample Maya", bio: "Putri ketiga" },
      { role: "groom", fullName: "Reza Mahendra", nickname: "Reza", father: "Bapak Sample Teguh", mother: "Ibu Sample Indah", bio: "Putra pertama" },
    ],
    events: [
      { type: "Sakral", title: "Akad Nikah", date: "2027-08-21", start: "15:00", end: "16:30", venue: "Masjid Sample", address: "Jl. Contoh No. 9, Jakarta" },
      { type: "Perayaan", title: "Resepsi Malam", date: "2027-08-21", start: "19:00", end: "22:00", venue: "Ballroom Sample", address: "Jl. Contoh No. 88, Jakarta", livestream: "https://www.youtube.com/" },
      { type: "Pesta malam", title: "After Party", date: "2027-08-21", start: "22:00", end: "23:30", venue: "Lounge Sample", address: "Jl. Contoh No. 88, Jakarta" },
    ],
    dressCode: { description: "Black tie. Gaun malam atau setelan gelap.", groups: [{ label: "Tamu", colors: ["#14121A", "#5E1A22", "#D8C08A"] }] },
  },
  {
    theme: "cobalt-riviera",
    sortOrder: 4,
    tagline: "Surat cinta dari Mediterania.",
    description:
      "Biru kobalt, porselen, dan matahari jeruk. Ombak yang surut saat dibuka, kartu pos untuk setiap konfirmasi, dan botol pesan untuk ucapan.\n\nCocok untuk destination wedding dan pernikahan di tepi pantai.",
    title: "Pernikahan Mira & Raka",
    eventDate: "2027-09-18",
    venue: "Pantai Sample, Bali",
    people: [
      { role: "bride", fullName: "Mira Anindya", nickname: "Mira", father: "Bapak Sample Made", mother: "Ibu Sample Ayu", bio: "Putri pertama" },
      { role: "groom", fullName: "Raka Pratama", nickname: "Raka", father: "Bapak Sample Budi", mother: "Ibu Sample Rina", bio: "Putra kedua" },
    ],
    events: [
      { type: "Sakral", title: "Pemberkatan", date: "2027-09-18", start: "10:00", end: "11:30", venue: "Kapel Sample", address: "Jl. Contoh No. 2, Bali" },
      { type: "Perayaan", title: "Resepsi Senja", date: "2027-09-18", start: "16:00", end: "20:00", venue: "Pantai Sample", address: "Jl. Contoh No. 45, Bali", livestream: "https://www.youtube.com/" },
      { type: "Perpisahan", title: "Farewell Brunch", date: "2027-09-19", start: "09:00", end: "11:00", venue: "Kafe Sample", address: "Jl. Contoh No. 10, Bali" },
    ],
    dressCode: { description: "Linen dan warna laut: biru, putih, dan sentuhan jeruk.", groups: [{ label: "Tamu", colors: ["#1D3E9E", "#F7F4EC", "#E8743B"] }] },
  },
  {
    theme: "kelir-kencana",
    sortOrder: 5,
    tagline: "Pagelaran wayang di balik kelir emas.",
    description:
      "Pagelaran wayang kulit di balik kelir yang disinari blencong. Gunungan dicabut saat undangan dibuka, tokoh wayang mendampingi mempelai, dan tancep kayon menutup acara.\n\nCocok untuk pernikahan adat Jawa, tasyakuran, dan acara keluarga yang ingin bernuansa budaya.",
    title: "Pernikahan Ratri & Galih",
    eventDate: "2027-10-16",
    venue: "Pendopo Sample, Surakarta",
    people: [
      { role: "bride", fullName: "Ratri Wulandari", nickname: "Ratri", father: "Bapak Sample Harjono", mother: "Ibu Sample Sulastri", bio: "Putri kedua" },
      { role: "groom", fullName: "Galih Satriya Wibowo", nickname: "Galih", father: "Bapak Sample Darmaji", mother: "Ibu Sample Kartini", bio: "Putra pertama" },
    ],
    events: [
      { type: "Adat", title: "Siraman & Midodareni", date: "2027-10-15", start: "15:00", end: "21:00", venue: "Rumah Keluarga Sample", address: "Jl. Contoh No. 4, Surakarta" },
      { type: "Sakral", title: "Akad Nikah", date: "2027-10-16", start: "08:00", end: "10:00", venue: "Masjid Sample", address: "Jl. Contoh No. 11, Surakarta" },
      { type: "Perayaan", title: "Resepsi", date: "2027-10-16", start: "11:00", end: "14:00", venue: "Pendopo Sample", address: "Jl. Contoh No. 17, Surakarta", livestream: "https://www.youtube.com/" },
    ],
    dressCode: { description: "Batik bernuansa sogan atau merah prada.", groups: [{ label: "Tamu", colors: ["#3D2314", "#8E2B1F", "#C09435"] }] },
  },
].map((demo) => ({ ...common, ...demo }));

export const STORIES = [
  { title: "Pertama bertemu", year: "2019", description: "Cerita contoh: kami bertemu di sebuah acara kampus dan mulai berbincang tanpa henti." },
  { title: "Menjalin cerita", year: "2022", description: "Cerita contoh: dari teman dekat menjadi pasangan yang saling menguatkan." },
  { title: "Melangkah bersama", year: "2026", description: "Cerita contoh: dengan restu keluarga, kami memutuskan untuk melangkah ke jenjang berikutnya." },
];

export const GIFTS = [
  { type: "bank", provider: "Bank Sample", number: "1234567890", name: "Nama Mempelai Sample" },
  { type: "ewallet", provider: "Dompet Digital Sample", number: "081200000000", name: "Nama Mempelai Sample" },
];

export const WISHES = [
  { name: "Tamu Sample 1", message: "Selamat menempuh hidup baru! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah." },
  { name: "Tamu Sample 2", message: "Bahagia selalu untuk kalian berdua. Semoga langgeng sampai kakek nenek." },
  { name: "Tamu Sample 3", message: "Turut berbahagia! Maaf belum bisa hadir, doa terbaik dari jauh." },
  { name: "Tamu Sample 4", message: "Semoga cinta kalian terus tumbuh setiap hari. Selamat!" },
];
