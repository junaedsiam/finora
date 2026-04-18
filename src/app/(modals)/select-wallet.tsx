import { useLocalSearchParams } from "expo-router";
import { SelectionList } from "@/components/forms/SelectionList";
import {
  useTransactionFormStore,
  type PickerItem,
} from "@/stores/transaction-form.store";

const DEMO_WALLETS: PickerItem[] = [
  { id: "1", name: "Moneybag", subtitle: "$420", icon: "dollar-sign", color: "#7C3AED" },
  { id: "2", name: "Cash", subtitle: "$12,000", icon: "credit-card", color: "#374151" },
  { id: "3", name: "Investment", subtitle: "$350,000", icon: "trending-up", color: "#EF4444" },
  { id: "4", name: "Bank Account", subtitle: "$68,128", icon: "home", color: "#2563EB" },
  { id: "5", name: "Savings", subtitle: "$498,825", icon: "archive", color: "#F59E0B" },
  { id: "6", name: "Credit Card", subtitle: "$257,474", icon: "credit-card", color: "#8B5CF6" },
];

export default function SelectWalletScreen() {
  const { field } = useLocalSearchParams<{ field: "from" | "to" }>();
  const { fromWallet, toWallet, setFromWallet, setToWallet } =
    useTransactionFormStore();

  const isTo = field === "to";

  return (
    <SelectionList
      title={isTo ? "Select Destination Wallet" : "Select Wallet"}
      items={DEMO_WALLETS}
      selectedId={isTo ? toWallet?.id : fromWallet?.id}
      onSelect={isTo ? setToWallet : setFromWallet}
    />
  );
}
