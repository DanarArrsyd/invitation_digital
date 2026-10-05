/** Digits only, country code first, no "+": what wa.me and site_settings expect. */
const WHATSAPP_NUMBER_PATTERN = /^[1-9][0-9]{7,14}$/;

/**
 * Accepts what an admin is likely to type ("0812-3456-7890", "+62 812 3456 7890",
 * "6281234567890") and returns the wa.me form, or null when it cannot be a
 * phone number. A leading 0 is read as an Indonesian number.
 */
export function normalizeWhatsAppNumber(input: string): string | null {
  let digits = input.replace(/[\s\-().+]/g, "");
  if (!/^[0-9]+$/.test(digits)) return null;
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  return WHATSAPP_NUMBER_PATTERN.test(digits) ? digits : null;
}

export interface OrderMessageValues {
  template: string;
  paket: string;
  acara: string;
}

/**
 * Fills {template}, {paket} and {acara}. A missing value removes its
 * placeholder together with the connecting words around it, so a generic
 * "Pesan via WhatsApp" button still produces a natural sentence.
 */
export function buildOrderMessage(template: string, values: Partial<OrderMessageValues>): string {
  let message = template;
  if (!values.template) message = message.replace(/\s*template\s*\{template\}/i, "");
  if (!values.paket) message = message.replace(/\s*paket\s*\{paket\}/i, "");
  if (!values.acara) message = message.replace(/\s*untuk\s*\{acara\}/i, "");
  return message
    .replace(/\{template\}/g, values.template ?? "")
    .replace(/\{paket\}/g, values.paket ?? "")
    .replace(/\{acara\}/g, values.acara ?? "")
    .replace(/\s+([.,!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function buildWhatsAppUrl(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
