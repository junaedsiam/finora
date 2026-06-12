import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTransactionsByAccount,
  getTransactionById,
} from "@/repositories/transaction.repository";
import {
  createTransactionAtomic,
  updateTransactionAtomic,
  deleteTransactionAtomic,
} from "@/services/transaction.service";
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
    mutationFn: async (params: {
      walletId: number;
      destinationWalletId?: number | null;
      categoryId?: number | null;
      type: TransactionType;
      amount: number;
      note?: string | null;
      status?: TransactionStatus;
      createdAt?: string;
    }) =>
      createTransactionAtomic({ accountId: activeAccountId, ...params }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["wallets", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["balance", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["budgets", activeAccountId] });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: async (params: {
      id: number;
      walletId?: number;
      destinationWalletId?: number | null;
      categoryId?: number | null;
      amount?: number;
      note?: string | null;
      status?: TransactionStatus;
    }) => {
      updateTransactionAtomic(params);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["wallets", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["balance", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["budgets", activeAccountId] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: async (id: number) => {
      deleteTransactionAtomic(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["wallets", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["balance", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["budgets", activeAccountId] });
    },
  });
}