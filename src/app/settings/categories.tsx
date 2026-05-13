import { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { IconCircle } from "@/components/ui/IconCircle";
import { TabPill } from "@/components/ui/TabPill";
import { useColors } from "@/constants/colors";
import type { CategoryRow } from "@/types/database";
import { useCategoriesByType, useDeleteCategory, useReorderCategories } from "@/hooks/useCategories";

function CategoryItem({
  category,
  drag,
  isActive,
  onDelete,
}: {
  category: CategoryRow;
  drag: () => void;
  isActive: boolean;
  onDelete: () => void;
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

      <Pressable
        className="flex-row flex-1 items-center ml-3 active:opacity-70"
        onPress={() =>
          router.push(`/settings/subcategories/${category.id}` as any)
        }
      >
        <IconCircle
          icon={category.icon as React.ComponentProps<typeof Feather>["name"]}
          bgColor={category.color}
          iconColor="rgba(0,0,0,0.55)"
          size={42}
        />
        <Text className="ml-3 text-lg font-sans-semibold text-foreground">
          {category.name}
        </Text>
      </Pressable>

      <Pressable
        onPress={() =>
          router.push({
            pathname: "/settings/edit-category",
            params: {
              id: category.id,
              type: category.type,
              name: category.name,
              color: category.color,
              icon: category.icon,
            },
          })
        }
        hitSlop={10}
        className="mr-4 active:opacity-70"
      >
        <Feather name="edit-2" size={20} color={colors.muted} />
      </Pressable>

      <Pressable onPress={onDelete} hitSlop={8} className="active:opacity-70">
        <Feather name="trash-2" size={20} color={colors.expense} />
      </Pressable>
    </View>
  );
}

const TAB_OPTIONS = ["Income", "Expense"];

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [activeTab, setActiveTab] = useState(0);

  const currentType = activeTab === 0 ? "income" : "expense";
  const { data: categories = [], isLoading } = useCategoriesByType(currentType);
  const deleteCategory = useDeleteCategory();
  const reorderCategories = useReorderCategories();

  const handleDelete = (category: CategoryRow) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.name}"? This will also delete all sub-categories.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteCategory.mutate(category.id),
        },
      ]
    );
  };

  const handleDragEnd = ({ data }: { data: CategoryRow[] }) => {
    const sorted = data.map((item, index) => ({
      id: item.id,
      sort_order: index,
    }));
    reorderCategories.mutate(sorted);
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<CategoryRow>) => (
    <CategoryItem
      category={item}
      drag={drag}
      isActive={isActive}
      onDelete={() => handleDelete(item)}
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
            Category
          </Text>
        </View>
        <Pressable
          hitSlop={8}
          className="active:opacity-70"
          onPress={() =>
            router.push({
              pathname: "/settings/edit-category",
              params: { type: currentType },
            })
          }
        >
          <Feather name="plus" size={24} color={colors.foreground} />
        </Pressable>
      </View>

      {/* Tabs */}
      <View className="px-5 mb-4">
        <TabPill
          options={TAB_OPTIONS}
          activeIndex={activeTab}
          onChange={setActiveTab}
        />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">Loading...</Text>
        </View>
      ) : categories.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Feather name="folder" size={48} color={colors.muted} />
          <Text className="text-muted mt-4 text-center font-sans-medium">
            No {currentType} categories yet
          </Text>
          <Text className="text-muted mt-1 text-center text-sm">
            Tap + to add your first {currentType} category
          </Text>
        </View>
      ) : (
        <DraggableFlatList
          data={categories}
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