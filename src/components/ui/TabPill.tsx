import { View, Text, Pressable } from "react-native";
import Animated, { useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { useColors } from "@/constants/colors";

type TabPillProps = {
  options: string[];
  activeIndex: number;
  onChange: (index: number) => void;
};

function TabItem({
  label,
  isActive,
  onPress,
  activeBg,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  activeBg: string;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(isActive ? activeBg : "transparent", {
      duration: 150,
      easing: Easing.out(Easing.quad),
    }),
  }));

  return (
    <Pressable onPress={onPress} className="flex-1">
      <Animated.View
        className="items-center py-2.5 rounded-full"
        style={animatedStyle}
      >
        <Text
          className={`text-base ${isActive ? "text-background" : "text-muted"}`}
          style={{
            fontFamily: isActive ? "Inter_600SemiBold" : "Inter_500Medium",
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function TabPill({ options, activeIndex, onChange }: TabPillProps) {
  const colors = useColors();
  return (
    <View className="flex-row items-center rounded-full bg-surface p-1">
      {options.map((label, index) => (
        <TabItem
          key={label}
          label={label}
          isActive={index === activeIndex}
          onPress={() => onChange(index)}
          activeBg={colors.foreground}
        />
      ))}
    </View>
  );
}
