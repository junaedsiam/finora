import { useState, useEffect } from "react";
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
import { formatCurrency } from "@/utils/currency";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
import {
  useDebt,
  useDeleteDebt,
  useSettleDebt,
  useDebtTransactions,
  useEditDebtPayment,
  useDeleteDebtPayment,
} from "@/hooks/useDebts";
import { useWallets } from "@/hooks/useWallets";
import { useColors } from "@/constants/colors";
import { useWalletPickerStore } from "@/stores/wallet-picker.store";
import { InsufficientBalanceError } from "@/services/debt.service";

export default function DebtDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const debtId = Number(id);

  const colors = useColors();
  const currency = useActiveCurrency();
  const { data: debt, isLoading } = useDebt(debtId);
  const { data: wallets = [] } = useWallets();
  const { data: payments = [] } = useDebtTransactions(debtId);
  const { mutate: deleteDebt } = useDeleteDebt();
  const { mutateAsync: settleDebt, isPending: isSettling } = useSettleDebt();
  const { mutateAsync: editPayment, isPending: isEditing } = useEditDebtPayment();
  const { mutate: deletePayment } = useDeleteDebtPayment();
  const { selectedWallet: pickedWallet, clearSelectedWallet } = useWalletPickerStore();

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [showSettleForm, setShowSettleForm] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);

  // Sync wallet picker store selection
  useEffect(() => {
    if (pickedWallet) {
      setSelectedWalletId(Number(pickedWallet.id));
      clearSelectedWallet();
    }
  }, [pickedWallet, clearSelectedWallet]);

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
  const walletBalance = selectedWallet?.balance ?? 0;

  const handleDelete = () => {
    Alert.alert(
      "Delete Debt",
      `Are you sure you want to delete "${debt.name}"?\n\nAll payment records will be lost.`,
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

  const resetForm = () => {
    setPaymentAmount("");
    setSelectedWalletId(null);
    setShowSettleForm(false);
    setEditingPaymentId(null);
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
    // For new payments, amount cannot exceed remaining
    // For editing, the old amount is reversed first so the max is remaining + oldAmount
    const maxAmount = editingPaymentId
      ? debt.remaining_amount + (payments.find((p) => p.id === editingPaymentId)?.amount ?? 0)
      : debt.remaining_amount;
    if (numAmount > maxAmount) {
      Alert.alert("Error", `Amount cannot exceed ${formatCurrency(maxAmount, { currency })}`);
      return;
    }

    try {
      if (editingPaymentId) {
        await editPayment({
          transactionId: editingPaymentId,
          debtId: debt.id,
          walletId: selectedWalletId,
          amount: numAmount,
          debtType: debt.type,
          note: `Payment for ${debt.name}`,
        });
        Alert.alert("Success", "Payment updated successfully");
      } else {
        await settleDebt({
          debtId: debt.id,
          walletId: selectedWalletId,
          amount: numAmount,
          debtType: debt.type,
          note: `Payment for ${debt.name}`,
        });
        Alert.alert("Success", "Payment recorded successfully");
      }
      resetForm();
    } catch (err) {
      if (err instanceof InsufficientBalanceError) {
        Alert.alert(
          "Insufficient Balance",
          `Your wallet only has ${formatCurrency(err.walletBalance, { currency })}. You need ${formatCurrency(err.requiredAmount, { currency })} to make this payment.`
        );
      } else {
        Alert.alert("Error", editingPaymentId ? "Failed to update payment" : "Failed to record payment");
      }
    }
  };

  const handleEditPayment = (payment: { id: number; amount: number; wallet_id: number }) => {
    setEditingPaymentId(payment.id);
    setPaymentAmount(payment.amount.toString());
    setSelectedWalletId(payment.wallet_id);
    setShowSettleForm(true);
  };

  const handleDeletePayment = (paymentId: number) => {
    Alert.alert(
      "Delete Payment",
      "Are you sure? This will reverse the payment and restore the debt amount.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deletePayment({ transactionId: paymentId, debtId: debt.id });
          },
        },
      ]
    );
  };

  const walletName = debt.wallet_id
    ? wallets.find((w) => w.id === debt.wallet_id)?.name ?? "Unknown"
    : "Not set";

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-4">
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
                  {editingPaymentId ? "Edit Payment" : isBorrow ? "Record Payment" : "Record Repayment"}
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
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/(modals)/select-wallet",
                        params: { context: "debt" },
                      })
                    }
                    className="flex-row items-center rounded-xl border border-border px-3 py-3"
                  >
                    {selectedWallet ? (
                      <>
                        <View
                          className="h-8 w-8 items-center justify-center rounded-full"
                          style={{ backgroundColor: selectedWallet.color }}
                        >
                          <Feather
                            name={selectedWallet.icon as any}
                            size={16}
                            color="rgba(0,0,0,0.6)"
                          />
                        </View>
                        <View className="flex-1 ml-3">
                          <Text className="text-base text-foreground font-sans-medium">
                            {selectedWallet.name}
                          </Text>
                          <Text className="text-sm text-muted">
                            {formatCurrency(selectedWallet.balance, { currency })}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <Feather name="credit-card" size={18} color={colors.muted} />
                        <Text className="flex-1 text-base text-foreground ml-2" style={{ fontFamily: "Inter_500Medium" }}>
                          Select a wallet
                        </Text>
                      </>
                    )}
                    <Feather name="chevron-right" size={18} color={colors.muted} />
                  </Pressable>

                  {/* Balance check for borrowed debts */}
                  {isBorrow && selectedWallet && (
                    <View className="flex-row items-center gap-2 mt-2">
                      <Feather
                        name={walletBalance >= parseFloat(paymentAmount || "0") ? "check-circle" : "alert-circle"}
                        size={14}
                        color={walletBalance >= parseFloat(paymentAmount || "0") ? "#22C55E" : "#EF4444"}
                      />
                      <Text className="text-sm text-muted">
                        Available: {formatCurrency(walletBalance, { currency })}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Actions */}
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={resetForm}
                    className="flex-1 rounded-xl py-3 items-center border border-border"
                  >
                    <Text className="text-base font-sans-medium text-muted">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSettle}
                    disabled={isSettling || isEditing}
                    className="flex-1 rounded-xl py-3 items-center"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Text className="text-base font-sans-semibold text-white">
                      {isSettling || isEditing ? "Saving..." : editingPaymentId ? "Update" : "Save"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

        {/* Payment History */}
        {payments.length > 0 && (
          <View className="mt-6">
            <Text
              className="text-lg text-foreground mb-3"
              style={{ fontFamily: "Inter_700Bold" }}
            >
              Payment History
            </Text>
            <View className="rounded-2xl border border-border overflow-hidden">
              {payments.map((payment, index) => {
                const wallet = wallets.find((w) => w.id === payment.wallet_id);
                return (
                  <View
                    key={payment.id}
                    className={`px-4 py-3 ${index < payments.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3 flex-1">
                        {wallet ? (
                          <View
                            className="h-8 w-8 items-center justify-center rounded-full"
                            style={{ backgroundColor: wallet.color }}
                          >
                            <Feather
                              name={wallet.icon as any}
                              size={14}
                              color="rgba(0,0,0,0.6)"
                            />
                          </View>
                        ) : (
                          <View className="h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <Feather name="credit-card" size={14} color={colors.foreground} />
                          </View>
                        )}
                        <View className="flex-1">
                          <Text className="text-base text-foreground font-sans-medium">
                            {formatCurrency(payment.amount, { currency })}
                          </Text>
                          <Text className="text-sm text-muted">
                            {wallet?.name ?? "Unknown wallet"} · {dayjs(payment.created_at).format("MMM D, YYYY")}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center gap-3">
                        <Pressable
                          onPress={() => handleEditPayment(payment)}
                          hitSlop={8}
                          className="active:opacity-70"
                        >
                          <Feather name="edit-2" size={18} color={colors.muted} />
                        </Pressable>
                        <Pressable
                          onPress={() => handleDeletePayment(payment.id)}
                          hitSlop={8}
                          className="active:opacity-70"
                        >
                          <Feather name="trash-2" size={18} color={colors.expense} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
