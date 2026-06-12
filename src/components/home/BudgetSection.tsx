import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BudgetProgressCard } from "./BudgetProgressCard";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
import { useColors } from "@/constants/colors";
import { useBudgets } from "@/hooks/useBudgets";

export function BudgetSection() {
  const router = useRouter();
  const currency = useActiveCurrency();
  const colors = useColors();
  const { data: budgets = [], isLoading } = useBudgets();

  const topBudgets = budgets.slice(0, 3);

  return (
    <View className="px-5 mt-6">
      <SectionHeader
        title="Budgets"
        actionLabel="View All >"
        onAction={() => router.push("/budget")}
      />
      <View className="gap-3">
        {topBudgets.map((budget) => (
          <BudgetProgressCard
            key={budget.id}
            name={budget.name}
            spent={budget.spent}
            total={budget.amount}
            color="#3538F8"
            currency={currency}
            onPress={() => router.push(`/budget/${budget.id}`)}
          />
        ))}
        {!isLoading && topBudgets.length === 0 && (
          <View className="items-center py-12">
            <Feather name="pie-chart" size={48} color={colors.muted} />
            <Text className="text-base text-muted mt-3">
              No budgets yet
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
