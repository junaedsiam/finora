import { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import DatePicker from "react-native-date-picker";
import { TabPill } from "@/components/ui/TabPill";
import { DropdownField } from "@/components/ui/DropdownField";
import { Button } from "@/components/ui/Button";
import { useColors } from "@/constants/colors";

const TYPE_TABS = ["I Borrowed", "I Lent"];
const DEMO_WALLETS = ["Cash", "Bank Account", "Credit Card", "Savings"];

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
  const colors = useColors();

  const [activeType, setActiveType] = useState(0);
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [walletIndex, setWalletIndex] = useState(0);
  const [note, setNote] = useState("");

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
          <DropdownField
            icon="calendar"
            label="Select date"
            value={formatDate(dueDate)}
            onPress={() => setDatePickerOpen(true)}
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
            value={DEMO_WALLETS[walletIndex]}
            onPress={() =>
              setWalletIndex((i) => (i + 1) % DEMO_WALLETS.length)
            }
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
          <Button label={isEditing ? "Update Debt" : "Add Debt"} />
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
