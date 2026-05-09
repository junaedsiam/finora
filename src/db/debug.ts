import { db } from "./client";

// Debug: log all tables and row counts
export function logDbState(): void {
  const tables = ["accounts", "wallets", "categories", "transactions", "budgets", "debts", "recurring"];
  for (const table of tables) {
    try {
      const result = db.getFirstSync<{ count: number }>(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`[DB] ${table}: ${result?.count ?? 0} rows`);
    } catch (e) {
      console.log(`[DB] ${table}: ERROR — ${e}`);
    }
  }
}

// Debug: log all wallets
export function logWallets(): void {
  const wallets = db.getAllSync("SELECT * FROM wallets");
  console.log("[DB] wallets:", JSON.stringify(wallets, null, 2));
}
