import { SelectionList } from "@/components/forms/SelectionList";
import {
  useTransactionFormStore,
  type PickerItem,
} from "@/stores/transaction-form.store";

const DEMO_CATEGORIES: PickerItem[] = [
  { id: "1", name: "Food & Dining", subtitle: "Restaurants, groceries", icon: "coffee", color: "#EF4444" },
  { id: "2", name: "Transport", subtitle: "Fuel, rides, parking", icon: "truck", color: "#F59E0B" },
  { id: "3", name: "Shopping", subtitle: "Clothes, electronics", icon: "shopping-bag", color: "#8B5CF6" },
  { id: "4", name: "Bills & Utilities", subtitle: "Rent, electricity, water", icon: "zap", color: "#3B82F6" },
  { id: "5", name: "Entertainment", subtitle: "Movies, games, music", icon: "film", color: "#EC4899" },
  { id: "6", name: "Health", subtitle: "Medicine, gym, doctor", icon: "heart", color: "#10B981" },
  { id: "7", name: "Salary", subtitle: "Monthly income", icon: "briefcase", color: "#059669" },
  { id: "8", name: "Freelance", subtitle: "Side projects", icon: "monitor", color: "#0EA5E9" },
];

export default function SelectCategoryScreen() {
  const { category, setCategory } = useTransactionFormStore();

  return (
    <SelectionList
      title="Select Category"
      items={DEMO_CATEGORIES}
      selectedId={category?.id}
      onSelect={setCategory}
    />
  );
}
