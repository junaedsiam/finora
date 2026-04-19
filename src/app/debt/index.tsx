import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { TabPill } from "@/components/ui/TabPill";
import { DebtCard } from "@/components/home/DebtCard";
import { formatCurrency } from "@/utils/currency";
import { useColors } from "@/constants/colors";

const TABS = ["I Borrowed", "I Lent"];

const MOCK_DEBTS = [
  {
    id: 1,
    person: "John Doe",
    type: "borrowed" as const,
    totalAmount: 1000,
    remainingAmount: 800,
    dueDate: "May 15, 2026",
  },
  {
    id: 2,
    person: "Mike Ross",
    type: "borrowed" as const,
    totalAmount: 500,
    remainingAmount: 200,
    dueDate: "Jun 10, 2026",
  },
  {
    id: 3,
    person: "Sarah Kim",
    type: "lent" as const,
    totalAmount: 500,
    remainingAmount: 500,
    dueDate: "Jun 1, 2026",
  },
  {
    id: 4,
    person: "Alex Chen",
    type: "lent" as const,
    totalAmount: 200,
    remainingAmount: 50,
    dueDate: "Jul 20, 2026",
  },
];

export default function DebtManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [activeTab, setActiveTab] = useState(0);

  const isBorrowed = activeTab === 0;
  const filtered = MOCK_DEBTS.filter((d) =>
    isBorrowed ? d.type === "borrowed" : d.type === "lent"
  );

  const totalRemaining = filtered.reduce(
    (sum, d) => sum + d.remainingAmount,
    0
  );

  const summaryLabel = isBorrowed
    ? `Not yet paid ${formatCurrency(totalRemaining)}`
    : `Not yet received ${formatCurrency(totalRemaining)}`;

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
            Debt Management
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/debt/add")}
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

        {/* Summary banner */}
        <View
          className="rounded-2xl p-4 mt-4 items-center"
          style={{
            backgroundColor: isBorrowed ? "#FEF2F2" : "#F0FDF4",
          }}
        >
          <Text
            className="text-base"
            style={{
              fontFamily: "Inter_600SemiBold",
              color: isBorrowed ? colors.expense : colors.income,
            }}
          >
            {summaryLabel}
          </Text>
        </View>

        {/* Debt list */}
        <View className="gap-3 mt-4 pb-8">
          {filtered.map((debt) => (
            <DebtCard
              key={debt.id}
              person={debt.person}
              type={debt.type}
              totalAmount={debt.totalAmount}
              remainingAmount={debt.remainingAmount}
              dueDate={debt.dueDate}
              onPress={() => router.push(`/debt/${debt.id}`)}
            />
          ))}
          {filtered.length === 0 && (
            <View className="items-center py-12">
              <Feather name="inbox" size={48} color={colors.muted} />
              <Text className="text-base text-muted mt-3">
                No {isBorrowed ? "borrowed" : "lent"} debts
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
