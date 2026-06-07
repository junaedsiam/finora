import { View, Text } from "react-native";
import { CategoryBreakdownItem, type CategoryBreakdown } from "./CategoryBreakdownItem";

type CategoryBreakdownListProps = {
  items: CategoryBreakdown[];
  currency?: string;
  onItemPress?: (item: CategoryBreakdown) => void;
};

export function CategoryBreakdownList({
  items,
  currency = "USD",
  onItemPress,
}: CategoryBreakdownListProps) {
  if (items.length === 0) {
    return (
      <View className="items-center justify-center py-12">
        <Text className="text-base text-muted">No data for this period</Text>
      </View>
    );
  }

  return (
    <View className="pb-6">
      <Text
        className="text-base font-sans-bold text-foreground px-5 mb-2 mt-2"
        style={{ fontFamily: "Inter_600SemiBold" }}
      >
        Breakdown
      </Text>
      {items.map((item) => (
        <CategoryBreakdownItem
          key={item.categoryId}
          item={item}
          currency={currency}
          onPress={() => onItemPress?.(item)}
        />
      ))}
    </View>
  );
}
