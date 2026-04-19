import { Stack } from "expo-router";
import { useColors } from "@/constants/colors";

export default function RecurringLayout() {
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
