import { db } from "@/db/client";

export type SettleDebtInput = {
  debtId: number;
  accountId: number;
  walletId: number;
  categoryId: number;
  amount: number;
  debtType: "borrow" | "lend";
  note?: string | null;
};

export function settleDebtAtomic(input: SettleDebtInput): number {
  let txId = 0;
  db.withTransactionSync(() => {
    const now = new Date().toISOString();
    const isBorrow = input.debtType === "borrow";
    const txType = isBorrow ? "expense" : "income";

    // 1. Create the payment transaction
    const txResult = db.runSync(
      `INSERT INTO transactions (account_id, wallet_id, destination_wallet_id, category_id, type, amount, note, status, recurring_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.accountId,
        input.walletId,
        null,
        input.categoryId,
        txType,
        input.amount,
        input.note ?? null,
        "confirmed",
        null,
        now,
        now,
      ]
    );
    txId = txResult.lastInsertRowId;

    // 2. Update wallet balance
    if (isBorrow) {
      db.runSync(
        `UPDATE wallets SET balance = balance - ?, updated_at = datetime('now') WHERE id = ?`,
        [input.amount, input.walletId]
      );
    } else {
      db.runSync(
        `UPDATE wallets SET balance = balance + ?, updated_at = datetime('now') WHERE id = ?`,
        [input.amount, input.walletId]
      );
    }

    // 3. Update debt remaining amount
    db.runSync(
      `UPDATE debts SET remaining_amount = remaining_amount - ?, updated_at = datetime('now') WHERE id = ?`,
      [input.amount, input.debtId]
    );

    // 4. Check if fully settled
    const debt = db.getFirstSync<{ remaining_amount: number }>(
      "SELECT remaining_amount FROM debts WHERE id = ?",
      [input.debtId]
    );
    if (debt && debt.remaining_amount <= 0) {
      db.runSync(
        `UPDATE debts SET is_settled = 1, remaining_amount = 0, updated_at = datetime('now') WHERE id = ?`,
        [input.debtId]
      );
    }
  });
  return txId;
}
