import { db } from "@/db/client";
import type { RecurringRow } from "@/types/database";

export function getRecurringByAccount(accountId: number): RecurringRow[] {
  return db.getAllSync<RecurringRow>(
    `SELECT * FROM recurring
     WHERE account_id = ?
     ORDER BY next_due_date ASC, id DESC`,
    [accountId]
  );
}

export function getRecurringById(id: number): RecurringRow | null {
  return db.getFirstSync<RecurringRow>("SELECT * FROM recurring WHERE id = ?", [id]);
}

export function getUpcomingRecurring(accountId: number, limit: number = 10): RecurringRow[] {
  const today = new Date().toISOString().split("T")[0];
  return db.getAllSync<RecurringRow>(
    `SELECT * FROM recurring
     WHERE account_id = ? AND is_active = 1 AND next_due_date <= date(?, '+7 days')
     ORDER BY next_due_date ASC
     LIMIT ?`,
    [accountId, today, limit]
  );
}

export function getPendingRecurring(accountId: number): RecurringRow[] {
  const today = new Date().toISOString().split("T")[0];
  return db.getAllSync<RecurringRow>(
    `SELECT * FROM recurring
     WHERE account_id = ? AND is_active = 1 AND next_due_date <= ?
     ORDER BY next_due_date ASC`,
    [accountId, today]
  );
}

export function createRecurring(params: {
  accountId: number;
  walletId: number;
  categoryId: number;
  destinationWalletId?: number | null;
  type: RecurringRow["type"];
  amount: number;
  frequency: RecurringRow["frequency"];
  nextDueDate: string;
  startDate?: string;
  note?: string | null;
}): number {
  const now = new Date().toISOString();
  const result = db.runSync(
    `INSERT INTO recurring (account_id, wallet_id, category_id, destination_wallet_id, type, amount, frequency, next_due_date, start_date, note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.accountId,
      params.walletId,
      params.categoryId,
      params.destinationWalletId ?? null,
      params.type,
      params.amount,
      params.frequency,
      params.nextDueDate,
      params.startDate ?? params.nextDueDate,
      params.note ?? null,
      now,
      now,
    ]
  );
  return result.lastInsertRowId;
}

export function updateRecurring(
  id: number,
  params: {
    walletId?: number;
    categoryId?: number;
    destinationWalletId?: number | null;
    type?: RecurringRow["type"];
    amount?: number;
    frequency?: RecurringRow["frequency"];
    nextDueDate?: string;
    startDate?: string;
    note?: string | null;
    isActive?: boolean;
  }
): void {
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (params.walletId !== undefined) {
    updates.push("wallet_id = ?");
    values.push(params.walletId);
  }
  if (params.categoryId !== undefined) {
    updates.push("category_id = ?");
    values.push(params.categoryId);
  }
  if (params.destinationWalletId !== undefined) {
    updates.push("destination_wallet_id = ?");
    values.push(params.destinationWalletId);
  }
  if (params.type !== undefined) {
    updates.push("type = ?");
    values.push(params.type);
  }
  if (params.amount !== undefined) {
    updates.push("amount = ?");
    values.push(params.amount);
  }
  if (params.frequency !== undefined) {
    updates.push("frequency = ?");
    values.push(params.frequency);
  }
  if (params.nextDueDate !== undefined) {
    updates.push("next_due_date = ?");
    values.push(params.nextDueDate);
  }
  if (params.startDate !== undefined) {
    updates.push("start_date = ?");
    values.push(params.startDate);
  }
  if (params.note !== undefined) {
    updates.push("note = ?");
    values.push(params.note);
  }
  if (params.isActive !== undefined) {
    updates.push("is_active = ?");
    values.push(params.isActive ? 1 : 0);
  }

  if (updates.length === 0) return;

  updates.push("updated_at = datetime('now')");
  values.push(id);

  db.runSync(`UPDATE recurring SET ${updates.join(", ")} WHERE id = ?`, values);
}

export function deleteRecurring(id: number): void {
  db.runSync("DELETE FROM recurring WHERE id = ?", [id]);
}

export function getRecurringTransactions(recurringId: number): {
  id: number;
  amount: number;
  note: string | null;
  status: string;
  created_at: string;
  wallet_id: number;
  type: string;
}[] {
  return db.getAllSync(
    `SELECT id, amount, note, status, created_at, wallet_id, type FROM transactions
     WHERE recurring_id = ?
     ORDER BY created_at DESC`,
    [recurringId]
  );
}

export function getPendingRecurringTransactions(accountId: number): {
  id: number;
  amount: number;
  note: string | null;
  status: string;
  created_at: string;
  wallet_id: number;
  type: string;
  recurring_id: number;
}[] {
  return db.getAllSync(
    `SELECT id, amount, note, status, created_at, wallet_id, type, recurring_id FROM transactions
     WHERE account_id = ? AND status = 'pending' AND recurring_id IS NOT NULL
     ORDER BY created_at DESC`,
    [accountId]
  );
}

export function getUpcomingRecurringWithPending(accountId: number, limit: number = 10): {
  id: number;
  amount: number;
  note: string | null;
  type: string;
  frequency: string;
  next_due_date: string;
  wallet_id: number;
  category_id: number;
  destination_wallet_id: number | null;
  is_active: boolean;
  pending_id: number | null;
  pending_amount: number | null;
  pending_note: string | null;
  pending_status: string | null;
}[] {
  const today = new Date().toISOString().split("T")[0];
  return db.getAllSync(
    `SELECT
       r.id,
       r.amount,
       r.note,
       r.type,
       r.frequency,
       r.next_due_date,
       r.wallet_id,
       r.category_id,
       r.destination_wallet_id,
       r.is_active,
       t.id AS pending_id,
       t.amount AS pending_amount,
       t.note AS pending_note,
       t.status AS pending_status
     FROM recurring r
     LEFT JOIN transactions t ON t.recurring_id = r.id AND t.status = 'pending'
     WHERE r.account_id = ? AND r.is_active = 1 AND r.next_due_date <= date(?, '+7 days')
     ORDER BY r.next_due_date ASC
     LIMIT ?`,
    [accountId, today, limit]
  );
}
