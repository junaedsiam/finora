# Recurring Transactions Implementation Plan

## 1. Current State

| Layer | Status |
|---|---|
| **Database Schema** | `recurring` table exists in migration v1, but missing `note` and `start_date` fields that the UI already expects |
| **Types** | `RecurringRow` exists but missing `note` / `start_date` |
| **Repository** | **Missing** — no `recurring.repository.ts` |
| **Service** | **Missing** — no `recurring.service.ts` |
| **Hooks** | **Missing** — no `useRecurring.ts` |
| **UI Screens** | All exist but use **hardcoded mock data** (`recurring/index.tsx`, `recurring/[id].tsx`, `recurring/add.tsx`, `home/UpcomingCosts.tsx`) |

The transaction system (create/delete/update with atomic balance updates) and debt system are fully functional and serve as the pattern to follow.

---

## 2. Schema & Migration Update

### 2.1 Goal
Add `note` and `start_date` to the `recurring` table to match the UI expectations.

### 2.2 Changes
- **`src/db/migrate.ts`** — Add migration **v6**:
  - `ALTER TABLE recurring ADD COLUMN note TEXT`
  - `ALTER TABLE recurring ADD COLUMN start_date TEXT NOT NULL DEFAULT (datetime('now'))`
- **`src/db/migrations/001_initial.sql`** — Update the `recurring` table definition in the baseline (for new installs)
- **`src/types/database.ts`** — Update `RecurringRow` to include `note: string | null` and `start_date: string`

### 2.3 Recurring Table Schema (Target)
```sql
CREATE TABLE IF NOT EXISTS recurring (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  wallet_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount REAL NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  next_due_date TEXT NOT NULL,
  start_date TEXT NOT NULL DEFAULT (datetime('now')),
  note TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

---

## 3. Repository Layer

**File**: `src/repositories/recurring.repository.ts`

**Functions to implement**:

| Function | Purpose |
|---|---|
| `getRecurringByAccount(accountId)` | All recurring entries for an account, ordered by `next_due_date` |
| `getRecurringById(id)` | Single entry by ID |
| `createRecurring(params)` | Insert new recurring entry |
| `updateRecurring(id, params)` | Partial update (name, amount, frequency, next_due_date, wallet_id, category_id, is_active, note, start_date) |
| `deleteRecurring(id)` | Delete entry |
| `getUpcomingRecurring(accountId, limit?)` | Active entries where `next_due_date <= today + 7 days` (for Upcoming Costs home section) |
| `getPendingRecurring(accountId)` | Active entries where `next_due_date <= today` (for the generation engine) |

---

## 4. Service Layer (Business Logic)

**File**: `src/services/recurring.service.ts`

All balance mutations must be inside `db.withTransactionSync()`.

### 4.1 Core Functions

| Function | Purpose |
|---|---|
| `createRecurringAtomic(input)` | Insert recurring row with `next_due_date = start_date`. No wallet balance changes at creation time. |
| `updateRecurringAtomic(input)` | Update fields on the recurring entry. Handle activation/deactivation (`is_active`). |
| `deleteRecurringAtomic(id)` | Delete the recurring entry. Also delete any `pending` transactions that were generated from this recurring (but **not** confirmed/skipped ones — those stay in history). |
| `generatePendingTransactions(accountId)` | The generation engine. See Section 5 for detailed behavior. |
| `confirmRecurringTransactionAtomic(transactionId)` | Set `status = 'confirmed'`, update wallet balance, advance `next_due_date` on parent recurring. |
| `skipRecurringTransactionAtomic(transactionId)` | Set `status = 'skipped'`, advance `next_due_date` on parent recurring. No wallet balance changes. |
| `modifyAndConfirmRecurringTransactionAtomic(transactionId, newAmount)` | Update the transaction amount, then confirm with the new amount. |

### 4.2 Date Advancement Logic
```
next_due_date advance:
- daily   -> +1 day
- weekly  -> +7 days
- monthly -> +1 month (same day; if day doesn't exist, use last day of month)
- yearly  -> +1 year
```

---

## 5. The Generation Engine: Single Catch-Up Transaction (Critical)

### 5.1 Philosophy

Instead of generating N individual pending transactions when a user has missed N occurrences, we generate **a single catch-up transaction** with the total amount. This keeps the UI clean and the user experience simple.

| Scenario | Old Approach | New Approach |
|---|---|---|
| 30 days missed, $10/day | 30 individual pending items | 1 pending item: $300 |
| 60 days missed, $50/week | 8 individual pending items | 1 pending item: $400 |
| 1 day missed | 1 pending item | 1 pending item (same) |

**Trade-off**: We lose per-day granularity in the transaction history. But the user can always edit the catch-up transaction to split it manually if needed. The total financial impact is identical.

### 5.2 Engine Flow

```
1. Query active recurring where next_due_date <= today
2. For each recurring:
   a. Count how many occurrences are due (handle gaps: daily recurring, 3 days missed = 3 occurrences)
   b. Calculate total_amount = recurring.amount × occurrences
   c. Generate ONE pending transaction:
      - status = 'pending'
      - wallet_id = recurring.wallet_id
      - amount = total_amount
      - created_at = today (or the last due date)
      - recurring_id = recurring.id
      - note = "Catch-up for N missed occurrences"
   d. Advance next_due_date by N steps
3. Handle auto-confirmation (see Section 5.3)
```

### 5.3 Auto-Confirmation Policy

| Condition | Action |
|---|---|
| **Wallet balance sufficient** (expense/transfer: `wallet.balance >= total_amount`) | **Auto-confirm** — set `status = 'confirmed'`, update wallet balance. |
| **Wallet balance insufficient** | **Leave as pending** — user must manually review in Upcoming Costs. |
| **Income type** | Always safe — auto-confirm if any occurrences are due. |

**No batch logic needed**: Since we generate only 1 transaction per recurring, the auto-confirm decision is always a single check.

### 5.4 Wallet Balance Guard

```
Before auto-confirming:
- If expense: check wallet.balance >= total_amount
- If transfer: check source wallet.balance >= total_amount AND destination wallet exists
- If income: always safe
```

If insufficient balance, the single catch-up transaction stays `pending` and the user sees it in Upcoming Costs with a warning: "Daily Groceries — $300 (30 days) — Insufficient balance".

---

## 6. Edge Case: Manual Confirm/Skip/Modify

### 6.1 Confirm

- Check wallet balance >= transaction amount.
- If yes: set `status = 'confirmed'`, update wallet balance.
- If no: show error, transaction stays pending.

### 6.2 Skip

- Set `status = 'skipped'`.
- No wallet balance changes.
- The `next_due_date` has already been advanced during generation, so the recurring continues normally.

### 6.3 Modify

- User can edit the amount, wallet, or note before confirming.
- If amount is reduced and wallet balance is now sufficient, confirm succeeds.
- If user increases amount, re-check balance.

### 6.4 Splitting a Catch-Up

If the user wants per-day detail, they can:
1. Skip the catch-up transaction.
2. Manually create individual transactions for each day via the regular Add Transaction flow.

This is a rare edge case and we won't build a dedicated split UI for now.

---

## 7. React Query Hooks

**File**: `src/hooks/useRecurring.ts`

| Hook | Query Key | Notes |
|---|---|---|
| `useRecurringList()` | `['recurring', activeAccountId]` | |
| `useRecurring(id)` | `['recurring', id]` | |
| `useCreateRecurring()` | — | Invalidate `['recurring', activeAccountId]` |
| `useUpdateRecurring()` | — | Invalidate `['recurring', activeAccountId]` and `['recurring', id]` |
| `useDeleteRecurring()` | — | Invalidate `['recurring', activeAccountId]` |
| `useUpcomingRecurring()` | `['upcoming-recurring', activeAccountId]` | For home section |
| `useConfirmRecurring()` | — | Invalidate `['recurring', ...]`, `['transactions', ...]`, `['wallets', ...]`, `['balance', ...]`, `['upcoming-recurring', ...]` |
| `useSkipRecurring()` | — | Invalidate `['recurring', ...]`, `['upcoming-recurring', ...]` |
| `useGeneratePending()` | — | Called on app startup. Invalidate `['upcoming-recurring', ...]`, `['transactions', ...]`, `['wallets', ...]`, `['balance', ...]` |

---

## 8. UI Wiring

### 8.1 Recurring List Screen (`src/app/recurring/index.tsx`)
- Replace `MOCK_RECURRING` with `useRecurringList()`
- Connect `TabPill` filtering to real data
- Wire `+` button to `router.push("/recurring/add")`
- Wire row tap to `router.push(\`/recurring/\${item.id}\`)`

### 8.2 Recurring Detail Screen (`src/app/recurring/[id].tsx`)
- Replace `MOCK_RECURRING` with `useRecurring(id)`
- Fetch real transaction history via `useTransactions` filtered by `recurring_id`
- Wire **edit** button to `router.push(\`/recurring/add?editId=\${id}\`)`
- Wire **delete** button to `useDeleteRecurring()` mutation with confirmation
- Wire **pause/resume** toggle to `useUpdateRecurring({ is_active: !current })`

### 8.3 Add/Edit Recurring Screen (`src/app/recurring/add.tsx`)
- Replace `DEMO_CATEGORIES` and `DEMO_WALLETS` with real hooks: `useCategoriesByType()` and `useWallets()`
- Wire form submission to `useCreateRecurring()` / `useUpdateRecurring()`
- Add `note` field to the actual form state
- Use `DropdownField` for real category and wallet pickers (similar to transaction form)
- Use `DatePicker` for `startDate`
- On success: `router.back()`

### 8.4 Upcoming Costs Home Section (`src/components/home/UpcomingCosts.tsx`)
- Replace `MOCK_UPCOMING` with `useUpcomingRecurring()`
- Add **Confirm** and **Skip** actions that call `useConfirmRecurring()` and `useSkipRecurring()`
- Amount color coding (green for income, red for expense)
- "Due Today" / "Due in X days" labels
- Show warning indicator if wallet balance is insufficient for an expense

### 8.5 App Startup (`src/app/_layout.tsx`)
- Add a `useEffect` that calls `useGeneratePending()` on app startup to process any missed recurring dates

---

## 9. Additional Edge Cases

### 9.1 Wallet Deleted While Recurring Exists
**Current behavior**: `ON DELETE CASCADE` on `recurring.wallet_id` means deleting a wallet deletes all its recurring entries.
**Risk**: This is aggressive. User might accidentally lose all recurring history.
**Mitigation**: In the UI, warn the user when deleting a wallet that has active recurring entries. Alternatively, change to `ON DELETE SET NULL` and block the UI when `wallet_id IS NULL`. (Decision: warn in UI for now.)

### 9.2 Category Deleted While Recurring Exists
**Current behavior**: `ON DELETE CASCADE` on `recurring.category_id` means deleting a category deletes all its recurring entries.
**Mitigation**: Same as above — warn in UI when deleting a category that has recurring entries.

### 9.3 Recurring Type Changed
The UI allows switching between Income/Expense. If a user changes the type of an existing recurring, the `next_due_date` logic remains the same, but the sign of the balance change flips. This is handled correctly by the service layer.

### 9.4 Start Date vs Next Due Date
- `start_date` is the original start date (immutable after creation, for reference).
- `next_due_date` is the mutable field that advances after each occurrence.
- When creating a recurring, `next_due_date = start_date`.

### 9.5 Transfer Type Recurring
Transfer recurring entries are supported by the schema. The generation engine should:
- Create a pending transfer transaction
- Use `destination_wallet_id` (stored in the recurring table? Currently not in schema. Need to add `destination_wallet_id` for transfers.)

**Decision**: Add `destination_wallet_id INTEGER` to the `recurring` table in migration v6 as well, to support transfer type recurring.

### 9.6 What Happens If Wallet Is Empty?

**Scenario**: 
- Wallet: $50
- Recurring: $10/day expense
- Missed: 7 days
- Catch-up transaction: $70

**Result**: 
- Engine generates 1 pending transaction: $70.
- Wallet balance check: $50 < $70 → **insufficient**.
- Transaction stays **pending**.
- User sees in Upcoming Costs: "Daily Groceries — $70 (7 days) — Insufficient balance".
- User can:
  - Change to a different wallet with enough balance
  - Edit the amount down to $50
  - Skip it entirely

### 9.7 What Happens During Manual Confirm If Wallet Is Empty?

**Scenario**: 
- Wallet: $50
- Catch-up: $70
- User taps "Confirm".

**Result**: 
- Show error toast: "Insufficient balance in wallet. You have $50 but need $70."
- Transaction stays pending.
- No partial confirmation — all or nothing.

### 9.8 What Happens If a User Has Multiple Recurring with the Same Wallet?

**Scenario**: 
- Wallet: $100
- Recurring A: $60/day, missed 1 day
- Recurring B: $50/day, missed 1 day

**Result**: 
- Two separate catch-up transactions generated: $60 and $50.
- First one auto-confirms (if engine processes it first), wallet becomes $40.
- Second one checks balance: $40 < $50 → **insufficient**, stays pending.
- User must manually handle the second one.

**Note**: The order of processing is deterministic (by `next_due_date` or `id`), so behavior is consistent.

---

## 10. Files to Create / Modify

| Action | File |
|---|---|
| **Create** | `src/repositories/recurring.repository.ts` |
| **Create** | `src/services/recurring.service.ts` |
| **Create** | `src/hooks/useRecurring.ts` |
| **Modify** | `src/db/migrate.ts` (add v6) |
| **Modify** | `src/db/migrations/001_initial.sql` (update baseline) |
| **Modify** | `src/types/database.ts` (add `note`, `start_date`, `destination_wallet_id`) |
| **Modify** | `src/app/recurring/index.tsx` (wire real data) |
| **Modify** | `src/app/recurring/[id].tsx` (wire real data + history) |
| **Modify** | `src/app/recurring/add.tsx` (wire real data + real pickers) |
| **Modify** | `src/components/home/UpcomingCosts.tsx` (wire real data + actions) |
| **Modify** | `src/app/_layout.tsx` (add startup generation) |

---

## 11. Verification Checklist

| Test | Expected Result |
|---|---|
| Create daily recurring expense | Pending transaction appears immediately if start_date is today |
| Close app for 3 days with daily recurring | **1** catch-up transaction generated: $30 (3 days), left as pending |
| Close app for 30 days with daily recurring | **1** catch-up transaction: $300 (30 days), left as pending |
| Auto-confirm with sufficient balance | Single catch-up confirmed, wallet balance deducted by total amount |
| Auto-confirm with insufficient balance | Single catch-up stays pending, shown in Upcoming Costs with warning |
| Confirm a pending recurring | Wallet balance decreases by total amount, next_due_date advances |
| Skip a pending recurring | No balance change, next_due_date advances |
| Modify amount on pending | New amount used, wallet balance updates accordingly |
| Pause recurring | `is_active = 0`, no more pending transactions generated |
| Delete recurring | Recurring removed; pending transactions from it also removed; confirmed ones stay |
| Edit recurring wallet | Future pending transactions use new wallet |
| Multiple recurring with same wallet | First catch-up auto-confirms if sufficient; second stays pending if wallet runs dry |
| Manual confirm with insufficient balance | Error toast, transaction stays pending, no partial confirmation |

---

## 12. Implementation Order

1. **Schema update** (migration v6, types, baseline SQL)
2. **Repository** (recurring.repository.ts)
3. **Service** (recurring.service.ts) — start with create/update/delete
4. **Service** (generation engine + confirm/skip/modify)
5. **Hooks** (useRecurring.ts)
6. **UI wiring** (recurring list, detail, add/edit)
7. **Upcoming Costs** (home section wiring)
8. **App startup** (generate pending on open)
9. **Verification** (run app, test edge cases)
