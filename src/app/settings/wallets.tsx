import { useCallback } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { IconCircle } from "@/components/ui/IconCircle";
import { useColors } from "@/constants/colors";
import { useWallets, useDeleteWallet, useUpdateWalletSortOrders } from "@/hooks/useWallets";

function WalletItem({
  wallet,
  drag,
  isActive,
}: {
  wallet: { id: number; name: string; balance: number; color: string; icon: string; is_excluded: boolean };
  drag: () => void;
  isActive: boolean;
}) {
  const colors = useColors();
  const deleteWallet = useDeleteWallet();

  return (
    <ScaleDecorator>
      <View
        className="flex-row items-center py-3.5 px-4 bg-background"
        style={
          isActive
            ? {
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 5,
              }
            : undefined
        }
      >
        <Pressable onLongPress={drag} delayLongPress={100} hitSlop={8} className="mr-3">
          <Feather name="menu" size={22} color={colors.muted} />
        </Pressable>

        <IconCircle
          icon={wallet.icon as React.ComponentProps<typeof Feather>["name"]}
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
                balance: String(wallet.balance),
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

        <Pressable
          hitSlop={8}
          className="active:opacity-70"
          onPress={() => {
            Alert.alert(
              "Delete Wallet",
              `Are you sure you want to delete "${wallet.name}"?`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => deleteWallet.mutate(wallet.id),
                },
              ]
            );
          }}
        >
          <Feather name="trash-2" size={20} color={colors.expense} />
        </Pressable>
      </View>
    </ScaleDecorator>
  );
}

export default function WalletsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { data: wallets = [] } = useWallets();
  const deleteWallet = useDeleteWallet();
  const updateSortOrders = useUpdateWalletSortOrders();

  const renderItem = ({ item, drag, isActive }: RenderItemParams<typeof wallets[number]>) => (
    <WalletItem wallet={item} drag={drag} isActive={isActive} />
  );

  const handleDragEnd = useCallback(
    ({ data }: { data: typeof wallets }) => {
      const orders = data.map((item, index) => ({
        id: item.id,
        sort_order: index,
      }));
      // Write to DB immediately — DraggableFlatList already has the reordered data from the drag
      updateSortOrders.mutate(orders);
    },
    [updateSortOrders]
  );

  return (
    <GestureHandlerRootView style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.background }}>
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
        onDragEnd={handleDragEnd}
        renderItem={renderItem}
        autoscrollThreshold={0}
        style={{ flex: 1, backgroundColor: colors.background }}
        containerStyle={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 24,
        }}
        ItemSeparatorComponent={() => <View className="h-px bg-border mx-4" />}
      />
    </GestureHandlerRootView>
  );
}