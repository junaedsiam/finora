import { create } from "zustand";

type IconPickerState = {
  selectedIcon: string | null;
  setSelectedIcon: (icon: string | null) => void;
};

export const useIconPickerStore = create<IconPickerState>((set) => ({
  selectedIcon: null,
  setSelectedIcon: (icon) => set({ selectedIcon: icon }),
}));