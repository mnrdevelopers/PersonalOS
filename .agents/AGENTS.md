# PersonalOS AI Guidelines & Project Customizations

This file outlines codebase rules, database structures, and design guidelines for future AI agents working on this workspace.

---

## 1. Dashboard Calculations & Net Worth

### Liabilities (Borrowed Loans) Exclusion
* **Rule**: Completely exclude **Borrowed/EMI** loans from dashboard Net Worth calculations and visual layouts. Only display and calculate **Lent** loans under assets.
* **Reasoning**: The user explicitly requested to completely hide/exclude liabilities from dashboard Net Worth views to focus on spendable liquid asset positioning.

### Date-Range Alignment
* **Rule**: The dashboard cash balance must align with the **current Financial Year** (starting April 1st) to match the Income/Expense page's default view. Do not show lifetime cash totals.

---

## 2. Earmarked (Locked) Funds

### Overview
To prevent accidental spending of money held on behalf of family or friends (locked holdings), the earmarked funds feature subtracts locked amounts from spendable capital.

### Database Structures
* **Parent Collection**: `earmarked_funds`
  * Fields: `userId`, `title`, `owner`, `source` (e.g., `cash`, `bank-[accountId]`, `wallet-[walletId]`), `notes`, `amount` (current computed lock), `initialAmount` (amount at lock creation), `status` (`'active'` or `'returned'`), `createdAt`, `updatedAt`.
* **Sub-collection (History/Ledger)**: `earmarked_funds/{fundId}/history`
  * Tracks monthly deposits or partial returns.
  * Fields: `userId`, `type` (`'deposit'` or `'release'`), `amount`, `date`, `note`, `createdAt`.

### Available Capital & Account Balance Deductions
* **Rule**: Always subtract active earmarked funds (`status == 'active'`) from:
  1. Dashboard **Available (Liquid) Capital**.
  2. The parent account (`cash`, the specific `bank-account`, or `wallet`) in breakdown listings.
* **Badges**: Display a locking badge next to individual cash, bank, or wallet line items where locked amounts are active.

### Firestore Rules & Query Restrictions
* **Rule**: All queries on `earmarked_funds` and its sub-collection `history` MUST filter by `userId` to pass Firestore security rules.
* **Client-side Sorting**: To avoid creating complex composite indexes, do **not** use Firestore `.orderBy()` fields on multiple fields when querying with `where('userId')`. Fetch the documents matching `userId` and sort them client-side by date and time.
* **Denormalized Syncing**: Adding or deleting history ledger entries must immediately compute the new total and update the parent `amount` field in the parent document. This keeps the dashboard queries performant and avoids nested sub-collection queries.

---

## 3. PWA Loading & Error Resilience

### Loader Synchronization
* **Rule**: The dashboard boot logic must await `initializeDashboard()` to keep the PWA load spinner active until cards fetch their data.
* **Query Safety**: Wrap Firestore parallel queries (`Promise.all`) in individual `.catch()` handlers that return empty fallback arrays. This prevents a single database read failure from freezing the application loading screen.

### Cache Invalidation
* **Rule**: Whenever modifying JavaScript, HTML, or CSS assets, manually increment the cache version name (e.g., `'personalos-v25'`) in the service worker file [sw.js](file:///d:/PROJECTS/PersonalOS/sw.js) to trigger browser cache invalidation.
