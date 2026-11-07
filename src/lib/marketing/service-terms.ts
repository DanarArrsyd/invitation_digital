/** Order terms shown under the packages and in the FAQ; change them here only. */
export const SERVICE_TERMS = {
  workingDays: 3,
  revisions: 2,
  downPaymentPercent: 50,
} as const;

export const SERVICE_TERMS_SUMMARY = [
  `Pengerjaan ${SERVICE_TERMS.workingDays} hari kerja sejak data lengkap`,
  `Revisi hingga ${SERVICE_TERMS.revisions} kali`,
  `DP ${SERVICE_TERMS.downPaymentPercent}%, pelunasan saat undangan terbit`,
] as const;

export const SERVICE_TERMS_ANSWER =
  `Undangan selesai dalam ${SERVICE_TERMS.workingDays} hari kerja sejak data Anda kami terima lengkap, ` +
  `termasuk revisi hingga ${SERVICE_TERMS.revisions} kali. Pembayaran cukup DP ${SERVICE_TERMS.downPaymentPercent}% di awal, ` +
  "pelunasan saat undangan terbit.";
