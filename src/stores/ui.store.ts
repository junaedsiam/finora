import { create } from "zustand";

type UIStore = {
  balanceVisible: boolean;
  toggleBalanceVisible: () => void;
};

export const useUIStore = create<UIStore>((set) => ({
  balanceVisible: true,
  toggleBalanceVisible: () =>
    set((state) => ({ balanceVisible: !state.balanceVisible })),
}));
