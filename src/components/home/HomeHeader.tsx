import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { useColors } from "@/constants/colors";

const AVATAR_COLORS = [
  "#3538F8", "#E5484D", "#30A46C", "#E38E1A",
  "#6E56CF", "#0091FF", "#E93D82", "#299999",
  "#7C66DC", "#DB4324", "#3E9B4F", "#D97706",
] as const;

function getAvatarColor(letter: string) {
  const index = letter.toUpperCase().charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function HomeHeader() {
  const colors = useColors();
  const name = "Evelyn";
  const initial = name.charAt(0).toUpperCase();
  const avatarColor = getAvatarColor(initial);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
      <View className="flex-row items-center gap-3">
        <View
          className="h-12 w-12 rounded-full items-center justify-center"
          style={{ backgroundColor: avatarColor }}
        >
          <Text className="text-xl font-sans-bold text-white">{initial}</Text>
        </View>
        <View>
          <Text className="text-lg font-sans-bold text-foreground">
            Hi, Evelyn!
          </Text>
          <Text className="text-base font-sans text-muted">{today}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-4">
        <Pressable hitSlop={8}>
          <Feather name="edit-2" size={20} color={colors.muted} />
        </Pressable>
        <Pressable hitSlop={8} onPress={() => router.push("/settings")}>
          <Feather name="settings" size={20} color={colors.muted} />
        </Pressable>
      </View>
    </View>
  );
}
