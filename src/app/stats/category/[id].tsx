import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import dayjs from "dayjs";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { TransactionItem } from "@/components/transaction/TransactionItem";
import { TransactionDateGroup } from "@/components/transaction/TransactionDateGroup";
import { useCategoryTransactions } from "@/hooks/useStats";
import { useWallets } from "@/hooks/useWallets";
import { useCategories } from "@/hooks/useCategories";
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

export default function CategoryStatsDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id: string;
    startDate: string;
    endDate: string;
    type: "income" | "expense";
    categoryName: string;
    categoryColor: string;
    categoryIcon: string;
  }>();

  const categoryId = Number(params.id);
  const startDate = params.startDate;
  const endDate = params.endDate;
  const type = params.type || "expense";
  const categoryName = params.categoryName || "Category";

  const { data: transactions = [] } = useCategoryTransactions(
    categoryId,
    startDate,
    endDate,
    type,
  );
  const { data: wallets = [] } = useWallets();
  const { data: categories = [] } = useCategories();
  const currency = useActiveCurrency();

  const walletMap = new Map(wallets.map((w) => [w.id, w]));
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const grouped = groupTransactionsByDate(transactions);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScreenHeader title={categoryName} showBack />
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {transactions.length === 0 ? (
          <View className="items-center justify-center flex-1 py-20">
            <Text className="text-lg text-muted">No transactions found</Text>
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

                  return (
                    <TransactionItem
                      key={tx.id}
                      title={title}
                      subtitle={subtitle}
                      amount={tx.amount}
                      type={tx.type}
                      time={dayjs(tx.created_at).format("HH:mm")}
                      icon={(category?.icon as any) || (tx.category_id === null ? "user" : "circle")}
                      iconBg={category?.color || (tx.category_id === null ? (tx.type === "expense" ? "#FEE2E2" : "#DCFCE7") : "#9898A6")}
                      currency={currency}
                    />
                  );
                })}
              </TransactionDateGroup>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
