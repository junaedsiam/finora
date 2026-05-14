import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useRef, useCallback } from "react";
import dayjs from "dayjs";
import { TransactionItem } from "@/components/transaction/TransactionItem";
import { TransactionDateGroup } from "@/components/transaction/TransactionDateGroup";
import { TimeRangeSelector } from "@/components/transaction/TimeRangeSelector";
import { FilterPills } from "@/components/transaction/FilterPills";
import { OverviewSection } from "@/components/transaction/OverviewSection";
import { PeriodBottomSheet } from "@/components/transaction/PeriodBottomSheet";
import { useTransactions } from "@/hooks/useTransactions";
import { useWallets } from "@/hooks/useWallets";
import { useCategories } from "@/hooks/useCategories";
import { useColors } from "@/constants/colors";
import { useTransactionFilter } from "@/stores/transaction-filter.store";
import type { TransactionRow } from "@/types/database";

function groupTransactionsByDate(
  transactions: TransactionRow[],
): Map<string, TransactionRow[]> {
  const groups = new Map<string, TransactionRow[]>();
  for (const tx of transactions) {
    const dateKey = dayjs(tx.created_at).format("YYYY-MM-DD");
    if (!groups.has(dateKey)) groups.set(dateKey, []);
    groups.get(dateKey)!.push(tx);
  }
  return groups;
}

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { data: allTransactions = [] } = useTransactions();
  const { data: wallets = [] } = useWallets();
  const { data: categories = [] } = useCategories();
  const { startDate, endDate, filterType } = useTransactionFilter();

  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleCalendarPress = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleCustomRangePress = useCallback(() => {
    bottomSheetRef.current?.close();
    router.push("/(modals)/custom-date-range");
  }, []);

  const walletMap = new Map(wallets.map((w) => [w.id, w]));
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const filtered = allTransactions.filter((tx) => {
    if (filterType !== "all" && tx.type !== filterType) return false;
    const created = dayjs(tx.created_at);
    if (created.isBefore(dayjs(startDate)) || created.isAfter(dayjs(endDate)))
      return false;
    return true;
  });

  const grouped = groupTransactionsByDate(filtered);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <TimeRangeSelector onCalendarPress={handleCalendarPress} />
      <FilterPills />
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <OverviewSection transactions={filtered} />
        {filtered.length === 0 ? (
          <View className="items-center justify-center flex-1 py-20">
            <Text className="text-lg text-muted">No transactions yet</Text>
          </View>
        ) : (
          Array.from(grouped.entries()).map(([dateKey, txs]) => {
            const date = dayjs(dateKey);
            return (
              <TransactionDateGroup
                key={dateKey}
                day={date.format("DD")}
                dayName={date.format("ddd")}
                monthYear={date.format("MMM YYYY")}
              >
                {txs.map((tx) => {
                  const wallet = walletMap.get(tx.wallet_id);
                  const category = categoryMap.get(tx.category_id);
                  const destWallet = tx.destination_wallet_id
                    ? walletMap.get(tx.destination_wallet_id)
                    : null;
                  const title = category?.name || "Unknown";
                  const subtitle =
                    tx.type === "transfer"
                      ? `${wallet?.name || "?"} → ${destWallet?.name || "?"}`
                      : wallet?.name || "Unknown wallet";
                  return (
                    <TransactionItem
                      key={tx.id}
                      title={title}
                      subtitle={subtitle}
                      amount={tx.amount}
                      type={tx.type}
                      time={dayjs(tx.created_at).format("HH:mm")}
                      icon={(category?.icon as any) || "circle"}
                      iconBg={category?.color || colors.muted}
                    />
                  );
                })}
              </TransactionDateGroup>
            );
          })
        )}
      </ScrollView>
      <PeriodBottomSheet
        sheetRef={bottomSheetRef}
        onCustomPress={handleCustomRangePress}
      />
    </View>
  );
}
