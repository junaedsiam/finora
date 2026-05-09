import { useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "@expo/vector-icons/Feather";
import { formatCurrency } from "@/utils/currency";
import { useUIStore } from "@/stores/ui.store";
import { useWallets } from "@/hooks/useWallets";
import { useAccounts } from "@/hooks/useAccount";
import { useAccountStore } from "@/stores/account.store";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
import { router } from "expo-router";

export function BalanceCard() {
  const visible = useUIStore((s) => s.balanceVisible);
  const toggleVisible = useUIStore((s) => s.toggleBalanceVisible);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: wallets = [] } = useWallets();
  const { data: accounts = [] } = useAccounts();
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  const setActiveAccountId = useAccountStore((s) => s.setActiveAccountId);

  const activeAccount = accounts.find((a) => a.id === activeAccountId);
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  const currency = useActiveCurrency();

  const handleAccountSelect = (id: number) => {
    setActiveAccountId(id);
    setDropdownOpen(false);
  };

  const handleAddAccount = () => {
    setDropdownOpen(false);
    router.push("/settings/edit-account");
  };

  return (
    <>
      <LinearGradient
        colors={["#3538F8", "#575AFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ marginHorizontal: 20, borderRadius: 24, padding: 20 }}
      >
        {/* Account selector + menu */}
        <View className="flex-row items-center justify-between mb-4">
          <Pressable
            onPress={() => setDropdownOpen(true)}
            className="flex-row items-center rounded-full px-4 py-1.5"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <Text className="mr-1 text-base text-white font-sans-medium">
              {activeAccount?.name ?? "Select Account"}
            </Text>
            <Feather name="chevron-down" size={16} color="#FFFFFF" />
          </Pressable>
          <Pressable hitSlop={8} onPress={() => setMenuOpen(true)}>
            <Feather name="more-vertical" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Total Balance */}
        <Text
          className="mb-1 font-sans text-base text-white"
          style={{ opacity: 0.7 }}
        >
          Total Balance
        </Text>
        <View className="flex-row items-center gap-3 mb-4">
          <Text className="text-[34px] font-sans-bold text-white">
            {visible ? formatCurrency(totalBalance, { currency }) : "••••••"}
          </Text>
          <Pressable onPress={toggleVisible} hitSlop={8}>
            <Feather
              name={visible ? "eye" : "eye-off"}
              size={22}
              color="rgba(255,255,255,0.6)"
            />
          </Pressable>
        </View>

        {/* Divider */}
        <View
          className="h-px mb-4"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        />

        {/* Income & Expense — placeholder until transactions are wired */}
        <View className="flex-row gap-8">
          <View>
            <View className="flex-row items-center gap-1 mb-1">
              <Text
                className="font-sans text-base text-white"
                style={{ opacity: 0.7 }}
              >
                Income
              </Text>
              <Feather name="arrow-up-right" size={16} color="#4ADE80" />
            </View>
            <Text className="text-lg text-white font-sans-semibold">
              {visible ? formatCurrency(0, { currency }) : "••••"}
            </Text>
          </View>
          <View>
            <View className="flex-row items-center gap-1 mb-1">
              <Text
                className="font-sans text-base text-white"
                style={{ opacity: 0.7 }}
              >
                Expense
              </Text>
              <Feather name="arrow-down-right" size={16} color="#FF6B6B" />
            </View>
            <Text className="text-lg text-white font-sans-semibold">
              {visible ? formatCurrency(0, { currency }) : "••••"}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Account Dropdown Modal — centered */}
      <Modal
        visible={dropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <Pressable
          className="items-center justify-center flex-1 bg-black/50"
          onPress={() => setDropdownOpen(false)}
        >
          <View
            className="mx-8 overflow-hidden bg-surface rounded-2xl w-72"
            onStartShouldSetResponder={() => true}
          >
            <Text className="px-5 pt-5 pb-3 text-lg font-sans-bold text-foreground">
              Switch Account
            </Text>
            {accounts.map((account) => (
              <Pressable
                key={account.id}
                onPress={() => handleAccountSelect(account.id)}
                className="flex-row items-center px-5 py-4 active:bg-border"
              >
                <Text className="flex-1 text-lg font-sans-medium text-foreground">
                  {account.name}
                </Text>
                {account.id === activeAccountId && (
                  <Feather name="check" size={20} color="#4ADE80" />
                )}
              </Pressable>
            ))}
            <View className="h-px mx-5 bg-border" />
            <Pressable
              onPress={handleAddAccount}
              className="flex-row items-center px-5 py-4 active:bg-border"
            >
              <Feather name="plus-circle" size={22} color="#4ADE80" />
              <Text className="ml-3 text-lg font-sans-medium text-foreground">
                Add New Account
              </Text>
            </Pressable>
            <View className="pb-5" />
          </View>
        </Pressable>
      </Modal>

      {/* 3-dot Menu Modal — centered */}
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
                setActiveAccountId(activeAccountId);
              }}
              className="flex-row items-center px-5 py-4 active:bg-border"
            >
              <Feather name="star" size={18} color="#FDE047" />
              <Text className="ml-3 text-base font-sans-medium text-foreground">
                Set as Active
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}