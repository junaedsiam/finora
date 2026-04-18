import { View, Text, Pressable } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { IconCircle } from "@/components/ui/IconCircle";
import { formatCurrency } from "@/utils/currency";
import { useUIStore } from "@/stores/ui.store";

type WalletCardProps = {
  name: string;
  balance: number;
  color: string;
  icon: React.ComponentProps<typeof Feather>["name"];
};

export function WalletCard({ name, balance, color, icon }: WalletCardProps) {
  const visible = useUIStore((s) => s.balanceVisible);

  return (
    <Pressable
      className="rounded-2xl p-4"
      style={{ backgroundColor: color }}
    >
      <View className="flex-row items-center">
        <IconCircle
          icon={icon}
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
            {name}
          </Text>
          <Text className="text-lg font-sans-bold text-foreground">
            {visible ? formatCurrency(balance, { decimals: false }) : "••••"}
          </Text>
        </View>
        <Pressable hitSlop={8}>
          <Feather name="more-vertical" size={18} color="rgba(0,0,0,0.4)" />
        </Pressable>
      </View>
    </Pressable>
  );
}
