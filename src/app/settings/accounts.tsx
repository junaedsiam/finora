import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { useColors } from "@/constants/colors";
import { useAccounts } from "@/hooks/useAccount";
import { useAccountStore } from "@/stores/account.store";

function AccountItem({ account }: { account: { id: number; name: string; currency: string } }) {
  const colors = useColors();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  const setActiveAccountId = useAccountStore((s) => s.setActiveAccountId);
  const isActive = account.id === activeAccountId;

  return (
    <Pressable
      className="flex-row items-center py-3.5 px-4 active:opacity-70"
      onPress={() =>
        router.push({
          pathname: "/settings/edit-account",
          params: { id: account.id, name: account.name, currency: account.currency },
        })
      }
    >
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-sans-semibold text-foreground">
            {account.name}
          </Text>
          {isActive && (
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: colors.primary }}>
              <Text className="text-xs font-sans-medium text-white">Active</Text>
            </View>
          )}
        </View>
        <Text className="text-base font-sans text-muted mt-0.5">
          {account.currency}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.muted} />
    </Pressable>
  );
}

export default function AccountsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { data: accounts = [] } = useAccounts();

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.background }}>
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
            Account
          </Text>
        </View>
        <Pressable
          hitSlop={8}
          className="active:opacity-70"
          onPress={() => router.push("/settings/edit-account")}
        >
          <Feather name="plus" size={24} color={colors.foreground} />
        </Pressable>
      </View>

      <View
        className="flex-1 bg-surface mx-4 rounded-2xl"
        style={{ marginBottom: insets.bottom + 24 }}
      >
        {accounts.map((account, index) => (
          <View key={account.id}>
            <AccountItem account={account} />
            {index < accounts.length - 1 && (
              <View className="h-px bg-border mx-4" />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
