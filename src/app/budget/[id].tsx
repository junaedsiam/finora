import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { BudgetProgressCard } from "@/components/home/BudgetProgressCard";
import { useColors } from "@/constants/colors";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
import { useBudget, useDeleteBudget } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency } from "@/utils/currency";

export default function BudgetDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const numericId = parseInt(id ?? "0");

  const colors = useColors();
  const currency = useActiveCurrency();

  const { data: budgetData, isLoading } = useBudget(numericId);
  const { data: allCategories = [] } = useCategories();
  const { mutate: deleteBudget } = useDeleteBudget();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted">Loading...</Text>
      </View>
    );
  }

  if (!budgetData) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted">Budget not found</Text>
      </View>
    );
  }

  const { budget, categoryIds } = budgetData;
  const today = new Date().toISOString().split("T")[0];
  const endDate = budget.end_date ?? today;

  // Calculate spent
  const linkedCategories = allCategories.filter((c) => categoryIds.includes(c.id));
  const spent = budgetData.spent ?? 0;
  const remaining = Math.max(0, budget.amount - spent);
  const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

  const handleDelete = () => {
    Alert.alert(
      "Delete Budget",
      "Are you sure? This will not delete any transactions.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteBudget(budget.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} hitSlop={8} className="active:opacity-70">
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
          <Text className="text-xl font-sans-bold text-foreground">Budget Details</Text>
        </View>
        <View className="flex-row items-center gap-4">
          <Pressable
            onPress={() => router.push(`/budget/add?editId=${id}`)}
            hitSlop={8}
            className="active:opacity-70"
          >
            <Feather name="edit-2" size={24} color={colors.foreground} />
          </Pressable>
          <Pressable onPress={handleDelete} hitSlop={8} className="active:opacity-70">
            <Feather name="trash-2" size={24} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Progress card */}
        <View className="mt-4">
          <BudgetProgressCard
            name={budget.name}
            spent={spent}
            total={budget.amount}
            color="#3538F8"
            currency={currency}
          />
        </View>

        {/* Details */}
        <View className="flex-row gap-3 mt-4">
          <View className="flex-1 rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted">Period</Text>
            <Text className="text-lg text-foreground mt-1 font-sans-bold">
              {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
            </Text>
          </View>
          <View className="flex-1 rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted">Remaining</Text>
            <Text className="text-lg text-foreground mt-1 font-sans-bold">
              {formatCurrency(remaining, { currency })}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3 mt-3">
          <View className="flex-1 rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted">Start Date</Text>
            <Text className="text-lg text-foreground mt-1 font-sans-bold">
              {budget.start_date}
            </Text>
          </View>
          <View className="flex-1 rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted">End Date</Text>
            <Text className="text-lg text-foreground mt-1 font-sans-bold">
              {budget.end_date ?? "Ongoing"}
            </Text>
          </View>
        </View>

        {/* Linked Categories */}
        <View className="mt-6 pb-8">
          <Text className="text-lg text-foreground mb-3 font-sans-bold">Linked Categories</Text>
          {linkedCategories.length === 0 ? (
            <Text className="text-muted">No categories linked</Text>
          ) : (
            <View className="gap-2">
              {linkedCategories.map((cat) => (
                <View
                  key={cat.id}
                  className="flex-row items-center rounded-2xl p-4 border border-border bg-background"
                >
                  <View
                    className="h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: cat.color }}
                  >
                    <Feather
                      name={cat.icon as React.ComponentProps<typeof Feather>["name"]}
                      size={18}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text className="flex-1 ml-3 text-base text-foreground font-sans-medium">
                    {cat.name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
