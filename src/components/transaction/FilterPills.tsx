import { View, Text, Pressable } from "react-native";
import {
  useTransactionFilter,
  type TransactionFilterType,
} from "@/stores/transaction-filter.store";
import { useColors } from "@/constants/colors";

const FILTER_OPTIONS: { label: string; value: TransactionFilterType }[] = [
  { label: "All", value: "all" },
  { label: "Income", value: "income" },
  { label: "Expense", value: "expense" },
  { label: "Transfer", value: "transfer" },
];

export function FilterPills() {
  const colors = useColors();
  const { filterType, setFilterType } = useTransactionFilter();

  return (
    <View className="px-5 mb-4">
      <View className="flex-row items-center p-1 rounded-full bg-surface">
        {FILTER_OPTIONS.map((opt) => {
          const isActive = filterType === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setFilterType(opt.value)}
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
