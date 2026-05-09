import { useLocalSearchParams } from "expo-router";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { useColors } from "@/constants/colors";
import {
  useTransactionFormStore,
  type PickerItem,
} from "@/stores/transaction-form.store";
import { useWallets } from "@/hooks/useWallets";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
import { formatCurrency } from "@/utils/currency";

export default function SelectWalletScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { field } = useLocalSearchParams<{ field: "from" | "to" }>();
  const { fromWallet, toWallet, setFromWallet, setToWallet } =
    useTransactionFormStore();
  const { data: wallets = [] } = useWallets();
  const currency = useActiveCurrency();

  const isTo = field === "to";

  const pickerItems: PickerItem[] = wallets.map((w) => ({
    id: w.id.toString(),
    name: w.name,
    subtitle: formatCurrency(w.balance, { currency }),
    icon: w.icon,
    color: w.color,
  }));

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4 gap-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="active:opacity-70"
        >
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="flex-1 text-xl font-sans-bold text-foreground">
          {isTo ? "Select Destination Wallet" : "Select Wallet"}
        </Text>
      </View>

      {/* List */}
      <ScrollView className="flex-1 px-4">
        {pickerItems.length === 0 ? (
          <View className="items-center py-12">
            <Feather name="briefcase" size={40} color={colors.muted} />
            <Text className="text-muted mt-3">No wallets yet</Text>
          </View>
        ) : (
          pickerItems.map((item) => {
            const isSelected = isTo ? toWallet?.id === item.id : fromWallet?.id === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  if (isTo) {
                    setToWallet(item);
                  } else {
                    setFromWallet(item);
                  }
                  router.back();
                }}
                className="flex-row items-center py-4"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <View
                  className="h-14 w-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: item.color }}
                >
                  <Feather
                    name={item.icon as React.ComponentProps<typeof Feather>["name"]}
                    size={24}
                    color="rgba(0,0,0,0.6)"
                  />
                </View>

                <View className="flex-1 ml-4">
                  <Text
                    className="text-xl text-foreground font-sans-semibold"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text
                    className="text-base text-muted mt-0.5"
                    style={{ fontFamily: "Inter_500Medium" }}
                  >
                    {item.subtitle}
                  </Text>
                </View>

                <View
                  className="h-6 w-6 items-center justify-center rounded-full border-2"
                  style={{
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primary : "transparent",
                  }}
                >
                  {isSelected && (
                    <View className="h-2.5 w-2.5 rounded-full bg-white" />
                  )}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}