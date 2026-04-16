import { View, Text, Pressable } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { colors } from "@/constants/colors";

export function HomeHeader() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
      <View className="flex-row items-center gap-3">
        {/* Avatar placeholder */}
        <View className="h-12 w-12 rounded-full bg-surface" />
        <View>
          <Text className="text-lg font-sans-bold text-foreground">
            Hi, Evelyn!
          </Text>
          <Text className="text-sm font-sans text-muted">{today}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-4">
        <Pressable hitSlop={8}>
          <Feather name="edit-2" size={20} color={colors.muted} />
        </Pressable>
        <Pressable hitSlop={8}>
          <Feather name="settings" size={20} color={colors.muted} />
        </Pressable>
      </View>
    </View>
  );
}
