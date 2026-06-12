import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { IconCircle } from "@/components/ui/IconCircle";
import { TransactionItem } from "@/components/transaction/TransactionItem";
import { TransactionDateGroup } from "@/components/transaction/TransactionDateGroup";
import { formatCurrency } from "@/utils/currency";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
import { useColors } from "@/constants/colors";
import {
  useRecurring,
  useDeleteRecurring,
  useUpdateRecurring,
  useRecurringTransactions,
} from "@/hooks/useRecurring";
import { useCategories } from "@/hooks/useCategories";
import { useWallets } from "@/hooks/useWallets";
import dayjs from "dayjs";

function formatFrequency(freq: string | undefined | null): string {
  if (!freq) return "Unknown";
  return freq.charAt(0).toUpperCase() + freq.slice(1);
}

export default function RecurringDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const numericId = parseInt(id ?? "0");

  const colors = useColors();
  const currency = useActiveCurrency();

  const { data: recurring, isLoading } = useRecurring(numericId);
  const { data: transactions = [] } = useRecurringTransactions(numericId);
  const { data: categories = [] } = useCategories();
  const { data: wallets = [] } = useWallets();
  const { mutate: deleteRecurring } = useDeleteRecurring();
  const { mutate: updateRecurring } = useUpdateRecurring();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted">Loading...</Text>
      </View>
    );
  }

  // Safety: if data is an array (shouldn't happen after query key fix), take first element
  const recurringData = Array.isArray(recurring) ? recurring[0] : recurring;

  if (!recurringData) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted">Recurring not found</Text>
      </View>
    );
  }

  const isIncome = recurringData.type === "income";
  const accentColor = isIncome ? colors.income : colors.expense;

  const category = categories.find((c) => c.id === recurringData.category_id);
  const wallet = wallets.find((w) => w.id === recurringData.wallet_id);

  const handleDelete = () => {
    Alert.alert(
      "Delete Recurring",
      "Are you sure? This will also delete any pending transactions from this recurring.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteRecurring(recurringData.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleTogglePause = () => {
    updateRecurring({
      id: recurringData.id,
      isActive: !recurringData.is_active,
    });
  };

  // Group transactions by date
  const grouped = transactions.reduce((groups, txn) => {
    const d = dayjs(txn.created_at);
    const key = d.format("YYYY-MM-DD");
    if (!groups[key]) {
      groups[key] = {
        date: {
          day: d.format("DD"),
          dayName: d.format("ddd"),
          monthYear: d.format("MM.YYYY"),
        },
        items: [],
      };
    }
    groups[key].items.push(txn);
    return groups;
  }, {} as Record<string, { date: { day: string; dayName: string; monthYear: string }; items: typeof transactions }>);

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
            onPress={handleDelete}
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
            icon={category?.icon || (isIncome ? "arrow-up-right" : "arrow-down-right")}
            bgColor={category?.color || (isIncome ? "#DCFCE7" : "#FEE2E2")}
            iconColor={category?.color || accentColor}
            size={64}
          />
          <Text
            className="text-xl text-foreground mt-3"
            style={{ fontFamily: "Inter_700Bold" }}
          >
            {recurringData.note || formatFrequency(recurringData.frequency)}
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
                {recurringData.type}
              </Text>
            </View>
            {!recurringData.is_active && (
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
            {isIncome ? "+" : "-"}{formatCurrency(recurringData.amount, { currency })}
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
              {formatFrequency(recurringData.frequency)}
            </Text>
          </View>
          <View className="flex-1 rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted">Next Due</Text>
            <Text
              className="text-lg text-foreground mt-1"
              style={{ fontFamily: "Inter_700Bold" }}
            >
              {recurringData.next_due_date}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3 mt-3">
          <View className="flex-1 rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted">Category</Text>
            <View className="flex-row items-center gap-2 mt-1">
              <IconCircle
                icon={category?.icon || "help-circle"}
                bgColor={category?.color || colors.muted}
                iconColor="#FFFFFF"
                size={24}
              />
              <Text
                className="text-lg text-foreground"
                style={{ fontFamily: "Inter_700Bold" }}
              >
                {category?.name || "Unknown"}
              </Text>
            </View>
          </View>
          <View className="flex-1 rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted">Wallet</Text>
            <Text
              className="text-lg text-foreground mt-1"
              style={{ fontFamily: "Inter_700Bold" }}
            >
              {wallet?.name || "Unknown"}
            </Text>
          </View>
        </View>

        <View className="rounded-2xl p-4 border border-border mt-3">
          <Text className="text-sm text-muted">Start Date</Text>
          <Text
            className="text-lg text-foreground mt-1"
            style={{ fontFamily: "Inter_700Bold" }}
          >
            {recurringData.start_date}
          </Text>
        </View>

        {recurringData.note && (
          <View className="rounded-2xl p-4 border border-border mt-3">
            <Text className="text-sm text-muted">Note</Text>
            <Text
              className="text-base text-foreground mt-1"
              style={{ fontFamily: "Inter_500Medium" }}
            >
              {recurringData.note}
            </Text>
          </View>
        )}

        {/* Pause/Resume button */}
        <Pressable
          onPress={handleTogglePause}
          className="rounded-2xl p-4 border border-border mt-3 items-center"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Text
            className="text-base"
            style={{
              fontFamily: "Inter_600SemiBold",
              color: recurringData.is_active ? colors.expense : colors.income,
            }}
          >
            {recurringData.is_active ? "Pause Recurring" : "Resume Recurring"}
          </Text>
        </Pressable>

        {/* Transaction history */}
        <View className="mt-6 pb-8">
          <Text
            className="text-lg text-foreground mb-2"
            style={{ fontFamily: "Inter_700Bold" }}
          >
            Transaction History
          </Text>
          {Object.values(grouped).map((group) => (
            <TransactionDateGroup
              key={`${group.date.day}-${group.date.monthYear}`}
              day={group.date.day}
              dayName={group.date.dayName}
              monthYear={group.date.monthYear}
            >
              {group.items.map((txn) => (
                <TransactionItem
                  key={txn.id}
                  title={txn.note || formatFrequency(recurringData.frequency)}
                  subtitle={wallet?.name || ""}
                  amount={txn.amount}
                  type={txn.type === "income" ? "income" : "expense"}
                  time={dayjs(txn.created_at).format("hh:mm a")}
                  icon={category?.icon || "help-circle"}
                  iconBg={category?.color || colors.muted}
                />
              ))}
            </TransactionDateGroup>
          ))}
          {transactions.length === 0 && (
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
