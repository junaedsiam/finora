import { Stack } from "expo-router";
import { useColors } from "@/constants/colors";

export default function ModalLayout() {
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="add-transaction"
        options={{
          contentStyle: { backgroundColor: "transparent" },
          animation: "slide_from_bottom",
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="select-category"
        options={{
          animation: "slide_from_right",
          contentStyle: { backgroundColor: colors.background },
        }}
      />
      <Stack.Screen
        name="select-wallet"
        options={{
          animation: "slide_from_right",
          contentStyle: { backgroundColor: colors.background },
        }}
      />
      <Stack.Screen
        name="custom-date-range"
        options={{
          animation: "slide_from_bottom",
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </Stack>
  );
}
