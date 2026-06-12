import { View, Text, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import dayjs from "dayjs";
import { useColors } from "@/constants/colors";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { IconCircle } from "@/components/ui/IconCircle";
import { formatCurrency } from "@/utils/currency";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
import {
  useUpcomingRecurringWithPending,
  useConfirmRecurring,
  useSkipRecurring,
} from "@/hooks/useRecurring";
import { useWallets } from "@/hooks/useWallets";

function formatDueLabel(nextDueDate: string): string {
  const today = dayjs().startOf("day");
  const due = dayjs(nextDueDate).startOf("day");
  const diff = due.diff(today, "day");

  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  if (diff < 0) {
    const days = Math.abs(diff);
    return `${days} day${days > 1 ? "s" : ""} overdue`;
  }
  return due.format("MMM D, YYYY");
}

export function UpcomingCosts() {
  const router = useRouter();
  const colors = useColors();
  const currency = useActiveCurrency();

  const { data: upcomingItems = [], isLoading } = useUpcomingRecurringWithPending();
  const { mutate: confirmRecurring } = useConfirmRecurring();
  const { mutate: skipRecurring } = useSkipRecurring();
  const { data: wallets = [] } = useWallets();

  const handleConfirm = (transactionId: number) => {
    confirmRecurring(transactionId);
  };

  const handleSkip = (transactionId: number) => {
    Alert.alert(
      "Skip Transaction",
      "Are you sure you want to skip this recurring transaction?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Skip", style: "destructive", onPress: () => skipRecurring(transactionId) },
      ]
    );
  };

  return (
    <View className="px-5 mt-6">
      <SectionHeader
        title="Upcoming Recurring"
        actionLabel="Manage Recurring >"
        onAction={() => router.push("/recurring")}
      />
      <View className="gap-3">
        {isLoading && (
          <View className="items-center py-8">
            <Text className="text-muted">Loading...</Text>
          </View>
        )}
        {upcomingItems.map((item) => {
          const isIncome = item.type === "income";
          const wallet = wallets.find((w) => w.id === item.wallet_id);
          const hasPending = item.pending_id !== null;

          const dueLabel = formatDueLabel(item.next_due_date);
          const displayAmount = hasPending && item.pending_amount !== null
            ? item.pending_amount
            : item.amount;

          const hasInsufficientBalance =
            hasPending && !isIncome && wallet && wallet.balance < (displayAmount ?? 0);

          return (
            <View
              key={item.id}
              className="flex-row items-center rounded-2xl p-4 border border-border bg-background"
            >
              <IconCircle
                icon={isIncome ? "arrow-up-right" : "arrow-down-right"}
                bgColor={isIncome ? "#DCFCE7" : "#FEE2E2"}
                iconColor={isIncome ? colors.income : colors.expense}
                size={44}
              />
              <View className="flex-1 ml-3">
                <Text className="text-base font-sans-semibold text-foreground">
                  {item.note || "Recurring"}
                </Text>
                <Text className="text-sm font-sans text-muted mt-0.5">
                  {dueLabel}
                  {hasInsufficientBalance && (
                    <Text className="text-expense"> - Insufficient balance</Text>
                  )}
                </Text>
              </View>
              <View className="items-end gap-2">
                <Text
                  className="text-base font-sans-semibold"
                  style={{ color: isIncome ? colors.income : colors.expense }}
                >
                  {isIncome ? "+" : "-"}{formatCurrency(displayAmount, { currency })}
                </Text>
                {hasPending && item.pending_id !== null && (
                  <View className="flex-row gap-3">
                    <Pressable
                      hitSlop={6}
                      onPress={() => handleConfirm(item.pending_id!)}
                      className="rounded-full p-1.5 border border-border"
                      disabled={hasInsufficientBalance}
                      style={{ opacity: hasInsufficientBalance ? 0.4 : 1 }}
                    >
                      <Feather name="check" size={16} color={colors.income} />
                    </Pressable>
                    <Pressable
                      hitSlop={6}
                      onPress={() => handleSkip(item.pending_id!)}
                      className="rounded-full p-1.5 border border-border"
                    >
                      <Feather name="x" size={16} color={colors.expense} />
                    </Pressable>
                  </View>
                )}
                {!hasPending && (
                  <Text className="text-xs text-muted font-sans">{item.frequency}</Text>
                )}
              </View>
            </View>
          );
        })}
        {!isLoading && upcomingItems.length === 0 && (
          <View className="items-center py-8">
            <Feather name="inbox" size={40} color={colors.muted} />
            <Text className="text-base text-muted mt-2">
              No upcoming recurring transactions
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
