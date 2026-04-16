import { View } from "react-native";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BudgetProgressCard } from "./BudgetProgressCard";

const MOCK_BUDGETS = [
  { name: "Monthly Budget", spent: 1650, total: 2500, color: "#3538F8" },
  { name: "Festival Budget", spent: 250, total: 1000, color: "#22C55E" },
];

export function BudgetSection() {
  return (
    <View className="px-5 mt-6">
      <SectionHeader title="Budgets" actionLabel="View All >" />
      <View className="gap-3">
        {MOCK_BUDGETS.map((budget) => (
          <BudgetProgressCard key={budget.name} {...budget} />
        ))}
      </View>
    </View>
  );
}
