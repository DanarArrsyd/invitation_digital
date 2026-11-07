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

/** Where a visitor came from, read from utm_source / utm_campaign. */
export interface VisitSource {
  source: string;
  campaign: string | null;
}

const SOURCE_VALUE_MAX = 60;

/**
 * Keeps a UTM value safe to put in a pre-filled message: lowercase letters,
 * digits, dot, dash and underscore only. Anything else becomes a dash, so a
 * crafted link cannot write free text into the customer's message.
 */
export function cleanSourceValue(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SOURCE_VALUE_MAX);
  return cleaned || null;
}

/** Adds "(Sumber: instagram/poster-uts)" when a source is known; otherwise the message is unchanged. */
export function appendSourceAttribution(message: string, visit: VisitSource | null): string {
  if (!visit) return message;
  const label = visit.campaign ? `${visit.source}/${visit.campaign}` : visit.source;
  return `${message} (Sumber: ${label})`;
}

/** The one place a marketing WhatsApp link is built. */
export function buildOrderWhatsAppUrl(
  number: string,
  template: string,
  values: Partial<OrderMessageValues>,
  visit: VisitSource | null = null,
): string {
  return buildWhatsAppUrl(number, appendSourceAttribution(buildOrderMessage(template, values), visit));
}
