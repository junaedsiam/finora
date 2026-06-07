# Finora - Task List

> Living document tracking implementation progress against the plan in `CLAUDE.md`.
> Last updated: 2026-05-31 (Fix round 1: currency, BalanceCard income/expense, atomic service layer, swipe-to-delete, full debt system, transaction editing, recent transactions on home)

---

## Legend

- [x] Done — implemented and wired to real data
- [~] Partial — UI exists but uses mock data or has gaps
- [ ] Not started
- [!] Blocker / needs attention

---

## Phase 1: Project Scaffolding — DONE

- [x] Expo SDK 55 + TypeScript configured
- [x] NativeWind v4 configured (`tailwind.config.ts`, `metro.config.js`, `global.css`)
- [x] Expo Router tab layout with 4 tabs (Home, Transactions, Calendar, Stats)
- [x] Custom tab bar with centered FAB
- [x] Inter font loaded via `expo-font`
- [x] `react-native-gesture-handler` root view
- [x] `react-native-reanimated` configured
- [x] `expo-linear-gradient` available
- [x] Dark/light/system theme support via `nativewind` + settings store

---

## Phase 2: UI — Reusable Components & Home Screen

### 2A. Reusable UI Primitives (`src/components/ui/`)

- [x] `Button.tsx` — Full-width rounded button
- [x] `DropdownField.tsx` — Tappable field with icon + label + chevron
- [x] `IconCircle.tsx` — Colored circle with centered icon
- [x] `ProgressBar.tsx` — Horizontal bar with fill + percentage
- [x] `ScreenHeader.tsx` — Screen title with optional back/settings
- [x] `SectionHeader.tsx` — Title + action link row
- [x] `TabPill.tsx` — Horizontal toggle (Income/Expense/Transfer)
- [~] `Card.tsx` — Not found as standalone; cards inlined in components
- [ ] `Badge.tsx` — Not implemented
- [ ] `AmountText.tsx` — Not implemented (formatCurrency used directly)
- [ ] `AmountInput.tsx` — Not implemented
- [ ] `IconPicker.tsx` — Not implemented (icon picker screen exists but not reusable component)
- [ ] `ColorPicker.tsx` — Not implemented
- [ ] `EmptyState.tsx` — Not implemented (empty states inlined)

### 2B. Home Screen Sections (`src/components/home/`)

- [x] `HomeHeader.tsx` — Greeting + date + settings icon
- [x] `BalanceCard.tsx` — Real total balance + real current-month income/expense from transactions
- [x] `WalletSection.tsx` — Real wallet data from DB
- [x] `WalletCard.tsx` — Colored cards with real balances
- [~] `BudgetSection.tsx` — Uses `MOCK_BUDGETS` (hardcoded)
- [x] `BudgetProgressCard.tsx` — UI component exists
- [~] `UpcomingCosts.tsx` — Uses `MOCK_UPCOMING` (hardcoded)
- [~] `DebtSection.tsx` — Uses `MOCK_DEBTS` (hardcoded)
- [x] `DebtCard.tsx` — UI component exists

### 2C. Home Screen Composition

- [x] `src/app/(tabs)/index.tsx` — Composed with ScrollView

---

## Phase 3: UI — Add Transaction Modal

- [x] `src/app/(modals)/_layout.tsx` — Modal presentation config
- [x] `src/app/(modals)/add-transaction.tsx` — Modal route
- [x] `src/components/forms/TransactionForm.tsx` — Full form with tabs, amount input, date picker, category picker, wallet picker, description, submit
- [x] FAB wired to `router.push('/(modals)/add-transaction')`
- [x] Category picker modal (`select-category.tsx`)
- [x] Wallet picker modal (`select-wallet.tsx`)
- [x] Custom date range modal (`custom-date-range.tsx`)

---

## Phase 4: UI — Transaction History Screen

- [x] `src/app/(tabs)/transactions.tsx` — Full screen with real data
- [x] `TimeRangeSelector.tsx` — Period selector with calendar icon
- [x] `FilterPills.tsx` — All / Income / Expense / Transfer filters (functional)
- [x] `OverviewSection.tsx` — Balance + Income + Expense overview cards
- [x] `TransactionDateGroup.tsx` — Date header with day/dayName/monthYear
- [x] `TransactionItem.tsx` — Single transaction row
- [x] `PeriodBottomSheet.tsx` — Bottom sheet for period selection

---

## Phase 5: Data Layer Foundation — PARTIAL

### Database

- [x] `src/db/client.ts` — SQLite sync client
- [x] `src/db/migrate.ts` — Migration runner with `PRAGMA user_version` (3 migrations)
- [x] `src/db/migrations/001_initial.sql` — All 8 tables + indexes + triggers
- [x] `src/db/migrations/002_add_subcategories.sql` — Subcategory support
- [x] `src/db/seed.ts` — Dev seed with default account, wallets, categories

### Types

- [x] `src/types/database.ts` — Row types for all 8 tables

### Repositories

- [x] `account.repository.ts` — getAll, getById, create, update
- [x] `wallet.repository.ts` — getByAccount, getById, create, update, updateBalance, delete, updateSortOrders
- [x] `category.repository.ts` — getByAccount, getByType, getRoot, getSub, getById, create, update, delete, sort orders
- [x] `transaction.repository.ts` — getByAccount, getById, create, update, delete
- [ ] `budget.repository.ts` — **NOT IMPLEMENTED**
- [ ] `debt.repository.ts` — **NOT IMPLEMENTED**
- [ ] `recurring.repository.ts` — **NOT IMPLEMENTED**

### Services

- [ ] `src/services/` directory — **EMPTY**
- [ ] `transaction.service.ts` — **NOT IMPLEMENTED**
- [ ] `budget.service.ts` — **NOT IMPLEMENTED**
- [ ] `recurring.service.ts` — **NOT IMPLEMENTED**
- [ ] `debt.service.ts` — **NOT IMPLEMENTED**
- [ ] `balance.service.ts` — **NOT IMPLEMENTED**
- [ ] `export.service.ts` — **NOT IMPLEMENTED**

> [x] **Fixed**: `transaction.service.ts` created with atomic SQLite transactions. `useTransactions` hook now uses service layer instead of repositories directly.

### Hooks (React Query)

- [x] `useAccount.ts` — useAccounts, useCreateAccount, useUpdateAccount
- [x] `useWallets.ts` — useWallets, useWallet, useCreateWallet, useUpdateWallet, useUpdateWalletBalance, useDeleteWallet, useUpdateWalletSortOrders
- [x] `useCategories.ts` — useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, etc.
- [x] `useTransactions.ts` — useTransactions, useTransaction, useCreateTransaction, useUpdateTransaction, useDeleteTransaction
- [x] `useActiveCurrency.ts` — Returns active account currency
- [ ] `useBudgets.ts` — **NOT IMPLEMENTED**
- [ ] `useDebts.ts` — **NOT IMPLEMENTED**
- [ ] `useRecurring.ts` — **NOT IMPLEMENTED**
- [ ] `useBalance.ts` — **NOT IMPLEMENTED**
- [ ] `useCalendar.ts` — **NOT IMPLEMENTED**

### Zustand Stores

- [x] `account.store.ts` — Active account ID (persisted via AsyncStorage)
- [x] `transaction-filter.store.ts` — Period, date range, type filters
- [x] `transaction-form.store.ts` — Category, wallet selection state
- [x] `ui.store.ts` — Balance visibility toggle
- [x] `settings.store.ts` — Theme, startup screen (persisted)
- [x] `currency-picker.store.ts` — Currency selection state
- [x] `icon-picker.store.ts` — Icon selection state

### Real Data Integration

- [x] Home wallets — real DB data
- [x] Home total balance — computed from real wallets
- [x] Home income/expense — real current-month totals from confirmed transactions
- [~] Home budgets — **MOCK data**
- [~] Home upcoming costs — **MOCK data** (currency prop now fixed)
- [x] Home debts — real DB data + summary cards (You Owe / You're Owed)
- [x] Transaction list — real DB data + swipe-to-delete with confirmation
- [x] Add transaction form — atomic create via service layer

> [x] **Fixed**: Transaction service layer wraps create/delete/update + balance changes in `withTransactionSync`.

---

## Phase 6: Transaction System Logic — PARTIAL

- [x] Create transaction (income/expense/transfer) — atomic via service layer
- [x] Wallet balance updates on create — atomic via service layer
- [x] Atomic balance updates — `transaction.service.ts` uses `withTransactionSync`
- [x] Edit transaction — tap any transaction item to open edit modal with pre-filled data
- [x] Delete transaction with balance revert — atomic via service layer
- [x] Swipe-to-delete on transaction list — with confirmation dialog
- [ ] Transaction detail screen
- [x] Category picker with real categories
- [x] Wallet picker with real wallets
- [x] Date picker (native modal)

---

## Phase 7: Budget System — NOT STARTED

- [ ] Budget repository
- [ ] Budget service (period calc, spent aggregation)
- [ ] Budget React Query hooks
- [ ] Budget CRUD screens
- [ ] Budget-category linking
- [ ] Wire `BudgetSection` to real data
- [ ] Budget detail screen (`budget/[id].tsx`)

---

## Phase 8: Recurring Transactions — NOT STARTED

- [ ] Recurring repository
- [ ] Recurring service (pending generation, auto-confirm, gap handling)
- [ ] Recurring React Query hooks
- [ ] Wire `UpcomingCosts` to real data
- [ ] Recurring list screen uses real data (`recurring/index.tsx` currently mock)
- [ ] Recurring detail screen uses real data (`recurring/[id].tsx` currently mock)
- [ ] Recurring add/edit form wired to DB (`recurring/add.tsx` currently mock)
- [ ] Confirm/skip/modify pending transactions
- [ ] Auto-confirmation on app open

---

## Phase 9: Debt Tracking — DONE

- [x] Debt repository (`src/repositories/debt.repository.ts`) — getByAccount, getById, create, update, delete
- [x] Debt service (`src/services/debt.service.ts`) — atomic settlement with transaction creation, wallet balance update, auto-settle when remaining reaches 0
- [x] Debt React Query hooks (`src/hooks/useDebts.ts`) — useDebts, useAllDebts, useDebt, useCreateDebt, useUpdateDebt, useDeleteDebt, useSettleDebt
- [x] Wire `DebtSection` to real data — summary cards (You Owe / You're Owed) + debt cards
- [x] Debt list screen (`debt/index.tsx`) — real data with tabs, delete confirmation
- [x] Debt detail screen (`debt/[id].tsx`) — real data with inline settlement form (amount, wallet picker, category picker)
- [x] Debt add/edit form (`debt/add.tsx`) — wired to DB with real wallet picker
- [~] Debt detail payment history — requires `debt_id` column on transactions (future migration)

---

## Phase 10: Calendar & Statistics — IN PROGRESS

### 10A. Statistics / Analytics Screen

> **Goal**: Category breakdown analytics with pie chart, date filtering, and category drill-down.

**Data Layer**
- [x] Add `getTransactionStatsByCategory` to `transaction.repository.ts` — SQL aggregation by category with SUM(amount), COUNT(*)
- [x] Create `src/hooks/useStats.ts` — React Query hook for stats data (`['stats', accountId, start, end, type]`)

**UI Components (`src/components/stats/`)**
- [x] `StatsPeriodSelector.tsx` — Date range navigator with prev/next arrows and period pills (Week/Month/Quarter/Year)
- [x] `StatsTypeTabs.tsx` — Income / Expense toggle, expense default
- [x] `PieChart.tsx` — SVG donut/pie chart using `react-native-svg`. Renders slices with category colors. Total amount in center.
- [x] `CategoryBreakdownItem.tsx` — Single category row: icon circle, name, percentage bar, amount, transaction count
- [x] `CategoryBreakdownList.tsx` — Descending-order list of `CategoryBreakdownItem`

**Screens**
- [x] `src/app/(tabs)/stats.tsx` — Main analytics screen composing: PeriodSelector + TypeTabs + PieChart + CategoryBreakdownList
- [x] `src/app/stats/category/[id].tsx` — Category detail screen: category name as title, list of transactions for that category in selected period
- [x] `src/app/stats/_layout.tsx` — Stack layout for stats routes
- [x] Update `src/app/_layout.tsx` — Add `stats` stack screen config

**Routing & Integration**
- [x] Tap category item → navigate to `/stats/category/${categoryId}` with query params for period + type
- [x] Use existing `TransactionItem` component for transaction list on detail screen
- [x] `react-native-svg` installed for chart rendering

### 10B. Calendar Screen — NOT STARTED

- [ ] Calendar grid component (`CalendarGrid`, `DayCell`)
- [ ] Monthly transaction query grouped by day
- [ ] Day tap to see transactions
- [ ] Bar chart for trends
- [ ] `victory-native` charts integration

> Current state: `calendar.tsx` is placeholder. `stats.tsx` is now implemented.

---

## Phase 11: Polish & Advanced Features — NOT STARTED

- [ ] Onboarding flow for first launch
- [ ] Haptic feedback (`expo-haptics`)
- [ ] FlashList for long lists (transactions, categories)
- [ ] Error boundaries
- [ ] Animations (entrance, list transitions)
- [ ] Pull-to-refresh on lists
- [ ] Search/filter in transaction list
- [ ] Empty state illustrations

---

## Phase 12: Backup, Export & Import — NOT STARTED

- [ ] CSV export
- [ ] JSON export/import
- [ ] Google Drive backup (`expo-auth-session`)
- [ ] Local file backup (`expo-file-system`, `expo-sharing`)
- [ ] Backup settings screen
- [ ] Export settings screen

---

## Settings Screens Status

| Screen | Status | Notes |
|--------|--------|-------|
| `settings/index.tsx` | [x] Done | Main settings with all links |
| `settings/accounts.tsx` | [x] Done | Account list + add/edit |
| `settings/edit-account.tsx` | [x] Done | Create/edit with currency picker |
| `settings/wallets.tsx` | [x] Done | Wallet list + reorder |
| `settings/edit-wallet.tsx` | [x] Done | Create/edit wallet |
| `settings/categories.tsx` | [x] Done | Category list + reorder |
| `settings/edit-category.tsx` | [x] Done | Create/edit category |
| `settings/subcategories/` | [x] Done | Subcategory management |
| `settings/icon-picker.tsx` | [x] Done | Icon selection |
| `settings/currency-picker.tsx` | [x] Done | Currency selection |
| `settings/theme.tsx` | [x] Done | Light/dark/system toggle |
| `settings/startup-screen.tsx` | [x] Done | Default tab on launch |
| `settings/backup.tsx` | [ ] Not found | Backup & restore UI |
| `settings/export.tsx` | [ ] Not found | Export & import UI |

---

## Known Issues / Technical Debt

1. [x] ~~**No service layer** — Fixed. `transaction.service.ts` handles atomic create/delete/update.~~
2. [x] ~~**BalanceCard income/expense** — Fixed. Now computes real current-month totals from confirmed transactions.~~
3. **Mock data remaining** — Budgets and upcoming costs (recurring) still use hardcoded mock data.
4. **Calendar & Stats** — Placeholder screens only.
5. [x] ~~**Transaction delete** — Fixed. Swipe-to-delete with confirmation dialog wired to atomic delete service.~~
6. [x] ~~**Transaction edit** — Done. Tap any transaction to open edit modal with pre-filled data.~~
7. [x] ~~**Missing repositories** — Debt repository created. Budget and recurring still missing.~~
8. [x] ~~**Missing hooks** — useDebts created. useBudgets, useRecurring, useBalance, useCalendar still missing.~~
9. **Recurring engine** — No pending generation or auto-confirm logic.
10. [x] ~~**Debt settlement** — Fixed. Atomic settlement service creates transaction + updates wallet + updates debt.~~
11. **Budget-category linking** — Junction table exists but no CRUD.
12. **Committed balance** — Not calculated (total - committed expenses + committed income).

---

## Recommended Next Steps (Priority Order)

### Immediate (High Impact, Low Effort)
1. [x] ~~**Fix BalanceCard income/expense** — Done.~~
2. [x] ~~**Add swipe-to-delete on transaction list** — Done.~~
3. [x] ~~**Add transaction detail/edit flow** — Done. Transaction items are tappable, form supports edit mode with atomic rebalancing.~~

### Short Term (Core Features)
4. **Build Budget data layer** — Repository + hooks + wire BudgetSection to real data.
5. [x] ~~**Build Debt data layer** — Done. Repository, hooks, service layer, all screens wired.~~
6. **Build Recurring data layer** — Repository + hooks + wire upcoming costs & recurring screens.
7. [x] ~~**Create service layer for atomic transactions** — Done. `transaction.service.ts` with `withTransactionSync`.~~

### Medium Term (Screens)
8. **Calendar screen** — Monthly grid with daily income/expense totals.
9. **Stats screen** — Category pie chart, trend bar chart.
10. **Budget detail screen** (`budget/[id].tsx`).

### Long Term (Polish)
11. Onboarding flow.
12. Backup/export screens.
13. Haptics, animations, FlashList.
