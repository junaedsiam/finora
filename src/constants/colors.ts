import { useColorScheme } from "nativewind";

type Colors = {
  primary: string;
  foreground: string;
  muted: string;
  background: string;
  surface: string;
  border: string;
  income: string;
  expense: string;
};

const lightColors: Colors = {
  primary: "#3538F8",
  foreground: "#222222",
  muted: "#82828C",
  background: "#FFFFFF",
  surface: "#F7F7FA",
  border: "#E6E6EB",
  income: "#22C55E",
  expense: "#EF4444",
};

const darkColors: Colors = {
  primary: "#6366F1",
  foreground: "#F1F1F4",
  muted: "#9898A6",
  background: "#121218",
  surface: "#1C1C24",
  border: "#2C2C38",
  income: "#34D399",
  expense: "#F87171",
};

/**
 * Reactive hook for inline styles — returns theme-aware colors.
 * For Tailwind classes (bg-background, text-foreground, etc.) no hook needed.
 */
export function useColors(): Colors {
  const { colorScheme } = useColorScheme();
  return colorScheme === "dark" ? darkColors : lightColors;
}

/**
 * Static light colors for non-component contexts (e.g. navigation config).
 * Prefer useColors() in components.
 */
export const colors = lightColors;
