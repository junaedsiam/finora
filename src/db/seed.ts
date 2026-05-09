import { db } from "./client";
import { runMigrations } from "./migrate";

const EXPENSE_CATEGORIES = [
  { name: "Food & Dining", icon: "coffee", color: "#FF6B6B" },
  { name: "Transport", icon: "truck", color: "#4ECDC4" },
  { name: "Shopping", icon: "shopping-bag", color: "#FFE66D" },
  { name: "Bills & Utilities", icon: "file-text", color: "#95E1D3" },
  { name: "Entertainment", icon: "headphones", color: "#DDA0DD" },
  { name: "Health", icon: "heart", color: "#98D8C8" },
  { name: "Education", icon: "book", color: "#87CEEB" },
  { name: "Travel", icon: "navigation", color: "#FFB347" },
  { name: "Groceries", icon: "shopping-bag", color: "#90EE90" },
  { name: "Other", icon: "ellipsis-horizontal", color: "#C0C0C0" },
];

const INCOME_CATEGORIES = [
  { name: "Salary", icon: "briefcase", color: "#22C55E" },
  { name: "Freelance", icon: "monitor", color: "#10B981" },
  { name: "Investment", icon: "trending-up", color: "#059669" },
  { name: "Gift", icon: "gift", color: "#34D399" },
  { name: "Other Income", icon: "ellipsis-horizontal", color: "#6EE7B7" },
];


export function seedDatabase(): void {
  runMigrations();

  // Check if already seeded
  const existingAccount = db.getFirstSync<{ count: number }>(
    "SELECT COUNT(*) as count FROM accounts"
  );
  if (existingAccount && existingAccount.count > 0) return;

  // Create default account
  db.runSync(
    "INSERT INTO accounts (name, currency) VALUES ('Main Account', 'USD')"
  );
  const accountId = 1;

  // Create default wallets
  const wallets = [
    { name: "Cash", type: "cash", balance: 0, color: "#22C55E", icon: "dollar-sign" },
    { name: "Bank", type: "bank", balance: 0, color: "#6366F1", icon: "credit-card" },
    {
      name: "Savings",
      type: "savings",
      balance: 0,
      color: "#F59E0B",
      icon: "briefcase",
    },
  ];

  for (const wallet of wallets) {
    db.runSync(
      "INSERT INTO wallets (account_id, name, type, balance, color, icon) VALUES (?, ?, ?, ?, ?, ?)",
      [accountId, wallet.name, wallet.type, wallet.balance, wallet.color, wallet.icon]
    );
  }

  // Create expense categories
  for (const cat of EXPENSE_CATEGORIES) {
    db.runSync(
      "INSERT INTO categories (account_id, name, type, icon, color) VALUES (?, ?, 'expense', ?, ?)",
      [accountId, cat.name, cat.icon, cat.color]
    );
  }

  // Create income categories
  for (const cat of INCOME_CATEGORIES) {
    db.runSync(
      "INSERT INTO categories (account_id, name, type, icon, color) VALUES (?, ?, 'income', ?, ?)",
      [accountId, cat.name, cat.icon, cat.color]
    );
  }

}
