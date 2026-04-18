import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { IconCircle } from "@/components/ui/IconCircle";
import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/colors";
import { walletColors } from "@/constants/wallet-colors";

export default function EditWalletScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    balance?: string;
    color?: string;
    icon?: string;
    is_excluded?: string;
  }>();

  const isEditing = !!params.id;
  const [name, setName] = useState(params.name ?? "");
  const [balance, setBalance] = useState(params.balance ?? "");
  const [selectedColor, setSelectedColor] = useState(params.color ?? walletColors[0].value);
  const [selectedIcon, setSelectedIcon] = useState<string>(params.icon ?? "dollar-sign");
  const [isExcluded, setIsExcluded] = useState(params.is_excluded === "1");
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);

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
          {isEditing ? "Edit Wallet" : "Add Wallet"}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview */}
        <View className="items-center my-4">
          <IconCircle
            icon={selectedIcon as React.ComponentProps<typeof Feather>["name"]}
            bgColor={selectedColor}
            iconColor="rgba(0,0,0,0.6)"
            size={64}
          />
        </View>

        <View className="gap-5">
          {/* Name */}
          <View className="gap-2">
            <Text className="text-sm font-sans-semibold text-muted uppercase tracking-wider">
              Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Wallet name"
              placeholderTextColor={colors.muted}
              className="rounded-xl border border-border px-4 py-3.5 text-base font-sans-medium text-foreground"
            />
          </View>

          {/* Balance */}
          <View className="gap-2">
            <Text className="text-sm font-sans-semibold text-muted uppercase tracking-wider">
              Initial Balance
            </Text>
            <TextInput
              value={balance}
              onChangeText={setBalance}
              placeholder="0.00"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              className="rounded-xl border border-border px-4 py-3.5 text-base font-sans-medium text-foreground"
            />
          </View>

          {/* Color */}
          <View className="gap-2">
            <Text className="text-sm font-sans-semibold text-muted uppercase tracking-wider">
              Color
            </Text>
            <Pressable
              onPress={() => setColorDropdownOpen((v) => !v)}
              className="flex-row items-center rounded-xl border border-border px-4 py-3.5 active:opacity-70"
            >
              <View
                className="h-6 w-6 rounded-full mr-3"
                style={{ backgroundColor: selectedColor }}
              />
              <Text className="flex-1 text-base font-sans-medium text-foreground">
                {walletColors.find((c) => c.value === selectedColor)?.name ?? "Select color"}
              </Text>
              <Feather
                name={colorDropdownOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.muted}
              />
            </Pressable>

            {colorDropdownOpen && (
              <View className="flex-row flex-wrap gap-2 mt-1">
                {walletColors.map((c) => (
                  <Pressable
                    key={c.value}
                    onPress={() => {
                      setSelectedColor(c.value);
                      setColorDropdownOpen(false);
                    }}
                    className="items-center justify-center rounded-full"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: c.value,
                      borderWidth: selectedColor === c.value ? 2.5 : 0,
                      borderColor: colors.foreground,
                    }}
                  >
                    {selectedColor === c.value && (
                      <Feather name="check" size={18} color={colors.foreground} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Icon */}
          <View className="gap-2">
            <Text className="text-sm font-sans-semibold text-muted uppercase tracking-wider">
              Icon
            </Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/settings/icon-picker",
                  params: { selected: selectedIcon, color: selectedColor },
                })
              }
              className="flex-row items-center rounded-xl border border-border px-4 py-3.5 active:opacity-70"
            >
              <View
                className="h-8 w-8 rounded-lg items-center justify-center mr-3"
                style={{ backgroundColor: selectedColor }}
              >
                <Feather
                  name={selectedIcon as React.ComponentProps<typeof Feather>["name"]}
                  size={18}
                  color="rgba(0,0,0,0.6)"
                />
              </View>
              <Text className="flex-1 text-base font-sans-medium text-foreground">
                Pick Icon
              </Text>
              <Feather name="chevron-right" size={18} color={colors.muted} />
            </Pressable>
          </View>

          {/* Exclude Toggle */}
          <View className="flex-row items-center justify-between rounded-xl border border-border px-4 py-3.5">
            <View className="flex-1 mr-3">
              <Text className="text-base font-sans-medium text-foreground">
                Exclude from total
              </Text>
              <Text className="text-sm font-sans text-muted mt-1">
                Ignore the balance of this wallet on the total balance
              </Text>
            </View>
            <Switch
              value={isExcluded}
              onValueChange={setIsExcluded}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Save Button */}
          <View className="mt-2">
            <Button
              label={isEditing ? "Save Changes" : "Create Wallet"}
              disabled={name.trim().length === 0}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
