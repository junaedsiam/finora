import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColors } from "@/constants/colors";

type Account = {
  id: number;
  name: string;
  currency: string;
  balance: number;
};

const INITIAL_ACCOUNTS: Account[] = [
  { id: 1, name: "Main Account", currency: "USD", balance: 12450.0 },
  { id: 2, name: "Savings", currency: "USD", balance: 34200.5 },
  { id: 3, name: "Business", currency: "EUR", balance: 8730.25 },
];

function AccountItem({
  account,
  drag,
  isActive,
}: {
  account: Account;
  drag: () => void;
  isActive: boolean;
}) {
  const colors = useColors();
  return (
    <ScaleDecorator>
      <View
        className="flex-row items-center py-3.5 px-4 bg-background"
        style={isActive ? { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 5 } : undefined}
      >
        {/* Drag handle */}
        <Pressable onLongPress={drag} delayLongPress={100} hitSlop={8} className="mr-3">
          <Feather name="menu" size={22} color={colors.muted} />
        </Pressable>

        {/* Name + Balance (tappable to edit) */}
        <Pressable
          className="flex-1 active:opacity-70"
          onPress={() =>
            router.push({
              pathname: "/settings/edit-account",
              params: { id: account.id, name: account.name, currency: account.currency },
            })
          }
        >
          <Text className="text-lg font-sans-semibold text-foreground">
            {account.name}
          </Text>
          <Text className="text-base font-sans text-muted mt-0.5">
            {account.currency} {account.balance.toLocaleString()}
          </Text>
        </Pressable>

        {/* Delete */}
        <Pressable hitSlop={8} className="active:opacity-70">
          <Feather name="trash-2" size={20} color={colors.expense} />
        </Pressable>
      </View>
    </ScaleDecorator>
  );
}

export default function AccountsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Account>) => (
    <AccountItem account={item} drag={drag} isActive={isActive} />
  );

  return (
    <GestureHandlerRootView style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.background }}>
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

      <DraggableFlatList
        data={accounts}
        keyExtractor={(item) => item.id.toString()}
        onDragEnd={({ data }) => setAccounts(data)}
        renderItem={renderItem}
        style={{ flex: 1, backgroundColor: colors.background }}
        containerStyle={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 24,
        }}
        ItemSeparatorComponent={() => (
          <View className="h-px bg-border mx-4" />
        )}
      />
    </GestureHandlerRootView>
  );
}
