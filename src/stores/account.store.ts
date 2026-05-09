import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AccountState = {
  activeAccountId: number;
  setActiveAccountId: (id: number) => void;
};

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      activeAccountId: 1,
      setActiveAccountId: (id) => set({ activeAccountId: id }),
    }),
    {
      name: "finora-account",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
