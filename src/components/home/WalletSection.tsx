import { View, Pressable } from "react-native";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WalletCard } from "./WalletCard";
import { useWallets } from "@/hooks/useWallets";
import { useColors } from "@/constants/colors";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";

export function WalletSection() {
  const colors = useColors();
  const { data: wallets = [] } = useWallets();
  const currency = useActiveCurrency();

  return (
    <View className="px-5 mt-6">
      <SectionHeader
        title="Wallets"
        actionLabel="View All >"
        onAction={() => router.push("/settings/wallets")}
      />
      <View className="flex-row flex-wrap gap-3">
        {wallets.slice(0, 4).map((wallet) => (
          <View key={wallet.id} className="w-[48%]">
            <WalletCard
              wallet={wallet}
              currency={currency}
            />
          </View>
        ))}
        {/* Add wallet card */}
        <View className="w-[48%]">
          <Pressable
            onPress={() => router.push("/settings/edit-wallet")}
            className="rounded-2xl border-2 border-dashed border-border items-center justify-center h-28"
          >
            <Feather name="plus" size={24} color={colors.muted} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}