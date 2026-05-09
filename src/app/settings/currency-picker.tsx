import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import Feather from "@expo/vector-icons/Feather";
import { useColors } from "@/constants/colors";
import { currencies, type Currency } from "@/constants/currencies";
import { useCurrencyPickerStore } from "@/stores/currency-picker.store";

function CurrencyItem({
  currency,
  isSelected,
  onPress,
}: {
  currency: Currency;
  isSelected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-3.5 px-4 active:opacity-70"
    >
      <Text className="text-lg font-sans-medium w-10">{currency.symbol}</Text>
      <View className="flex-1 ml-2">
        <Text className="text-base font-sans-medium text-foreground">
          {currency.name}
        </Text>
        <Text className="text-sm font-sans text-muted">{currency.code}</Text>
      </View>
      {isSelected && (
        <Feather name="check" size={20} color={colors.primary} />
      )}
    </Pressable>
  );
}

export default function CurrencyPickerScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const params = useLocalSearchParams<{ selected?: string }>();
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const setSelectedCode = useCurrencyPickerStore((s) => s.setSelectedCode);

  const filtered = search.trim()
    ? currencies.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.symbol.includes(search)
      )
    : currencies;

  const handleSelect = (code: string) => {
    setSelectedCode(code);
    router.back();
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
            Currency
          </Text>
        </View>
        <Pressable
          hitSlop={8}
          className="active:opacity-70"
          onPress={() => setShowSearch((v) => !v)}
        >
          <Feather name="search" size={20} color={colors.muted} />
        </Pressable>
      </View>

      {/* Search bar */}
      {showSearch && (
        <View className="px-5 pb-3">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search currencies..."
            placeholderTextColor={colors.muted}
            autoFocus
            className="rounded-xl bg-surface px-4 py-3 text-base font-sans-medium text-foreground"
          />
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.code}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        renderItem={({ item }) => (
          <CurrencyItem
            currency={item}
            isSelected={item.code === params.selected}
            onPress={() => handleSelect(item.code)}
          />
        )}
        ItemSeparatorComponent={() => (
          <View className="h-px bg-border mx-4" />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-base font-sans text-muted">
              No currencies found
            </Text>
          </View>
        }
      />
    </View>
  );
}
