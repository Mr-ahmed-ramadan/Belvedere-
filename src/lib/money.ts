// Currency formatting. Default GBP; override with CURRENCY (ISO code) and
// NEXT_PUBLIC_CURRENCY so client components can read it too.
const CURRENCY =
  process.env.NEXT_PUBLIC_CURRENCY || process.env.CURRENCY || "GBP";
const LOCALE = process.env.MONEY_LOCALE || "en-GB";

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Parse a user-entered money string ("1,234.50", "-80") to a number. */
export function parseMoney(value: string): number | null {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
