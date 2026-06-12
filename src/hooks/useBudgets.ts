import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBudgetsByAccount,
  getBudgetById,
  getBudgetWithCategories,
  getBudgetSpent,
  getBudgetsWithProgress,
  createBudget,
  updateBudget,
  deleteBudget,
} from "@/repositories/budget.repository";
import { getBudgetsWithSpent, getBudgetProgress } from "@/services/budget.service";
import { useAccountStore } from "@/stores/account.store";
import type { BudgetRow } from "@/types/database";

export function useBudgets() {
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useQuery({
    queryKey: ["budgets", activeAccountId],
    queryFn: () => getBudgetsWithProgress(activeAccountId),
    enabled: !!activeAccountId,
  });
}

export function useBudget(id: number) {
  return useQuery({
    queryKey: ["budget", id],
    queryFn: () => getBudgetWithCategories(id),
    enabled: !!id,
  });
}

export function useBudgetProgress(id: number, startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["budget-progress", id, startDate, endDate],
    queryFn: () => getBudgetProgress(id, startDate, endDate),
    enabled: !!id && !!startDate && !!endDate,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: async (params: {
      name: string;
      amount: number;
      period: BudgetRow["period"];
      startDate: string;
      endDate?: string | null;
      categoryIds: number[];
    }) => {
      return createBudget({ accountId: activeAccountId, ...params });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets", activeAccountId] });
    },
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: async (params: {
      id: number;
      name?: string;
      amount?: number;
      period?: BudgetRow["period"];
      startDate?: string;
      endDate?: string | null;
      categoryIds?: number[];
    }) => {
      updateBudget(params.id, params);
      return params.id;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["budgets", activeAccountId] });
      qc.invalidateQueries({ queryKey: ["budget", vars.id] });
    },
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: async (id: number) => {
      deleteBudget(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets", activeAccountId] });
    },
  });
}
