import { View, Text } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { IconCircle } from "@/components/ui/IconCircle";
import { formatCurrency } from "@/utils/currency";
import { useColors } from "@/constants/colors";
import { useTransactionFilter } from "@/stores/transaction-filter.store";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
import type { TransactionRow } from "@/types/database";

type OverviewSectionProps = {
  transactions: TransactionRow[];
};

export function OverviewSection({ transactions }: OverviewSectionProps) {
  const colors = useColors();
  const currency = useActiveCurrency();

  const totalIncome = transactions
    .filter((tx) => tx.type === "income" && tx.status === "confirmed")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = transactions
    .filter((tx) => tx.type === "expense" && tx.status === "confirmed")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <View className="mb-5">
      {/* Balance card - full width top row */}
      <View className="flex-row items-center justify-center gap-3 p-4 bg-surface rounded-2xl">
        <IconCircle
          icon="dollar-sign"
          bgColor={colors.primary}
          size={36}
          iconColor="#FFFFFF"
        />
        <View className="gap-1 text-center">
          <Text
            className="text-lg text-center text-muted"
            style={{ fontFamily: "Inter_500Medium" }}
          >
            Balance
          </Text>
          <Text
            className={`text-3xl font-sans-bold text-center ${balance >= 0 ? "text-income" : "text-expense"}`}
          >
            {formatCurrency(balance, { currency, abbreviate: true })}
          </Text>
        </View>
      </View>

      {/* Income and Expense - bottom row side by side */}
      <View className="flex-row gap-3 mt-3">
        {/* Income card */}
        <View className="flex-row items-center flex-1 gap-3 p-4 bg-surface rounded-2xl">
          <IconCircle
            icon="trending-up"
            bgColor={colors.income}
            size={36}
            iconColor="#FFFFFF"
          />
          <View className="gap-1">
            <Text
              className="text-base text-muted"
              style={{ fontFamily: "Inter_500Medium" }}
            >
              Income
            </Text>
            <Text className="text-lg font-sans-bold text-income">
              {formatCurrency(totalIncome, { currency, abbreviate: true })}
            </Text>
          </View>
        </View>

        {/* Expense card */}
        <View className="flex-row items-center flex-1 gap-3 p-4 bg-surface rounded-2xl">
          <IconCircle
            icon="trending-down"
            bgColor={colors.expense}
            size={36}
            iconColor="#FFFFFF"
          />
          <View className="gap-1">
            <Text
              className="text-base text-muted"
              style={{ fontFamily: "Inter_500Medium" }}
            >
              Expense
            </Text>
            <Text className="text-lg font-sans-bold text-expense">
              {formatCurrency(totalExpense, { currency, abbreviate: true })}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
