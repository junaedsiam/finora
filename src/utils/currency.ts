import { currencies } from "@/constants/currencies";

const currencySymbolMap = new Map(currencies.map((c) => [c.code, c.symbol]));

export function formatCurrency(
  amount: number,
  options?: { decimals?: boolean; currency?: string },
): string {
  const { decimals = true, currency = "USD" } = options ?? {};
  const symbol = currencySymbolMap.get(currency) ?? currency;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(amount);
  return `${symbol}${formatted}`;
}
