import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { colors } from "@/constants/colors";

type ScreenHeaderProps = {
  title: string;
  showBack?: boolean;
  showSettings?: boolean;
};

export function ScreenHeader({
  title,
  showBack = false,
  showSettings = true,
}: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
      <View className="flex-row items-center gap-3">
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="active:opacity-70"
          >
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
        )}
        <Text className="text-xl font-sans-bold text-foreground">{title}</Text>
      </View>
      {showSettings && (
        <Pressable
          onPress={() => router.push("/settings")}
          hitSlop={8}
          className="active:opacity-70"
        >
          <Feather name="settings" size={20} color={colors.muted} />
        </Pressable>
      )}
    </View>
  );
}
