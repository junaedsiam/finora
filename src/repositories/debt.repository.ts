import { db } from "@/db/client";
import type { DebtRow } from "@/types/database";

export function getDebtsByAccount(accountId: number): DebtRow[] {
  return db.getAllSync<DebtRow>(
    `SELECT * FROM debts WHERE account_id = ? AND is_settled = 0 ORDER BY due_date ASC, id DESC`,
    [accountId]
  );
}

export function getAllDebtsByAccount(accountId: number): DebtRow[] {
  return db.getAllSync<DebtRow>(
    `SELECT * FROM debts WHERE account_id = ? ORDER BY is_settled ASC, due_date ASC, id DESC`,
    [accountId]
  );
}

export function getDebtById(id: number): DebtRow | null {
  return db.getFirstSync<DebtRow>("SELECT * FROM debts WHERE id = ?", [id]);
}

export async function createDebt(params: {
  accountId: number;
  name: string;
  type: "borrow" | "lend";
  originalAmount: number;
  remainingAmount: number;
  dueDate?: string | null;
  walletId?: number | null;
}): Promise<number> {
  const result = db.runSync(
    `INSERT INTO debts (account_id, name, type, original_amount, remaining_amount, due_date, wallet_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      params.accountId,
      params.name,
      params.type,
      params.originalAmount,
      params.remainingAmount,
      params.dueDate ?? null,
      params.walletId ?? null,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateDebt(
  id: number,
  params: {
    name?: string;
    type?: "borrow" | "lend";
    originalAmount?: number;
    remainingAmount?: number;
    dueDate?: string | null;
    walletId?: number | null;
    isSettled?: boolean;
  }
): Promise<void> {
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (params.name !== undefined) {
    updates.push("name = ?");
    values.push(params.name);
  }
  if (params.type !== undefined) {
    updates.push("type = ?");
    values.push(params.type);
  }
  if (params.originalAmount !== undefined) {
    updates.push("original_amount = ?");
    values.push(params.originalAmount);
  }
  if (params.remainingAmount !== undefined) {
    updates.push("remaining_amount = ?");
    values.push(params.remainingAmount);
  }
  if (params.dueDate !== undefined) {
    updates.push("due_date = ?");
    values.push(params.dueDate);
  }
  if (params.walletId !== undefined) {
    updates.push("wallet_id = ?");
    values.push(params.walletId);
  }
  if (params.isSettled !== undefined) {
    updates.push("is_settled = ?");
    values.push(params.isSettled ? 1 : 0);
  }

  if (updates.length === 0) return;

  updates.push("updated_at = datetime('now')");
  values.push(id);

  db.runSync(`UPDATE debts SET ${updates.join(", ")} WHERE id = ?`, values);
}

export async function deleteDebt(id: number): Promise<void> {
  db.runSync("DELETE FROM debts WHERE id = ?", [id]);
}
