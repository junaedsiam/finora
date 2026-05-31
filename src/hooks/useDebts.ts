import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDebtsByAccount,
  getAllDebtsByAccount,
  getDebtById,
  createDebt,
  updateDebt,
  deleteDebt,
} from "@/repositories/debt.repository";
import { settleDebtAtomic } from "@/services/debt.service";
import { useAccountStore } from "@/stores/account.store";
import type { DebtRow } from "@/types/database";

export function useDebts() {
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useQuery<DebtRow[]>({
    queryKey: ["debts", activeAccountId],
    queryFn: () => getDebtsByAccount(activeAccountId),
  });
}

export function useAllDebts() {
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useQuery<DebtRow[]>({
    queryKey: ["all-debts", activeAccountId],
    queryFn: () => getAllDebtsByAccount(activeAccountId),
  });
}

export function useDebt(id: number) {
  return useQuery<DebtRow | null>({
    queryKey: ["debt", id],
    queryFn: () => getDebtById(id),
  });
}

export function useCreateDebt() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: async (params: {
      name: string;
      type: "borrow" | "lend";
      originalAmount: number;
      remainingAmount: number;
      dueDate?: string | null;
      walletId?: number | null;
    }) => createDebt({ accountId: activeAccountId, ...params }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["debts", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["all-debts", activeAccountId] });
    },
  });
}

export function useUpdateDebt() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: async (params: {
      id: number;
      name?: string;
      type?: "borrow" | "lend";
      originalAmount?: number;
      remainingAmount?: number;
      dueDate?: string | null;
      walletId?: number | null;
      isSettled?: boolean;
    }) => updateDebt(params.id, params),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["debts", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["all-debts", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["debt", vars.id] });
    },
  });
}

export function useDeleteDebt() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: async (id: number) => deleteDebt(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["debts", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["all-debts", activeAccountId] });
    },
  });
}

export function useSettleDebt() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: async (params: {
      debtId: number;
      walletId: number;
      categoryId: number;
      amount: number;
      debtType: "borrow" | "lend";
      note?: string | null;
    }) =>
      settleDebtAtomic({ accountId: activeAccountId, ...params }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["debts", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["all-debts", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["debt", vars.debtId] });
      qc.invalidateQueries({ queryKey: ["transactions", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["wallets", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["balance", activeAccountId] });
    },
  });
}
