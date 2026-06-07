import { View, Text, Pressable } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { IconCircle } from "@/components/ui/IconCircle";
import { formatCurrency } from "@/utils/currency";
import { useColors } from "@/constants/colors";

export type CategoryBreakdown = {
  categoryId: number;
  name: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
  transactionCount: number;
};

type CategoryBreakdownItemProps = {
  item: CategoryBreakdown;
  currency?: string;
  onPress?: () => void;
};

export function CategoryBreakdownItem({
  item,
  currency = "USD",
  onPress,
}: CategoryBreakdownItemProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-3 px-5 active:opacity-70"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <IconCircle
        icon={item.icon as any}
        bgColor={item.color}
        size={44}
        iconColor="rgba(0,0,0,0.55)"
      />
      <View className="flex-1 ml-3">
        <Text
          className="text-base text-foreground"
          style={{ fontFamily: "Inter_500Medium" }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View className="flex-row items-center mt-1.5">
          <View
            className="h-1.5 rounded-full bg-surface overflow-hidden flex-1 mr-2"
            style={{ maxWidth: 120 }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${Math.min(item.percentage, 100)}%`,
                backgroundColor: item.color,
              }}
            />
          </View>
          <Text className="text-xs text-muted">
            {item.percentage.toFixed(1)}%
          </Text>
        </View>
      </View>
      <View className="items-end ml-2">
        <Text
          className="text-base"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}
        >
          {formatCurrency(item.amount, { currency })}
        </Text>
        <Text className="text-xs text-muted mt-0.5">
          {item.transactionCount} transaction{item.transactionCount !== 1 ? "s" : ""}
        </Text>
      </View>
      <Feather
        name="chevron-right"
        size={16}
        color={colors.muted}
        style={{ marginLeft: 4 }}
      />
    </Pressable>
  );
}
