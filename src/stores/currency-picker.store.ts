import { create } from "zustand";

type CurrencyPickerState = {
  selectedCode: string | null;
  setSelectedCode: (code: string | null) => void;
};

export const useCurrencyPickerStore = create<CurrencyPickerState>((set) => ({
  selectedCode: null,
  setSelectedCode: (code) => set({ selectedCode: code }),
}));