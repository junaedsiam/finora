export function formatCurrency(
  amount: number,
  options?: { decimals?: boolean },
): string {
  const { decimals = true } = options ?? {};
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(amount);
}
