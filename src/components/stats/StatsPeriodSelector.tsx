import { View, Text, Pressable } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useColors } from "@/constants/colors";
import {
  useStatsFilter,
  getStatsPeriodLabel,
  type StatsPeriod,
} from "@/stores/stats-filter.store";

const PERIODS: { label: string; value: StatsPeriod }[] = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Quarter", value: "quarter" },
  { label: "Year", value: "year" },
];

export function StatsPeriodSelector() {
  const colors = useColors();
  const { period, startDate, endDate, setPeriod, goNext, goPrev } =
    useStatsFilter();

  const label = getStatsPeriodLabel(period, startDate, endDate);

  return (
    <View className="px-5 mb-4">
      {/* Period pills */}
      <View className="flex-row items-center p-1 rounded-full bg-surface mb-4">
        {PERIODS.map((opt) => {
          const isActive = period === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setPeriod(opt.value)}
              className={`flex-1 items-center py-2 rounded-full ${isActive ? "bg-foreground" : "bg-transparent"}`}
            >
              <Text
                className={`text-sm ${isActive ? "text-background" : "text-muted"}`}
                style={{ fontFamily: "Inter_500Medium" }}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Date navigator */}
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={goPrev}
          hitSlop={8}
          className="p-2 active:opacity-70"
        >
          <Feather name="chevron-left" size={24} color={colors.foreground} />
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
    </View>
  );
}
