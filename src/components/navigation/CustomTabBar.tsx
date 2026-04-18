import { Fragment } from "react";
import { View, Pressable, Text } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Feather from "@expo/vector-icons/Feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/constants/colors";

const TAB_CONFIG = [
  { name: "index", label: "Home", icon: "home" },
  { name: "transactions", label: "Transaction", icon: "repeat" },
  { name: "calendar", label: "Calendar", icon: "calendar" },
  { name: "stats", label: "Analytics", icon: "bar-chart-2" },
] as const;

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View className="relative bg-background border-t border-border">
      {/* FAB — centered above the tab bar */}
      <View
        className="absolute left-0 right-0 items-center z-10"
        style={{ top: -10 }}
        pointerEvents="box-none"
      >
        <Pressable
          className="h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg"
          onPress={() => router.push("/(modals)/add-transaction")}
          hitSlop={4}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Feather name="plus" size={30} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Tab items */}
      <View
        className="flex-row items-stretch"
        style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      >
        {TAB_CONFIG.map((tab, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: state.routes[index].key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(state.routes[index].name);
            }
          };

          return (
            <Fragment key={tab.name}>
              {/* Spacer for FAB gap before the 3rd tab */}
              {index === 2 && <View className="flex-1" />}
              <Pressable
                onPress={onPress}
                hitSlop={4}
                className="flex-1 items-center justify-center gap-1 py-3"
                style={({ pressed }) => ({
                  backgroundColor: pressed
                    ? "rgba(53, 56, 248, 0.1)"
                    : "transparent",
                })}
              >
                <Feather
                  name={tab.icon}
                  size={22}
                  color={isFocused ? colors.primary : colors.muted}
                />
                <Text
                  className={`text-[10px] ${isFocused ? "text-primary" : "text-muted"}`}
                  style={{
                    fontFamily: isFocused
                      ? "Inter_500Medium"
                      : "Inter_400Regular",
                  }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            </Fragment>
          );
        })}
      </View>
    </View>
  );
}
