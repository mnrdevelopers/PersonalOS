# PersonalOS — Application Map, Data Schema & System Architecture Guide

This guide is designed to train and orient AI agents on the features, file structure, database schema, and execution rules of the PersonalOS PWA application.

---

## 1. Application Architecture Overview

PersonalOS is a client-side Progressive Web Application (PWA) built with Vanilla JavaScript, HTML5, Bootstrap 5, and Firebase (Firestore, Authentication, and Hosting). It serves as a personal dashboard for tracking finances, habits, vehicle service alerts, groceries, reminders, and personal memories.

### Core File Structure
* **`index.html`**: Entry page (redirects to auth or dashboard).
* **`auth.html`**: User registration, login, and Google Sign-In portal.
* **`dashboard.html`**: The main multi-tab single-page interface hosting the dashboard cards, finances, habits, vehicle manager, groceries, settings, and other sub-workspaces.
* **`sw.js`**: Service Worker managing PWA offline assets caching.
* **`manifest.json`**: PWA installer metadata.
* **`css/style.css`**: Styling definitions, dark mode support, layouts, and animations.
* **`js/` (JavaScript Controllers)**:
  * `js/dashboard.js`: Controller for the dashboard home view, calculations, and general boot handlers.
  * `js/finance.js`: Shared calculation tools for financial years and transaction parsing.
  * `js/loans.js`: Logic for managing Lent Loans, Credit Cards, Investments, and Earmarked Funds.
  * `js/habits.js`: Controls habit tracking, grids, logs, and streaks.
  * `js/vehicles.js`: Vehicle logs, service tracking, and alert triggers.
  * `js/groceries.js`: Grocery checklist and item logs.
  * `js/settings.js`: User profile and notification parameters.

---

## 2. Feature Workspaces & Business Rules

### A. Finance & Transactions
* **Income/Expense**: Users log transactions categorized as `income`, `expense`, or `transfer` with an amount, date, and category.
* **Cash Position**: Dashboard Cash and Income/Expense default lists are filtered to show only the **current Financial Year** (starting April 1st).
* **Payment Modes**: Handled by `window.getTransactionAccountMeta(data)` (in `js/finance.js`). Older transactions without `accountType` map to cash or bank based on `paymentMode`.

### B. Loans & Earmarked Funds
* **Exclusion of Liabilities**: **Borrowed/EMI** loans must be completely hidden/excluded from Net Worth calculations and dashboard listings. Only assets (Lent loans) are counted.
* **Earmarked (Locked) Funds**: Money held for family/friends. Earmarked amounts are subtracted from:
  1. Dashboard **Available (Liquid) Capital**.
  2. The parent accounts (Cash, specific Bank Account, or Wallet).
  * Lock indicators/badges are rendered beside the locked items on the dashboard.

### C. Habits & Logs
* Users track habits. Checking a habit writes a log to `habit_logs` for that day.
* Streaks are computed client-side by scanning historical dates in consecutive order.

### D. Vehicle Manager
* Tracks vehicle details, fuel logs, service history, and triggers reminders based on odometer limits or target calendar dates.

### E. Grocery List
* An active grocery checklist. Checked items get moved to a purchase logs history.

---

## 3. Database Schema (Firestore)

All collections are top-level collections (except sub-collections like `repayments` and `history`) and MUST query filter by `userId == request.auth.uid`.

| Collection | Path | Description & Fields |
| :--- | :--- | :--- |
| **Users** | `/users/{userId}` | Profile parameters. `userId` matches the Auth UID. |
| **Transactions** | `/transactions/{docId}` | `userId`, `type` (`'income'`, `'expense'`, `'transfer'`), `amount`, `date`, `category`, `paymentMode`, `accountType`, `bankAccountId`, `destinationBankAccountId`, `notes`. |
| **Loans** | `/loans/{docId}` | `userId`, `title`, `borrower`, `type` (`'lent'`, `'borrowed'`), `totalAmount`, `paidAmount`, `interestRate`, `status` (`'active'`, `'completed'`), `notes`. |
| **Repayments** | `/loans/{docId}/repayments/{repaymentId}` | Sub-collection. `userId`, `amount`, `date`, `interestSplit`, `feeSplit`, `note`. |
| **Earmarked Funds** | `/earmarked_funds/{docId}` | `userId`, `title`, `owner`, `amount` (current computed lock), `initialAmount`, `source` (`'cash'`, `'bank-ID'`, `'wallet-ID'`), `status` (`'active'`, `'returned'`). |
| **Earmarked History** | `/earmarked_funds/{docId}/history/{entryId}` | Sub-collection. `userId`, `type` (`'deposit'`, `'release'`), `amount`, `date`, `note`. |
| **Wallets** | `/wallets/{docId}` | `userId`, `name`, `balance`, `color`. |
| **Bank Accounts** | `/bank_accounts/{docId}` | `userId`, `name`, `color`, `icon`, `status`. |
| **Credit Cards** | `/credit_cards/{docId}` | `userId`, `name`, `creditLimit`, `currentOutstanding`, `billingCycleStart`, `color`. |
| **Investments** | `/investments/{docId}` | `userId`, `name`, `investedAmount`, `currentValue`, `category`, `status`. |
| **Habits** | `/habits/{docId}` | `userId`, `name`, `frequency`, `color`, `streak`. |
| **Habit Logs** | `/habit_logs/{docId}` | `userId`, `habitId`, `date`, `status` (`'done'`). |
| **Grocery Items** | `/grocery_items/{docId}` | `userId`, `name`, `quantity`, `category`, `checked`. |
| **Grocery Logs** | `/grocery_logs/{docId}` | `userId`, `name`, `quantity`, `dateBought`. |
| **Vehicles** | `/vehicles/{docId}` | `userId`, `name`, `odometer`, `type`. |
| **Vehicle Logs** | `/vehicle_logs/{docId}` | `userId`, `vehicleId`, `type` (`'fuel'`, `'service'`), `cost`, `odometer`, `date`, `note`. |

---

## 4. Key Security & Query Implementation Rules

* **Composite Indexes Avoidance**: To avoid manual Firebase Console configuration, do **not** use composite order-by queries. Instead:
  1. Fetch documents matching the `userId == uid` condition (plus simple single-field checks).
  2. Sort documents client-side using JavaScript `Array.prototype.sort()`.
* **PWA Error Resilience**: Keep the PWA loading spinner active during initial reads by wrapping Firestore queries in `Promise.all` alongside individual `.catch()` fallback handlers.
* **Cache Invalidation**: On making script or markup edits, manually increment the cache version name (e.g., `'personalos-v25'`) in the service worker [sw.js](file:///d:/PROJECTS/PersonalOS/sw.js) to trigger an immediate browser reload.
