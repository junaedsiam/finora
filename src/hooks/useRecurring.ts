import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRecurringByAccount,
  getRecurringById,
  getUpcomingRecurring,
  createRecurring,
  updateRecurring,
  deleteRecurring,
  getRecurringTransactions as getRecurringTransactionsRepo,
  getPendingRecurringTransactions as getPendingRecurringTransactionsRepo,
  getUpcomingRecurringWithPending as getUpcomingRecurringWithPendingRepo,
} from "@/repositories/recurring.repository";
import {
  createRecurringAtomic,
  updateRecurringAtomic,
  deleteRecurringAtomic,
  generatePendingTransactions,
  confirmRecurringTransactionAtomic,
  skipRecurringTransactionAtomic,
  modifyAndConfirmRecurringTransactionAtomic,
} from "@/services/recurring.service";
import { useAccountStore } from "@/stores/account.store";
import type { RecurringRow } from "@/types/database";

export function useRecurringList() {
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useQuery<RecurringRow[]>({
    queryKey: ["recurring-list", activeAccountId],
    queryFn: () => getRecurringByAccount(activeAccountId),
    enabled: !!activeAccountId,
  });
}

export function useRecurring(id: number) {
  return useQuery<RecurringRow | null>({
    queryKey: ["recurring-detail", id],
    queryFn: () => getRecurringById(id),
    enabled: !!id,
  });
}

export function useUpcomingRecurring() {
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useQuery<RecurringRow[]>({
    queryKey: ["upcoming-recurring", activeAccountId],
    queryFn: () => getUpcomingRecurring(activeAccountId),
    enabled: !!activeAccountId,
  });
}

export function useCreateRecurring() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: async (params: {
      walletId: number;
      categoryId: number;
      destinationWalletId?: number | null;
      type: RecurringRow["type"];
      amount: number;
      frequency: RecurringRow["frequency"];
      nextDueDate: string;
      startDate?: string;
      note?: string | null;
    }) =>
      createRecurringAtomic({ accountId: activeAccountId, ...params }),
    onSuccess: () => {
      try {
        generatePendingTransactions(activeAccountId);
      } catch (e) {
        console.warn("Failed to generate pending recurring after creation:", e);
      }
      qc.invalidateQueries({ queryKey: ["recurring-list", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["upcoming-recurring", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["upcoming-recurring-with-pending", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["pending-recurring-transactions", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["transactions", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["wallets", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["balance", activeAccountId] });
    },
  });
}

export function useUpdateRecurring() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: async (params: {
      id: number;
      walletId?: number;
      categoryId?: number;
      destinationWalletId?: number | null;
      type?: RecurringRow["type"];
      amount?: number;
      frequency?: RecurringRow["frequency"];
      nextDueDate?: string;
      startDate?: string;
      note?: string | null;
      isActive?: boolean;
    }) => {
      updateRecurringAtomic(params);
      return params.id;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["recurring-list", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["recurring-detail", vars.id] });
      qc.invalidateQueries({ queryKey: ["upcoming-recurring", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["upcoming-recurring-with-pending", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["pending-recurring-transactions", activeAccountId] });
    },
  });
}

export function useDeleteRecurring() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: async (id: number) => {
      deleteRecurringAtomic(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recurring-list", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["upcoming-recurring", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["upcoming-recurring-with-pending", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["pending-recurring-transactions", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["transactions", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["wallets", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["balance", activeAccountId] });
    },
  });
}

export function useGeneratePending() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: async () => {
      generatePendingTransactions(activeAccountId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recurring-list", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["upcoming-recurring", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["upcoming-recurring-with-pending", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["pending-recurring-transactions", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["transactions", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["wallets", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["balance", activeAccountId] });
    },
  });
}

export function useConfirmRecurring() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: async (transactionId: number) => {
      confirmRecurringTransactionAtomic(transactionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pending-recurring-transactions", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["upcoming-recurring", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["upcoming-recurring-with-pending", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["transactions", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["wallets", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["balance", activeAccountId] });
    },
  });
}

export function useSkipRecurring() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: async (transactionId: number) => {
      skipRecurringTransactionAtomic(transactionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pending-recurring-transactions", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["upcoming-recurring", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["upcoming-recurring-with-pending", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["transactions", activeAccountId] });
    },
  });
}

export function useModifyRecurring() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: async (params: { transactionId: number; newAmount: number }) => {
      modifyAndConfirmRecurringTransactionAtomic(params.transactionId, params.newAmount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pending-recurring-transactions", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["upcoming-recurring", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["upcoming-recurring-with-pending", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["transactions", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["wallets", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["balance", activeAccountId] });
    },
  });
}

export function useRecurringTransactions(recurringId: number) {
  return useQuery({
    queryKey: ["recurring-transactions", recurringId],
    queryFn: () => getRecurringTransactionsRepo(recurringId),
    enabled: !!recurringId,
  });
}

export function usePendingRecurringTransactions() {
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useQuery({
    queryKey: ["pending-recurring-transactions", activeAccountId],
    queryFn: () => getPendingRecurringTransactionsRepo(activeAccountId),
    enabled: !!activeAccountId,
  });
}

export function useUpcomingRecurringWithPending() {
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useQuery({
    queryKey: ["upcoming-recurring-with-pending", activeAccountId],
    queryFn: () => getUpcomingRecurringWithPendingRepo(activeAccountId),
    enabled: !!activeAccountId,
  });
}
