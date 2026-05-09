import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import DatePicker from "react-native-date-picker";
import { TabPill } from "@/components/ui/TabPill";
import { DropdownField } from "@/components/ui/DropdownField";
import { Button } from "@/components/ui/Button";
import { useTransactionFormStore } from "@/stores/transaction-form.store";
import { useColors } from "@/constants/colors";

const TABS = ["Income", "Expense", "Transfer"];

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

export function TransactionForm() {
  const router = useRouter();
  const colors = useColors();
  const { category, fromWallet, toWallet } = useTransactionFormStore();

  const [activeTab, setActiveTab] = useState(1);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);

  const isTransfer = activeTab === 2;
  const currentType = activeTab === 0 ? "income" : "expense";

  return (
    <View className="flex-1 bg-background rounded-t-3xl px-5 pt-6 pb-8">
      {/* Tab pills */}
      <TabPill options={TABS} activeIndex={activeTab} onChange={setActiveTab} />

      {/* Amount input */}
      <View className="items-center mt-8 mb-8">
        <Text className="text-base font-sans-medium text-muted mb-2">
          Amount
        </Text>
        <View className="flex-row items-center">
          <Text
            className="text-5xl text-foreground"
            style={{ fontFamily: "Inter_700Bold", lineHeight: 60 }}
          >
            ${" "}
          </Text>
          <TextInput
            value={amount}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9.]/g, "");
              if ((cleaned.match(/\./g) || []).length <= 1) setAmount(cleaned);
            }}
            placeholder="0.00"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            className="text-5xl text-foreground min-w-[80px]"
            style={{ fontFamily: "Inter_700Bold", padding: 0, lineHeight: 60 }}
          />
        </View>
      </View>

      {/* Field grid */}
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
          onPress={() => router.push({ pathname: "/(modals)/select-category", params: { type: currentType } })}
          flex={false}
        />

        {/* From Wallet + To Wallet */}
        <View className="flex-row gap-3">
          <DropdownField
            icon="chevrons-right"
            label="From - Wallet"
            value={fromWallet?.name}
            onPress={() => router.push({ pathname: "/(modals)/select-wallet", params: { field: "from" } })}
          />
          {isTransfer ? (
            <DropdownField
              icon="chevrons-left"
              label="To - Wallet"
              value={toWallet?.name}
              onPress={() => router.push({ pathname: "/(modals)/select-wallet", params: { field: "to" } })}
            />
          ) : (
            <View className="flex-1" />
          )}
        </View>
      </View>

      {/* Description */}
      {showDescription ? (
        <View className="flex-row items-center mt-4 py-3 border-b border-border">
          <Feather name="file-text" size={18} color={colors.muted} />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description..."
            placeholderTextColor={colors.muted}
            autoFocus
            className="flex-1 text-base text-foreground ml-2"
            style={{ fontFamily: "Inter_500Medium", padding: 0 }}
          />
        </View>
      ) : (
        <Pressable
          className="flex-row items-center mt-4 py-3"
          onPress={() => setShowDescription(true)}
        >
          <Feather name="file-text" size={18} color={colors.muted} />
          <Text className="text-base font-sans-medium text-muted ml-2">
            Add Description
          </Text>
        </Pressable>
      )}

      {/* Submit button */}
      <View className="mt-auto pt-6">
        <Button label="Add Transaction" />
      </View>

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
    </View>
  );
}
