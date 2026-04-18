import { create } from "zustand";

export type PickerItem = {
  id: string;
  name: string;
  subtitle?: string;
  icon: string;
  color: string;
};

type TransactionFormState = {
  category: PickerItem | null;
  fromWallet: PickerItem | null;
  toWallet: PickerItem | null;
  setCategory: (item: PickerItem) => void;
  setFromWallet: (item: PickerItem) => void;
  setToWallet: (item: PickerItem) => void;
  reset: () => void;
};

export const useTransactionFormStore = create<TransactionFormState>((set) => ({
  category: null,
  fromWallet: null,
  toWallet: null,
  setCategory: (item) => set({ category: item }),
  setFromWallet: (item) => set({ fromWallet: item }),
  setToWallet: (item) => set({ toWallet: item }),
  reset: () => set({ category: null, fromWallet: null, toWallet: null }),
}));
