import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllAccounts, createAccount, updateAccount } from "@/repositories/account.repository";
import type { AccountRow } from "@/types/database";

export function useAccounts() {
  return useQuery<AccountRow[]>({
    queryKey: ["accounts"],
    queryFn: getAllAccounts,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, currency }: { name: string; currency: string }) =>
      createAccount(name, currency),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, currency }: { id: number; name: string; currency: string }) =>
      updateAccount(id, name, currency),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}
