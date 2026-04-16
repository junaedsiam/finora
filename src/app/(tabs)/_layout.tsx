import { Tabs } from "expo-router";
import { CustomTabBar } from "@/components/navigation/CustomTabBar";

export default function TabLayout() {
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
