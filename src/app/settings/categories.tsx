import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { IconCircle } from "@/components/ui/IconCircle";
import { TabPill } from "@/components/ui/TabPill";
import { useColors } from "@/constants/colors";

type Category = {
  id: number;
  type: "income" | "expense";
  name: string;
  color: string;
  icon: React.ComponentProps<typeof Feather>["name"];
};

const MOCK_INCOME: Category[] = [
  { id: 1, type: "income", name: "Salary", color: "#86EFAC", icon: "briefcase" },
  { id: 2, type: "income", name: "Freelance", color: "#7DD3FC", icon: "monitor" },
  { id: 3, type: "income", name: "Investment", color: "#C4B5FD", icon: "trending-up" },
  { id: 4, type: "income", name: "Gift", color: "#FDE68A", icon: "gift" },
  { id: 5, type: "income", name: "Refund", color: "#5EEAD4", icon: "refresh-cw" },
];

const MOCK_EXPENSE: Category[] = [
  { id: 6, type: "expense", name: "Food & Drinks", color: "#FDBA74", icon: "coffee" },
  { id: 7, type: "expense", name: "Transport", color: "#93C5FD", icon: "navigation" },
  { id: 8, type: "expense", name: "Shopping", color: "#F9A8D4", icon: "shopping-bag" },
  { id: 9, type: "expense", name: "Bills & Utilities", color: "#FCA5A5", icon: "zap" },
  { id: 10, type: "expense", name: "Entertainment", color: "#D8B4FE", icon: "film" },
  { id: 11, type: "expense", name: "Health", color: "#6EE7B7", icon: "heart" },
  { id: 12, type: "expense", name: "Education", color: "#A5B4FC", icon: "book" },
  { id: 13, type: "expense", name: "Rent", color: "#FCD34D", icon: "home" },
];

function CategoryItem({
  category,
  drag,
  isActive,
}: {
  category: Category;
  drag: () => void;
  isActive: boolean;
}) {
  const colors = useColors();
  return (
    <ScaleDecorator>
      <View
        className="flex-row items-center py-3.5 px-4 bg-background"
        style={isActive ? { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 5 } : undefined}
      >
        <Pressable onLongPress={drag} delayLongPress={100} hitSlop={8} className="mr-3">
          <Feather name="menu" size={22} color={colors.muted} />
        </Pressable>

        <IconCircle
          icon={category.icon}
          bgColor={category.color}
          iconColor="rgba(0,0,0,0.55)"
          size={42}
        />

        <Pressable
          className="flex-1 ml-3 active:opacity-70"
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
        >
          <Text className="text-lg font-sans-semibold text-foreground">
            {category.name}
          </Text>
        </Pressable>

        <Pressable hitSlop={8} className="active:opacity-70">
          <Feather name="trash-2" size={20} color={colors.expense} />
        </Pressable>
      </View>
    </ScaleDecorator>
  );
}

const TAB_OPTIONS = ["Income", "Expense"];

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [activeTab, setActiveTab] = useState(0);
  const [incomeCategories, setIncomeCategories] = useState(MOCK_INCOME);
  const [expenseCategories, setExpenseCategories] = useState(MOCK_EXPENSE);

  const currentType = activeTab === 0 ? "income" : "expense";
  const currentData = activeTab === 0 ? incomeCategories : expenseCategories;
  const setCurrentData = activeTab === 0 ? setIncomeCategories : setExpenseCategories;

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Category>) => (
    <CategoryItem category={item} drag={drag} isActive={isActive} />
  );

  return (
    <GestureHandlerRootView style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.background }}>
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
        <TabPill options={TAB_OPTIONS} activeIndex={activeTab} onChange={setActiveTab} />
      </View>

      <DraggableFlatList
        data={currentData}
        keyExtractor={(item) => item.id.toString()}
        onDragEnd={({ data }) => setCurrentData(data)}
        renderItem={renderItem}
        style={{ flex: 1, backgroundColor: colors.background }}
        containerStyle={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 24,
        }}
        ItemSeparatorComponent={() => (
          <View className="h-px bg-border mx-4" />
        )}
      />
    </GestureHandlerRootView>
  );
}
