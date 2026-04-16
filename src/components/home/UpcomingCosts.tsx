import { View, Text, Pressable } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { colors } from "@/constants/colors";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { IconCircle } from "@/components/ui/IconCircle";
import { formatCurrency } from "@/utils/currency";

type UpcomingItem = {
  name: string;
  dueLabel: string;
  amount: number;
  icon: React.ComponentProps<typeof Feather>["name"];
  iconBg: string;
};

const MOCK_UPCOMING: UpcomingItem[] = [
  {
    name: "Internet Bill",
    dueLabel: "Due 24 Jun - Today",
    amount: 20.0,
    icon: "wifi",
    iconBg: "#5EEAD4",
  },
  {
    name: "Grocery - Regular",
    dueLabel: "Due 24 Jun - Today",
    amount: 5.49,
    icon: "shopping-bag",
    iconBg: "#FDBA74",
  },
];

export function UpcomingCosts() {
  return (
    <View className="px-5 mt-6">
      <SectionHeader title="Upcoming Costs" actionLabel="Manage Recurring >" />
      <View className="gap-3">
        {MOCK_UPCOMING.map((item) => (
          <View
            key={item.name}
            className="flex-row items-center rounded-2xl p-4 border border-border bg-background"
          >
            <IconCircle
              icon={item.icon}
              bgColor={item.iconBg}
              iconColor="#FFFFFF"
              size={44}
            />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-sans-semibold text-foreground">
                {item.name}
              </Text>
              <Text className="text-xs font-sans text-muted mt-0.5">
                {item.dueLabel}
              </Text>
            </View>
            <View className="items-end gap-2">
              <Text className="text-base font-sans-semibold text-foreground">
                {formatCurrency(item.amount)}
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  hitSlop={6}
                  className="rounded-full p-1.5 border border-border"
                >
                  <Feather name="edit-2" size={14} color={colors.muted} />
                </Pressable>
                <Pressable
                  hitSlop={6}
                  className="rounded-full p-1.5 border border-border"
                >
                  <Feather name="x" size={14} color={colors.expense} />
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
