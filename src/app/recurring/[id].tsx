import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { IconCircle } from "@/components/ui/IconCircle";
import { TransactionItem } from "@/components/transaction/TransactionItem";
import { TransactionDateGroup } from "@/components/transaction/TransactionDateGroup";
import { formatCurrency } from "@/utils/currency";
import { useColors } from "@/constants/colors";

const MOCK_RECURRING: Record<
  string,
  {
    name: string;
    type: "income" | "expense";
    amount: number;
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    startDate: string;
    nextDueDate: string;
    walletName: string;
    categoryName: string;
    categoryIcon: React.ComponentProps<typeof Feather>["name"];
    categoryColor: string;
    isActive: boolean;
    note: string | null;
  }
> = {
  "1": {
    name: "Monthly Salary",
    type: "income",
    amount: 5000,
    frequency: "monthly",
    startDate: "Jan 01, 2026",
    nextDueDate: "May 01, 2026",
    walletName: "Bank Account",
    categoryName: "Salary",
    categoryIcon: "briefcase",
    categoryColor: "#22C55E",
    isActive: true,
    note: "Main job salary",
  },
  "2": {
    name: "Internet Bill",
    type: "expense",
    amount: 20,
    frequency: "monthly",
    startDate: "Feb 01, 2026",
    nextDueDate: "Apr 24, 2026",
    walletName: "Bank Account",
    categoryName: "Bills",
    categoryIcon: "wifi",
    categoryColor: "#5EEAD4",
    isActive: true,
    note: null,
  },
  "3": {
    name: "Daily Groceries",
    type: "expense",
    amount: 5.49,
    frequency: "daily",
    startDate: "Mar 01, 2026",
    nextDueDate: "Apr 20, 2026",
    walletName: "Cash",
    categoryName: "Food",
    categoryIcon: "shopping-bag",
    categoryColor: "#FDBA74",
    isActive: true,
    note: "Regular grocery shopping",
  },
  "4": {
    name: "Gym Membership",
    type: "expense",
    amount: 45,
    frequency: "monthly",
    startDate: "Jan 15, 2026",
    nextDueDate: "May 05, 2026",
    walletName: "Credit Card",
    categoryName: "Health",
    categoryIcon: "heart",
    categoryColor: "#F87171",
    isActive: true,
    note: null,
  },
  "5": {
    name: "Freelance Payment",
    type: "income",
    amount: 1200,
    frequency: "monthly",
    startDate: "Mar 01, 2026",
    nextDueDate: "May 15, 2026",
    walletName: "Bank Account",
    categoryName: "Freelance",
    categoryIcon: "dollar-sign",
    categoryColor: "#3B82F6",
    isActive: false,
    note: "Side project client",
  },
  "6": {
    name: "Netflix Subscription",
    type: "expense",
    amount: 15.99,
    frequency: "monthly",
    startDate: "Jan 10, 2026",
    nextDueDate: "Apr 28, 2026",
    walletName: "Credit Card",
    categoryName: "Entertainment",
    categoryIcon: "tv",
    categoryColor: "#E11D48",
    isActive: true,
    note: null,
  },
};

const MOCK_HISTORY = [
  {
    id: 1,
    title: "Monthly Salary",
    wallet: "Bank Account",
    amount: 5000,
    type: "income" as const,
    time: "09:00am",
    date: { day: "01", dayName: "Wed", monthYear: "04.2026" },
    icon: "briefcase" as const,
    iconBg: "#22C55E",
  },
  {
    id: 2,
    title: "Monthly Salary",
    wallet: "Bank Account",
    amount: 5000,
    type: "income" as const,
    time: "09:00am",
    date: { day: "01", dayName: "Sun", monthYear: "03.2026" },
    icon: "briefcase" as const,
    iconBg: "#22C55E",
  },
];

function formatFrequency(freq: string): string {
  return freq.charAt(0).toUpperCase() + freq.slice(1);
}

export default function RecurringDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const colors = useColors();
  const recurring = MOCK_RECURRING[id ?? "1"];
  if (!recurring) return null;

  const isIncome = recurring.type === "income";
  const accentColor = isIncome ? colors.income : colors.expense;

  const groupedHistory = MOCK_HISTORY.reduce(
    (groups, txn) => {
      const key = `${txn.date.day}-${txn.date.monthYear}`;
      if (!groups[key]) groups[key] = { date: txn.date, items: [] };
      groups[key].items.push(txn);
      return groups;
    },
    {} as Record<
      string,
      { date: (typeof MOCK_HISTORY)[0]["date"]; items: typeof MOCK_HISTORY }
    >
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
            Recurring Details
          </Text>
        </View>
        <View className="flex-row items-center gap-4">
          <Pressable
            onPress={() => router.push(`/recurring/add?editId=${id}`)}
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
        {/* Top info */}
        <View className="items-center mt-6">
          <IconCircle
            icon={recurring.categoryIcon}
            bgColor={recurring.categoryColor}
            iconColor="#FFFFFF"
            size={64}
          />
          <Text
            className="text-xl text-foreground mt-3"
            style={{ fontFamily: "Inter_700Bold" }}
          >
            {recurring.name}
          </Text>
          <View className="flex-row items-center gap-2 mt-2">
            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: isIncome ? "#DCFCE7" : "#FEE2E2" }}
            >
              <Text
                className="text-sm uppercase"
                style={{ fontFamily: "Inter_700Bold", color: accentColor }}
              >
                {recurring.type}
              </Text>
            </View>
            {!recurring.isActive && (
              <View className="rounded-full px-3 py-1 bg-surface">
                <Text
                  className="text-sm uppercase"
                  style={{ fontFamily: "Inter_700Bold", color: colors.muted }}
                >
                  Paused
                </Text>
              </View>
            )}
          </View>
          <Text
            className="text-3xl mt-4"
            style={{ fontFamily: "Inter_700Bold", color: accentColor }}
          >
            {isIncome ? "+" : "-"}{formatCurrency(recurring.amount)}
          </Text>
        </View>

        {/* Details grid */}
        <View className="flex-row gap-3 mt-6">
          <View className="flex-1 rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted">Frequency</Text>
            <Text
              className="text-lg text-foreground mt-1"
              style={{ fontFamily: "Inter_700Bold" }}
            >
              {formatFrequency(recurring.frequency)}
            </Text>
          </View>
          <View className="flex-1 rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted">Next Due</Text>
            <Text
              className="text-lg text-foreground mt-1"
              style={{ fontFamily: "Inter_700Bold" }}
            >
              {recurring.nextDueDate}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3 mt-3">
          <View className="flex-1 rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted">Category</Text>
            <View className="flex-row items-center gap-2 mt-1">
              <IconCircle
                icon={recurring.categoryIcon}
                bgColor={recurring.categoryColor}
                iconColor="#FFFFFF"
                size={24}
              />
              <Text
                className="text-lg text-foreground"
                style={{ fontFamily: "Inter_700Bold" }}
              >
                {recurring.categoryName}
              </Text>
            </View>
          </View>
          <View className="flex-1 rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted">Wallet</Text>
            <Text
              className="text-lg text-foreground mt-1"
              style={{ fontFamily: "Inter_700Bold" }}
            >
              {recurring.walletName}
            </Text>
          </View>
        </View>

        <View className="rounded-2xl p-4 border border-border mt-3">
          <Text className="text-sm text-muted">Start Date</Text>
          <Text
            className="text-lg text-foreground mt-1"
            style={{ fontFamily: "Inter_700Bold" }}
          >
            {recurring.startDate}
          </Text>
        </View>

        {recurring.note && (
          <View className="rounded-2xl p-4 border border-border mt-3">
            <Text className="text-sm text-muted">Note</Text>
            <Text
              className="text-base text-foreground mt-1"
              style={{ fontFamily: "Inter_500Medium" }}
            >
              {recurring.note}
            </Text>
          </View>
        )}

        {/* Transaction history */}
        <View className="mt-6 pb-8">
          <Text
            className="text-lg text-foreground mb-2"
            style={{ fontFamily: "Inter_700Bold" }}
          >
            Transaction History
          </Text>
          {Object.values(groupedHistory).map((group) => (
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
          {MOCK_HISTORY.length === 0 && (
            <View className="items-center py-8">
              <Feather name="inbox" size={40} color={colors.muted} />
              <Text className="text-base text-muted mt-2">
                No transactions yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
