import { useState, useEffect } from "react";
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
import {
  useCreateTransaction,
  useUpdateTransaction,
  useTransaction,
} from "@/hooks/useTransactions";
import { useWallets } from "@/hooks/useWallets";
import { useCategories } from "@/hooks/useCategories";
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

type TransactionFormProps = {
  editId?: number;
};

export function TransactionForm({ editId }: TransactionFormProps) {
  const router = useRouter();
  const colors = useColors();
  const {
    category,
    fromWallet,
    toWallet,
    setCategory,
    setFromWallet,
    setToWallet,
    reset,
  } = useTransactionFormStore();
  const { mutateAsync: createTx } = useCreateTransaction();
  const { mutateAsync: updateTx } = useUpdateTransaction();
  const { data: existingTx, isLoading: isLoadingTx } = useTransaction(editId ?? 0);
  const { data: wallets = [] } = useWallets();
  const { data: categories = [] } = useCategories();
  const activeCurrency = useActiveCurrency();
  const symbol = currencySymbolMap.get(activeCurrency) ?? activeCurrency;

  const isEditing = !!editId;

  const [activeTab, setActiveTab] = useState(1);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTransfer = activeTab === 2;
  const currentType = activeTab === 0 ? "income" : "expense";

  // Populate form when editing and data loads
  useEffect(() => {
    if (!isEditing || !existingTx) return;

    // Set amount
    setAmount(existingTx.amount.toString());

    // Set date
    setDate(new Date(existingTx.created_at));

    // Set description
    if (existingTx.note) {
      setDescription(existingTx.note);
      setShowDescription(true);
    }

    // Set tab based on type
    if (existingTx.type === "income") setActiveTab(0);
    else if (existingTx.type === "expense") setActiveTab(1);
    else setActiveTab(2);

    // Set category in store
    const cat = categories.find((c) => c.id === existingTx.category_id);
    if (cat) {
      setCategory({
        id: cat.id.toString(),
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
      });
    }

    // Set wallets in store
    const wallet = wallets.find((w) => w.id === existingTx.wallet_id);
    if (wallet) {
      const pickerWallet = {
        id: wallet.id.toString(),
        name: wallet.name,
        icon: wallet.icon,
        color: wallet.color,
      };
      if (existingTx.type === "income") {
        setToWallet(pickerWallet);
      } else {
        setFromWallet(pickerWallet);
      }
    }

    if (existingTx.destination_wallet_id) {
      const destWallet = wallets.find(
        (w) => w.id === existingTx.destination_wallet_id
      );
      if (destWallet) {
        setToWallet({
          id: destWallet.id.toString(),
          name: destWallet.name,
          icon: destWallet.icon,
          color: destWallet.color,
        });
      }
    }
  }, [isEditing, existingTx, categories, wallets]);

  // Reset store on unmount
  useEffect(() => {
    return () => reset();
  }, []);

  const handleTabChange = (index: number) => {
    if (isEditing) return; // Disable type changes during edit
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

      if (isEditing && existingTx) {
        // UPDATE
        const walletId =
          activeTab === 0
            ? parseInt(toWallet!.id)
            : parseInt(fromWallet!.id);

        await updateTx({
          id: existingTx.id,
          walletId,
          destinationWalletId: isTransfer
            ? parseInt(toWallet!.id)
            : null,
          categoryId,
          amount: numAmount,
          note: description || null,
        });
      } else {
        // CREATE
        if (activeTab === 0) {
          await createTx({
            walletId: parseInt(toWallet!.id),
            destinationWalletId: undefined,
            categoryId,
            type: "income",
            amount: numAmount,
            note: description || null,
            createdAt: date.toISOString(),
          });
        } else if (isTransfer) {
          await createTx({
            walletId: parseInt(fromWallet!.id),
            destinationWalletId: parseInt(toWallet!.id),
            categoryId,
            type: "transfer",
            amount: numAmount,
            note: description || null,
            createdAt: date.toISOString(),
          });
        } else {
          await createTx({
            walletId: parseInt(fromWallet!.id),
            destinationWalletId: undefined,
            categoryId,
            type: "expense",
            amount: numAmount,
            note: description || null,
            createdAt: date.toISOString(),
          });
        }
      }

      reset();
      router.back();
    } catch (err) {
      Alert.alert("Error", isEditing ? "Failed to update transaction" : "Failed to create transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing && isLoadingTx) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-muted">Loading...</Text>
      </View>
    );
  }

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
        {isEditing && (
          <Text className="text-center text-sm text-muted mb-2">
            Editing transaction — type cannot be changed
          </Text>
        )}

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
              {description || "Add Description"}
            </Text>
          </Pressable>
        )}

        <View className="pt-6 mt-6">
          <Button
            label={
              isSubmitting
                ? "Saving..."
                : isEditing
                ? "Update Transaction"
                : "Add Transaction"
            }
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
