import { db } from "@/db/client";
import type { WalletRow } from "@/types/database";

export function getWalletsByAccount(accountId: number): WalletRow[] {
  return db.getAllSync<WalletRow>(
    "SELECT * FROM wallets WHERE account_id = ? ORDER BY sort_order, id",
    [accountId]
  );
}

export function getWalletById(id: number): WalletRow | null {
  return db.getFirstSync<WalletRow>("SELECT * FROM wallets WHERE id = ?", [id]);
}

export async function createWallet(
  accountId: number,
  name: string,
  type: string,
  balance: number,
  color: string,
  icon: string
): Promise<number> {
  const result = db.runSync(
    `INSERT INTO wallets (account_id, name, type, balance, color, icon)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [accountId, name, type, balance, color, icon]
  );
  return result.lastInsertRowId;
}

export async function updateWalletBalance(id: number, newBalance: number): Promise<void> {
  db.runSync(
    "UPDATE wallets SET balance = ?, updated_at = datetime('now') WHERE id = ?",
    [newBalance, id]
  );
}

export async function updateWallet(
  id: number,
  name: string,
  type: string,
  color: string,
  icon: string,
  is_excluded: number = 0
): Promise<void> {
  db.runSync(
    `UPDATE wallets SET name = ?, type = ?, color = ?, icon = ?, is_excluded = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [name, type, color, icon, is_excluded, id]
  );
}

export async function deleteWallet(id: number): Promise<void> {
  db.runSync("DELETE FROM wallets WHERE id = ?", [id]);
}

export async function updateWalletSortOrders(orders: { id: number; sort_order: number }[]): Promise<void> {
  for (const { id, sort_order } of orders) {
    db.runSync("UPDATE wallets SET sort_order = ? WHERE id = ?", [sort_order, id]);
  }
}
