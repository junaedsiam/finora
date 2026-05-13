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
import { Button } from "@/components/ui/Button";
import { useColors } from "@/constants/colors";
import {
  useCreateSubCategory,
  useUpdateSubCategory,
  useCategory,
} from "@/hooks/useCategories";

export default function EditSubCategoryScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id?: string;
    parentId: string;
  }>();

  const colors = useColors();
  const isEditing = !!params.id;
  const parentId = parseInt(params.parentId ?? "0", 10);
  const itemId = isEditing ? parseInt(params.id ?? "0", 10) : 0;

  const { data: existingSub } = useCategory(itemId);
  const [name, setName] = useState("");

  useEffect(() => {
    if (existingSub?.name) {
      setName(existingSub.name);
    }
  }, [existingSub]);

  const createSubCategory = useCreateSubCategory();
  const updateSubCategory = useUpdateSubCategory();

  const isDisabled = name.trim().length === 0;

  const handleSave = () => {
    if (!name.trim()) return;
    Keyboard.dismiss();

    if (isEditing && params.id) {
      updateSubCategory.mutate(
        { id: Number(params.id), name: name.trim(), parentId },
        {
          onSuccess: () => router.back(),
          onError: () => Alert.alert("Error", "Failed to update sub-category"),
        },
      );
    } else {
      createSubCategory.mutate(
        { parentId, name: name.trim() },
        {
          onSuccess: () => router.back(),
          onError: () => Alert.alert("Error", "Failed to create sub-category"),
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
          {isEditing ? "Edit Sub-Category" : "Add Sub-Category"}
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
        <View className="gap-5">
          {/* Name */}
          <View className="gap-2">
            <Text className="text-sm tracking-wider uppercase font-sans-semibold text-muted">
              Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Sub-category name"
              placeholderTextColor={colors.muted}
              className="rounded-xl border border-border px-4 py-4 text-base font-sans-medium text-foreground"
            />
          </View>

          {/* Save Button */}
          <View className="mt-2">
            <Button
              label={isEditing ? "Save Changes" : "Create Sub-Category"}
              disabled={
                isDisabled ||
                createSubCategory.isPending ||
                updateSubCategory.isPending
              }
              onPress={handleSave}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
