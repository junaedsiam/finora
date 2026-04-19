import { View, Text, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import Feather from "@expo/vector-icons/Feather";
import { useColors } from "@/constants/colors";
import { currencies } from "@/constants/currencies";
import { Button } from "@/components/ui/Button";

export default function EditAccountScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    currency?: string;
  }>();

  const colors = useColors();
  const isEditing = !!params.id;
  const [name, setName] = useState(params.name ?? "");
  const [currencyCode, setCurrencyCode] = useState(params.currency ?? "USD");

  const selectedCurrency = currencies.find((c) => c.code === currencyCode);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="mr-3 active:opacity-70"
        >
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-xl font-sans-bold text-foreground">
          {isEditing ? "Edit Account" : "Add Account"}
        </Text>
      </View>

      <View className="px-5 mt-4 gap-5">
        {/* Name Field */}
        <View className="gap-2">
          <Text className="text-sm font-sans-semibold text-muted uppercase tracking-wider">
            Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Account name"
            placeholderTextColor={colors.muted}
            className="rounded-xl border border-border px-4 py-3.5 text-base font-sans-medium text-foreground"
          />
        </View>

        {/* Currency Field */}
        <View className="gap-2">
          <Text className="text-sm font-sans-semibold text-muted uppercase tracking-wider">
            Currency
          </Text>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/settings/currency-picker",
                params: { selected: currencyCode },
              })
            }
            className="flex-row items-center rounded-xl border border-border px-4 py-3.5 active:opacity-70"
          >
            <Text className="flex-1 text-base font-sans-medium text-foreground">
              {selectedCurrency
                ? `${selectedCurrency.symbol}  ${selectedCurrency.name} (${selectedCurrency.code})`
                : "Select currency"}
            </Text>
            <Feather name="chevron-right" size={18} color={colors.muted} />
          </Pressable>
        </View>

        {/* Save Button */}
        <View className="mt-4">
          <Button
            label={isEditing ? "Save Changes" : "Create Account"}
            disabled={name.trim().length === 0}
          />
        </View>
      </View>
    </View>
  );
}
