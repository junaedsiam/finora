import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useSettingsStore } from "@/stores/settings.store";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const theme = useSettingsStore((s) => s.theme);
  const { setColorScheme } = useColorScheme();

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
        name="(modals)"
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
