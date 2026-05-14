import { currencies } from "@/constants/currencies";

const currencySymbolMap = new Map(currencies.map((c) => [c.code, c.symbol]));

export function formatCurrency(
  amount: number,
  options?: { decimals?: boolean; currency?: string; abbreviate?: boolean },
): string {
  const { decimals = true, currency = "USD", abbreviate = false } = options ?? {};
  const symbol = currencySymbolMap.get(currency) ?? currency;

  if (abbreviate) {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? "-" : "";
    if (abs >= 1_000_000_000) {
      return `${sign}${symbol}${(abs / 1_000_000_000).toFixed(2)}B`;
    }
    if (abs >= 1_000_000) {
      return `${sign}${symbol}${(abs / 1_000_000).toFixed(2)}M`;
    }
    if (abs >= 1_000) {
      return `${sign}${symbol}${(abs / 1_000).toFixed(1)}K`;
    }
    return `${sign}${symbol}${abs.toFixed(decimals ? 2 : 0)}`;
  }

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(amount);
  return `${symbol}${formatted}`;
}
