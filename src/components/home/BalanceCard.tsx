import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "@expo/vector-icons/Feather";
import { formatCurrency } from "@/utils/currency";
import { useUIStore } from "@/stores/ui.store";

export function BalanceCard() {
  const visible = useUIStore((s) => s.balanceVisible);
  const toggleVisible = useUIStore((s) => s.toggleBalanceVisible);

  const totalBalance = 159062.78;
  const income = 1980.0;
  const expense = 1080.5;

  return (
    <LinearGradient
      colors={["#3538F8", "#575AFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ marginHorizontal: 20, borderRadius: 24, padding: 20 }}
    >
      {/* Account selector + menu */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable
          className="flex-row items-center rounded-full px-4 py-1.5"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        >
          <Text className="text-base font-sans-medium text-white mr-1">
            Main Account
          </Text>
          <Feather name="chevron-down" size={16} color="#FFFFFF" />
        </Pressable>
        <Pressable hitSlop={8}>
          <Feather name="more-vertical" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Total Balance */}
      <Text
        className="text-base font-sans text-white mb-1"
        style={{ opacity: 0.7 }}
      >
        Total Balance
      </Text>
      <View className="flex-row items-center gap-3 mb-4">
        <Text className="text-[34px] font-sans-bold text-white">
          {visible ? formatCurrency(totalBalance) : "••••••"}
        </Text>
        <Pressable onPress={toggleVisible} hitSlop={8}>
          <Feather
            name={visible ? "eye" : "eye-off"}
            size={22}
            color="rgba(255,255,255,0.6)"
          />
        </Pressable>
      </View>

      {/* Divider */}
      <View
        className="h-px mb-4"
        style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
      />

      {/* Income & Expense */}
      <View className="flex-row gap-8">
        <View>
          <View className="flex-row items-center gap-1 mb-1">
            <Text
              className="text-base font-sans text-white"
              style={{ opacity: 0.7 }}
            >
              Income
            </Text>
            <Feather name="arrow-up-right" size={16} color="#4ADE80" />
          </View>
          <Text className="text-lg font-sans-semibold text-white">
            {visible ? formatCurrency(income) : "••••"}
          </Text>
        </View>
        <View>
          <View className="flex-row items-center gap-1 mb-1">
            <Text
              className="text-base font-sans text-white"
              style={{ opacity: 0.7 }}
            >
              Expense
            </Text>
            <Feather name="arrow-down-right" size={16} color="#FF6B6B" />
          </View>
          <Text className="text-lg font-sans-semibold text-white">
            {visible ? formatCurrency(expense) : "••••"}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
