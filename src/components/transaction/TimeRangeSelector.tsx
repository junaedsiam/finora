import { View, Text, Pressable } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { useColors } from "@/constants/colors";
import {
  useTransactionFilter,
  getPeriodLabel,
} from "@/stores/transaction-filter.store";

type TimeRangeSelectorProps = {
  onCalendarPress?: () => void;
};

export function TimeRangeSelector({
  onCalendarPress,
}: TimeRangeSelectorProps) {
  const colors = useColors();
  const { period, startDate, endDate, goNext, goPrev } =
    useTransactionFilter();

  const label = getPeriodLabel(period, startDate, endDate);

  return (
    <View className="px-5 mb-5">
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={onCalendarPress}
          hitSlop={8}
          className="p-2 active:opacity-70"
        >
          <Feather name="calendar" size={20} color={colors.muted} />
        </Pressable>

        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={goPrev}
            hitSlop={8}
            className="p-2 active:opacity-70"
          >
            <Feather name="chevron-left" size={26} color={colors.foreground} />
          </Pressable>

          <Text
            className="text-lg font-sans-bold text-foreground"
            style={{ fontFamily: "Inter_600SemiBold" }}
          >
            {label}
          </Text>

          <Pressable
            onPress={goNext}
            hitSlop={8}
            className="p-2 active:opacity-70"
          >
            <Feather name="chevron-right" size={24} color={colors.foreground} />
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push("/settings")}
          hitSlop={8}
          className="p-2 active:opacity-70"
        >
          <Feather name="settings" size={20} color={colors.muted} />
        </Pressable>
      </View>
    </View>
  );
}
