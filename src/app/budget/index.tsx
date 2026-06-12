import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { useColors } from "@/constants/colors";
import { BudgetProgressCard } from "@/components/home/BudgetProgressCard";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
import { useBudgets } from "@/hooks/useBudgets";

export default function BudgetListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const currency = useActiveCurrency();
  const { data: budgets = [], isLoading } = useBudgets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} hitSlop={8} className="active:opacity-70">
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
          <Text className="text-xl font-sans-bold text-foreground">Budgets</Text>
        </View>
        <Pressable
          onPress={() => router.push("/budget/add")}
          hitSlop={8}
          className="active:opacity-70"
        >
          <Feather name="plus" size={24} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 24 }}>
        {isLoading && (
          <View className="items-center py-12">
            <Text className="text-muted">Loading...</Text>
          </View>
        )}

        <View className="gap-3">
          {budgets.map((budget) => (
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
        </View>

        {!isLoading && budgets.length === 0 && (
          <View className="items-center py-12">
            <Feather name="pie-chart" size={48} color={colors.muted} />
            <Text className="text-muted mt-3 text-base">No budgets yet</Text>
            <Pressable
              onPress={() => router.push("/budget/add")}
              className="mt-4 rounded-xl px-6 py-3 bg-primary"
            >
              <Text className="text-white font-sans-semibold">Create Budget</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
