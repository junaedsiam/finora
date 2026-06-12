import { db } from "@/db/client";
import type { TransactionType } from "@/types/database";

export type CreateRecurringInput = {
  accountId: number;
  walletId: number;
  categoryId: number;
  destinationWalletId?: number | null;
  type: TransactionType;
  amount: number;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  nextDueDate: string;
  startDate?: string;
  note?: string | null;
};

export type UpdateRecurringInput = {
  id: number;
  walletId?: number;
  categoryId?: number;
  destinationWalletId?: number | null;
  type?: TransactionType;
  amount?: number;
  frequency?: "daily" | "weekly" | "monthly" | "yearly";
  nextDueDate?: string;
  startDate?: string;
  note?: string | null;
  isActive?: boolean;
};

export type ConfirmRecurringInput = {
  transactionId: number;
  recurringId: number;
};

export type ModifyRecurringInput = {
  transactionId: number;
  recurringId: number;
  newAmount: number;
};

export class InsufficientBalanceError extends Error {
  constructor(public walletBalance: number, public requiredAmount: number) {
    super(
      `Insufficient balance. Wallet has ${walletBalance}, but ${requiredAmount} is required.`
    );
    this.name = "InsufficientBalanceError";
  }
}

// --- Date helpers ---

function toDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function advanceDate(dateStr: string, frequency: string): string {
  const d = new Date(dateStr + "T00:00:00");
  switch (frequency) {
    case "daily":
      d.setDate(d.getDate() + 1);
      break;
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "monthly": {
      const day = d.getDate();
      d.setMonth(d.getMonth() + 1);
      // If the day doesn't exist in the new month (e.g., Jan 31 -> Feb), go to last day
      if (d.getDate() < day) {
        d.setDate(0);
      }
      break;
    }
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return toDateStr(d);
}

function daysBetween(start: string, end: string): number {
  const s = new Date(start + "T00:00:00").getTime();
  const e = new Date(end + "T00:00:00").getTime();
  return Math.floor((e - s) / (1000 * 60 * 60 * 24));
}

function countOccurrences(startDate: string, frequency: string, until: string): number {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(until + "T00:00:00");
  let count = 0;
  let current = new Date(start);
  let currentStr = toDateStr(current);

  while (current <= end) {
    count++;
    const nextStr = advanceDate(currentStr, frequency);
    current = new Date(nextStr + "T00:00:00");
    currentStr = nextStr;

    // Safety guard: prevent infinite loops
    if (count > 10000) {
      console.warn("countOccurrences safety guard triggered. Breaking loop.", { startDate, frequency, until });
      break;
    }
  }
  return count;
}

function countOccurrencesUntilExclusive(startDate: string, frequency: string, untilExclusive: string): number {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(untilExclusive + "T00:00:00");
  let count = 0;
  let current = new Date(start);
  let currentStr = toDateStr(current);

  while (current < end) {
    count++;
    const nextStr = advanceDate(currentStr, frequency);
    current = new Date(nextStr + "T00:00:00");
    currentStr = nextStr;

    if (count > 10000) {
      console.warn("countOccurrencesUntilExclusive safety guard triggered.", { startDate, frequency, untilExclusive });
      break;
    }
  }
  return count;
}

// --- CRUD operations ---

export function createRecurringAtomic(input: CreateRecurringInput): number {
  const now = new Date().toISOString();
  const result = db.runSync(
    `INSERT INTO recurring (account_id, wallet_id, category_id, destination_wallet_id, type, amount, frequency, next_due_date, start_date, note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.accountId,
      input.walletId,
      input.categoryId,
      input.destinationWalletId ?? null,
      input.type,
      input.amount,
      input.frequency,
      input.nextDueDate,
      input.startDate ?? input.nextDueDate,
      input.note ?? null,
      now,
      now,
    ]
  );
  return result.lastInsertRowId;
}

export function updateRecurringAtomic(input: UpdateRecurringInput): void {
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (input.walletId !== undefined) {
    updates.push("wallet_id = ?");
    values.push(input.walletId);
  }
  if (input.categoryId !== undefined) {
    updates.push("category_id = ?");
    values.push(input.categoryId);
  }
  if (input.destinationWalletId !== undefined) {
    updates.push("destination_wallet_id = ?");
    values.push(input.destinationWalletId);
  }
  if (input.type !== undefined) {
    updates.push("type = ?");
    values.push(input.type);
  }
  if (input.amount !== undefined) {
    updates.push("amount = ?");
    values.push(input.amount);
  }
  if (input.frequency !== undefined) {
    updates.push("frequency = ?");
    values.push(input.frequency);
  }
  if (input.nextDueDate !== undefined) {
    updates.push("next_due_date = ?");
    values.push(input.nextDueDate);
  }
  if (input.startDate !== undefined) {
    updates.push("start_date = ?");
    values.push(input.startDate);
  }
  if (input.note !== undefined) {
    updates.push("note = ?");
    values.push(input.note);
  }
  if (input.isActive !== undefined) {
    updates.push("is_active = ?");
    values.push(input.isActive ? 1 : 0);
  }

  if (updates.length === 0) return;

  updates.push("updated_at = datetime('now')");
  values.push(input.id);

  db.runSync(`UPDATE recurring SET ${updates.join(", ")} WHERE id = ?`, values);
}

export function deleteRecurringAtomic(id: number): void {
  db.withTransactionSync(() => {
    // Delete any pending transactions generated from this recurring
    db.runSync(
      "DELETE FROM transactions WHERE recurring_id = ? AND status = 'pending'",
      [id]
    );
    // Delete the recurring entry
    db.runSync("DELETE FROM recurring WHERE id = ?", [id]);
  });
}

// --- Generation engine ---

export function generatePendingTransactions(accountId: number): void {
  const today = new Date().toISOString().split("T")[0];

  const pendingRecurring = db.getAllSync<{
    id: number;
    wallet_id: number;
    category_id: number;
    destination_wallet_id: number | null;
    type: TransactionType;
    amount: number;
    frequency: string;
    next_due_date: string;
    note: string | null;
  }>(
    `SELECT id, wallet_id, category_id, destination_wallet_id, type, amount, frequency, next_due_date, note
     FROM recurring
     WHERE account_id = ? AND is_active = 1 AND next_due_date <= ?
     ORDER BY id`,
    [accountId, today]
  );

  for (const recurring of pendingRecurring) {
    const occurrences = countOccurrences(recurring.next_due_date, recurring.frequency, today);
    const pastOccurrences = countOccurrencesUntilExclusive(recurring.next_due_date, recurring.frequency, today);
    const todayOccurrence = occurrences - pastOccurrences;

    if (occurrences <= 0) continue;

    const now = new Date().toISOString();

    // Advance next_due_date by total occurrences
    let finalNextDueDate = recurring.next_due_date;
    for (let i = 0; i < occurrences; i++) {
      finalNextDueDate = advanceDate(finalNextDueDate, recurring.frequency);
    }

    db.withTransactionSync(() => {
      // Check if a pending transaction already exists for this recurring
      const existingPending = db.getFirstSync<{ id: number }>(
        "SELECT id FROM transactions WHERE recurring_id = ? AND status = 'pending'",
        [recurring.id]
      );

      // --- Handle missed (past) occurrences: auto-confirm ---
      if (pastOccurrences > 0) {
        const pastAmount = recurring.amount * pastOccurrences;
        const pastNote = `Catch-up for ${pastOccurrences} missed occurrence${pastOccurrences > 1 ? "s" : ""}`;

        // Check balance for auto-confirm
        const wallet = db.getFirstSync<{ balance: number }>(
          "SELECT balance FROM wallets WHERE id = ?",
          [recurring.wallet_id]
        );
        const canConfirmPast =
          recurring.type === "income" ||
          (recurring.type === "expense" && wallet && wallet.balance >= pastAmount) ||
          (recurring.type === "transfer" &&
            recurring.destination_wallet_id &&
            wallet &&
            wallet.balance >= pastAmount);

        if (existingPending) {
          // Reuse existing pending for past catch-up
          db.runSync(
            `UPDATE transactions
             SET amount = ?, note = ?, updated_at = ?
             WHERE id = ?`,
            [pastAmount, pastNote, now, existingPending.id]
          );
          if (canConfirmPast) {
            db.runSync(
              "UPDATE transactions SET status = 'confirmed', updated_at = ? WHERE id = ?",
              [now, existingPending.id]
            );
          }
        } else {
          db.runSync(
            `INSERT INTO transactions (account_id, wallet_id, destination_wallet_id, category_id, type, amount, note, status, recurring_id, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              accountId,
              recurring.wallet_id,
              recurring.destination_wallet_id,
              recurring.category_id,
              recurring.type,
              pastAmount,
              pastNote,
              canConfirmPast ? "confirmed" : "pending",
              recurring.id,
              now,
              now,
            ]
          );
        }

        if (canConfirmPast) {
          if (recurring.type === "income") {
            db.runSync(
              "UPDATE wallets SET balance = balance + ?, updated_at = ? WHERE id = ?",
              [pastAmount, now, recurring.wallet_id]
            );
          } else if (recurring.type === "expense") {
            db.runSync(
              "UPDATE wallets SET balance = balance - ?, updated_at = ? WHERE id = ?",
              [pastAmount, now, recurring.wallet_id]
            );
          } else if (recurring.type === "transfer" && recurring.destination_wallet_id) {
            db.runSync(
              "UPDATE wallets SET balance = balance - ?, updated_at = ? WHERE id = ?",
              [pastAmount, now, recurring.wallet_id]
            );
            db.runSync(
              "UPDATE wallets SET balance = balance + ?, updated_at = ? WHERE id = ?",
              [pastAmount, now, recurring.destination_wallet_id]
            );
          }
        }
      }

      // --- Handle today's occurrence: always pending, never auto-confirm ---
      if (todayOccurrence > 0) {
        const todayAmount = recurring.amount;
        const todayNote = recurring.note || "Recurring";

        if (existingPending && pastOccurrences === 0) {
          // Update existing pending for today (no past catch-up)
          db.runSync(
            `UPDATE transactions
             SET amount = ?, note = ?, updated_at = ?
             WHERE id = ?`,
            [todayAmount, todayNote, now, existingPending.id]
          );
        } else {
          // Create a new pending for today
          db.runSync(
            `INSERT INTO transactions (account_id, wallet_id, destination_wallet_id, category_id, type, amount, note, status, recurring_id, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              accountId,
              recurring.wallet_id,
              recurring.destination_wallet_id,
              recurring.category_id,
              recurring.type,
              todayAmount,
              todayNote,
              "pending",
              recurring.id,
              now,
              now,
            ]
          );
        }
      }

      // Advance next_due_date on the recurring entry
      db.runSync(
        "UPDATE recurring SET next_due_date = ?, updated_at = ? WHERE id = ?",
        [finalNextDueDate, now, recurring.id]
      );
    });
  }
}

// --- Confirm / Skip / Modify ---

export function confirmRecurringTransactionAtomic(transactionId: number): void {
  db.withTransactionSync(() => {
    const tx = db.getFirstSync<{
      wallet_id: number;
      destination_wallet_id: number | null;
      type: TransactionType;
      amount: number;
      recurring_id: number;
    }>(
      "SELECT wallet_id, destination_wallet_id, type, amount, recurring_id FROM transactions WHERE id = ?",
      [transactionId]
    );

    if (!tx) return;

    const wallet = db.getFirstSync<{ balance: number }>(
      "SELECT balance FROM wallets WHERE id = ?",
      [tx.wallet_id]
    );

    if (tx.type === "expense" && (!wallet || wallet.balance < tx.amount)) {
      throw new InsufficientBalanceError(wallet?.balance ?? 0, tx.amount);
    }

    if (tx.type === "transfer" && tx.destination_wallet_id) {
      const sourceWallet = db.getFirstSync<{ balance: number }>(
        "SELECT balance FROM wallets WHERE id = ?",
        [tx.wallet_id]
      );
      if (!sourceWallet || sourceWallet.balance < tx.amount) {
        throw new InsufficientBalanceError(sourceWallet?.balance ?? 0, tx.amount);
      }
    }

    const now = new Date().toISOString();

    // Update transaction status
    db.runSync(
      "UPDATE transactions SET status = 'confirmed', updated_at = ? WHERE id = ?",
      [now, transactionId]
    );

    // Update wallet balance
    if (tx.type === "income") {
      db.runSync(
        "UPDATE wallets SET balance = balance + ?, updated_at = ? WHERE id = ?",
        [tx.amount, now, tx.wallet_id]
      );
    } else if (tx.type === "expense") {
      db.runSync(
        "UPDATE wallets SET balance = balance - ?, updated_at = ? WHERE id = ?",
        [tx.amount, now, tx.wallet_id]
      );
    } else if (tx.type === "transfer" && tx.destination_wallet_id) {
      db.runSync(
        "UPDATE wallets SET balance = balance - ?, updated_at = ? WHERE id = ?",
        [tx.amount, now, tx.wallet_id]
      );
      db.runSync(
        "UPDATE wallets SET balance = balance + ?, updated_at = ? WHERE id = ?",
        [tx.amount, now, tx.destination_wallet_id]
      );
    }
  });
}

export function skipRecurringTransactionAtomic(transactionId: number): void {
  const now = new Date().toISOString();
  db.runSync(
    "UPDATE transactions SET status = 'skipped', updated_at = ? WHERE id = ?",
    [now, transactionId]
  );
}

export function modifyAndConfirmRecurringTransactionAtomic(
  transactionId: number,
  newAmount: number
): void {
  db.withTransactionSync(() => {
    const tx = db.getFirstSync<{
      wallet_id: number;
      destination_wallet_id: number | null;
      type: TransactionType;
      amount: number;
    }>(
      "SELECT wallet_id, destination_wallet_id, type, amount FROM transactions WHERE id = ?",
      [transactionId]
    );

    if (!tx) return;

    const wallet = db.getFirstSync<{ balance: number }>(
      "SELECT balance FROM wallets WHERE id = ?",
      [tx.wallet_id]
    );

    if (tx.type === "expense" && (!wallet || wallet.balance < newAmount)) {
      throw new InsufficientBalanceError(wallet?.balance ?? 0, newAmount);
    }

    if (tx.type === "transfer" && tx.destination_wallet_id) {
      const sourceWallet = db.getFirstSync<{ balance: number }>(
        "SELECT balance FROM wallets WHERE id = ?",
        [tx.wallet_id]
      );
      if (!sourceWallet || sourceWallet.balance < newAmount) {
        throw new InsufficientBalanceError(sourceWallet?.balance ?? 0, newAmount);
      }
    }

    const now = new Date().toISOString();

    // Update transaction amount and status
    db.runSync(
      "UPDATE transactions SET amount = ?, status = 'confirmed', updated_at = ? WHERE id = ?",
      [newAmount, now, transactionId]
    );

    // Update wallet balance
    if (tx.type === "income") {
      db.runSync(
        "UPDATE wallets SET balance = balance + ?, updated_at = ? WHERE id = ?",
        [newAmount, now, tx.wallet_id]
      );
    } else if (tx.type === "expense") {
      db.runSync(
        "UPDATE wallets SET balance = balance - ?, updated_at = ? WHERE id = ?",
        [newAmount, now, tx.wallet_id]
      );
    } else if (tx.type === "transfer" && tx.destination_wallet_id) {
      db.runSync(
        "UPDATE wallets SET balance = balance - ?, updated_at = ? WHERE id = ?",
        [newAmount, now, tx.wallet_id]
      );
      db.runSync(
        "UPDATE wallets SET balance = balance + ?, updated_at = ? WHERE id = ?",
        [newAmount, now, tx.destination_wallet_id]
      );
    }
  });
}

export function getRecurringTransactions(recurringId: number): {
  id: number;
  amount: number;
  note: string | null;
  status: string;
  created_at: string;
  wallet_id: number;
}[] {
  return db.getAllSync(
    `SELECT id, amount, note, status, created_at, wallet_id FROM transactions
     WHERE recurring_id = ?
     ORDER BY created_at DESC`,
    [recurringId]
  );
}
