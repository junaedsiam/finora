import { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import DatePicker from "react-native-date-picker";
import { TabPill } from "@/components/ui/TabPill";
import { Button } from "@/components/ui/Button";
import { useColors } from "@/constants/colors";
import { useCreateDebt, useUpdateDebt, useDebt } from "@/hooks/useDebts";
import { useWallets } from "@/hooks/useWallets";

const TYPE_TABS = ["I Borrowed", "I Lent"];

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AddDebtScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const isEditing = !!editId;
  const editIdNum = editId ? Number(editId) : 0;
  const colors = useColors();

  const { data: wallets = [] } = useWallets();
  const { data: existingDebt } = useDebt(editIdNum);
  const { mutateAsync: createDebt, isPending: isCreating } = useCreateDebt();
  const { mutateAsync: updateDebt, isPending: isUpdating } = useUpdateDebt();

  const [activeType, setActiveType] = useState(0);
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (existingDebt) {
      setActiveType(existingDebt.type === "borrow" ? 0 : 1);
      setPersonName(existingDebt.name);
      setAmount(existingDebt.original_amount.toString());
      setSelectedWalletId(existingDebt.wallet_id);
      if (existingDebt.due_date) {
        setDueDate(new Date(existingDebt.due_date));
      }
    }
  }, [existingDebt]);

  const isSubmitting = isCreating || isUpdating;

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!personName.trim()) {
      Alert.alert("Error", "Please enter a name");
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    const debtType = activeType === 0 ? "borrow" : "lend";

    try {
      if (isEditing) {
        await updateDebt({
          id: editIdNum,
          name: personName.trim(),
          type: debtType,
          originalAmount: numAmount,
          remainingAmount: existingDebt
            ? existingDebt.remaining_amount + (numAmount - existingDebt.original_amount)
            : numAmount,
          dueDate: dueDate.toISOString(),
          walletId: selectedWalletId,
        });
      } else {
        await createDebt({
          name: personName.trim(),
          type: debtType,
          originalAmount: numAmount,
          remainingAmount: numAmount,
          dueDate: dueDate.toISOString(),
          walletId: selectedWalletId,
        });
      }
      router.back();
    } catch {
      Alert.alert("Error", isEditing ? "Failed to update debt" : "Failed to create debt");
    }
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
            {isEditing ? "Edit Debt" : "Add Debt"}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
        {/* Type tabs */}
        <View className="mt-4">
          <TabPill
            options={TYPE_TABS}
            activeIndex={activeType}
            onChange={setActiveType}
          />
        </View>

        {/* Person name */}
        <View className="mt-6">
          <Text
            className="text-base text-muted mb-2"
            style={{ fontFamily: "Inter_500Medium" }}
          >
            {activeType === 0 ? "Lender Name" : "Borrower Name"}
          </Text>
          <View className="flex-row items-center rounded-xl border border-border px-3 py-4">
            <Feather name="user" size={18} color={colors.muted} />
            <TextInput
              value={personName}
              onChangeText={setPersonName}
              placeholder="Enter name"
              placeholderTextColor={colors.muted}
              className="flex-1 text-base text-foreground ml-2"
              style={{ fontFamily: "Inter_500Medium", padding: 0 }}
            />
          </View>
        </View>

        {/* Amount */}
        <View className="mt-4">
          <Text
            className="text-base text-muted mb-2"
            style={{ fontFamily: "Inter_500Medium" }}
          >
            Amount
          </Text>
          <View className="flex-row items-center rounded-xl border border-border px-3 py-4">
            <Feather name="dollar-sign" size={18} color={colors.muted} />
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
              className="flex-1 text-base text-foreground ml-2"
              style={{ fontFamily: "Inter_500Medium", padding: 0 }}
            />
          </View>
        </View>

        {/* Due date */}
        <View className="mt-4">
          <Text
            className="text-base text-muted mb-2"
            style={{ fontFamily: "Inter_500Medium" }}
          >
            Due Date
          </Text>
          <Pressable
            onPress={() => setDatePickerOpen(true)}
            className="flex-row items-center rounded-xl border border-border px-3 py-4"
          >
            <Feather name="calendar" size={18} color={colors.muted} />
            <Text className="flex-1 text-base text-foreground ml-2" style={{ fontFamily: "Inter_500Medium" }}>
              {formatDate(dueDate)}
            </Text>
            <Feather name="chevron-right" size={18} color={colors.muted} />
          </Pressable>
        </View>

        {/* Wallet */}
        <View className="mt-4">
          <Text
            className="text-base text-muted mb-2"
            style={{ fontFamily: "Inter_500Medium" }}
          >
            Wallet (optional)
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

        {/* Submit */}
        <View className="mt-8 pb-8">
          <Button
            label={isSubmitting ? "Saving..." : isEditing ? "Update Debt" : "Add Debt"}
            onPress={handleSubmit}
            disabled={isSubmitting}
          />
        </View>
      </ScrollView>

      <DatePicker
        modal
        open={datePickerOpen}
        date={dueDate}
        mode="date"
        onConfirm={(d) => {
          setDatePickerOpen(false);
          setDueDate(d);
        }}
        onCancel={() => setDatePickerOpen(false)}
      />
    </View>
  );
}
