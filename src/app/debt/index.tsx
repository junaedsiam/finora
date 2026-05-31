import { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import dayjs from "dayjs";
import { TabPill } from "@/components/ui/TabPill";
import { DebtCard } from "@/components/home/DebtCard";
import { formatCurrency } from "@/utils/currency";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
import { useAllDebts, useDeleteDebt } from "@/hooks/useDebts";
import { useColors } from "@/constants/colors";

const TABS = ["I Borrowed", "I Lent"];

function mapDebtType(type: "borrow" | "lend"): "borrowed" | "lent" {
  return type === "borrow" ? "borrowed" : "lent";
}

export default function DebtManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const currency = useActiveCurrency();
  const { data: debts = [] } = useAllDebts();
  const { mutate: deleteDebt } = useDeleteDebt();
  const [activeTab, setActiveTab] = useState(0);

  const isBorrowed = activeTab === 0;
  const dbType = isBorrowed ? "borrow" : "lend";
  const filtered = debts.filter((d) => d.type === dbType);

  const totalRemaining = filtered.reduce(
    (sum, d) => sum + d.remaining_amount,
    0
  );

  const summaryLabel = isBorrowed
    ? `Not yet paid ${formatCurrency(totalRemaining, { currency })}`
    : `Not yet received ${formatCurrency(totalRemaining, { currency })}`;

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      "Delete Debt",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteDebt(id),
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
              person={debt.name}
              type={mapDebtType(debt.type)}
              totalAmount={debt.original_amount}
              remainingAmount={debt.remaining_amount}
              dueDate={debt.due_date ? dayjs(debt.due_date).format("MMM D, YYYY") : "No due date"}
              currency={currency}
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
