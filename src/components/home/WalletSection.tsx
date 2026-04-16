import { View, Pressable } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WalletCard } from "./WalletCard";
import { colors } from "@/constants/colors";

const MOCK_WALLETS = [
  { name: "Cash", balance: 5543, color: "#86EFAC", icon: "dollar-sign" as const },
  { name: "Brac Bank", balance: 10543, color: "#93C5FD", icon: "credit-card" as const },
  { name: "Investment", balance: 101543, color: "#FDE047", icon: "trending-up" as const },
  { name: "Land Investment", balance: 10543, color: "#C4B5FD", icon: "file-text" as const },
];

export function WalletSection() {
  return (
    <View className="px-5 mt-6">
      <SectionHeader title="Wallets" actionLabel="View All >" />
      <View className="flex-row flex-wrap gap-3">
        {MOCK_WALLETS.map((wallet) => (
          <View key={wallet.name} className="w-[48%]">
            <WalletCard {...wallet} />
          </View>
        ))}
        {/* Add wallet card */}
        <View className="w-[48%]">
          <Pressable className="rounded-2xl border-2 border-dashed border-border items-center justify-center h-28">
            <Feather name="plus" size={24} color={colors.muted} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
