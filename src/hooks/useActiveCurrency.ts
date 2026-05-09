import { useAccountStore } from "@/stores/account.store";
import { useAccounts } from "@/hooks/useAccount";

export function useActiveCurrency(): string {
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  const { data: accounts = [] } = useAccounts();
  const activeAccount = accounts.find((a) => a.id === activeAccountId);
  return activeAccount?.currency ?? "USD";
}
