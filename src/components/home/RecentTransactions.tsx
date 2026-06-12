import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import dayjs from "dayjs";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TransactionItem } from "@/components/transaction/TransactionItem";
import { TransactionDateGroup } from "@/components/transaction/TransactionDateGroup";
import { useTransactions } from "@/hooks/useTransactions";
import { useWallets } from "@/hooks/useWallets";
import { useCategories } from "@/hooks/useCategories";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
import { useColors } from "@/constants/colors";

export function RecentTransactions() {
  const colors = useColors();
  const currency = useActiveCurrency();
  const { data: transactions = [] } = useTransactions();
  const { data: wallets = [] } = useWallets();
  const { data: categories = [] } = useCategories();

  const walletMap = new Map(wallets.map((w) => [w.id, w]));
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const now = dayjs();
  const currentMonthTxs = transactions.filter((tx) => {
    const txDate = dayjs(tx.created_at);
    return txDate.year() === now.year() && txDate.month() === now.month();
  });
  const recent = currentMonthTxs.slice(0, 10);

  // Group by date for display
  const groups = new Map<string, typeof recent>();
  for (const tx of recent) {
    const key = dayjs(tx.created_at).format("YYYY-MM-DD");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(tx);
  }

  return (
    <View className="px-5 mt-6">
      <SectionHeader
        title="Recent Transactions"
        actionLabel="View All >"
        onAction={() => router.push("/(tabs)/transactions")}
      />

      {recent.length === 0 ? (
        <View className="flex items-center justify-center my-8">
          <Feather name="inbox" size={40} color={colors.muted} />
          <Text
            className="mt-4 text-base text-center text-muted"
            style={{ fontFamily: "Inter_400Regular" }}
          >
            No transactions this month
          </Text>
        </View>
      ) : (
        Array.from(groups.entries()).map(([dateKey, txs]) => {
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
                    iconBg={category?.color || (tx.category_id === null ? (tx.type === "expense" ? "#FEE2E2" : "#DCFCE7") : colors.muted)}
                    currency={currency}
                    onPress={() =>
                      router.push({
                        pathname: "/(modals)/add-transaction",
                        params: { editId: tx.id.toString() },
                      })
                    }
                  />
                );
              })}
            </TransactionDateGroup>
          );
        })
      )}
    </View>
  );
}
