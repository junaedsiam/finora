import { db } from "@/db/client";

export type SettleDebtInput = {
  debtId: number;
  accountId: number;
  walletId: number;
  amount: number;
  debtType: "borrow" | "lend";
  note?: string | null;
};

export type EditDebtPaymentInput = {
  transactionId: number;
  debtId: number;
  accountId: number;
  walletId: number;
  amount: number;
  debtType: "borrow" | "lend";
  note?: string | null;
};

export class InsufficientBalanceError extends Error {
  constructor(public walletBalance: number, public requiredAmount: number) {
    super(
      `Insufficient balance. Wallet has ${walletBalance}, but ${requiredAmount} is required.`
    );
    this.name = "InsufficientBalanceError";
  }
}

export function settleDebtAtomic(input: SettleDebtInput): number {
  let txId = 0;
  db.withTransactionSync(() => {
    const now = new Date().toISOString();
    const isBorrow = input.debtType === "borrow";
    const txType = isBorrow ? "expense" : "income";

    // 1. Validate wallet balance for borrow payments
    if (isBorrow) {
      const wallet = db.getFirstSync<{ balance: number }>(
        "SELECT balance FROM wallets WHERE id = ?",
        [input.walletId]
      );
      if (!wallet || wallet.balance < input.amount) {
        throw new InsufficientBalanceError(
          wallet?.balance ?? 0,
          input.amount
        );
      }
    }

    // 2. Create the payment transaction with debt_id
    const txResult = db.runSync(
      `INSERT INTO transactions (account_id, wallet_id, destination_wallet_id, category_id, type, amount, note, status, recurring_id, debt_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.accountId,
        input.walletId,
        null,
        null,
        txType,
        input.amount,
        input.note ?? null,
        "confirmed",
        null,
        input.debtId,
        now,
        now,
      ]
    );
    txId = txResult.lastInsertRowId;

    // 3. Update wallet balance
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

    // 4. Update debt remaining amount
    db.runSync(
      `UPDATE debts SET remaining_amount = remaining_amount - ?, updated_at = datetime('now') WHERE id = ?`,
      [input.amount, input.debtId]
    );

    // 5. Check if fully settled
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

export function editDebtPaymentAtomic(input: EditDebtPaymentInput): void {
  db.withTransactionSync(() => {
    const now = new Date().toISOString();
    const isBorrow = input.debtType === "borrow";

    // 1. Fetch the existing transaction
    const existing = db.getFirstSync<{
      wallet_id: number;
      amount: number;
      type: string;
    }>("SELECT wallet_id, amount, type FROM transactions WHERE id = ?", [
      input.transactionId,
    ]);

    if (!existing) return;

    const oldAmount = existing.amount;
    const oldWalletId = existing.wallet_id;
    const delta = input.amount - oldAmount;

    // 2. Validate wallet balance for borrow payments if increasing
    if (isBorrow && delta > 0) {
      const wallet = db.getFirstSync<{ balance: number }>(
        "SELECT balance FROM wallets WHERE id = ?",
        [input.walletId]
      );
      if (!wallet || wallet.balance < delta) {
        throw new InsufficientBalanceError(
          wallet?.balance ?? 0,
          delta
        );
      }
    }

    // 3. Reverse old wallet balance changes
    if (existing.type === "expense") {
      db.runSync(
        `UPDATE wallets SET balance = balance + ?, updated_at = datetime('now') WHERE id = ?`,
        [oldAmount, oldWalletId]
      );
    } else {
      db.runSync(
        `UPDATE wallets SET balance = balance - ?, updated_at = datetime('now') WHERE id = ?`,
        [oldAmount, oldWalletId]
      );
    }

    // 4. Apply new wallet balance changes
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

    // 5. Update the transaction record
    db.runSync(
      `UPDATE transactions
       SET wallet_id = ?, amount = ?, note = ?, updated_at = ?
       WHERE id = ?`,
      [input.walletId, input.amount, input.note ?? null, now, input.transactionId]
    );

    // 6. Reverse old debt remaining and apply new
    db.runSync(
      `UPDATE debts SET remaining_amount = remaining_amount + ?, updated_at = datetime('now') WHERE id = ?`,
      [oldAmount, input.debtId]
    );
    db.runSync(
      `UPDATE debts SET remaining_amount = remaining_amount - ?, updated_at = datetime('now') WHERE id = ?`,
      [input.amount, input.debtId]
    );

    // 7. Check if fully settled or unsettled
    const debt = db.getFirstSync<{ remaining_amount: number; is_settled: number }>(
      "SELECT remaining_amount, is_settled FROM debts WHERE id = ?",
      [input.debtId]
    );
    if (debt) {
      if (debt.remaining_amount <= 0) {
        db.runSync(
          `UPDATE debts SET is_settled = 1, remaining_amount = 0, updated_at = datetime('now') WHERE id = ?`,
          [input.debtId]
        );
      } else if (debt.is_settled) {
        db.runSync(
          `UPDATE debts SET is_settled = 0, updated_at = datetime('now') WHERE id = ?`,
          [input.debtId]
        );
      }
    }
  });
}

export function deleteDebtPaymentAtomic(transactionId: number, debtId: number): void {
  db.withTransactionSync(() => {
    // 1. Fetch the existing transaction
    const existing = db.getFirstSync<{
      wallet_id: number;
      amount: number;
      type: string;
    }>("SELECT wallet_id, amount, type FROM transactions WHERE id = ?", [transactionId]);

    if (!existing) return;

    // 2. Reverse wallet balance
    if (existing.type === "expense") {
      db.runSync(
        `UPDATE wallets SET balance = balance + ?, updated_at = datetime('now') WHERE id = ?`,
        [existing.amount, existing.wallet_id]
      );
    } else {
      db.runSync(
        `UPDATE wallets SET balance = balance - ?, updated_at = datetime('now') WHERE id = ?`,
        [existing.amount, existing.wallet_id]
      );
    }

    // 3. Add back to debt remaining
    db.runSync(
      `UPDATE debts SET remaining_amount = remaining_amount + ?, is_settled = 0, updated_at = datetime('now') WHERE id = ?`,
      [existing.amount, debtId]
    );

    // 4. Delete the transaction
    db.runSync("DELETE FROM transactions WHERE id = ?", [transactionId]);
  });
}

export function getDebtTransactions(debtId: number): { id: number; amount: number; note: string | null; created_at: string; wallet_id: number }[] {
  return db.getAllSync<{ id: number; amount: number; note: string | null; created_at: string; wallet_id: number }>(
    `SELECT id, amount, note, created_at, wallet_id FROM transactions
     WHERE debt_id = ? AND status = 'confirmed'
     ORDER BY created_at DESC`,
    [debtId]
  );
}
