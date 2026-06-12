import { View, Text, ScrollView, Alert, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Swipeable } from "react-native-gesture-handler";
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
import { useTransactions, useDeleteTransaction } from "@/hooks/useTransactions";
import { useWallets } from "@/hooks/useWallets";
import { useCategories } from "@/hooks/useCategories";
import { useColors } from "@/constants/colors";
import { useTransactionFilter } from "@/stores/transaction-filter.store";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
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
  const currency = useActiveCurrency();
  const { mutate: deleteTx } = useDeleteTransaction();

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
                  const category = tx.category_id ? categoryMap.get(tx.category_id) : null;
                  const destWallet = tx.destination_wallet_id
                    ? walletMap.get(tx.destination_wallet_id)
                    : null;
                  const title = category?.name || tx.note || "Payment";
                  const subtitle =
                    tx.type === "transfer"
                      ? `${wallet?.name || "?"} → ${destWallet?.name || "?"}`
                      : wallet?.name || "Unknown wallet";

                  const handleDelete = () => {
                    Alert.alert(
                      "Delete Transaction",
                      "Are you sure? This will revert the wallet balance.",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => deleteTx(tx.id),
                        },
                      ]
                    );
                  };

                  const renderRightActions = (
                    progress: Animated.AnimatedInterpolation<number>,
                    dragX: Animated.AnimatedInterpolation<number>
                  ) => {
                    const trans = dragX.interpolate({
                      inputRange: [-80, 0],
                      outputRange: [0, 80],
                      extrapolate: "clamp",
                    });
                    return (
                      <Animated.View
                        style={{
                          transform: [{ translateX: trans }],
                          justifyContent: "center",
                          alignItems: "center",
                          width: 80,
                          backgroundColor: colors.expense,
                          borderRadius: 12,
                          marginVertical: 4,
                        }}
                      >
                        <Text className="text-white font-sans-semibold text-sm">
                          Delete
                        </Text>
                      </Animated.View>
                    );
                  };

                  return (
                    <Swipeable
                      key={tx.id}
                      renderRightActions={renderRightActions}
                      onSwipeableOpen={handleDelete}
                      friction={2}
                      rightThreshold={40}
                    >
                      <TransactionItem
                        title={title}
                        subtitle={subtitle}
                        amount={tx.amount}
                        type={tx.type}
                        time={dayjs(tx.created_at).format("HH:mm")}
                        icon={(category?.icon as any) || (tx.category_id === null ? "user" : "circle")}
                        iconBg={category?.color || (tx.category_id === null ? (tx.type === "expense" ? "#FEE2E2" : "#DCFCE7") : colors.muted)}
                        currency={currency}
                        onPress={() =>
                          router.push({
                            pathname: "/(modals)/add-transaction",
                            params: { editId: tx.id.toString() },
                          })
                        }
                      />
                    </Swipeable>
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
