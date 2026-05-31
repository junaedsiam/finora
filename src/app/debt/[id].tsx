import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import dayjs from "dayjs";
import { IconCircle } from "@/components/ui/IconCircle";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/currency";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
import { useDebt, useDeleteDebt, useSettleDebt } from "@/hooks/useDebts";
import { useWallets } from "@/hooks/useWallets";
import { useCategories } from "@/hooks/useCategories";
import { useColors } from "@/constants/colors";

export default function DebtDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const debtId = Number(id);

  const colors = useColors();
  const currency = useActiveCurrency();
  const { data: debt, isLoading } = useDebt(debtId);
  const { data: wallets = [] } = useWallets();
  const { data: categories = [] } = useCategories();
  const { mutate: deleteDebt } = useDeleteDebt();
  const { mutateAsync: settleDebt, isPending: isSettling } = useSettleDebt();

  // Settlement form state
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showSettleForm, setShowSettleForm] = useState(false);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center" style={{ paddingTop: insets.top }}>
        <Text className="text-muted">Loading...</Text>
      </View>
    );
  }

  if (!debt) {
    return (
      <View className="flex-1 bg-background items-center justify-center" style={{ paddingTop: insets.top }}>
        <Text className="text-muted">Debt not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-primary">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const isBorrow = debt.type === "borrow";
  const accentColor = isBorrow ? colors.expense : colors.income;
  const paid = debt.original_amount - debt.remaining_amount;
  const percentage = debt.original_amount > 0
    ? Math.round((paid / debt.original_amount) * 100)
    : 0;

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);

  // Get categories appropriate for the debt type
  const relevantCategories = categories.filter((c) =>
    isBorrow ? c.type === "expense" : c.type === "income"
  );
  const selectedCategory = relevantCategories.find((c) => c.id === selectedCategoryId);

  const handleDelete = () => {
    Alert.alert(
      "Delete Debt",
      `Are you sure you want to delete "${debt.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteDebt(debt.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleSettle = async () => {
    const numAmount = parseFloat(paymentAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    if (!selectedWalletId) {
      Alert.alert("Error", "Please select a wallet");
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert("Error", "Please select a category");
      return;
    }
    if (numAmount > debt.remaining_amount) {
      Alert.alert("Error", `Amount cannot exceed remaining ${formatCurrency(debt.remaining_amount, { currency })}`);
      return;
    }

    try {
      await settleDebt({
        debtId: debt.id,
        walletId: selectedWalletId,
        categoryId: selectedCategoryId,
        amount: numAmount,
        debtType: debt.type,
        note: `Payment for ${debt.name}`,
      });
      setPaymentAmount("");
      setSelectedWalletId(null);
      setSelectedCategoryId(null);
      setShowSettleForm(false);
      Alert.alert("Success", "Payment recorded successfully");
    } catch {
      Alert.alert("Error", "Failed to record payment");
    }
  };

  const walletName = debt.wallet_id
    ? wallets.find((w) => w.id === debt.wallet_id)?.name ?? "Unknown"
    : "Not set";

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
            onPress={() => router.push(`/debt/add?editId=${debt.id}`)}
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
            {debt.name}
          </Text>
          <View className="flex-row items-center gap-2 mt-2">
            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: isBorrow ? "#FEE2E2" : "#DCFCE7" }}
            >
              <Text
                className="text-sm uppercase"
                style={{ fontFamily: "Inter_700Bold", color: accentColor }}
              >
                {isBorrow ? "Borrowed" : "Lent"}
              </Text>
            </View>
            {!!debt.is_settled && (
              <View className="rounded-full px-3 py-1 bg-surface">
                <Text
                  className="text-sm uppercase"
                  style={{ fontFamily: "Inter_700Bold", color: colors.muted }}
                >
                  Settled
                </Text>
              </View>
            )}
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
          <ProgressBar value={paid} max={debt.original_amount} color={accentColor} />
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-sm text-muted">
              {formatCurrency(paid, { currency })} / {formatCurrency(debt.original_amount, { currency })}
            </Text>
            <Text className="text-sm text-muted">
              Remaining: {formatCurrency(debt.remaining_amount, { currency })}
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
              {formatCurrency(debt.original_amount, { currency })}
            </Text>
          </View>
          <View className="flex-1 rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted">Due Date</Text>
            <Text
              className="text-lg text-foreground mt-1"
              style={{ fontFamily: "Inter_700Bold" }}
            >
              {debt.due_date ? dayjs(debt.due_date).format("MMM D, YYYY") : "No due date"}
            </Text>
          </View>
        </View>
        <View className="rounded-2xl p-4 border border-border mt-3">
          <Text className="text-sm text-muted">Wallet</Text>
          <Text
            className="text-lg text-foreground mt-1"
            style={{ fontFamily: "Inter_700Bold" }}
          >
            {walletName}
          </Text>
        </View>

        {/* Record Payment section */}
        {!debt.is_settled && (
          <View className="mt-6">
            {!showSettleForm ? (
              <Pressable
                onPress={() => setShowSettleForm(true)}
                className="rounded-2xl p-4 items-center"
                style={{ backgroundColor: isBorrow ? "#FEE2E2" : "#DCFCE7" }}
              >
                <Text
                  className="text-base font-sans-semibold"
                  style={{ color: accentColor }}
                >
                  {isBorrow ? "Record Payment" : "Record Repayment"}
                </Text>
              </Pressable>
            ) : (
              <View className="rounded-2xl p-4 border border-border gap-4">
                <Text
                  className="text-lg text-foreground"
                  style={{ fontFamily: "Inter_700Bold" }}
                >
                  {isBorrow ? "Record Payment" : "Record Repayment"}
                </Text>

                {/* Amount */}
                <View>
                  <Text className="text-base text-muted mb-2" style={{ fontFamily: "Inter_500Medium" }}>
                    Amount
                  </Text>
                  <View className="flex-row items-center rounded-xl border border-border px-3 py-3">
                    <Feather name="dollar-sign" size={18} color={colors.muted} />
                    <TextInput
                      value={paymentAmount}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/[^0-9.]/g, "");
                        if ((cleaned.match(/\./g) || []).length <= 1)
                          setPaymentAmount(cleaned);
                      }}
                      placeholder="0.00"
                      placeholderTextColor={colors.muted}
                      keyboardType="decimal-pad"
                      className="flex-1 text-base text-foreground ml-2"
                      style={{ fontFamily: "Inter_500Medium", padding: 0 }}
                    />
                  </View>
                </View>

                {/* Wallet */}
                <View>
                  <Text className="text-base text-muted mb-2" style={{ fontFamily: "Inter_500Medium" }}>
                    Wallet
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {wallets.map((wallet) => (
                      <Pressable
                        key={wallet.id}
                        onPress={() => setSelectedWalletId(wallet.id)}
                        className="rounded-xl px-3 py-2 border"
                        style={{
                          borderColor: selectedWalletId === wallet.id ? wallet.color : colors.border,
                          backgroundColor: selectedWalletId === wallet.id ? `${wallet.color}20` : "transparent",
                        }}
                      >
                        <Text
                          className="text-sm font-sans-medium"
                          style={{
                            color: selectedWalletId === wallet.id ? wallet.color : colors.foreground,
                          }}
                        >
                          {wallet.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Category */}
                <View>
                  <Text className="text-base text-muted mb-2" style={{ fontFamily: "Inter_500Medium" }}>
                    Category
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {relevantCategories.map((cat) => (
                      <Pressable
                        key={cat.id}
                        onPress={() => setSelectedCategoryId(cat.id)}
                        className="flex-row items-center rounded-xl px-3 py-2 border gap-2"
                        style={{
                          borderColor: selectedCategoryId === cat.id ? cat.color : colors.border,
                          backgroundColor: selectedCategoryId === cat.id ? `${cat.color}20` : "transparent",
                        }}
                      >
                        <Feather name={cat.icon as any} size={14} color={selectedCategoryId === cat.id ? cat.color : colors.muted} />
                        <Text
                          className="text-sm font-sans-medium"
                          style={{
                            color: selectedCategoryId === cat.id ? cat.color : colors.foreground,
                          }}
                        >
                          {cat.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Actions */}
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => {
                      setShowSettleForm(false);
                      setPaymentAmount("");
                      setSelectedWalletId(null);
                      setSelectedCategoryId(null);
                    }}
                    className="flex-1 rounded-xl py-3 items-center border border-border"
                  >
                    <Text className="text-base font-sans-medium text-muted">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSettle}
                    disabled={isSettling}
                    className="flex-1 rounded-xl py-3 items-center"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Text className="text-base font-sans-semibold text-white">
                      {isSettling ? "Saving..." : "Save"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
