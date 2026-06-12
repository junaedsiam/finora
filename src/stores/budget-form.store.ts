import { create } from "zustand";

export type PickerItem = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type BudgetFormState = {
  name: string;
  amount: string;
  startDate: Date;
  endDate: Date | null;
  period: "weekly" | "monthly" | "yearly" | "custom";
  categories: PickerItem[];
  setName: (name: string) => void;
  setAmount: (amount: string) => void;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date | null) => void;
  setPeriod: (period: BudgetFormState["period"]) => void;
  addCategory: (item: PickerItem) => void;
  removeCategory: (id: string) => void;
  toggleCategory: (item: PickerItem) => void;
  setCategories: (items: PickerItem[]) => void;
  reset: () => void;
};

export const useBudgetFormStore = create<BudgetFormState>((set) => ({
  name: "",
  amount: "",
  startDate: new Date(),
  endDate: null,
  period: "monthly",
  categories: [],
  setName: (name) => set({ name }),
  setAmount: (amount) => set({ amount }),
  setStartDate: (startDate) => set({ startDate }),
  setEndDate: (endDate) => set({ endDate }),
  setPeriod: (period) => set({ period }),
  addCategory: (item) =>
    set((state) => ({
      categories: [...state.categories, item],
    })),
  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),
  toggleCategory: (item) =>
    set((state) => {
      const exists = state.categories.some((c) => c.id === item.id);
      if (exists) {
        return { categories: state.categories.filter((c) => c.id !== item.id) };
      }
      return { categories: [...state.categories, item] };
    }),
  setCategories: (items) => set({ categories: items }),
  reset: () =>
    set({
      name: "",
      amount: "",
      startDate: new Date(),
      endDate: null,
      period: "monthly",
      categories: [],
    }),
}));
