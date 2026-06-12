import { View, Text, Pressable } from "react-native";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency } from "@/utils/currency";

type BudgetProgressCardProps = {
  name: string;
  spent: number;
  total: number;
  color?: string;
  currency?: string;
  onPress?: () => void;
};

export function BudgetProgressCard({
  name,
  spent,
  total,
  color = "#3538F8",
  currency = "USD",
  onPress,
}: BudgetProgressCardProps) {
  const percentage = total > 0 ? Math.round((spent / total) * 100) : 0;

  const card = (
    <View className="rounded-2xl p-4 border border-border bg-background">
      <Text className="text-base font-sans-bold text-foreground mb-3">
        {name}
      </Text>
      <ProgressBar value={spent} max={total} color={color} />
      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-base font-sans text-muted">
          Spent: {formatCurrency(spent, { currency })} / {formatCurrency(total, { currency })}
        </Text>
        <Text className="text-base font-sans-bold" style={{ color }}>
          {percentage}%
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
        {card}
      </Pressable>
    );
  }

  return card;
}
