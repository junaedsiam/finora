import { View, Text, Pressable, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { useColors } from "@/constants/colors";
import { walletIcons } from "@/constants/wallet-icons";

export default function IconPickerScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const params = useLocalSearchParams<{ selected?: string; color?: string }>();
  const activeColor = params.color ?? "#C1F0DB";

  const renderItem = ({ item }: { item: (typeof walletIcons)[number] }) => {
    const isSelected = item === params.selected;

    return (
      <Pressable
        onPress={() => router.back()}
        className="flex-1 items-center justify-center py-4 active:opacity-70"
      >
        <View
          className="items-center justify-center rounded-2xl"
          style={{
            width: 56,
            height: 56,
            backgroundColor: isSelected ? activeColor : colors.surface,
          }}
        >
          <Feather
            name={item}
            size={24}
            color={isSelected ? "rgba(0,0,0,0.6)" : colors.muted}
          />
        </View>
        <Text
          className="mt-1.5 text-xs font-sans-medium text-center"
          style={{ color: isSelected ? colors.foreground : colors.muted }}
          numberOfLines={1}
        >
          {item}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="mr-3 active:opacity-70"
        >
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-xl font-sans-bold text-foreground">
          Pick Icon
        </Text>
      </View>

      <FlatList
        data={walletIcons}
        keyExtractor={(item) => item}
        numColumns={4}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 24,
        }}
      />
    </View>
  );
}
