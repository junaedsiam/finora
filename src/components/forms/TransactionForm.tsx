import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import DatePicker from "react-native-date-picker";
import { TabPill } from "@/components/ui/TabPill";
import { DropdownField } from "@/components/ui/DropdownField";
import { Button } from "@/components/ui/Button";
import { useTransactionFormStore } from "@/stores/transaction-form.store";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useWallets } from "@/hooks/useWallets";
import { useUpdateWalletBalance } from "@/hooks/useWallets";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
import { formatCurrency } from "@/utils/currency";
import { useColors } from "@/constants/colors";
import { currencies } from "@/constants/currencies";

const currencySymbolMap = new Map(currencies.map((c) => [c.code, c.symbol]));

const TABS = ["Income", "Expense", "Transfer"];

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TransactionForm() {
  const router = useRouter();
  const colors = useColors();
  const { category, fromWallet, toWallet, reset } = useTransactionFormStore();
  const { data: wallets = [] } = useWallets();
  const { mutateAsync: createTx } = useCreateTransaction();
  const { mutateAsync: updateWalletBalanceMut } = useUpdateWalletBalance();
  const activeCurrency = useActiveCurrency();
  const symbol = currencySymbolMap.get(activeCurrency) ?? activeCurrency;

  const [activeTab, setActiveTab] = useState(1);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTransfer = activeTab === 2;
  const currentType = activeTab === 0 ? "income" : "expense";

  const handleTabChange = (index: number) => {
    if (index !== activeTab) {
      reset();
    }
    setActiveTab(index);
  };

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    if (!category) {
      Alert.alert("Error", "Please select a category");
      return;
    }
    if (activeTab === 0 && !toWallet) {
      Alert.alert("Error", "Please select a wallet");
      return;
    }
    if (activeTab !== 0 && !fromWallet) {
      Alert.alert("Error", "Please select a wallet");
      return;
    }
    if (isTransfer && !toWallet) {
      Alert.alert("Error", "Please select a destination wallet");
      return;
    }

    setIsSubmitting(true);
    try {
      const categoryId = parseInt(category.id);

      if (activeTab === 0) {
        // Income: money goes INTO toWallet
        const walletId = parseInt(toWallet!.id);
        await createTx({
          walletId,
          destinationWalletId: undefined,
          categoryId,
          type: "income",
          amount: numAmount,
          note: description || null,
          createdAt: date.toISOString(),
        });
        const wallet = wallets.find((w) => w.id === walletId);
        if (wallet) {
          await updateWalletBalanceMut({ id: walletId, balance: wallet.balance + numAmount });
        }
      } else if (isTransfer) {
        // Transfer: fromWallet -> toWallet
        const fromWalletId = parseInt(fromWallet!.id);
        await createTx({
          walletId: fromWalletId,
          destinationWalletId: parseInt(toWallet!.id),
          categoryId,
          type: "transfer",
          amount: numAmount,
          note: description || null,
          createdAt: date.toISOString(),
        });
        const srcWallet = wallets.find((w) => w.id === fromWalletId);
        const dstWallet = wallets.find((w) => w.id === parseInt(toWallet!.id));
        if (srcWallet) {
          await updateWalletBalanceMut({ id: fromWalletId, balance: srcWallet.balance - numAmount });
        }
        if (dstWallet) {
          await updateWalletBalanceMut({ id: parseInt(toWallet!.id), balance: dstWallet.balance + numAmount });
        }
      } else {
        // Expense: money leaves fromWallet
        const walletId = parseInt(fromWallet!.id);
        await createTx({
          walletId,
          destinationWalletId: undefined,
          categoryId,
          type: "expense",
          amount: numAmount,
          note: description || null,
          createdAt: date.toISOString(),
        });
        const wallet = wallets.find((w) => w.id === walletId);
        if (wallet) {
          await updateWalletBalanceMut({ id: walletId, balance: wallet.balance - numAmount });
        }
      }

      reset();
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to create transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="height"
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        className="flex-1 px-5 pt-6 bg-background rounded-t-3xl"
        contentContainerClassName="pb-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TabPill
          options={TABS}
          activeIndex={activeTab}
          onChange={handleTabChange}
        />

        <View className="items-center mt-8 mb-8">
          <Text className="mb-2 text-base font-sans-medium text-muted">
            Amount
          </Text>
          <View className="flex-row items-center">
            <Text
              className="text-5xl text-foreground"
              style={{ fontFamily: "Inter_700Bold", lineHeight: 60 }}
            >
              {symbol}{" "}
            </Text>
            <TextInput
              value={amount}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9.]/g, "");
                if ((cleaned.match(/\./g) || []).length <= 1)
                  setAmount(cleaned);
              }}
              placeholder="0.00"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              className="text-5xl text-foreground min-w-[80px]"
              style={{
                fontFamily: "Inter_700Bold",
                padding: 0,
                lineHeight: 60,
              }}
            />
          </View>
        </View>

        <View className="gap-3">
          <DropdownField
            icon="calendar"
            label="Date & Time"
            value={formatDate(date)}
            onPress={() => setDatePickerOpen(true)}
            flex={false}
          />

          <DropdownField
            icon="align-left"
            label="Category"
            value={category?.name}
            onPress={() =>
              router.push({
                pathname: "/(modals)/select-category",
                params: { type: currentType },
              })
            }
            flex={false}
          />

          <View className="flex-row gap-3">
            {activeTab !== 0 && (
              <DropdownField
                icon="chevrons-right"
                label="From - Wallet"
                value={fromWallet?.name}
                onPress={() =>
                  router.push({
                    pathname: "/(modals)/select-wallet",
                    params: { field: "from" },
                  })
                }
              />
            )}
            {isTransfer ? (
              <DropdownField
                icon="chevrons-left"
                label="To - Wallet"
                value={toWallet?.name}
                onPress={() =>
                  router.push({
                    pathname: "/(modals)/select-wallet",
                    params: { field: "to" },
                  })
                }
              />
            ) : activeTab === 0 ? (
              <DropdownField
                icon="chevrons-left"
                label="To - Wallet"
                value={toWallet?.name}
                onPress={() =>
                  router.push({
                    pathname: "/(modals)/select-wallet",
                    params: { field: "to" },
                  })
                }
              />
            ) : (
              <View className="flex-1" />
            )}
          </View>
        </View>

        {showDescription ? (
          <View className="flex-row items-center px-3 py-4 mt-4 border rounded-xl border-border">
            <Feather name="file-text" size={18} color={colors.muted} />
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description..."
              placeholderTextColor={colors.muted}
              autoFocus
              className="flex-1 ml-2 text-base text-foreground"
              style={{ fontFamily: "Inter_500Medium", padding: 0 }}
            />
          </View>
        ) : (
          <Pressable
            className="flex-row items-center px-3 py-4 mt-4 border rounded-xl border-border"
            onPress={() => setShowDescription(true)}
          >
            <Feather name="file-text" size={18} color={colors.muted} />
            <Text className="flex-1 ml-2 text-base font-sans-medium text-muted">
              Add Description
            </Text>
          </Pressable>
        )}

        <View className="pt-6 mt-6">
          <Button
            label={isSubmitting ? "Saving..." : "Add Transaction"}
            onPress={handleSubmit}
            disabled={isSubmitting}
          />
        </View>
      </ScrollView>

      <DatePicker
        modal
        open={datePickerOpen}
        date={date}
        mode="datetime"
        onConfirm={(d) => {
          setDatePickerOpen(false);
          setDate(d);
        }}
        onCancel={() => setDatePickerOpen(false)}
      />
    </KeyboardAvoidingView>
  );
}
