import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWalletsByAccount,
  createWallet,
  updateWallet,
  updateWalletBalance,
  deleteWallet,
  updateWalletSortOrders,
} from "@/repositories/wallet.repository";
import { useAccountStore } from "@/stores/account.store";
import type { WalletRow } from "@/types/database";

export function useWallets() {
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useQuery<WalletRow[]>({
    queryKey: ["wallets", activeAccountId],
    queryFn: () => getWalletsByAccount(activeAccountId),
  });
}

export function useWallet(id: number) {
  return useQuery<WalletRow | null>({
    queryKey: ["wallet", id],
    queryFn: () => {
      const { getWalletById } = require("@/repositories/wallet.repository");
      return getWalletById(id);
    },
  });
}

export function useCreateWallet() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: (params: {
      name: string;
      type: string;
      balance: number;
      color: string;
      icon: string;
    }) => createWallet(activeAccountId, params.name, params.type, params.balance, params.color, params.icon),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wallets", activeAccountId] }),
  });
}

export function useUpdateWallet() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: (params: { id: number; name: string; type: string; color: string; icon: string; is_excluded?: number }) =>
      updateWallet(params.id, params.name, params.type, params.color, params.icon, params.is_excluded),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wallets", activeAccountId] }),
  });
}

export function useUpdateWalletBalance() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: ({ id, balance }: { id: number; balance: number }) =>
      updateWalletBalance(id, balance),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wallets", activeAccountId] }),
  });
}

export function useDeleteWallet() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: (id: number) => deleteWallet(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wallets", activeAccountId] }),
  });
}

export function useUpdateWalletSortOrders() {
  const qc = useQueryClient();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  return useMutation({
    mutationFn: (orders: { id: number; sort_order: number }[]) =>
      updateWalletSortOrders(orders),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wallets", activeAccountId] }),
  });
}
