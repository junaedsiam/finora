import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { TabPill } from "@/components/ui/TabPill";
import { IconCircle } from "@/components/ui/IconCircle";
import { formatCurrency } from "@/utils/currency";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
import { useColors } from "@/constants/colors";

const TABS = ["Income", "Expense"];

type MockRecurring = {
  id: number;
  name: string;
  type: "income" | "expense";
  amount: number;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  nextDueDate: string;
  categoryIcon: React.ComponentProps<typeof Feather>["name"];
  categoryColor: string;
  isActive: boolean;
};

const MOCK_RECURRING: MockRecurring[] = [
  {
    id: 1,
    name: "Monthly Salary",
    type: "income",
    amount: 5000,
    frequency: "monthly",
    nextDueDate: "May 01, 2026",
    categoryIcon: "briefcase",
    categoryColor: "#22C55E",
    isActive: true,
  },
  {
    id: 2,
    name: "Internet Bill",
    type: "expense",
    amount: 20,
    frequency: "monthly",
    nextDueDate: "Apr 24, 2026",
    categoryIcon: "wifi",
    categoryColor: "#5EEAD4",
    isActive: true,
  },
  {
    id: 3,
    name: "Daily Groceries",
    type: "expense",
    amount: 5.49,
    frequency: "daily",
    nextDueDate: "Apr 20, 2026",
    categoryIcon: "shopping-bag",
    categoryColor: "#FDBA74",
    isActive: true,
  },
  {
    id: 4,
    name: "Gym Membership",
    type: "expense",
    amount: 45,
    frequency: "monthly",
    nextDueDate: "May 05, 2026",
    categoryIcon: "heart",
    categoryColor: "#F87171",
    isActive: true,
  },
  {
    id: 5,
    name: "Freelance Payment",
    type: "income",
    amount: 1200,
    frequency: "monthly",
    nextDueDate: "May 15, 2026",
    categoryIcon: "dollar-sign",
    categoryColor: "#3B82F6",
    isActive: false,
  },
  {
    id: 6,
    name: "Netflix Subscription",
    type: "expense",
    amount: 15.99,
    frequency: "monthly",
    nextDueDate: "Apr 28, 2026",
    categoryIcon: "tv",
    categoryColor: "#E11D48",
    isActive: true,
  },
];

function formatFrequency(freq: string): string {
  return freq.charAt(0).toUpperCase() + freq.slice(1);
}

export default function RecurringListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const currency = useActiveCurrency();
  const [activeTab, setActiveTab] = useState(0);

  const filtered = MOCK_RECURRING.filter((r) =>
    activeTab === 0 ? r.type === "income" : r.type === "expense"
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
          {filtered.map((item) => {
            const isIncome = item.type === "income";
            return (
              <Pressable
                key={item.id}
                onPress={() => router.push(`/recurring/${item.id}`)}
                className="flex-row items-center rounded-2xl p-4 border border-border bg-background"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <IconCircle
                  icon={item.categoryIcon}
                  bgColor={item.categoryColor}
                  iconColor="#FFFFFF"
                  size={44}
                />
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center gap-2">
                    <Text
                      className="text-base text-foreground"
                      style={{ fontFamily: "Inter_600SemiBold" }}
                    >
                      {item.name}
                    </Text>
                    {!item.isActive && (
                      <View className="rounded-full px-2 py-0.5 bg-surface">
                        <Text className="text-sm text-muted" style={{ fontFamily: "Inter_500Medium" }}>
                          Paused
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-muted mt-0.5">
                    Next: {item.nextDueDate} - {formatFrequency(item.frequency)}
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
          {filtered.length === 0 && (
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
