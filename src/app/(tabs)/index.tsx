import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeHeader } from "@/components/home/HomeHeader";
import { BalanceCard } from "@/components/home/BalanceCard";
import { WalletSection } from "@/components/home/WalletSection";
import { BudgetSection } from "@/components/home/BudgetSection";
import { UpcomingCosts } from "@/components/home/UpcomingCosts";
import { DebtSection } from "@/components/home/DebtSection";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <HomeHeader />
      <BalanceCard />
      <WalletSection />
      <UpcomingCosts />
      <BudgetSection />
      <DebtSection />
    </ScrollView>
  );
}
