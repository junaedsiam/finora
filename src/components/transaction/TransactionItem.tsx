import { View, Text, Pressable } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { IconCircle } from "@/components/ui/IconCircle";
import { formatCurrency } from "@/utils/currency";
import { useColors } from "@/constants/colors";

type TransactionItemProps = {
  title: string;
  subtitle: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  time: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  iconBg: string;
  onPress?: () => void;
};

export function TransactionItem({
  title,
  subtitle,
  amount,
  type,
  time,
  icon,
  iconBg,
  onPress,
}: TransactionItemProps) {
  const colors = useColors();
  const isIncome = type === "income";
  const amountColor = isIncome ? colors.income : colors.expense;
  const prefix = isIncome ? "+" : "-";

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-3"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <IconCircle icon={icon} bgColor={iconBg} size={44} />
      <View className="flex-1 ml-3">
        <Text
          className="text-base text-foreground"
          style={{ fontFamily: "Inter_500Medium" }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text className="text-sm text-muted mt-0.5">{subtitle}</Text>
      </View>
      <View className="items-end">
        <Text
          className="text-base"
          style={{ fontFamily: "Inter_600SemiBold", color: amountColor }}
        >
          {prefix}{formatCurrency(Math.abs(amount))}
        </Text>
        <Text className="text-sm text-muted mt-0.5">{time}</Text>
      </View>
    </Pressable>
  );
}
