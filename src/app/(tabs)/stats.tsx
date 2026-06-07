import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { StatsPeriodSelector } from "@/components/stats/StatsPeriodSelector";
import { StatsTypeTabs } from "@/components/stats/StatsTypeTabs";
import { PieChart } from "@/components/stats/PieChart";
import { CategoryBreakdownList } from "@/components/stats/CategoryBreakdownList";
import { useCategoryStats } from "@/hooks/useStats";
import { useStatsFilter } from "@/stores/stats-filter.store";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
import type { CategoryBreakdown } from "@/components/stats/CategoryBreakdownItem";

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { startDate, endDate, type } = useStatsFilter();
  const { data: stats = [] } = useCategoryStats(startDate, endDate, type);
  const currency = useActiveCurrency();

  const total = stats.reduce((sum, s) => sum + s.total_amount, 0);

  const slices = stats.map((s) => ({
    value: s.total_amount,
    color: s.color,
  }));

  const breakdownItems: CategoryBreakdown[] = stats.map((s) => ({
    categoryId: s.category_id,
    name: s.name,
    icon: s.icon,
    color: s.color,
    amount: s.total_amount,
    percentage: total > 0 ? (s.total_amount / total) * 100 : 0,
    transactionCount: s.transaction_count,
  }));

  const handleItemPress = (item: CategoryBreakdown) => {
    router.push({
      pathname: `/stats/category/${item.categoryId}` as any,
      params: {
        startDate,
        endDate,
        type,
        categoryName: item.name,
        categoryColor: item.color,
        categoryIcon: item.icon,
      },
    });
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScreenHeader title="Analytics" showSettings={false} />
      <StatsPeriodSelector />
      <StatsTypeTabs />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <PieChart
          slices={slices}
          total={total}
          currency={currency}
          size={240}
        />
        <CategoryBreakdownList
          items={breakdownItems}
          currency={currency}
          onItemPress={handleItemPress}
        />
      </ScrollView>
    </View>
  );
}
