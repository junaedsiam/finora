import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScreenHeader title="Calendar" />
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg font-sans-semibold text-foreground">
          Calendar
        </Text>
      </View>
    </View>
  );
}
