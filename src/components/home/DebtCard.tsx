import { View, Text, Pressable } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { IconCircle } from "@/components/ui/IconCircle";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency } from "@/utils/currency";
import { useColors } from "@/constants/colors";

type DebtCardProps = {
  person: string;
  type: "borrowed" | "lent";
  totalAmount: number;
  remainingAmount: number;
  dueDate: string;
  currency?: string;
  onPress?: () => void;
};

export function DebtCard({
  person,
  type,
  totalAmount,
  remainingAmount,
  dueDate,
  currency = "USD",
  onPress,
}: DebtCardProps) {
  const colors = useColors();
  const isBorrowed = type === "borrowed";
  const paid = totalAmount - remainingAmount;
  const percentage = Math.round((paid / totalAmount) * 100);
  const accentColor = isBorrowed ? colors.expense : colors.income;

  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl p-4 border border-border bg-background"
      style={({ pressed }) => (onPress ? { opacity: pressed ? 0.7 : 1 } : {})}
    >
      {/* Top row: person + badge */}
      <View className="flex-row items-center mb-2">
        <IconCircle
          icon="user"
          bgColor={isBorrowed ? "#FEE2E2" : "#DCFCE7"}
          iconColor={accentColor}
          size={40}
        />
        <View className="flex-1 ml-3">
          <Text className="text-base font-sans-semibold text-foreground">
            {person}
          </Text>
          <Text className="text-sm font-sans text-muted mt-0.5">
            Due {dueDate}
          </Text>
        </View>
        <View
          className="rounded-full px-2.5 py-1"
          style={{ backgroundColor: isBorrowed ? "#FEE2E2" : "#DCFCE7" }}
        >
          <Text
            className="text-xs font-sans-bold uppercase"
            style={{ color: accentColor }}
          >
            {type}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View className="mt-1">
        <ProgressBar value={paid} max={totalAmount} color={accentColor} />
      </View>

      {/* Bottom row: amounts + action */}
      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-base font-sans text-muted">
          Paid: {formatCurrency(paid, { currency })} / {formatCurrency(totalAmount, { currency })}
        </Text>
        <Text
          className="text-base font-sans-bold"
          style={{ color: accentColor }}
        >
          {percentage}%
        </Text>
      </View>

      {/* Remaining + Record Payment */}
      {/* <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border">
        <View>
          <Text className="text-sm font-sans text-muted">Remaining</Text>
          <Text
            className="text-base font-sans-bold"
            style={{ color: accentColor }}
          >
            {formatCurrency(remainingAmount)}
          </Text>
        </View>
        <Pressable
          className="flex-row items-center gap-1.5 rounded-full px-4 py-2"
          style={{ backgroundColor: isBorrowed ? "#FEE2E2" : "#DCFCE7" }}
        >
          <Feather
            name={isBorrowed ? "dollar-sign" : "bell"}
            size={16}
            color={accentColor}
          />
          <Text
            className="text-sm font-sans-semibold"
            style={{ color: accentColor }}
          >
            {isBorrowed ? "Record Payment" : "Remind"}
          </Text>
        </Pressable>
      </View> */}
    </Pressable>
  );
}
