import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { IconCircle } from "@/components/ui/IconCircle";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TransactionItem } from "@/components/transaction/TransactionItem";
import { TransactionDateGroup } from "@/components/transaction/TransactionDateGroup";
import { formatCurrency } from "@/utils/currency";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
import { useColors } from "@/constants/colors";

const MOCK_DEBTS: Record<string, {
  person: string;
  type: "borrow" | "lend";
  totalAmount: number;
  remainingAmount: number;
  dueDate: string;
  walletName: string;
  createdAt: string;
}> = {
  "1": {
    person: "John Doe",
    type: "borrow",
    totalAmount: 1000,
    remainingAmount: 800,
    dueDate: "May 15, 2026",
    walletName: "Cash",
    createdAt: "Apr 01, 2026",
  },
  "2": {
    person: "Mike Ross",
    type: "borrow",
    totalAmount: 500,
    remainingAmount: 200,
    dueDate: "Jun 10, 2026",
    walletName: "Bank Account",
    createdAt: "Mar 20, 2026",
  },
  "3": {
    person: "Sarah Kim",
    type: "lend",
    totalAmount: 500,
    remainingAmount: 500,
    dueDate: "Jun 1, 2026",
    walletName: "Cash",
    createdAt: "Apr 10, 2026",
  },
  "4": {
    person: "Alex Chen",
    type: "lend",
    totalAmount: 200,
    remainingAmount: 50,
    dueDate: "Jul 20, 2026",
    walletName: "Bank Account",
    createdAt: "Feb 15, 2026",
  },
};

const MOCK_TRANSACTIONS = [
  {
    id: 1,
    title: "Payment",
    wallet: "Cash",
    amount: 100,
    type: "expense" as const,
    time: "02:30pm",
    date: { day: "15", dayName: "Tue", monthYear: "04.2026" },
    icon: "dollar-sign" as const,
    iconBg: "#3B82F6",
  },
  {
    id: 2,
    title: "Payment",
    wallet: "Cash",
    amount: 100,
    type: "expense" as const,
    time: "11:00am",
    date: { day: "10", dayName: "Thu", monthYear: "04.2026" },
    icon: "dollar-sign" as const,
    iconBg: "#3B82F6",
  },
];

export default function DebtDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const colors = useColors();
  const currency = useActiveCurrency();
  const debt = MOCK_DEBTS[id ?? "1"];
  if (!debt) return null;

  const isBorrow = debt.type === "borrow";
  const accentColor = isBorrow ? colors.expense : colors.income;
  const paid = debt.totalAmount - debt.remainingAmount;
  const percentage = Math.round((paid / debt.totalAmount) * 100);

  const groupedTransactions = MOCK_TRANSACTIONS.reduce(
    (groups, txn) => {
      const key = `${txn.date.day}-${txn.date.monthYear}`;
      if (!groups[key]) groups[key] = { date: txn.date, items: [] };
      groups[key].items.push(txn);
      return groups;
    },
    {} as Record<string, { date: typeof MOCK_TRANSACTIONS[0]["date"]; items: typeof MOCK_TRANSACTIONS }>,
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="active:opacity-70"
          >
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
          <Text className="text-xl font-sans-bold text-foreground">
            Debt Details
          </Text>
        </View>
        <View className="flex-row items-center gap-4">
          <Pressable
            onPress={() => router.push(`/debt/add?editId=${id}`)}
            hitSlop={8}
            className="active:opacity-70"
          >
            <Feather name="edit-2" size={24} color={colors.foreground} />
          </Pressable>
          <Pressable
            onPress={() => {}}
            hitSlop={8}
            className="active:opacity-70"
          >
            <Feather name="trash-2" size={24} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Person info */}
        <View className="items-center mt-6">
          <IconCircle
            icon="user"
            bgColor={isBorrow ? "#FEE2E2" : "#DCFCE7"}
            iconColor={accentColor}
            size={64}
          />
          <Text
            className="text-xl text-foreground mt-3"
            style={{ fontFamily: "Inter_700Bold" }}
          >
            {debt.person}
          </Text>
          <View
            className="rounded-full px-3 py-1 mt-2"
            style={{ backgroundColor: isBorrow ? "#FEE2E2" : "#DCFCE7" }}
          >
            <Text
              className="text-sm uppercase"
              style={{ fontFamily: "Inter_700Bold", color: accentColor }}
            >
              {isBorrow ? "Borrowed" : "Lent"}
            </Text>
          </View>
        </View>

        {/* Progress section */}
        <View className="mt-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base text-muted" style={{ fontFamily: "Inter_500Medium" }}>
              {isBorrow ? "Paid" : "Received"}
            </Text>
            <Text
              className="text-base"
              style={{ fontFamily: "Inter_600SemiBold", color: accentColor }}
            >
              {percentage}%
            </Text>
          </View>
          <ProgressBar value={paid} max={debt.totalAmount} color={accentColor} />
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-sm text-muted">
              {formatCurrency(paid, { currency })} / {formatCurrency(debt.totalAmount, { currency })}
            </Text>
            <Text className="text-sm text-muted">
              Remaining: {formatCurrency(debt.remainingAmount, { currency })}
            </Text>
          </View>
        </View>

        {/* Details grid */}
        <View className="flex-row gap-3 mt-6">
          <View className="flex-1 rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted">Total Amount</Text>
            <Text
              className="text-lg text-foreground mt-1"
              style={{ fontFamily: "Inter_700Bold" }}
            >
              {formatCurrency(debt.totalAmount, { currency })}
            </Text>
          </View>
          <View className="flex-1 rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted">Due Date</Text>
            <Text
              className="text-lg text-foreground mt-1"
              style={{ fontFamily: "Inter_700Bold" }}
            >
              {debt.dueDate}
            </Text>
          </View>
        </View>
        <View className="rounded-2xl p-4 border border-border mt-3">
          <Text className="text-sm text-muted">Wallet</Text>
          <Text
            className="text-lg text-foreground mt-1"
            style={{ fontFamily: "Inter_700Bold" }}
          >
            {debt.walletName}
          </Text>
        </View>

        {/* Transaction history */}
        <View className="mt-6 pb-8">
          <Text
            className="text-lg text-foreground mb-2"
            style={{ fontFamily: "Inter_700Bold" }}
          >
            Payment History
          </Text>
          {Object.values(groupedTransactions).map((group) => (
            <TransactionDateGroup
              key={`${group.date.day}-${group.date.monthYear}`}
              day={group.date.day}
              dayName={group.date.dayName}
              monthYear={group.date.monthYear}
            >
              {group.items.map((txn) => (
                <TransactionItem
                  key={txn.id}
                  title={txn.title}
                  subtitle={txn.wallet}
                  amount={txn.amount}
                  type={txn.type}
                  time={txn.time}
                  icon={txn.icon}
                  iconBg={txn.iconBg}
                />
              ))}
            </TransactionDateGroup>
          ))}
          {MOCK_TRANSACTIONS.length === 0 && (
            <View className="items-center py-8">
              <Feather name="inbox" size={40} color={colors.muted} />
              <Text className="text-base text-muted mt-2">No payments yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
