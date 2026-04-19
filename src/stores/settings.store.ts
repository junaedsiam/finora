import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type StartupScreen = "index" | "transactions" | "calendar" | "stats";
export type ThemePreference = "light" | "dark" | "system";

type SettingsState = {
  startupScreen: StartupScreen;
  theme: ThemePreference;
  setStartupScreen: (screen: StartupScreen) => void;
  setTheme: (theme: ThemePreference) => void;
};

export const STARTUP_SCREEN_OPTIONS: {
  id: StartupScreen;
  label: string;
  icon: string;
}[] = [
  { id: "index", label: "Home", icon: "home" },
  { id: "transactions", label: "Transaction", icon: "repeat" },
  { id: "calendar", label: "Calendar", icon: "calendar" },
  { id: "stats", label: "Analytics", icon: "pie-chart" },
];

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      startupScreen: "index",
      theme: "system",
      setStartupScreen: (screen) => set({ startupScreen: screen }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "finora-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
