import { db } from "@/db/client";
import type { TransactionType, TransactionStatus } from "@/types/database";

export type CreateTransactionInput = {
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
};

export function createTransactionAtomic(input: CreateTransactionInput): number {
  let lastId = 0;
  db.withTransactionSync(() => {
    const now = new Date().toISOString();

    // 1. Insert transaction
    const txResult = db.runSync(
      `INSERT INTO transactions (account_id, wallet_id, destination_wallet_id, category_id, type, amount, note, status, recurring_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.accountId,
        input.walletId,
        input.destinationWalletId ?? null,
        input.categoryId,
        input.type,
        input.amount,
        input.note ?? null,
        input.status ?? "confirmed",
        input.recurringId ?? null,
        input.createdAt ?? now,
        now,
      ]
    );
    lastId = txResult.lastInsertRowId;

    // 2. Update wallet balance(s)
    if (input.type === "income") {
      db.runSync(
        `UPDATE wallets SET balance = balance + ?, updated_at = datetime('now') WHERE id = ?`,
        [input.amount, input.walletId]
      );
    } else if (input.type === "expense") {
      db.runSync(
        `UPDATE wallets SET balance = balance - ?, updated_at = datetime('now') WHERE id = ?`,
        [input.amount, input.walletId]
      );
    } else if (input.type === "transfer" && input.destinationWalletId) {
      db.runSync(
        `UPDATE wallets SET balance = balance - ?, updated_at = datetime('now') WHERE id = ?`,
        [input.amount, input.walletId]
      );
      db.runSync(
        `UPDATE wallets SET balance = balance + ?, updated_at = datetime('now') WHERE id = ?`,
        [input.amount, input.destinationWalletId]
      );
    }
  });
  return lastId;
}

export function deleteTransactionAtomic(id: number): void {
  db.withTransactionSync(() => {
    // 1. Fetch the transaction first
    const tx = db.getFirstSync<{
      wallet_id: number;
      destination_wallet_id: number | null;
      type: TransactionType;
      amount: number;
    }>("SELECT wallet_id, destination_wallet_id, type, amount FROM transactions WHERE id = ?", [id]);

    if (!tx) return;

    // 2. Reverse wallet balance changes
    if (tx.type === "income") {
      db.runSync(
        `UPDATE wallets SET balance = balance - ?, updated_at = datetime('now') WHERE id = ?`,
        [tx.amount, tx.wallet_id]
      );
    } else if (tx.type === "expense") {
      db.runSync(
        `UPDATE wallets SET balance = balance + ?, updated_at = datetime('now') WHERE id = ?`,
        [tx.amount, tx.wallet_id]
      );
    } else if (tx.type === "transfer" && tx.destination_wallet_id) {
      db.runSync(
        `UPDATE wallets SET balance = balance + ?, updated_at = datetime('now') WHERE id = ?`,
        [tx.amount, tx.wallet_id]
      );
      db.runSync(
        `UPDATE wallets SET balance = balance - ?, updated_at = datetime('now') WHERE id = ?`,
        [tx.amount, tx.destination_wallet_id]
      );
    }

    // 3. Delete the transaction
    db.runSync("DELETE FROM transactions WHERE id = ?", [id]);
  });
}

export type UpdateTransactionInput = {
  id: number;
  walletId?: number;
  destinationWalletId?: number | null;
  categoryId?: number;
  amount?: number;
  note?: string | null;
  status?: TransactionStatus;
};

export function updateTransactionAtomic(input: UpdateTransactionInput): void {
  db.withTransactionSync(() => {
    // 1. Fetch the existing transaction
    const existing = db.getFirstSync<{
      wallet_id: number;
      destination_wallet_id: number | null;
      type: TransactionType;
      amount: number;
    }>("SELECT wallet_id, destination_wallet_id, type, amount FROM transactions WHERE id = ?", [input.id]);

    if (!existing) return;

    // 2. Determine effective values
    const newAmount = input.amount ?? existing.amount;
    const newWalletId = input.walletId ?? existing.wallet_id;
    const newDestWalletId = input.destinationWalletId !== undefined
      ? input.destinationWalletId
      : existing.destination_wallet_id;
    const newType = existing.type; // Type changes not supported in v1

    // 3. Reverse old balance changes
    if (existing.type === "income") {
      db.runSync(
        `UPDATE wallets SET balance = balance - ?, updated_at = datetime('now') WHERE id = ?`,
        [existing.amount, existing.wallet_id]
      );
    } else if (existing.type === "expense") {
      db.runSync(
        `UPDATE wallets SET balance = balance + ?, updated_at = datetime('now') WHERE id = ?`,
        [existing.amount, existing.wallet_id]
      );
    } else if (existing.type === "transfer" && existing.destination_wallet_id) {
      db.runSync(
        `UPDATE wallets SET balance = balance + ?, updated_at = datetime('now') WHERE id = ?`,
        [existing.amount, existing.wallet_id]
      );
      db.runSync(
        `UPDATE wallets SET balance = balance - ?, updated_at = datetime('now') WHERE id = ?`,
        [existing.amount, existing.destination_wallet_id]
      );
    }

    // 4. Apply new balance changes
    if (newType === "income") {
      db.runSync(
        `UPDATE wallets SET balance = balance + ?, updated_at = datetime('now') WHERE id = ?`,
        [newAmount, newWalletId]
      );
    } else if (newType === "expense") {
      db.runSync(
        `UPDATE wallets SET balance = balance - ?, updated_at = datetime('now') WHERE id = ?`,
        [newAmount, newWalletId]
      );
    } else if (newType === "transfer" && newDestWalletId) {
      db.runSync(
        `UPDATE wallets SET balance = balance - ?, updated_at = datetime('now') WHERE id = ?`,
        [newAmount, newWalletId]
      );
      db.runSync(
        `UPDATE wallets SET balance = balance + ?, updated_at = datetime('now') WHERE id = ?`,
        [newAmount, newDestWalletId]
      );
    }

    // 5. Build and execute UPDATE
    const updates: string[] = [];
    const values: (string | number | null | Uint8Array)[] = [];

    if (input.walletId !== undefined) {
      updates.push("wallet_id = ?");
      values.push(input.walletId);
    }
    if (input.destinationWalletId !== undefined) {
      updates.push("destination_wallet_id = ?");
      values.push(input.destinationWalletId);
    }
    if (input.categoryId !== undefined) {
      updates.push("category_id = ?");
      values.push(input.categoryId);
    }
    if (input.amount !== undefined) {
      updates.push("amount = ?");
      values.push(input.amount);
    }
    if (input.note !== undefined) {
      updates.push("note = ?");
      values.push(input.note);
    }
    if (input.status !== undefined) {
      updates.push("status = ?");
      values.push(input.status);
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      values.push(input.id);
      db.runSync(`UPDATE transactions SET ${updates.join(", ")} WHERE id = ?`, values);
    }
  });
}
