export type TransactionType = "income" | "expense" | "transfer";
export type TransactionStatus = "confirmed" | "pending" | "skipped";
export type CategoryType = "income" | "expense";

export type AccountRow = {
  id: number;
  name: string;
  currency: string;
  created_at: string;
  updated_at: string;
};

export type WalletRow = {
  id: number;
  account_id: number;
  name: string;
  type: string;
  balance: number;
  color: string;
  icon: string;
  is_excluded: boolean;
  created_at: string;
  updated_at: string;
};

export type CategoryRow = {
  id: number;
  account_id: number;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  parent_id: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type TransactionRow = {
  id: number;
  account_id: number;
  wallet_id: number;
  destination_wallet_id: number | null;
  category_id: number;
  type: TransactionType;
  amount: number;
  note: string | null;
  status: TransactionStatus;
  recurring_id: number | null;
  created_at: string;
  updated_at: string;
};

export type BudgetRow = {
  id: number;
  account_id: number;
  name: string;
  amount: number;
  period: "weekly" | "monthly" | "yearly";
  start_date: string;
  created_at: string;
  updated_at: string;
};

export type BudgetCategoryRow = {
  budget_id: number;
  category_id: number;
};

export type DebtRow = {
  id: number;
  account_id: number;
  name: string;
  type: "borrow" | "lend";
  original_amount: number;
  remaining_amount: number;
  due_date: string | null;
  wallet_id: number | null;
  is_settled: boolean;
  created_at: string;
  updated_at: string;
};

export type RecurringRow = {
  id: number;
  account_id: number;
  wallet_id: number;
  category_id: number;
  type: TransactionType;
  amount: number;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  next_due_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
