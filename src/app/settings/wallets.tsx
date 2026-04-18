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
import { IconCircle } from "@/components/ui/IconCircle";
import { colors } from "@/constants/colors";

type Wallet = {
  id: number;
  name: string;
  balance: number;
  color: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  is_excluded: boolean;
};

const INITIAL_WALLETS: Wallet[] = [
  { id: 1, name: "Cash", balance: 2340.0, color: "#C1F0DB", icon: "dollar-sign", is_excluded: false },
  { id: 2, name: "Bank Account", balance: 8750.5, color: "#BAE1FF", icon: "credit-card", is_excluded: false },
  { id: 3, name: "Savings", balance: 15200.0, color: "#FFF3C4", icon: "lock", is_excluded: false },
  { id: 4, name: "Investment", balance: 5400.25, color: "#D5C8F0", icon: "trending-up", is_excluded: true },
];

function WalletItem({
  wallet,
  drag,
  isActive,
}: {
  wallet: Wallet;
  drag: () => void;
  isActive: boolean;
}) {
  return (
    <ScaleDecorator>
      <View
        className="flex-row items-center py-3.5 px-4 bg-background"
        style={isActive ? { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 5 } : undefined}
      >
        <Pressable onLongPress={drag} delayLongPress={100} hitSlop={8} className="mr-3">
          <Feather name="menu" size={22} color={colors.muted} />
        </Pressable>

        <IconCircle
          icon={wallet.icon}
          bgColor={wallet.color}
          iconColor="rgba(0,0,0,0.6)"
          size={42}
        />

        <Pressable
          className="flex-1 ml-3 active:opacity-70"
          onPress={() =>
            router.push({
              pathname: "/settings/edit-wallet",
              params: {
                id: wallet.id,
                name: wallet.name,
                balance: wallet.balance,
                color: wallet.color,
                icon: wallet.icon,
                is_excluded: wallet.is_excluded ? "1" : "0",
              },
            })
          }
        >
          <Text className="text-lg font-sans-semibold text-foreground">
            {wallet.name}
          </Text>
          <Text className="text-base font-sans text-muted mt-0.5">
            ${wallet.balance.toLocaleString()}
          </Text>
        </Pressable>

        <Pressable hitSlop={8} className="active:opacity-70">
          <Feather name="trash-2" size={20} color={colors.expense} />
        </Pressable>
      </View>
    </ScaleDecorator>
  );
}

export default function WalletsScreen() {
  const insets = useSafeAreaInsets();
  const [wallets, setWallets] = useState(INITIAL_WALLETS);

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Wallet>) => (
    <WalletItem wallet={item} drag={drag} isActive={isActive} />
  );

  return (
    <GestureHandlerRootView className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="active:opacity-70"
          >
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
          <Text className="text-xl font-sans-bold text-foreground">Wallet</Text>
        </View>
        <Pressable
          hitSlop={8}
          className="active:opacity-70"
          onPress={() => router.push("/settings/edit-wallet")}
        >
          <Feather name="plus" size={24} color={colors.foreground} />
        </Pressable>
      </View>

      <DraggableFlatList
        data={wallets}
        keyExtractor={(item) => item.id.toString()}
        onDragEnd={({ data }) => setWallets(data)}
        renderItem={renderItem}
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
