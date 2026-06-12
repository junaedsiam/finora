import "../global.css";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useSettingsStore } from "@/stores/settings.store";
import { useAccountStore } from "@/stores/account.store";
import { seedDatabase } from "@/db/seed";
import { generatePendingTransactions } from "@/services/recurring.service";
// import { logDbState, logWallets } from "@/db/debug";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const activeAccountId = useAccountStore((s) => s.activeAccountId);

  useEffect(() => {
    seedDatabase();
    // Generate pending recurring transactions on startup
    try {
      generatePendingTransactions(activeAccountId);
    } catch (e) {
      console.warn("Failed to generate pending recurring transactions:", e);
    }
    // logDbState();
    // logWallets();
    setReady(true);
  }, [activeAccountId]);

  if (!ready) return null;
  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const theme = useSettingsStore((s) => s.theme);
  const { colorScheme, setColorScheme } = useColorScheme();

  const statusBarStyle =
    theme === "system"
      ? colorScheme === "dark"
        ? "light"
        : "dark"
      : theme === "dark"
        ? "light"
        : "dark";

  useEffect(() => {
    if (theme === "system") {
      setColorScheme("system");
    } else {
      setColorScheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView className="flex-1">
      <StatusBar style={statusBarStyle} />
      <QueryClientProvider client={queryClient}>
        <DatabaseProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="settings"
              options={{
                headerShown: false,
                animation: "none",
              }}
            />
            <Stack.Screen
              name="debt"
              options={{
                headerShown: false,
                animation: "none",
              }}
            />
            <Stack.Screen
              name="recurring"
              options={{
                headerShown: false,
                animation: "none",
              }}
            />
            <Stack.Screen
              name="stats"
              options={{
                headerShown: false,
                animation: "none",
              }}
            />
            <Stack.Screen
              name="budget"
              options={{
                headerShown: false,
                animation: "none",
              }}
            />
            <Stack.Screen
              name="(modals)"
              options={{
                headerShown: false,
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
          </Stack>
        </DatabaseProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
