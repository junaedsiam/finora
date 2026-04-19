import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import type { PickerItem } from "@/stores/transaction-form.store";
import { useColors } from "@/constants/colors";

type SelectionListProps = {
  title: string;
  items: PickerItem[];
  selectedId?: string | null;
  onSelect: (item: PickerItem) => void;
};

export function SelectionList({
  title,
  items,
  selectedId,
  onSelect,
}: SelectionListProps) {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();

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
          {title}
        </Text>
      </View>

      {/* List */}
      <ScrollView className="flex-1 px-4">
        {items.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                onSelect(item);
                router.back();
              }}
              className="flex-row items-center py-4"
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
            >
              {/* Icon circle */}
              <View
                className="h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: item.color }}
              >
                <Feather
                  name={item.icon as React.ComponentProps<typeof Feather>["name"]}
                  size={20}
                  color="#FFFFFF"
                />
              </View>

              {/* Name + subtitle */}
              <View className="flex-1 ml-3">
                <Text
                  className="text-lg text-foreground"
                  style={{ fontFamily: "Inter_500Medium" }}
                >
                  {item.name}
                </Text>
                {item.subtitle && (
                  <Text className="text-base text-muted mt-0.5">
                    {item.subtitle}
                  </Text>
                )}
              </View>

              {/* Radio */}
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
        })}
      </ScrollView>
    </View>
  );
}
