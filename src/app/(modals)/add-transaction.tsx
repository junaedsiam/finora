import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { useColors } from "@/constants/colors";

export default function AddTransactionModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  return (
    <View
      className="flex-1"
      style={{ paddingTop: insets.top + 40, backgroundColor: colors.background }}
    >
      {/* Tap above form to dismiss + back button */}
      <Pressable className="flex-row items-end px-4 pb-3" onPress={() => router.back()}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-full"
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
            backgroundColor: colors.surface,
          })}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
      </Pressable>

      <TransactionForm />
    </View>
  );
}
