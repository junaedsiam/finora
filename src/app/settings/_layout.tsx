import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "none" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="accounts" />
      <Stack.Screen name="edit-account" />
      <Stack.Screen name="currency-picker" />
      <Stack.Screen name="wallets" />
      <Stack.Screen name="edit-wallet" />
      <Stack.Screen name="icon-picker" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="edit-category" />
      <Stack.Screen name="startup-screen" />
      <Stack.Screen name="theme" />
    </Stack>
  );
}
