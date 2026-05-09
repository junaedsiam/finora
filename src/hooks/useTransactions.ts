import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTransactionsByAccount,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/repositories/transaction.repository";
import { useAccountStore } from "@/stores/account.store";
import type { TransactionRow, TransactionType, TransactionStatus } from "@/types/database";

export function useTransactions() {
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useQuery<TransactionRow[]>({
    queryKey: ["transactions", activeAccountId],
    queryFn: () => getTransactionsByAccount(activeAccountId),
  });
}

export function useTransaction(id: number) {
  return useQuery<TransactionRow | null>({
    queryKey: ["transaction", id],
    queryFn: () => getTransactionById(id),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: (params: {
      walletId: number;
      destinationWalletId?: number | null;
      categoryId: number;
      type: TransactionType;
      amount: number;
      note?: string | null;
      status?: TransactionStatus;
      createdAt?: string;
    }) => createTransaction({ accountId: activeAccountId, ...params }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["wallets", activeAccountId] });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: (params: {
      id: number;
      walletId?: number;
      destinationWalletId?: number | null;
      categoryId?: number;
      amount?: number;
      note?: string | null;
      status?: TransactionStatus;
    }) => updateTransaction(params.id, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions", activeAccountId] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: (id: number) => deleteTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["wallets", activeAccountId] });
    },
  });
}