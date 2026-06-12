import { create } from "zustand";

export type PickerWallet = {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
};

type WalletPickerStore = {
  selectedWallet: PickerWallet | null;
  setSelectedWallet: (wallet: PickerWallet | null) => void;
  clearSelectedWallet: () => void;
};

export const useWalletPickerStore = create<WalletPickerStore>((set) => ({
  selectedWallet: null,
  setSelectedWallet: (wallet) => set({ selectedWallet: wallet }),
  clearSelectedWallet: () => set({ selectedWallet: null }),
}));
