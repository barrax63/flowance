import type { Currency } from "@/types";

/**
 * Small currency catalog. Add more freely — `numberLocale` controls grouping
 * and decimal separators independently from the UI language.
 */
export const CURRENCIES: Record<string, Currency> = {
  EUR: { code: "EUR", symbol: "€", numberLocale: "de-DE" },
  USD: { code: "USD", symbol: "$", numberLocale: "en-US" },
  GBP: { code: "GBP", symbol: "£", numberLocale: "en-GB" },
  CHF: { code: "CHF", symbol: "CHF", numberLocale: "de-CH" },
  JPY: { code: "JPY", symbol: "¥", numberLocale: "ja-JP" },
  CAD: { code: "CAD", symbol: "C$", numberLocale: "en-CA" },
  AUD: { code: "AUD", symbol: "A$", numberLocale: "en-AU" },
  SEK: { code: "SEK", symbol: "kr", numberLocale: "sv-SE" },
};

/** Format a numeric amount with the active currency. */
export function formatMoney(value: number, currency: Currency): string {
  // JPY has no fractional units; everything else uses 2 decimals.
  const fractionDigits = currency.code === "JPY" ? 0 : 2;
  return new Intl.NumberFormat(currency.numberLocale, {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
