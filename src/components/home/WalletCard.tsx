import { useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { IconCircle } from "@/components/ui/IconCircle";
import { formatCurrency } from "@/utils/currency";
import { useUIStore } from "@/stores/ui.store";
import { router } from "expo-router";
import type { WalletRow } from "@/types/database";

type WalletCardProps = {
  wallet: WalletRow;
  currency?: string;
};

export function WalletCard({ wallet, currency = "USD" }: WalletCardProps) {
  const visible = useUIStore((s) => s.balanceVisible);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Pressable
        className="rounded-2xl p-4"
        style={{ backgroundColor: wallet.color }}
      >
        <View className="flex-row items-center">
          <IconCircle
            icon={wallet.icon as React.ComponentProps<typeof Feather>["name"]}
            bgColor="rgba(255,255,255,0.35)"
            iconColor="rgba(0,0,0,0.6)"
            size={36}
          />
          <View className="flex-1 ml-3">
            <Text
              className="text-base font-sans-medium"
              style={{ color: "rgba(0,0,0,0.6)" }}
              numberOfLines={1}
            >
              {wallet.name}
            </Text>
            <Text
              className="text-lg font-sans-bold"
              style={{ color: "#222222" }}
            >
              {visible ? formatCurrency(wallet.balance, { decimals: false, currency }) : "••••"}
            </Text>
          </View>
          <Pressable hitSlop={8} onPress={() => setMenuOpen(true)}>
            <Feather name="more-vertical" size={18} color="rgba(0,0,0,0.4)" />
          </Pressable>
        </View>
      </Pressable>

      {/* 3-dot Menu */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          className="items-center justify-center flex-1 bg-black/50"
          onPress={() => setMenuOpen(false)}
        >
          <View
            className="mx-8 overflow-hidden bg-surface rounded-2xl w-56"
            onStartShouldSetResponder={() => true}
          >
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                router.push("/(modals)/add-transaction");
              }}
              className="flex-row items-center px-5 py-4 active:bg-border"
            >
              <Feather name="plus-circle" size={20} color="#4ADE80" />
              <Text className="ml-3 text-lg font-sans-medium text-foreground">
                Add Transaction
              </Text>
            </Pressable>
            <View className="h-px bg-border mx-5" />
            <Pressable
              onPress={() => {
                setMenuOpen(false);
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
                });
              }}
              className="flex-row items-center px-5 py-4 active:bg-border"
            >
              <Feather name="edit-2" size={20} color="#93C5FD" />
              <Text className="ml-3 text-lg font-sans-medium text-foreground">
                Edit
              </Text>
            </Pressable>
            <View className="h-px bg-border mx-5" />
            <Pressable
              onPress={() => setMenuOpen(false)}
              className="flex-row items-center px-5 py-4 active:bg-border"
            >
              <Feather name="trash-2" size={20} color="#FF6B6B" />
              <Text className="ml-3 text-lg font-sans-medium text-foreground">
                Delete
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}