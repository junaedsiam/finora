import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import {
  useSettingsStore,
  type ThemePreference,
} from "@/stores/settings.store";
import { useColors } from "@/constants/colors";

const THEME_OPTIONS: {
  id: ThemePreference;
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
}[] = [
  { id: "system", label: "System Default", icon: "smartphone" },
  { id: "light", label: "Light", icon: "sun" },
  { id: "dark", label: "Dark", icon: "moon" },
];

export default function ThemeSetting() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { theme, setTheme } = useSettingsStore();

  function handleSelect(id: ThemePreference) {
    setTheme(id);
    router.back();
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4 gap-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="active:opacity-70"
        >
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="flex-1 text-xl font-sans-bold text-foreground">
          Theme
        </Text>
      </View>

      {/* Options */}
      <View className="px-4">
        {THEME_OPTIONS.map((option) => {
          const isSelected = option.id === theme;
          return (
            <Pressable
              key={option.id}
              onPress={() => handleSelect(option.id)}
              className="flex-row items-center py-4"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View className="h-12 w-12 items-center justify-center rounded-full bg-surface">
                <Feather
                  name={option.icon}
                  size={20}
                  color={isSelected ? colors.primary : colors.muted}
                />
              </View>

              <Text
                className="flex-1 text-lg text-foreground ml-3"
                style={{ fontFamily: "Inter_500Medium" }}
              >
                {option.label}
              </Text>

              <View
                className="h-6 w-6 items-center justify-center rounded-full border-2"
                style={{
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: isSelected ? colors.primary : "transparent",
                }}
              >
                {isSelected && (
                  <View className="h-2.5 w-2.5 rounded-full bg-white" />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
