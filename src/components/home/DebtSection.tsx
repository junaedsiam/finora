import { View, Text } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DebtCard } from "./DebtCard";
import { formatCurrency } from "@/utils/currency";
import { colors } from "@/constants/colors";

const MOCK_DEBTS = [
  {
    id: 1,
    person: "John Doe",
    type: "borrowed" as const,
    totalAmount: 1000,
    remainingAmount: 800,
    dueDate: "May 15, 2026",
  },
  {
    id: 2,
    person: "Sarah Kim",
    type: "lent" as const,
    totalAmount: 500,
    remainingAmount: 500,
    dueDate: "Jun 1, 2026",
  },
  // {
  //   id: 3,
  //   person: "Alex Chen",
  //   type: "borrowed" as const,
  //   totalAmount: 200,
  //   remainingAmount: 50,
  //   dueDate: "Jul 20, 2026",
  // },
];

export function DebtSection() {
  const totalOwed = MOCK_DEBTS.filter((d) => d.type === "borrowed").reduce(
    (sum, d) => sum + d.remainingAmount,
    0,
  );
  const totalLent = MOCK_DEBTS.filter((d) => d.type === "lent").reduce(
    (sum, d) => sum + d.remainingAmount,
    0,
  );

  return (
    <View className="px-5 mt-6">
      <SectionHeader title="Debts" actionLabel="View All >" />

      {/* Summary card */}
      <View className="flex-row gap-3 mb-3">
        <View className="flex-1 rounded-2xl p-4 border border-border bg-background items-center">
          <View className="flex-row items-center gap-1.5 mb-1">
            <Feather name="arrow-down-left" size={14} color={colors.expense} />
            <Text className="text-xs font-sans-medium text-muted">
              You Owe
            </Text>
          </View>
          <Text className="text-lg font-sans-bold text-expense">
            {formatCurrency(totalOwed)}
          </Text>
        </View>
        <View className="flex-1 rounded-2xl p-4 border border-border bg-background items-center">
          <View className="flex-row items-center gap-1.5 mb-1">
            <Feather name="arrow-up-right" size={14} color={colors.income} />
            <Text className="text-xs font-sans-medium text-muted">
              You're Owed
            </Text>
          </View>
          <Text className="text-lg font-sans-bold text-income">
            {formatCurrency(totalLent)}
          </Text>
        </View>
      </View>

      {/* Individual debt cards */}
      <View className="gap-3">
        {MOCK_DEBTS.map((debt) => (
          <DebtCard key={debt.id} {...debt} />
        ))}
      </View>
    </View>
  );
}
