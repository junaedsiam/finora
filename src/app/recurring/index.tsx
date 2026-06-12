import { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { TabPill } from "@/components/ui/TabPill";
import { IconCircle } from "@/components/ui/IconCircle";
import { formatCurrency } from "@/utils/currency";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
import { useColors } from "@/constants/colors";
import {
  useRecurringList,
  useDeleteRecurring,
} from "@/hooks/useRecurring";

const TABS = ["Income", "Expense"];

function formatFrequency(freq: string | undefined | null): string {
  if (!freq) return "Unknown";
  return freq.charAt(0).toUpperCase() + freq.slice(1);
}

export default function RecurringListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const currency = useActiveCurrency();
  const [activeTab, setActiveTab] = useState(0);

  const { data: recurringList = [], isLoading } = useRecurringList();
  const { mutate: deleteRecurring } = useDeleteRecurring();

  // Safety: ensure recurringList is an array
  const safeRecurringList = Array.isArray(recurringList) ? recurringList : [];
  const filtered = safeRecurringList.filter((r) =>
    activeTab === 0 ? r.type === "income" : r.type === "expense"
  );

  const handleDelete = (id: number) => {
    Alert.alert(
      "Delete Recurring",
      "Are you sure? This will also delete any pending transactions from this recurring.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteRecurring(id),
        },
      ]
    );
  };

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
            Recurring Transactions
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/recurring/add")}
          hitSlop={8}
          className="active:opacity-70"
        >
          <Feather name="plus" size={24} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Tabs */}
        <View className="mt-4">
          <TabPill
            options={TABS}
            activeIndex={activeTab}
            onChange={setActiveTab}
          />
        </View>

        {/* Recurring list */}
        <View className="gap-3 mt-4 pb-8">
          {isLoading && (
            <View className="items-center py-12">
              <Text className="text-muted">Loading...</Text>
            </View>
          )}
          {filtered.map((item) => {
            const isIncome = item.type === "income";
            return (
              <Pressable
                key={item.id}
                onPress={() => router.push(`/recurring/${item.id}`)}
                onLongPress={() => handleDelete(item.id)}
                className="flex-row items-center rounded-2xl p-4 border border-border bg-background"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <IconCircle
                  icon={isIncome ? "arrow-up-right" : "arrow-down-right"}
                  bgColor={isIncome ? "#DCFCE7" : "#FEE2E2"}
                  iconColor={isIncome ? colors.income : colors.expense}
                  size={44}
                />
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center gap-2">
                    <Text
                      className="text-base text-foreground"
                      style={{ fontFamily: "Inter_600SemiBold" }}
                    >
                      {item.note || formatFrequency(item.frequency)}
                    </Text>
                    {!item.is_active && (
                      <View className="rounded-full px-2 py-0.5 bg-surface">
                        <Text className="text-sm text-muted" style={{ fontFamily: "Inter_500Medium" }}>
                          Paused
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-muted mt-0.5">
                    Next: {item.next_due_date} - {formatFrequency(item.frequency)}
                  </Text>
                </View>
                <Text
                  className="text-base"
                  style={{
                    fontFamily: "Inter_700Bold",
                    color: isIncome ? colors.income : colors.expense,
                  }}
                >
                  {isIncome ? "+" : "-"}{formatCurrency(item.amount, { currency })}
                </Text>
              </Pressable>
            );
          })}
          {!isLoading && filtered.length === 0 && (
            <View className="items-center py-12">
              <Feather name="inbox" size={48} color={colors.muted} />
              <Text className="text-base text-muted mt-3">
                No recurring transactions
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
