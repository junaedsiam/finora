import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import BottomSheet from "@gorhom/bottom-sheet";
import DatePicker from "react-native-date-picker";
import { TabPill } from "@/components/ui/TabPill";
import { DropdownField } from "@/components/ui/DropdownField";
import { Button } from "@/components/ui/Button";
import { useColors } from "@/constants/colors";
import { useRecurringFormStore } from "@/stores/recurring-form.store";
import {
  useCreateRecurring,
  useUpdateRecurring,
  useRecurring,
} from "@/hooks/useRecurring";
import { useCategories } from "@/hooks/useCategories";
import { useWallets } from "@/hooks/useWallets";
import { FrequencyBottomSheet } from "@/components/forms/FrequencyBottomSheet";

const TYPE_TABS = ["Income", "Expense"];
const FREQUENCY_OPTIONS = ["daily", "weekly", "monthly", "yearly"] as const;
const FREQUENCY_LABELS = ["Daily", "Weekly", "Monthly", "Yearly"];

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function dateToISO(d: Date): string {
  return d.toISOString().split("T")[0];
}

export default function AddRecurringScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const isEditing = !!editId;
  const colors = useColors();

  const { category, wallet, setCategory, setWallet, reset } = useRecurringFormStore();
  const { mutateAsync: createRecurring } = useCreateRecurring();
  const { mutateAsync: updateRecurring } = useUpdateRecurring();
  const { data: existingRecurring, isLoading: isLoadingRecurring } = useRecurring(
    isEditing ? parseInt(editId) : 0
  );
  const { data: categories = [] } = useCategories();
  const { data: wallets = [] } = useWallets();

  const [activeType, setActiveType] = useState(1);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequencyIndex, setFrequencyIndex] = useState(2);
  const [startDate, setStartDate] = useState(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const frequencySheetRef = useRef<BottomSheet>(null);

  const currentType = activeType === 0 ? "income" : "expense";

  // Populate form when editing
  useEffect(() => {
    if (!isEditing || !existingRecurring) return;

    // Safety: if data is an array (shouldn't happen after query key fix), take first element
    const recurringData = Array.isArray(existingRecurring) ? existingRecurring[0] : existingRecurring;
    if (!recurringData) return;

    setName(recurringData.note ?? "");
    setAmount(recurringData.amount.toString());
    const freqIndex = recurringData.frequency
      ? FREQUENCY_OPTIONS.indexOf(recurringData.frequency)
      : 2;
    setFrequencyIndex(freqIndex >= 0 ? freqIndex : 2);
    setStartDate(new Date(recurringData.start_date));
    setNote(recurringData.note ?? "");
    setActiveType(recurringData.type === "income" ? 0 : 1);

    // Set category in store
    const cat = categories.find((c) => c.id === existingRecurring.category_id);
    if (cat) {
      setCategory({
        id: cat.id.toString(),
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
      });
    }

    // Set wallet in store
    const w = wallets.find((w) => w.id === existingRecurring.wallet_id);
    if (w) {
      setWallet({
        id: w.id.toString(),
        name: w.name,
        icon: w.icon,
        color: w.color,
      });
    }
  }, [isEditing, existingRecurring, categories, wallets]);

  // Reset store on unmount
  useEffect(() => {
    return () => reset();
  }, []);

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a name");
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    if (!category) {
      Alert.alert("Error", "Please select a category");
      return;
    }
    if (!wallet) {
      Alert.alert("Error", "Please select a wallet");
      return;
    }

    setIsSubmitting(true);
    try {
      const categoryId = parseInt(category.id);
      const walletId = parseInt(wallet.id);
      const frequency = FREQUENCY_OPTIONS[frequencyIndex];
      const startDateStr = dateToISO(startDate);

      const noteValue = name.trim() ? name.trim() : null;

      if (isEditing && existingRecurring) {
        await updateRecurring({
          id: existingRecurring.id,
          walletId,
          categoryId,
          type: currentType,
          amount: numAmount,
          frequency,
          nextDueDate: startDateStr,
          startDate: startDateStr,
          note: noteValue,
        });
      } else {
        await createRecurring({
          walletId,
          categoryId,
          type: currentType,
          amount: numAmount,
          frequency,
          nextDueDate: startDateStr,
          startDate: startDateStr,
          note: noteValue,
        });
      }

      reset();
      router.back();
    } catch (err) {
      Alert.alert("Error", isEditing ? "Failed to update recurring" : "Failed to create recurring");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing && isLoadingRecurring) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted">Loading...</Text>
      </View>
    );
  }

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
            {isEditing ? "Edit Recurring" : "Add Recurring"}
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

        {/* Name */}
        <View className="mt-6">
          <Text
            className="text-base text-muted mb-2"
            style={{ fontFamily: "Inter_500Medium" }}
          >
            Name
          </Text>
          <View className="flex-row items-center rounded-xl border border-border px-3 py-4">
            <Feather name="tag" size={18} color={colors.muted} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Monthly Salary, Internet Bill"
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

        {/* Frequency */}
        <View className="mt-4">
          <Text
            className="text-base text-muted mb-2"
            style={{ fontFamily: "Inter_500Medium" }}
          >
            Frequency
          </Text>
          <DropdownField
            icon="repeat"
            label="Select frequency"
            value={FREQUENCY_LABELS[frequencyIndex]}
            onPress={() => frequencySheetRef.current?.snapToIndex(0)}
            flex={false}
          />
        </View>

        {/* Category */}
        <View className="mt-4">
          <Text
            className="text-base text-muted mb-2"
            style={{ fontFamily: "Inter_500Medium" }}
          >
            Category
          </Text>
          <DropdownField
            icon="grid"
            label="Select category"
            value={category?.name}
            onPress={() =>
              router.push({
                pathname: "/(modals)/select-category",
                params: { type: currentType, context: "recurring" },
              })
            }
            flex={false}
          />
        </View>

        {/* Wallet */}
        <View className="mt-4">
          <Text
            className="text-base text-muted mb-2"
            style={{ fontFamily: "Inter_500Medium" }}
          >
            Wallet
          </Text>
          <DropdownField
            icon="credit-card"
            label="Select wallet"
            value={wallet?.name}
            onPress={() =>
              router.push({
                pathname: "/(modals)/select-wallet",
                params: { field: "to", context: "recurring" },
              })
            }
            flex={false}
          />
        </View>

        {/* Start date */}
        <View className="mt-4">
          <Text
            className="text-base text-muted mb-2"
            style={{ fontFamily: "Inter_500Medium" }}
          >
            Start Date
          </Text>
          <DropdownField
            icon="calendar"
            label="Select date"
            value={formatDate(startDate)}
            onPress={() => setDatePickerOpen(true)}
            flex={false}
          />
        </View>

        {/* Note */}
        <View className="mt-4">
          <Text
            className="text-base text-muted mb-2"
            style={{ fontFamily: "Inter_500Medium" }}
          >
            Note (optional)
          </Text>
          <View className="flex-row items-center rounded-xl border border-border px-3 py-4">
            <Feather name="file-text" size={18} color={colors.muted} />
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Add a note..."
              placeholderTextColor={colors.muted}
              className="flex-1 text-base text-foreground ml-2"
              style={{ fontFamily: "Inter_500Medium", padding: 0 }}
            />
          </View>
        </View>

        {/* Submit */}
        <View className="mt-8 pb-8">
          <Button
            label={
              isSubmitting
                ? "Saving..."
                : isEditing
                ? "Update Recurring"
                : "Add Recurring"
            }
            onPress={handleSubmit}
            disabled={isSubmitting}
          />
        </View>
      </ScrollView>

      <FrequencyBottomSheet
        sheetRef={frequencySheetRef}
        selectedValue={FREQUENCY_OPTIONS[frequencyIndex]}
        onSelect={(value) => {
          const idx = FREQUENCY_OPTIONS.indexOf(value as typeof FREQUENCY_OPTIONS[number]);
          if (idx >= 0) setFrequencyIndex(idx);
        }}
      />

      <DatePicker
        modal
        open={datePickerOpen}
        date={startDate}
        mode="date"
        onConfirm={(d) => {
          setDatePickerOpen(false);
          setStartDate(d);
        }}
        onCancel={() => setDatePickerOpen(false)}
      />
    </View>
  );
}
