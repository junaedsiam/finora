import { View, Text, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import type { CategoryRow } from "@/types/database";
import { useColors } from "@/constants/colors";
import { useCategory } from "@/hooks/useCategories";
import { useSubCategories, useDeleteSubCategory, useReorderSubCategories } from "@/hooks/useCategories";

function SubCategoryItem({
  category,
  drag,
  isActive,
  onDelete,
  onEdit,
}: {
  category: CategoryRow;
  drag: () => void;
  isActive: boolean;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const colors = useColors();
  return (
    <View
      className="flex-row items-center py-3.5 px-4 bg-background"
      style={
        isActive
          ? {
              transform: [{ scale: 1.02 }],
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 6,
            }
          : undefined
      }
    >
      <Pressable
        onLongPress={drag}
        delayLongPress={100}
        hitSlop={8}
        className="mr-3"
      >
        <Feather name="menu" size={22} color={colors.muted} />
      </Pressable>

      <Pressable className="flex-1 ml-3" onPress={onEdit}>
        <Text className="text-lg font-sans-semibold text-foreground">
          {category.name}
        </Text>
      </Pressable>

      <Pressable
        onPress={onEdit}
        hitSlop={8}
        className="mr-3 active:opacity-70"
      >
        <Feather name="edit-2" size={18} color={colors.muted} />
      </Pressable>

      <Pressable
        onPress={onDelete}
        hitSlop={8}
        className="active:opacity-70"
      >
        <Feather name="trash-2" size={20} color={colors.expense} />
      </Pressable>
    </View>
  );
}

export default function SubCategoriesScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ categoryId: string }>();
  const colors = useColors();
  const categoryId = parseInt(params.categoryId ?? "0", 10);

  const { data: parentCategory } = useCategory(categoryId);
  const { data: subCategories = [] } = useSubCategories(categoryId);
  const deleteSubCategory = useDeleteSubCategory();
  const reorderSubCategories = useReorderSubCategories();

  const handleDelete = (sub: CategoryRow) => {
    Alert.alert(
      "Delete Sub-Category",
      `Are you sure you want to delete "${sub.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteSubCategory.mutate(sub.id),
        },
      ]
    );
  };

  const handleEdit = (sub: CategoryRow) => {
    router.push({
      pathname: "/settings/edit-subcategory",
      params: { id: sub.id.toString(), parentId: categoryId.toString() },
    } as any);
  };

  const handleDragEnd = ({ data }: { data: CategoryRow[] }) => {
    const sorted = data.map((item, index) => ({
      id: item.id,
      sort_order: index,
    }));
    reorderSubCategories.mutate(sorted);
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<CategoryRow>) => (
    <SubCategoryItem
      category={item}
      drag={drag}
      isActive={isActive}
      onDelete={() => handleDelete(item)}
      onEdit={() => handleEdit(item)}
    />
  );

  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        paddingTop: insets.top,
        backgroundColor: colors.background,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="active:opacity-70"
          >
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
          <Text className="text-xl font-sans-bold text-foreground">
            {parentCategory?.name ?? "Sub-Categories"}
          </Text>
        </View>
        <Pressable
          hitSlop={8}
          className="active:opacity-70"
          onPress={() =>
            router.push({
              pathname: "/settings/edit-subcategory",
              params: { parentId: categoryId.toString() },
            } as any)
          }
        >
          <Feather name="plus" size={24} color={colors.foreground} />
        </Pressable>
      </View>

      {subCategories.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Feather name="folder" size={48} color={colors.muted} />
          <Text className="text-muted mt-4 text-center font-sans-medium">
            No sub-categories yet
          </Text>
          <Text className="text-muted mt-1 text-center text-sm">
            Tap + to add your first sub-category
          </Text>
        </View>
      ) : (
        <DraggableFlatList
          data={subCategories}
          keyExtractor={(item) => item.id.toString()}
          onDragEnd={handleDragEnd}
          renderItem={renderItem}
          autoscrollThreshold={0}
          activationDistance={0}
          animationConfig={{}}
          style={{ flex: 1, backgroundColor: colors.background }}
          containerStyle={{ flex: 1, backgroundColor: colors.background }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 24,
          }}
          ItemSeparatorComponent={() => <View className="h-px mx-4 bg-border" />}
        />
      )}
    </GestureHandlerRootView>
  );
}
