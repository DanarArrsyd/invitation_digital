const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** 149000 → "Rp 149.000" (regular space, so it can be matched and wrapped). */
export function formatRupiah(amount: number): string {
  return rupiah.format(amount).replace(/\s/g, " ");
}

export interface PackagePrice {
  /** "Rp 149.000" or "Tanya harga". */
  label: string;
  /** Optional qualifier such as "mulai dari" or "per undangan". */
  note: string | null;
  hasPrice: boolean;
}

export function describePackagePrice(offer: { price_idr: number | null; price_note: string | null } | null): PackagePrice {
  const note = offer?.price_note?.trim() || null;
  if (offer?.price_idr == null) return { label: "Tanya harga", note, hasPrice: false };
  return { label: formatRupiah(offer.price_idr), note, hasPrice: true };
}
