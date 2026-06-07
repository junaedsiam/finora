import { View, Text, Pressable } from "react-native";
import { useColors } from "@/constants/colors";
import { useStatsFilter, type StatsType } from "@/stores/stats-filter.store";

const TABS: { label: string; value: StatsType }[] = [
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
];

export function StatsTypeTabs() {
  const colors = useColors();
  const { type, setType } = useStatsFilter();

  return (
    <View className="px-5 mb-6">
      <View className="flex-row items-center p-1 rounded-full bg-surface">
        {TABS.map((opt) => {
          const isActive = type === opt.value;
          const activeColor =
            opt.value === "income" ? colors.income : colors.expense;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setType(opt.value)}
              className={`flex-1 items-center py-2 rounded-full ${isActive ? "bg-foreground" : "bg-transparent"}`}
            >
              <Text
                className={`text-base ${isActive ? "text-background" : "text-muted"}`}
                style={{ fontFamily: "Inter_500Medium" }}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
