import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { IconCircle } from "@/components/ui/IconCircle";
import { Button } from "@/components/ui/Button";
import { useColors } from "@/constants/colors";
import { categoryColors } from "@/constants/category-colors";
import { useIconPickerStore } from "@/stores/icon-picker.store";
import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";
import type { CategoryType } from "@/types/database";

export default function EditCategoryScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id?: string;
    type?: string;
    name?: string;
    color?: string;
    icon?: string;
  }>();

  const colors = useColors();
  const isEditing = !!params.id;
  const categoryType = params.type ?? "expense";
  const typeLabel = categoryType === "income" ? "Income" : "Expense";

  const [name, setName] = useState(params.name ?? "");
  const [selectedColor, setSelectedColor] = useState(
    params.color ?? categoryColors[0].value,
  );
  const [selectedIcon, setSelectedIcon] = useState<string>(
    params.icon ?? "tag",
  );
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);

  const storeIcon = useIconPickerStore((s) => s.selectedIcon);
  const clearIcon = () => useIconPickerStore.getState().setSelectedIcon(null);

  useEffect(() => {
    if (storeIcon) {
      setSelectedIcon(storeIcon);
      clearIcon();
    }
  }, [storeIcon]);

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const isDisabled = name.trim().length === 0;

  const handleSave = () => {
    if (!name.trim()) return;
    if (isEditing && params.id) {
      updateCategory.mutate(
        {
          id: Number(params.id),
          name: name.trim(),
          icon: selectedIcon,
          color: selectedColor,
        },
        {
          onSuccess: () => router.back(),
          onError: () => Alert.alert("Error", "Failed to update category"),
        },
      );
    } else {
      createCategory.mutate(
        {
          name: name.trim(),
          type: categoryType as CategoryType,
          icon: selectedIcon,
          color: selectedColor,
        },
        {
          onSuccess: () => router.back(),
          onError: () => Alert.alert("Error", "Failed to create category"),
        },
      );
    }
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
          {isEditing
            ? `Edit ${typeLabel} Category`
            : `Add ${typeLabel} Category`}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        {/* Preview */}
        <View className="items-center my-4">
          <IconCircle
            icon={selectedIcon as React.ComponentProps<typeof Feather>["name"]}
            bgColor={selectedColor}
            iconColor="rgba(0,0,0,0.55)"
            size={64}
          />
        </View>

        <View className="gap-5">
          {/* Name */}
          <View className="gap-2">
            <Text className="text-sm tracking-wider uppercase font-sans-semibold text-muted">
              Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Category name"
              placeholderTextColor={colors.muted}
              className="rounded-xl border border-border px-4 py-4 text-base font-sans-medium text-foreground"
            />
          </View>

          {/* Color */}
          <View className="gap-2">
            <Text className="text-sm tracking-wider uppercase font-sans-semibold text-muted">
              Color
            </Text>
            <Pressable
              onPress={() => setColorDropdownOpen((v) => !v)}
              className="flex-row items-center rounded-xl border border-border px-4 py-4 active:opacity-70"
            >
              <View
                className="w-6 h-6 mr-3 rounded-full"
                style={{ backgroundColor: selectedColor }}
              />
              <Text className="flex-1 text-base font-sans-medium text-foreground">
                {categoryColors.find((c) => c.value === selectedColor)?.name ??
                  "Select color"}
              </Text>
              <Feather
                name={colorDropdownOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.muted}
              />
            </Pressable>

            {colorDropdownOpen && (
              <View className="flex-row flex-wrap gap-2 mt-1">
                {categoryColors.map((c) => (
                  <Pressable
                    key={c.value}
                    onPress={() => {
                      setSelectedColor(c.value);
                      setColorDropdownOpen(false);
                    }}
                    className="items-center justify-center rounded-full"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: c.value,
                      borderWidth: selectedColor === c.value ? 2.5 : 0,
                      borderColor: colors.foreground,
                    }}
                  >
                    {selectedColor === c.value && (
                      <Feather
                        name="check"
                        size={18}
                        color={colors.foreground}
                      />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Icon */}
          <View className="gap-2">
            <Text className="text-sm tracking-wider uppercase font-sans-semibold text-muted">
              Icon
            </Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/settings/icon-picker",
                  params: { selected: selectedIcon, color: selectedColor },
                })
              }
              className="flex-row items-center rounded-xl border border-border px-4 py-4 active:opacity-70"
            >
              <View
                className="items-center justify-center w-8 h-8 mr-3 rounded-lg"
                style={{ backgroundColor: selectedColor }}
              >
                <Feather
                  name={
                    selectedIcon as React.ComponentProps<typeof Feather>["name"]
                  }
                  size={18}
                  color="rgba(0,0,0,0.55)"
                />
              </View>
              <Text className="flex-1 text-base font-sans-medium text-foreground">
                Pick Icon
              </Text>
              <Feather name="chevron-right" size={18} color={colors.muted} />
            </Pressable>
          </View>

          {/* Save Button */}
          <View className="mt-2">
            <Button
              label={
                isEditing ? "Save Changes" : `Create ${typeLabel} Category`
              }
              disabled={
                isDisabled ||
                createCategory.isPending ||
                updateCategory.isPending
              }
              onPress={handleSave}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
