import { useQuery } from "@tanstack/react-query";
import {
  getTransactionStatsByCategory,
  getTransactionsByCategoryAndPeriod,
  type CategoryStatRow,
} from "@/repositories/transaction.repository";
import { useAccountStore } from "@/stores/account.store";
import type { TransactionRow } from "@/types/database";

export function useCategoryStats(
  startDate: string,
  endDate: string,
  type: "income" | "expense",
) {
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useQuery<CategoryStatRow[]>({
    queryKey: ["stats", activeAccountId, startDate, endDate, type],
    queryFn: () =>
      getTransactionStatsByCategory(activeAccountId, startDate, endDate, type),
    enabled: !!activeAccountId && !!startDate && !!endDate,
  });
}

export function useCategoryTransactions(
  categoryId: number,
  startDate: string,
  endDate: string,
  type: "income" | "expense",
) {
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useQuery<TransactionRow[]>({
    queryKey: [
      "transactions",
      activeAccountId,
      "category",
      categoryId,
      startDate,
      endDate,
      type,
    ],
    queryFn: () =>
      getTransactionsByCategoryAndPeriod(
        activeAccountId,
        categoryId,
        startDate,
        endDate,
        type,
      ),
    enabled: !!activeAccountId && !!categoryId && !!startDate && !!endDate,
  });
}
