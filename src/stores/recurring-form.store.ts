import { create } from "zustand";

export type PickerItem = {
  id: string;
  name: string;
  subtitle?: string;
  icon: string;
  color: string;
};

type RecurringFormState = {
  category: PickerItem | null;
  wallet: PickerItem | null;
  setCategory: (item: PickerItem) => void;
  setWallet: (item: PickerItem) => void;
  reset: () => void;
};

export const useRecurringFormStore = create<RecurringFormState>((set) => ({
  category: null,
  wallet: null,
  setCategory: (item) => set({ category: item }),
  setWallet: (item) => set({ wallet: item }),
  reset: () => set({ category: null, wallet: null }),
}));
