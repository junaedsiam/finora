import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import dayjs from "dayjs";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DebtCard } from "./DebtCard";
import { formatCurrency } from "@/utils/currency";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
import { useDebts } from "@/hooks/useDebts";
import { useColors } from "@/constants/colors";

function mapDebtType(type: "borrow" | "lend"): "borrowed" | "lent" {
  return type === "borrow" ? "borrowed" : "lent";
}

export function DebtSection() {
  const router = useRouter();
  const colors = useColors();
  const currency = useActiveCurrency();
  const { data: debts = [] } = useDebts();

  const totalOwed = debts
    .filter((d) => d.type === "borrow")
    .reduce((sum, d) => sum + d.remaining_amount, 0);
  const totalLent = debts
    .filter((d) => d.type === "lend")
    .reduce((sum, d) => sum + d.remaining_amount, 0);

  return (
    <View className="px-5 mt-6">
      <SectionHeader title="Debts" actionLabel="View All >" onAction={() => router.push("/debt")} />

      {/* Summary cards */}
      <View className="flex-row gap-3 mb-3">
        <View className="flex-1 rounded-2xl p-4 border border-border bg-background items-center">
          <View className="flex-row items-center gap-1.5 mb-1">
            <Feather name="arrow-down-left" size={16} color={colors.expense} />
            <Text className="text-sm font-sans-medium text-muted">
              You Owe
            </Text>
          </View>
          <Text className="text-lg font-sans-bold text-expense">
            {formatCurrency(totalOwed, { currency })}
          </Text>
        </View>
        <View className="flex-1 rounded-2xl p-4 border border-border bg-background items-center">
          <View className="flex-row items-center gap-1.5 mb-1">
            <Feather name="arrow-up-right" size={16} color={colors.income} />
            <Text className="text-sm font-sans-medium text-muted">
              You're Owed
            </Text>
          </View>
          <Text className="text-lg font-sans-bold text-income">
            {formatCurrency(totalLent, { currency })}
          </Text>
        </View>
      </View>

      {/* Individual debt cards */}
      <View className="gap-3">
        {debts.slice(0, 3).map((debt) => (
          <DebtCard
            key={debt.id}
            person={debt.name}
            type={mapDebtType(debt.type)}
            totalAmount={debt.original_amount}
            remainingAmount={debt.remaining_amount}
            dueDate={debt.due_date ? dayjs(debt.due_date).format("MMM D, YYYY") : "No due date"}
            currency={currency}
            onPress={() => router.push(`/debt/${debt.id}`)}
          />
        ))}
      </View>
    </View>
  );
}
