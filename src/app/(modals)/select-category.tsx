import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { useColors } from "@/constants/colors";
import {
  useTransactionFormStore,
} from "@/stores/transaction-form.store";
import { useCategoriesForPicker } from "@/hooks/useCategories";
import type { CategoryType } from "@/types/database";

export default function SelectCategoryScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ type?: string }>();
  const { category, setCategory } = useTransactionFormStore();

  const categoryType = (params.type ?? "expense") as CategoryType;
  const { data: categoriesWithSubs = [] } = useCategoriesForPicker(categoryType);

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
          Select Category
        </Text>
      </View>

      {/* List */}
      <ScrollView className="flex-1 px-4">
        {categoriesWithSubs.length === 0 ? (
          <View className="items-center py-12">
            <Feather name="folder" size={40} color={colors.muted} />
            <Text className="text-muted mt-3">No categories yet</Text>
          </View>
        ) : (
          categoriesWithSubs.map((parent) => (
            <View key={parent.id}>
              {/* Parent Category */}
              <Pressable
                onPress={() => {
                  setCategory({
                    id: parent.id.toString(),
                    name: parent.name,
                    icon: parent.icon,
                    color: parent.color,
                  });
                  router.back();
                }}
                className="flex-row items-center py-4"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <View
                  className="h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: parent.color }}
                >
                  <Feather
                    name={parent.icon as React.ComponentProps<typeof Feather>["name"]}
                    size={20}
                    color="#FFFFFF"
                  />
                </View>

                <View className="flex-1 ml-3">
                  <Text className="text-lg text-foreground font-sans-medium">
                    {parent.name}
                  </Text>
                </View>

                <View
                  className="h-6 w-6 items-center justify-center rounded-full border-2"
                  style={{
                    borderColor: category?.id === parent.id.toString() ? colors.primary : colors.border,
                    backgroundColor: category?.id === parent.id.toString() ? colors.primary : "transparent",
                  }}
                >
                  {category?.id === parent.id.toString() && (
                    <View className="h-2.5 w-2.5 rounded-full bg-white" />
                  )}
                </View>
              </Pressable>

              {/* Subcategories */}
              {parent.subCategories.length > 0 && (
                <View className="pl-6 pb-2">
                  {parent.subCategories.map((sub) => {
                    const isSelected = category?.id === sub.id.toString();
                    return (
                      <Pressable
                        key={sub.id}
                        onPress={() => {
                          setCategory({
                            id: sub.id.toString(),
                            name: `${parent.name}/${sub.name}`,
                            icon: sub.icon || parent.icon,
                            color: sub.color || parent.color,
                          });
                          router.back();
                        }}
                        className="flex-row items-center py-3"
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.7 : 1,
                        })}
                      >
                        <View
                          className="h-2 w-2 rounded-full mr-3"
                          style={{ backgroundColor: sub.color || parent.color }}
                        />
                        <Text className="flex-1 text-lg text-foreground font-sans-medium">
                          {sub.name}
                        </Text>
                        <View
                          className="h-5 w-5 items-center justify-center rounded-full border-2"
                          style={{
                            borderColor: isSelected ? colors.primary : colors.border,
                            backgroundColor: isSelected ? colors.primary : "transparent",
                          }}
                        >
                          {isSelected && (
                            <View className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}