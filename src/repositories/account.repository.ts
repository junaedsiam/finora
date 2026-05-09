import { db } from "@/db/client";
import type { AccountRow } from "@/types/database";

export function getAllAccounts(): AccountRow[] {
  return db.getAllSync<AccountRow>("SELECT * FROM accounts ORDER BY id");
}

export function getAccountById(id: number): AccountRow | null {
  return db.getFirstSync<AccountRow>("SELECT * FROM accounts WHERE id = ?", [id]);
}

export async function createAccount(name: string, currency: string): Promise<number> {
  const result = db.runSync(
    "INSERT INTO accounts (name, currency) VALUES (?, ?)",
    [name, currency]
  );
  return result.lastInsertRowId;
}

export async function updateAccount(id: number, name: string, currency: string): Promise<void> {
  db.runSync(
    "UPDATE accounts SET name = ?, currency = ?, updated_at = datetime('now') WHERE id = ?",
    [name, currency, id]
  );
}
