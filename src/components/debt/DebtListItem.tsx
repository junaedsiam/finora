import { View, Text, Pressable } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { IconCircle } from "@/components/ui/IconCircle";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency } from "@/utils/currency";
import { useColors } from "@/constants/colors";

type DebtListItemProps = {
  id: number;
  person: string;
  type: "borrow" | "lend";
  totalAmount: number;
  remainingAmount: number;
  dueDate: string | null;
  onPress?: () => void;
  onDelete?: () => void;
};

export function DebtListItem({
  person,
  type,
  totalAmount,
  remainingAmount,
  dueDate,
  onPress,
  onDelete,
}: DebtListItemProps) {
  const colors = useColors();
  const isBorrow = type === "borrow";
  const accentColor = isBorrow ? colors.expense : colors.income;
  const paid = totalAmount - remainingAmount;
  const percentage = Math.round((paid / totalAmount) * 100);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-2xl p-4 border border-border bg-background"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <IconCircle
        icon="user"
        bgColor={isBorrow ? "#FEE2E2" : "#DCFCE7"}
        iconColor={accentColor}
        size={44}
      />
      <View className="flex-1 ml-3">
        <Text
          className="text-base text-foreground"
          style={{ fontFamily: "Inter_600SemiBold" }}
        >
          {person}
        </Text>
        <View className="mt-1.5">
          <ProgressBar value={paid} max={totalAmount} color={accentColor} />
        </View>
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-sm text-muted">
            {formatCurrency(paid)} / {formatCurrency(totalAmount)}
          </Text>
          <Text
            className="text-sm"
            style={{ fontFamily: "Inter_600SemiBold", color: accentColor }}
          >
            {percentage}%
          </Text>
        </View>
        {dueDate && (
          <Text className="text-sm text-muted mt-0.5">Due {dueDate}</Text>
        )}
      </View>
      <Pressable
        onPress={onDelete}
        hitSlop={8}
        className="ml-3 p-2 rounded-full"
        style={({ pressed }) => ({
          backgroundColor: pressed ? "rgba(239,68,68,0.1)" : "transparent",
        })}
      >
        <Feather name="trash-2" size={18} color={colors.expense} />
      </Pressable>
    </Pressable>
  );
}
