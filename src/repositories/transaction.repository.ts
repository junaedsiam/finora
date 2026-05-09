import { db } from "@/db/client";
import type { TransactionRow, TransactionType, TransactionStatus } from "@/types/database";

export function getTransactionsByAccount(accountId: number): TransactionRow[] {
  return db.getAllSync<TransactionRow>(
    `SELECT * FROM transactions
     WHERE account_id = ?
     ORDER BY created_at DESC`,
    [accountId]
  );
}

export function getTransactionById(id: number): TransactionRow | null {
  return db.getFirstSync<TransactionRow>("SELECT * FROM transactions WHERE id = ?", [id]);
}

export async function createTransaction(params: {
  accountId: number;
  walletId: number;
  destinationWalletId?: number | null;
  categoryId: number;
  type: TransactionType;
  amount: number;
  note?: string | null;
  status?: TransactionStatus;
  recurringId?: number | null;
  createdAt?: string;
}): Promise<number> {
  const now = new Date().toISOString();
  const result = db.runSync(
    `INSERT INTO transactions (account_id, wallet_id, destination_wallet_id, category_id, type, amount, note, status, recurring_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.accountId,
      params.walletId,
      params.destinationWalletId ?? null,
      params.categoryId,
      params.type,
      params.amount,
      params.note ?? null,
      params.status ?? "confirmed",
      params.recurringId ?? null,
      params.createdAt ?? now,
      now,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateTransaction(
  id: number,
  params: {
    walletId?: number;
    destinationWalletId?: number | null;
    categoryId?: number;
    amount?: number;
    note?: string | null;
    status?: TransactionStatus;
  }
): Promise<void> {
  const updates: string[] = [];
  const values: (string | number | null | Uint8Array)[] = [];

  if (params.walletId !== undefined) {
    updates.push("wallet_id = ?");
    values.push(params.walletId);
  }
  if (params.destinationWalletId !== undefined) {
    updates.push("destination_wallet_id = ?");
    values.push(params.destinationWalletId);
  }
  if (params.categoryId !== undefined) {
    updates.push("category_id = ?");
    values.push(params.categoryId);
  }
  if (params.amount !== undefined) {
    updates.push("amount = ?");
    values.push(params.amount);
  }
  if (params.note !== undefined) {
    updates.push("note = ?");
    values.push(params.note);
  }
  if (params.status !== undefined) {
    updates.push("status = ?");
    values.push(params.status);
  }

  if (updates.length === 0) return;

  updates.push("updated_at = datetime('now')");
  values.push(id);

  db.runSync(`UPDATE transactions SET ${updates.join(", ")} WHERE id = ?`, values);
}

export async function deleteTransaction(id: number): Promise<void> {
  db.runSync("DELETE FROM transactions WHERE id = ?", [id]);
}