import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import DatePicker from "react-native-date-picker";
import BottomSheet from "@gorhom/bottom-sheet";
import { DropdownField } from "@/components/ui/DropdownField";
import { Button } from "@/components/ui/Button";
import { useColors } from "@/constants/colors";
import { useBudgetFormStore } from "@/stores/budget-form.store";
import { useCreateBudget, useUpdateBudget, useBudget } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { BudgetPeriodBottomSheet } from "@/components/forms/BudgetPeriodBottomSheet";

const PERIOD_OPTIONS = [
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
  { label: "Custom", value: "custom" },
];

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

export default function AddBudgetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const isEditing = !!editId;
  const colors = useColors();

  const {
    name,
    amount,
    startDate,
    endDate,
    period,
    categories,
    setName,
    setAmount,
    setStartDate,
    setEndDate,
    setPeriod,
    setCategories,
    reset,
  } = useBudgetFormStore();

  const { mutateAsync: createBudget } = useCreateBudget();
  const { mutateAsync: updateBudget } = useUpdateBudget();
  const { data: existingBudget } = useBudget(isEditing ? parseInt(editId) : 0);
  const { data: allCategories = [] } = useCategories();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const periodSheetRef = useRef<BottomSheet>(null);

  // Populate form when editing
  useEffect(() => {
    if (!isEditing || !existingBudget) return;
    const { budget, categoryIds } = existingBudget;
    setName(budget.name);
    setAmount(budget.amount.toString());
    setStartDate(new Date(budget.start_date));
    setEndDate(budget.end_date ? new Date(budget.end_date) : null);
    setPeriod(budget.period);

    // Populate categories
    const linkedCats = allCategories
      .filter((c) => categoryIds.includes(c.id))
      .map((c) => ({
        id: c.id.toString(),
        name: c.name,
        icon: c.icon,
        color: c.color,
      }));
    setCategories(linkedCats);
  }, [isEditing, existingBudget, allCategories, setCategories]);

  // Reset store on unmount
  useEffect(() => {
    return () => reset();
  }, []);

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a budget name");
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    if (categories.length === 0) {
      Alert.alert("Error", "Please select at least one category");
      return;
    }

    setIsSubmitting(true);
    try {
      const categoryIds = categories.map((c) => parseInt(c.id));
      const startDateStr = dateToISO(startDate);
      const endDateStr = endDate ? dateToISO(endDate) : undefined;

      if (isEditing && existingBudget) {
        await updateBudget({
          id: existingBudget.budget.id,
          name: name.trim(),
          amount: numAmount,
          period,
          startDate: startDateStr,
          endDate: endDateStr ?? null,
          categoryIds,
        });
      } else {
        await createBudget({
          name: name.trim(),
          amount: numAmount,
          period,
          startDate: startDateStr,
          endDate: endDateStr ?? null,
          categoryIds,
        });
      }

      reset();
      router.back();
    } catch (err) {
      Alert.alert("Error", isEditing ? "Failed to update budget" : "Failed to create budget");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categorySummary =
    categories.length === 0
      ? undefined
      : categories.length === 1
      ? categories[0].name
      : `${categories.length} categories`;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} hitSlop={8} className="active:opacity-70">
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
          <Text className="text-xl font-sans-bold text-foreground">
            {isEditing ? "Edit Budget" : "Add Budget"}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
        {/* Name */}
        <View className="mt-6">
          <Text className="text-base text-muted mb-2" style={{ fontFamily: "Inter_500Medium" }}>
            Name
          </Text>
          <View className="flex-row items-center rounded-xl border border-border px-3 py-4">
            <Feather name="tag" size={18} color={colors.muted} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Monthly Groceries"
              placeholderTextColor={colors.muted}
              className="flex-1 text-base text-foreground ml-2"
              style={{ fontFamily: "Inter_500Medium", padding: 0 }}
            />
          </View>
        </View>

        {/* Amount */}
        <View className="mt-4">
          <Text className="text-base text-muted mb-2" style={{ fontFamily: "Inter_500Medium" }}>
            Budget Amount
          </Text>
          <View className="flex-row items-center rounded-xl border border-border px-3 py-4">
            <Feather name="dollar-sign" size={18} color={colors.muted} />
            <TextInput
              value={amount}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9.]/g, "");
                if ((cleaned.match(/\./g) || []).length <= 1) setAmount(cleaned);
              }}
              placeholder="0.00"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              className="flex-1 text-base text-foreground ml-2"
              style={{ fontFamily: "Inter_500Medium", padding: 0 }}
            />
          </View>
        </View>

        {/* Period */}
        <View className="mt-4">
          <Text className="text-base text-muted mb-2" style={{ fontFamily: "Inter_500Medium" }}>
            Period
          </Text>
          <DropdownField
            icon="calendar"
            label="Select period"
            value={PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? period}
            onPress={() => periodSheetRef.current?.snapToIndex(0)}
            flex={false}
          />
        </View>

        {/* Start Date */}
        <View className="mt-4">
          <Text className="text-base text-muted mb-2" style={{ fontFamily: "Inter_500Medium" }}>
            Start Date
          </Text>
          <DropdownField
            icon="calendar"
            label="Select start date"
            value={formatDate(startDate)}
            onPress={() => setStartDatePickerOpen(true)}
            flex={false}
          />
        </View>

        {/* End Date (only for custom) */}
        {period === "custom" && (
          <View className="mt-4">
            <Text className="text-base text-muted mb-2" style={{ fontFamily: "Inter_500Medium" }}>
              End Date
            </Text>
            <DropdownField
              icon="calendar"
              label="Select end date"
              value={endDate ? formatDate(endDate) : "Optional"}
              onPress={() => setEndDatePickerOpen(true)}
              flex={false}
            />
          </View>
        )}

        {/* Categories */}
        <View className="mt-4">
          <Text className="text-base text-muted mb-2" style={{ fontFamily: "Inter_500Medium" }}>
            Categories
          </Text>
          <DropdownField
            icon="grid"
            label="Select categories"
            value={categorySummary}
            onPress={() =>
              router.push({
                pathname: "/(modals)/select-categories",
                params: { type: "expense" },
              })
            }
            flex={false}
          />
        </View>

        {/* Submit */}
        <View className="mt-8 pb-8">
          <Button
            label={isSubmitting ? "Saving..." : isEditing ? "Update Budget" : "Add Budget"}
            onPress={handleSubmit}
            disabled={isSubmitting}
          />
        </View>
      </ScrollView>

      <BudgetPeriodBottomSheet
        sheetRef={periodSheetRef}
        selectedValue={period}
        onSelect={(value) => {
          const newPeriod = value as typeof period;
          setPeriod(newPeriod);
          if (newPeriod !== "custom") {
            setEndDate(null);
          }
        }}
      />

      <DatePicker
        modal
        open={startDatePickerOpen}
        date={startDate}
        mode="date"
        onConfirm={(d) => {
          setStartDatePickerOpen(false);
          setStartDate(d);
        }}
        onCancel={() => setStartDatePickerOpen(false)}
      />

      <DatePicker
        modal
        open={endDatePickerOpen}
        date={endDate ?? new Date()}
        mode="date"
        minimumDate={startDate}
        onConfirm={(d) => {
          setEndDatePickerOpen(false);
          setEndDate(d);
        }}
        onCancel={() => setEndDatePickerOpen(false)}
      />
    </View>
  );
}
