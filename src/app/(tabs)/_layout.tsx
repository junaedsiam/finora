import { useState, useEffect, useRef } from "react";
import { Tabs, useRouter } from "expo-router";
import { CustomTabBar } from "@/components/navigation/CustomTabBar";
import { useSettingsStore } from "@/stores/settings.store";

export default function TabLayout() {
  const router = useRouter();
  const hasRedirected = useRef(false);
  const [hydrated, setHydrated] = useState(useSettingsStore.persist.hasHydrated());
  const startupScreen = useSettingsStore((s) => s.startupScreen);

  useEffect(() => {
    if (hydrated) return;
    return useSettingsStore.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || hasRedirected.current) return;
    hasRedirected.current = true;
    if (startupScreen && startupScreen !== "index") {
      router.replace(`/(tabs)/${startupScreen}`);
    }
  }, [hydrated]);

  if (!hydrated) return null;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="transactions" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="stats" />
    </Tabs>
  );
}
