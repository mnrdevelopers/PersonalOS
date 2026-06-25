function getDefaultFinanceFinancialYear() {
    const today = new Date();
    return String(today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1);
}

let currentCategoryType = 'income';
let currentFinanceFilter = 'all';
let financeCategoryFilter = 'all';
let financeLastDocs = [];
let financeCurrentPage = 1;
const FINANCE_PAGE_SIZE = 50;
let financeSearchQuery = '';
let financeFinancialYearFilter = getDefaultFinanceFinancialYear();
window.userCategoryIcons = {};

window.getCurrentFinancialYearStartYear = function(date = new Date()) {
    const value = date instanceof Date ? date : new Date(date);
    return value.getMonth() >= 3 ? value.getFullYear() : value.getFullYear() - 1;
};

window.getFinancialYearRange = function(startYear) {
    const numericYear = Number(startYear);
    return {
        start: `${numericYear}-04-01`,
        end: `${numericYear + 1}-03-31`
    };
};

window.getFinancialYearLabel = function(startYear) {
    const numericYear = Number(startYear);
    const shortEndYear = String(numericYear + 1).slice(-2);
    return `FY ${numericYear}-${shortEndYear}`;
};

window.formatLocalDateForInput = function(date = new Date()) {
    const value = date instanceof Date ? date : new Date(date);
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

window.getCurrentMonthDateRange = function(date = new Date()) {
    const value = date instanceof Date ? date : new Date(date);
    const start = new Date(value.getFullYear(), value.getMonth(), 1);
    const end = new Date(value.getFullYear(), value.getMonth() + 1, 0);

    return {
        start: window.formatLocalDateForInput(start),
        end: window.formatLocalDateForInput(end)
    };
};

window.populateFinancialYearSelect = function(selectId, selectedValue = 'all', yearsBack = 6) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const currentStartYear = window.getCurrentFinancialYearStartYear();
    const options = [
        { value: 'all', label: 'All Financial Years' },
        { value: 'custom', label: 'Custom Range' }
    ];

    for (let offset = 0; offset <= yearsBack; offset++) {
        const startYear = currentStartYear - offset;
        options.push({
            value: String(startYear),
            label: window.getFinancialYearLabel(startYear)
        });
    }

    select.innerHTML = options.map(option => `<option value="${option.value}">${option.label}</option>`).join('');
    select.value = options.some(option => option.value === String(selectedValue)) ? String(selectedValue) : 'all';
};

window.applyFinanceDefaultLedgerRange = function() {
    financeFinancialYearFilter = getDefaultFinanceFinancialYear();
    const range = window.getFinancialYearRange(financeFinancialYearFilter);
    const startInput = document.getElementById('finance-start-date');
    const endInput = document.getElementById('finance-end-date');
    const fySelect = document.getElementById('finance-financial-year');

    if (startInput) startInput.value = range.start;
    if (endInput) endInput.value = range.end;
    if (fySelect) fySelect.value = financeFinancialYearFilter;
};

window.detectFinancialYearSelection = function(startDate, endDate) {
    if (!startDate && !endDate) return 'all';
    if (!startDate || !endDate) return 'custom';

    const startYear = Number(startDate.split('-')[0]);
    if (!Number.isFinite(startYear)) return 'custom';

    const range = window.getFinancialYearRange(startYear);
    return range.start === startDate && range.end === endDate ? String(startYear) : 'custom';
};

window.refreshCategoryIcons = async function() {
    const user = auth.currentUser;
    if (!user) return;
    try {
        const snap = await db.collection('categories').where('userId', '==', user.uid).get();
        window.userCategoryIcons = {};
        snap.forEach(doc => {
            const d = doc.data();
            if (d.name) window.userCategoryIcons[d.name] = d.icon;
        });
    } catch (e) { console.error("Error refreshing icons:", e); }
};

// Helper to get icon for category name (fallback for existing data)
window.getCategoryIcon = function(name, explicitIcon = null) {
    if (explicitIcon) return explicitIcon;
    if (!name) return '🏷️';
    if (window.userCategoryIcons && window.userCategoryIcons[name]) return window.userCategoryIcons[name];
    const lower = name.toLowerCase();
    const map = {
        'salary': '💰', 'freelance': '💻', 'investment': '📈', 'gift': '🎁',
        'food': '🍔', 'transport': '🚌', 'shopping': '🛍️', 'entertainment': '🎬',
        'bills': '🧾', 'healthcare': '⚕️', 'education': '🎓', 'travel': '✈️',
        'groceries': '🛒', 'rent': '🏠', 'utilities': '💡', 'fuel': '⛽',
        'emi': '🏦', 'loan': '💸', 'insurance': '🛡️', 'maintenance': '🔧', 'grocery': '🛒',
        'vehicle': '🚗', 'home': '🏡', 'subscription': '🔄'
    };
    for (const [key, icon] of Object.entries(map)) {
        if (lower.includes(key)) return icon;
    }
    return '🏷️';
};

window.getPaymentModeLabel = function(mode) {
    if (!mode) return 'CASH';
    const labels = {
        cash: 'CASH',
        bank: 'BANK TRANSFER',
        upi: 'UPI',
        'upi-bhim': 'UPI (BHIM)',
        'upi-phonepe': 'UPI (PHONEPE)',
        'upi-gpay': 'UPI (GOOGLE PAY)',
        'upi-navi': 'UPI (NAVI PAY)',
        'upi-cred': 'UPI (CRED PAY)',
        'internal-transfer': 'INTERNAL TRANSFER',
        'credit-card': 'CREDIT CARD',
        'debit-card': 'DEBIT CARD',
        wallet: 'WALLET',
        card: 'CARD',
        fastag_wallet: 'FASTAG WALLET',
        other: 'OTHER'
    };
    return labels[mode] || mode.toUpperCase();
};

window.getAccountTypeLabel = function(type) {
    const labels = {
        cash: 'Cash',
        bank: 'Bank',
        transfer: 'Transfer',
        wallet: 'Wallet',
        'credit-card': 'Credit Card',
        other: 'Other'
    };
    return labels[type] || 'Other';
};

window.getTransactionAccountMeta = function(transactionOrMode) {
    if (transactionOrMode && typeof transactionOrMode === 'object') {
        if (transactionOrMode.type === 'transfer') {
            const sourceLabel = transactionOrMode.sourceAccountLabel || window.getAccountTypeLabel(transactionOrMode.sourceAccountType || 'cash');
            const destinationLabel = transactionOrMode.destinationAccountLabel || window.getAccountTypeLabel(transactionOrMode.destinationAccountType || 'bank');
            return {
                type: 'transfer',
                label: `${sourceLabel} -> ${destinationLabel}`
            };
        }
        if (transactionOrMode.accountType) {
            return {
                type: transactionOrMode.accountType,
                label: transactionOrMode.accountLabel || window.getAccountTypeLabel(transactionOrMode.accountType)
            };
        }
        return window.getTransactionAccountMeta(transactionOrMode.paymentMode);
    }

    const mode = transactionOrMode;
    if (!mode || mode === 'cash') return { type: 'cash', label: 'Cash' };
    if (
        mode === 'bank' ||
        mode === 'upi' ||
        mode === 'debit-card' ||
        (typeof mode === 'string' && mode.startsWith('upi-'))
    ) {
        return { type: 'bank', label: 'Bank' };
    }
    if (mode === 'wallet') return { type: 'wallet', label: 'Wallet' };
    if (mode === 'fastag_wallet') return { type: 'wallet', label: 'FASTag Wallet' };
    if (mode === 'credit-card' || mode === 'card') return { type: 'credit-card', label: mode === 'card' ? 'Card' : 'Credit Card' };
    return { type: 'other', label: 'Other' };
};

window.getAccountBadgeClass = function(type) {
    const classes = {
        cash: 'bg-success-subtle text-success',
        bank: 'bg-primary-subtle text-primary',
        transfer: 'bg-dark-subtle text-dark',
        wallet: 'bg-info-subtle text-info',
        'credit-card': 'bg-warning-subtle text-warning',
        other: 'bg-secondary-subtle text-secondary'
    };
    return classes[type] || classes.other;
};

window.isUpiPaymentMode = function(mode) {
    return mode === 'upi' || (typeof mode === 'string' && mode.startsWith('upi-'));
};

window.loadFinanceSection = async function() {
    const container = document.getElementById('finance-section');
    container.innerHTML = `
        <div class="finance-shell finance-classic">
        <!-- Quick Guide -->
        <details class="section-guide-card mb-4 animate-fade-in">
            <summary class="section-guide-header">
                <span class="section-guide-title"><i class="fas fa-compass"></i> Finance Guide</span>
            </summary>
            <div class="section-guide-content">
                <ul class="section-guide-steps">
                    <li><strong>Workspace Layout</strong>: Manage your income, expenses, bank accounts, and scheduled recurring rules from one dashboard.</li>
                    <li><strong>Transfers vs. Income/Expenses</strong>: Record transfers to move money between cash and bank accounts. Transfers update account totals without inflating your income or expense logs.</li>
                    <li><strong>Quick Integrations</strong>: Click "Categories" to create custom emojis and color tags, or select PDF/CSV to export report spreadsheets.</li>
                </ul>
            </div>
        </details>

        <div class="finance-hero card border-0 shadow-lg rounded-4 overflow-hidden animate-slide-up mb-4">
            <div class="card-body p-3 p-lg-4 finance-hero-body position-relative">
                <div class="finance-hero-glow finance-hero-glow-1"></div>
                <div class="finance-hero-glow finance-hero-glow-2"></div>
                <div class="finance-hero-grid position-relative">
                    <div class="finance-hero-copy">
                        <div class="finance-kicker">Finance Workspace</div>
                        <h2 class="fw-bold mb-2">Income, Expenses & Transfers</h2>
                        <p class="finance-subtitle mb-3">Track actual movement across cash and bank, keep internal transfers clean, and review the register financial-year wise.</p>
                        <div class="finance-hero-highlights">
                            <span class="finance-highlight-chip"><i class="fas fa-building-columns"></i>Real cash vs bank view</span>
                            <span class="finance-highlight-chip"><i class="fas fa-calendar-days"></i>Financial year ready</span>
                            <span class="finance-highlight-chip"><i class="fas fa-right-left"></i>Transfer-safe totals</span>
                        </div>
                    </div>
                    <div class="finance-actions-card">
                        <div class="finance-actions-eyebrow">Quick Actions</div>
                        <div class="finance-actions">
                            <button class="btn btn-sm btn-dark finance-action-btn finance-action-primary" onclick="openTransferModal()">
                                <i class="fas fa-right-left me-2"></i>Cash / Bank Transfer
                            </button>
                            <button class="btn btn-sm btn-outline-danger finance-action-btn finance-action-secondary" onclick="exportFinancePDF()">
                                <i class="fas fa-file-pdf me-2"></i>Export PDF
                            </button>
                            <button class="btn btn-sm btn-outline-success finance-action-btn finance-action-secondary" onclick="exportFinanceCSV()">
                                <i class="fas fa-file-csv me-2"></i>Export CSV
                            </button>
                            <button class="btn btn-sm btn-outline-primary finance-action-btn finance-action-secondary" onclick="openCategoriesModal()">
                                <i class="fas fa-tags me-2"></i>Categories
                            </button>
                        </div>
                        <div class="finance-actions-note">Transfers move value between cash and bank without changing income or expense totals.</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Stats Row -->
        <div class="finance-overview-row row g-3 mb-4">
            <div class="col-md-4 animate-slide-up" style="animation-delay: 0.1s;">
                <div class="card border-0 shadow-lg h-100 overflow-hidden premium-card-income rounded-4 finance-metric-card">
                    <div class="card-body p-3 finance-stat-card-body text-white position-relative">
                        <div class="d-flex justify-content-between align-items-start z-1 position-relative">
                            <div>
                                <p class="mb-1 opacity-75 fw-medium finance-card-eyebrow">Total Income</p>
                                <h2 class="display-6 fw-bold mb-0" id="stats-income">₹0.00</h2>
                            </div>
                            <div class="icon-box bg-white bg-opacity-25 rounded-circle p-3 backdrop-blur"><i class="fas fa-arrow-down fa-lg"></i></div>
                        </div>
                        <div class="finance-card-footnote position-relative z-1">Filtered incoming transactions for the selected finance period.</div>
                        <div class="decorative-circle"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-4 animate-slide-up" style="animation-delay: 0.2s;">
                <div class="card border-0 shadow-lg h-100 overflow-hidden premium-card-expense rounded-4 finance-metric-card">
                    <div class="card-body p-3 finance-stat-card-body text-white position-relative">
                        <div class="d-flex justify-content-between align-items-start z-1 position-relative">
                            <div>
                                <p class="mb-1 opacity-75 fw-medium finance-card-eyebrow">Total Expense</p>
                                <h2 class="display-6 fw-bold mb-0" id="stats-expense">₹0.00</h2>
                            </div>
                            <div class="icon-box bg-white bg-opacity-25 rounded-circle p-3 backdrop-blur"><i class="fas fa-arrow-up fa-lg"></i></div>
                        </div>
                        <div class="finance-card-footnote position-relative z-1">Filtered outgoing transactions for the selected finance period.</div>
                        <div class="decorative-circle"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-4 animate-slide-up" style="animation-delay: 0.3s;">
                <div class="card border-0 shadow-lg h-100 overflow-hidden premium-card-balance rounded-4 finance-metric-card">
                    <div class="card-body p-3 finance-stat-card-body text-white position-relative">
                        <div class="d-flex justify-content-between align-items-start z-1 position-relative">
                            <div>
                                <p class="mb-1 opacity-75 fw-medium finance-card-eyebrow">Net Balance</p>
                                <h2 class="display-6 fw-bold mb-0" id="stats-balance">₹0.00</h2>
                            </div>
                            <div class="icon-box bg-white bg-opacity-25 rounded-circle p-3 backdrop-blur"><i class="fas fa-wallet fa-lg"></i></div>
                        </div>
                        <div class="finance-card-footnote position-relative z-1">Income less expense for the selected finance period, with transfers excluded from profit view.</div>
                        <div class="decorative-circle"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="finance-balance-row row g-3 mb-4">
            <div class="col-md-6 animate-slide-up" style="animation-delay: 0.35s;">
                <div class="card border-0 shadow-sm rounded-4 h-100 finance-position-card finance-position-cash finance-metric-card">
                    <div class="card-body p-3 finance-position-card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <div class="text-muted small text-uppercase fw-semibold finance-card-eyebrow">Cash Position</div>
                                <h3 class="mb-0 fw-bold text-success" id="stats-cash-balance">₹0.00</h3>
                            </div>
                            <span class="badge rounded-pill bg-success-subtle text-success px-3 py-2 finance-chip-badge">Cash</span>
                        </div>
                        <div class="finance-position-caption">Cash movement after income, expense, and transfer flow in the selected finance period.</div>
                        <div class="small text-muted" id="stats-cash-detail">In ₹0.00 • Out ₹0.00</div>
                    </div>
                </div>
            </div>
            <div class="col-md-6 animate-slide-up" style="animation-delay: 0.4s;">
                <div class="card border-0 shadow-sm rounded-4 h-100 finance-position-card finance-position-bank finance-metric-card">
                    <div class="card-body p-3 finance-position-card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <div class="text-muted small text-uppercase fw-semibold finance-card-eyebrow">Bank Position</div>
                                <h3 class="mb-0 fw-bold text-primary" id="stats-bank-balance">₹0.00</h3>
                            </div>
                            <span class="badge rounded-pill bg-primary-subtle text-primary px-3 py-2 finance-chip-badge">Bank</span>
                        </div>
                        <div class="finance-position-caption">Bank-linked movement from bank, UPI, and internal transfer flow in the selected finance period.</div>
                        <div class="small text-muted" id="stats-bank-detail">In ₹0.00 • Out ₹0.00</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Per-account balance chips (shown when user has bank accounts) -->
        <div id="finance-account-chips-row" class="mb-4" style="display:none"></div>

        <div class="finance-register-shell">
        <div class="finance-register-header">
            <div class="finance-register-copy">
                <div class="finance-register-kicker">Finance Register</div>
                <h3 class="finance-register-title mb-1">Transactions and recurring rules</h3>
                <div class="finance-register-subtitle">Review day-to-day entries, internal transfers, and scheduled rules from one workspace.</div>
            </div>
            <ul class="nav nav-pills finance-tabs">
                <li class="nav-item">
                    <a class="nav-link active" href="javascript:void(0)" onclick="switchFinanceTab('ledger', this)">Transactions</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="javascript:void(0)" onclick="switchFinanceTab('recurring', this)">Recurring Rules</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="javascript:void(0)" onclick="switchFinanceTab('accounts', this)"><i class="fas fa-building-columns me-1"></i>Bank Accounts</a>
                </li>
            </ul>
        </div>

        <!-- Ledger View -->
        <div id="finance-ledger-view">
            <div class="finance-filter-panel card border-0 shadow-sm rounded-4 mb-4 animate-slide-up" style="animation-delay: 0.38s;">
                <div class="card-body p-2 p-lg-3">
                    <!-- Row 1: Quick presets + Reset -->
                    <div class="d-flex align-items-center gap-2 flex-wrap mb-2">
                        <span class="text-muted small fw-semibold me-1" style="white-space:nowrap">Quick:</span>
                        <button type="button" class="btn btn-xs btn-outline-secondary finance-preset-btn py-1 px-2" style="font-size:0.75rem" onclick="applyFinancePreset('today')">Today</button>
                        <button type="button" class="btn btn-xs btn-outline-secondary finance-preset-btn py-1 px-2" style="font-size:0.75rem" onclick="applyFinancePreset('month')">This Month</button>
                        <button type="button" class="btn btn-xs btn-outline-secondary finance-preset-btn py-1 px-2" style="font-size:0.75rem" onclick="applyFinancePreset('current-fy')">Current FY</button>
                        <button type="button" class="btn btn-xs btn-outline-secondary finance-preset-btn py-1 px-2" style="font-size:0.75rem" onclick="applyFinancePreset('last-fy')">Last FY</button>
                        <button type="button" class="btn btn-xs btn-outline-danger ms-auto py-1 px-2" style="font-size:0.75rem" onclick="resetFinanceFilters()">
                            <i class="fas fa-rotate-left me-1"></i>Reset
                        </button>
                    </div>
                    <!-- Row 2: All filters inline -->
                    <div class="d-flex align-items-center gap-2 flex-wrap">
                        <!-- Search -->
                        <div class="input-group" style="min-width:160px;max-width:220px;flex:1 1 160px">
                            <span class="input-group-text py-1 px-2"><i class="fas fa-search text-muted" style="font-size:0.75rem"></i></span>
                            <input type="text" class="form-control form-control-sm" id="finance-search" placeholder="Search..." onkeyup="searchFinance(this.value)" style="font-size:0.8rem">
                        </div>
                        <!-- Category -->
                        <select class="form-select form-select-sm" id="finance-category-filter" onchange="filterFinanceCategory(this.value)" style="min-width:130px;max-width:170px;flex:1 1 130px;font-size:0.8rem">
                            <option value="all">All Categories</option>
                        </select>
                        <!-- Bank Account -->
                        <select class="form-select form-select-sm" id="finance-bank-account-filter" onchange="filterFinanceBankAccount(this.value)" style="min-width:130px;max-width:170px;flex:1 1 130px;font-size:0.8rem">
                            <option value="all">All Accounts</option>
                        </select>
                        <!-- Financial Year -->
                        <select class="form-select form-select-sm" id="finance-financial-year" onchange="applyFinanceFinancialYear(this.value)" style="min-width:120px;max-width:150px;flex:1 1 120px;font-size:0.8rem">
                            <option value="all">All Years</option>
                        </select>
                        <!-- Date Range -->
                        <div class="d-flex align-items-center gap-1" style="flex:1 1 auto">
                            <input type="date" class="form-control form-control-sm" id="finance-start-date" onchange="filterFinanceDate()" style="font-size:0.78rem;min-width:115px">
                            <span class="text-muted small">–</span>
                            <input type="date" class="form-control form-control-sm" id="finance-end-date" onchange="filterFinanceDate()" style="font-size:0.78rem;min-width:115px">
                            <button class="btn btn-sm btn-outline-secondary py-1 px-2" type="button" onclick="clearFinanceDate()" title="Clear dates" style="font-size:0.75rem"><i class="fas fa-times"></i></button>
                        </div>
                        <!-- Type pills -->
                        <div class="d-flex gap-1" role="group" aria-label="Transaction type filters">
                            <input type="radio" class="btn-check" name="finance-filter" id="filter-all" autocomplete="off" checked>
                            <label class="btn btn-sm btn-outline-primary py-1 px-2" for="filter-all" style="font-size:0.78rem">All</label>
                            <input type="radio" class="btn-check" name="finance-filter" id="filter-income" autocomplete="off">
                            <label class="btn btn-sm btn-outline-success py-1 px-2" for="filter-income" style="font-size:0.78rem">In</label>
                            <input type="radio" class="btn-check" name="finance-filter" id="filter-expense" autocomplete="off">
                            <label class="btn btn-sm btn-outline-danger py-1 px-2" for="filter-expense" style="font-size:0.78rem">Out</label>
                            <input type="radio" class="btn-check" name="finance-filter" id="filter-transfer" autocomplete="off">
                            <label class="btn btn-sm btn-outline-secondary py-1 px-2" for="filter-transfer" style="font-size:0.78rem">Txfr</label>
                        </div>
                    </div>
                    <!-- Active filter chips -->
                    <div class="finance-active-filters mt-2" id="finance-active-filters"></div>
                </div>
            </div>
            <div class="card table-card finance-table-card animate-slide-up" style="animation-delay: 0.42s;">
                <div class="card-body p-0">
                    <div class="finance-table-intro">
                        <div>
                            <div class="finance-filter-label mb-1">Transaction Register</div>
                            <div class="text-muted small">Transfers change cash and bank positions, but stay out of income and expense totals.</div>
                        </div>
                        <div class="d-flex align-items-center gap-2 flex-wrap">
                            <span class="finance-register-note d-none d-md-inline-flex">Live view of filtered finance entries</span>
                            <button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="exportFinancePDF()" title="Download PDF Report">
                                <i class="fas fa-file-pdf me-1"></i> Download PDF
                            </button>
                            <button class="btn btn-sm btn-outline-success rounded-pill px-3" onclick="exportFinanceCSV()" title="Download CSV Report">
                                <i class="fas fa-file-csv me-1"></i> Download CSV
                            </button>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th class="ps-4" style="width: 40px;">
                                        <input type="checkbox" class="form-check-input" id="finance-select-all" onclick="toggleSelectAllFinance(this)">
                                    </th>
                                    <th>Date</th>
                                    <th>Category & Desc</th>
                                    <th>Account</th>
                                    <th>Payment Mode</th>
                                    <th class="text-end pe-4">Amount</th>
                                    <th class="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="finance-table-body">
                                <tr><td colspan="7" class="text-center">Loading...</td></tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Pagination -->
                    <div class="finance-pagination-bar">
                        <div class="finance-page-meta">
                            <span class="finance-page-label">Register Page</span>
                            <span class="text-muted small" id="finance-page-info">Page 1</span>
                        </div>
                        <div class="btn-group">
                            <button class="btn btn-outline-secondary btn-sm finance-page-btn" id="btn-finance-prev" onclick="changeFinancePage(-1)" disabled>
                                <i class="fas fa-chevron-left"></i> Previous
                            </button>
                            <button class="btn btn-outline-secondary btn-sm finance-page-btn" id="btn-finance-next" onclick="changeFinancePage(1)" disabled>
                                Next <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recurring View -->
        <div id="finance-recurring-view" class="d-none">
            <div class="card table-card finance-table-card animate-slide-up">
                <div class="card-body p-0">
                    <div class="finance-table-intro">
                        <div>
                            <div class="finance-filter-label mb-1">Recurring Rules</div>
                            <div class="text-muted small">Scheduled items continue to create regular finance entries on their due dates.</div>
                        </div>
                        <span class="finance-register-note">Active recurring transactions only</span>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th class="ps-4">Description</th>
                                    <th>Category</th>
                                    <th>Frequency</th>
                                    <th>Next Due</th>
                                    <th class="text-end pe-4">Amount</th>
                                    <th class="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="recurring-table-body">
                                <tr><td colspan="6" class="text-center">Loading...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        </div>

        <!-- Bank Accounts View -->
        <div id="finance-accounts-view" class="d-none">
            <!-- Content loaded dynamically by bank-accounts.js -->
        </div>
        </div>

        <!-- Categories Modal (Premium Redesign) -->
        <div class="modal fade" id="categoriesModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" style="max-width:520px">
                <div class="modal-content">
                    <!-- Premium Gradient Header -->
                    <div class="cat-modal-header">
                        <div class="cat-modal-header-inner">
                            <span class="cat-modal-title"><i class="fas fa-tags"></i> Manage Categories</span>
                            <button type="button" class="cat-modal-close" data-bs-dismiss="modal" aria-label="Close"><i class="fas fa-times"></i></button>
                        </div>
                        <!-- Pill tab switcher -->
                        <div class="cat-tab-strip">
                            <button class="cat-tab-btn" id="cat-tab-income" onclick="switchCategoryTab('income', this)">
                                <i class="fas fa-arrow-down"></i> Income
                                <span class="cat-tab-badge" id="cat-count-income">0</span>
                            </button>
                            <button class="cat-tab-btn" id="cat-tab-expense" onclick="switchCategoryTab('expense', this)">
                                <i class="fas fa-arrow-up"></i> Expense
                                <span class="cat-tab-badge" id="cat-count-expense">0</span>
                            </button>
                        </div>
                    </div>
                    <!-- Body -->
                    <div class="modal-body">
                        <!-- Hidden inputs -->
                        <input type="hidden" id="new-category-icon" value="🏷️">
                        <input type="hidden" id="edit-category-id">
                        <!-- Add / Edit Form -->
                        <div class="cat-form-card" id="cat-form-card">
                            <label class="cat-form-label" id="cat-form-heading">Add New Category</label>
                            <div class="cat-form-row">
                                <button class="cat-emoji-btn" id="cat-emoji-trigger" onclick="toggleEmojiPicker(event)" type="button" title="Pick an icon">🏷️</button>
                                <input type="text" class="cat-name-input" id="new-category-name" placeholder="e.g. Groceries, Salary…">
                            </div>
                            <!-- Color Swatches -->
                            <div class="cat-color-row" id="cat-color-row"></div>
                            <input type="hidden" id="new-category-color" value="#4f46e5">
                            <!-- Actions -->
                            <div class="cat-form-actions">
                                <button class="cat-btn-save income-mode" id="btn-add-category" onclick="addCategory()">
                                    <i class="fas fa-plus"></i> Add Category
                                </button>
                                <button class="cat-btn-cancel d-none" id="btn-cancel-category" onclick="resetCategoryForm()">Cancel</button>
                            </div>
                        </div>
                        <!-- Category Grid -->
                        <div class="cat-section-label">
                            Your Categories
                            <button class="cat-btn-defaults" id="btn-seed-defaults" onclick="seedDefaultCategories()" title="Add commonly used categories that you don't have yet">
                                <i class="fas fa-magic"></i> Add Defaults
                            </button>
                        </div>
                        <div id="categories-list"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Transfer Modal -->
        <div class="modal fade" id="transferModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable finance-transfer-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Cash / Bank Transfer</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="finance-transfer-note">
                            <i class="fas fa-circle-info"></i>
                            <span>This records internal movement only. It updates cash and bank positions without affecting income or expense totals.</span>
                        </div>
                        <form id="transfer-form">
                            <input type="hidden" id="transfer-id">
                            <div class="mb-3">
                                <label class="form-label">Direction</label>
                                <select class="form-select" id="transfer-direction" required onchange="onTransferDirectionChange(this.value)">
                                    <option value="cash_to_bank">Cash → Bank</option>
                                    <option value="bank_to_cash">Bank → Cash</option>
                                    <option value="bank_to_bank">Bank → Bank (between accounts)</option>
                                </select>
                            </div>
                            <!-- Source bank account (shown for bank_to_cash and bank_to_bank) -->
                            <div class="mb-3 transfer-bank-row" id="transfer-source-bank-row">
                                <label class="form-label">Source Bank Account</label>
                                <select class="form-select" id="transfer-source-bank-account">
                                    <option value="">Select account…</option>
                                </select>
                            </div>
                            <!-- Destination bank account (shown for cash_to_bank and bank_to_bank) -->
                            <div class="mb-3 transfer-bank-row" id="transfer-dest-bank-row">
                                <label class="form-label">Destination Bank Account</label>
                                <select class="form-select" id="transfer-dest-bank-account">
                                    <option value="">Select account…</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Amount</label>
                                <div class="input-group">
                                    <span class="input-group-text">₹</span>
                                    <input type="number" class="form-control" id="transfer-amount" step="0.01" min="0" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Date</label>
                                <input type="date" class="form-control" id="transfer-date" required>
                            </div>
                            <div class="mb-0">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" id="transfer-description" rows="2" placeholder="Optional note for this internal transfer"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-dark" id="save-transfer" onclick="saveTransferTransaction()">Save Transfer</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Load data
    await window.refreshCategoryIcons();
    await window.populateCategoryFilter();
    window.populateFinancialYearSelect('finance-financial-year', financeFinancialYearFilter);
    if (financeFinancialYearFilter !== 'all' && financeFinancialYearFilter !== 'custom') {
        const range = window.getFinancialYearRange(financeFinancialYearFilter);
        document.getElementById('finance-start-date').value = range.start;
        document.getElementById('finance-end-date').value = range.end;
    }

    // Populate bank account filter and chips
    await window.populateFinanceBankAccountFilter();

    const activeFilterInput = document.getElementById(`filter-${currentFinanceFilter}`) || document.getElementById('filter-all');
    if (activeFilterInput) activeFilterInput.checked = true;
    updateFinanceFilterSummary();

    await loadFinanceData();

    // Setup filters
    document.getElementById('filter-all').addEventListener('click', () => filterFinance('all', true));
    document.getElementById('filter-income').addEventListener('click', () => filterFinance('income', true));
    document.getElementById('filter-expense').addEventListener('click', () => filterFinance('expense', true));
    document.getElementById('filter-transfer').addEventListener('click', () => filterFinance('transfer', true));
};

window.switchFinanceTab = function(tab, element) {
    if (window.clearBulkSelection) window.clearBulkSelection();
    document.querySelectorAll('#finance-section .finance-tabs .nav-link').forEach(l => l.classList.remove('active'));
    element.classList.add('active');

    const ledger  = document.getElementById('finance-ledger-view');
    const recur   = document.getElementById('finance-recurring-view');
    const accounts = document.getElementById('finance-accounts-view');

    [ledger, recur, accounts].forEach(el => el && el.classList.add('d-none'));

    if (tab === 'ledger') {
        if (ledger) ledger.classList.remove('d-none');
        loadFinanceData();
    } else if (tab === 'recurring') {
        if (recur) recur.classList.remove('d-none');
        loadRecurringTransactions();
    } else if (tab === 'accounts') {
        if (accounts) accounts.classList.remove('d-none');
        if (window.loadBankAccountsSection) window.loadBankAccountsSection();
    }
};

window.populateCategoryFilter = async function() {
    const user = auth.currentUser;
    if (!user) return;
    const select = document.getElementById('finance-category-filter');
    if (!select) return;

    select.innerHTML = '<option value="all">All Categories</option>';

    try {
        const snap = await db.collection('categories')
            .where('userId', '==', user.uid)
            .orderBy('name')
            .get();
        
        const incomeCats = [];
        const expenseCats = [];

        snap.forEach(doc => {
            const d = doc.data();
            if (d.type === 'income') incomeCats.push(d);
            else expenseCats.push(d);
        });

        if (incomeCats.length > 0) {
            const grp = document.createElement('optgroup');
            grp.label = 'Income';
            incomeCats.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.name;
                opt.textContent = `${c.icon || '💰'} ${c.name}`;
                grp.appendChild(opt);
            });
            select.appendChild(grp);
        }

        if (expenseCats.length > 0) {
            const grp = document.createElement('optgroup');
            grp.label = 'Expense';
            expenseCats.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.name;
                opt.textContent = `${c.icon || '💸'} ${c.name}`;
                grp.appendChild(opt);
            });
            select.appendChild(grp);
        }

        const systemGroup = document.createElement('optgroup');
        systemGroup.label = 'System';
        const transferOption = document.createElement('option');
        transferOption.value = 'Transfer';
        transferOption.textContent = '⇄ Transfer';
        systemGroup.appendChild(transferOption);
        select.appendChild(systemGroup);
        
        select.value = financeCategoryFilter;
    } catch (e) { console.error("Error populating categories:", e); }
};

window.filterFinanceCategory = function(category) {
    financeCategoryFilter = category;
    financeCurrentPage = 1;
    financeLastDocs = [];
    updateFinanceFilterSummary();
    loadFinanceData();
};

/* ── Bank Account filter (new) ── */
let financeAccountFilter = 'all';

window.populateFinanceBankAccountFilter = async function() {
    const select = document.getElementById('finance-bank-account-filter');
    if (!select || !window.getUserBankAccounts) return;

    const accounts = await window.getUserBankAccounts();
    select.innerHTML = '<option value="all">All Accounts</option>';

    // Populate chips row
    const chipsRow = document.getElementById('finance-account-chips-row');
    if (chipsRow) { chipsRow.style.display = accounts.length > 0 ? 'block' : 'none'; }

    accounts.forEach(acc => {
        const opt = document.createElement('option');
        opt.value = acc.id;
        opt.textContent = `${acc.icon || '🏦'} ${acc.name}`;
        if (acc.id === financeAccountFilter) opt.selected = true;
        select.appendChild(opt);
    });

    // Add "Unassigned" option
    const unassigned = document.createElement('option');
    unassigned.value = '__unassigned__';
    unassigned.textContent = '⚠️ Unassigned Bank';
    select.appendChild(unassigned);
};

window.filterFinanceBankAccount = function(accountId) {
    financeAccountFilter = accountId || 'all';
    financeCurrentPage = 1;
    financeLastDocs = [];
    updateFinanceFilterSummary();
    loadFinanceData();
};

window.updateFinanceFilterSummary = function() {
    const container = document.getElementById('finance-active-filters');
    if (!container) return;

    const chips = [];
    const startDate = document.getElementById('finance-start-date')?.value || '';
    const endDate = document.getElementById('finance-end-date')?.value || '';

    if (financeSearchQuery) chips.push(`<span class="finance-filter-chip"><i class="fas fa-search"></i>${financeSearchQuery}</span>`);
    if (financeCategoryFilter !== 'all') chips.push(`<span class="finance-filter-chip"><i class="fas fa-tags"></i>${financeCategoryFilter}</span>`);
    if (financeFinancialYearFilter !== 'all' && financeFinancialYearFilter !== 'custom') {
        chips.push(`<span class="finance-filter-chip"><i class="fas fa-calendar-days"></i>${window.getFinancialYearLabel(financeFinancialYearFilter)}</span>`);
    }
    if (financeFinancialYearFilter === 'custom' || (startDate && endDate)) {
        const formattedStartDate = window.formatFinanceFilterDateLabel(startDate);
        const formattedEndDate = window.formatFinanceFilterDateLabel(endDate);
        const dateLabel = formattedStartDate && formattedEndDate ? `${formattedStartDate} to ${formattedEndDate}` : (formattedStartDate || formattedEndDate);
        if (dateLabel) chips.push(`<span class="finance-filter-chip"><i class="fas fa-clock"></i>${dateLabel}</span>`);
    }
    if (currentFinanceFilter !== 'all') {
        const labels = { income: 'Income', expense: 'Expense', transfer: 'Transfer' };
        chips.push(`<span class="finance-filter-chip"><i class="fas fa-filter"></i>${labels[currentFinanceFilter] || currentFinanceFilter}</span>`);
    }

    if (chips.length === 0) {
        container.innerHTML = '<span class="finance-filter-empty">Showing all transactions</span>';
        return;
    }

    container.innerHTML = chips.join('');
};

window.formatFinanceFilterDateLabel = function(value) {
    if (!value) return '';

    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

window.applyFinancePreset = function(preset) {
    const today = new Date();
    let start = '';
    let end = '';
    let fyValue = 'custom';

    if (preset === 'today') {
        start = window.formatLocalDateForInput(today);
        end = start;
    } else if (preset === 'month') {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        start = window.formatLocalDateForInput(monthStart);
        end = window.formatLocalDateForInput(monthEnd);
    } else if (preset === 'current-fy') {
        fyValue = String(window.getCurrentFinancialYearStartYear(today));
        const range = window.getFinancialYearRange(fyValue);
        start = range.start;
        end = range.end;
    } else if (preset === 'last-fy') {
        fyValue = String(window.getCurrentFinancialYearStartYear(today) - 1);
        const range = window.getFinancialYearRange(fyValue);
        start = range.start;
        end = range.end;
    }

    const startInput = document.getElementById('finance-start-date');
    const endInput = document.getElementById('finance-end-date');
    const fySelect = document.getElementById('finance-financial-year');

    if (startInput) startInput.value = start;
    if (endInput) endInput.value = end;

    financeFinancialYearFilter = fyValue;
    if (fySelect) fySelect.value = fyValue;
    filterFinanceDate();
};

window.applyFinanceFinancialYear = function(value) {
    financeFinancialYearFilter = value || 'all';

    if (financeFinancialYearFilter === 'all') {
        document.getElementById('finance-start-date').value = '';
        document.getElementById('finance-end-date').value = '';
    } else if (financeFinancialYearFilter !== 'custom') {
        const range = window.getFinancialYearRange(financeFinancialYearFilter);
        document.getElementById('finance-start-date').value = range.start;
        document.getElementById('finance-end-date').value = range.end;
    }

    financeCurrentPage = 1;
    financeLastDocs = [];
    updateFinanceFilterSummary();
    loadFinanceData();
};

window.loadRecurringTransactions = async function() {
    const user = auth.currentUser;
    const tbody = document.getElementById('recurring-table-body');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center"><div class="spinner-border spinner-border-sm text-primary"></div> Loading...</td></tr>';

    try {
        const snapshot = await db.collection('transactions')
            .where('userId', '==', user.uid)
            .where('recurring', '==', true)
            .orderBy('nextDueDate', 'asc')
            .get();

        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No active recurring transactions found.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const isIncome = data.type === 'income';
            const colorClass = isIncome ? 'text-success' : 'text-danger';
            const icon = window.getCategoryIcon(data.category);
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4" data-label="Description">
                    <div class="fw-bold finance-row-title">${data.description || 'Recurring Transaction'}</div>
                </td>
                <td data-label="Category">
                    <span class="finance-row-category"><span class="me-2">${icon}</span>${data.category}</span>
                </td>
                <td data-label="Frequency"><span class="badge finance-table-badge finance-frequency-badge">${(data.frequency || 'Monthly').toUpperCase()}</span></td>
                <td data-label="Next Due">${data.nextDueDate ? new Date(data.nextDueDate).toLocaleDateString() : 'N/A'}</td>
                <td class="text-end ${colorClass} fw-bold pe-4">₹${data.amount.toFixed(2)}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-primary me-1 finance-row-action" onclick="editTransaction('${doc.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger finance-row-action" onclick="stopRecurring('${doc.id}')" title="Stop Recurring">
                        <i class="fas fa-stop-circle"></i>
                    </button>
                </td>
            `;
            tr.children[4]?.setAttribute('data-label', 'Amount');
            tr.children[5]?.setAttribute('data-label', 'Actions');
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading data</td></tr>';
    }
};

window.stopRecurring = async function(id) {
    if (!confirm('Stop this recurring transaction? It will no longer generate future entries.')) return;
    
    try {
        if(window.dashboard) window.dashboard.showLoading();
        await db.collection('transactions').doc(id).update({
            recurring: false,
            nextDueDate: null,
            frequency: null,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        loadRecurringTransactions();
        if(window.dashboard) window.dashboard.showNotification('Recurring transaction stopped', 'success');
    } catch(e) {
        console.error(e);
        if(window.dashboard) window.dashboard.showNotification('Error updating transaction', 'danger');
    } finally {
        if(window.dashboard) window.dashboard.hideLoading();
    }
};

async function getFinanceTransactionsData() {
    const user = auth.currentUser;
    if (!user) return [];

    const docs = await window.getTransactions(user.uid);

    // Sort docs client-side: date (desc), createdAt (desc), id (desc)
    docs.sort((a, b) => {
        const dataA = a.data();
        const dataB = b.data();
        
        const dateA = dataA.date || '';
        const dateB = dataB.date || '';
        if (dateA !== dateB) {
            return dateB.localeCompare(dateA); // desc
        }
        
        // Parse createdAt timestamps to ms
        const getCreatedMs = (data) => {
            if (!data.createdAt) return 0;
            if (typeof data.createdAt.toMillis === 'function') {
                return data.createdAt.toMillis();
            }
            if (data.createdAt.seconds) {
                return data.createdAt.seconds * 1000 + (data.createdAt.nanoseconds || 0) / 1000000;
            }
            if (data.createdAt instanceof Date) {
                return data.createdAt.getTime();
            }
            const parsed = Date.parse(data.createdAt);
            return isNaN(parsed) ? 0 : parsed;
        };

        const createdA = getCreatedMs(dataA);
        const createdB = getCreatedMs(dataB);
        if (createdA !== createdB) {
            return createdB - createdA; // desc
        }
        
        return b.id.localeCompare(a.id); // desc
    });

    return docs;
}

async function loadFinanceData(filter = null) {
    const user = auth.currentUser;
    if (!user) return;

    if (filter !== null) {
        currentFinanceFilter = filter;
        financeCurrentPage = 1;
        financeLastDocs = [];
    }

    // Bank account filter applied client-side (bankAccountId may be null on old docs)
    const bankAccountFilterValue = financeAccountFilter || 'all';

    const startDate = document.getElementById('finance-start-date')?.value;
    const endDate = document.getElementById('finance-end-date')?.value;

    // Update stats (only on first page load or filter change to save reads)
    if (financeCurrentPage === 1) updateFinanceStats();

    try {
        let docs = await getFinanceTransactionsData();
        const tbody = document.getElementById('finance-table-body');
        const prevBtn = document.getElementById('btn-finance-prev');
        const nextBtn = document.getElementById('btn-finance-next');
        const pageInfo = document.getElementById('finance-page-info');
        
        // Apply client-side filters
        docs = docs.filter(doc => {
            const data = doc.data();

            // Filter by type
            if (currentFinanceFilter !== 'all' && data.type !== currentFinanceFilter) {
                return false;
            }

            // Filter by category
            if (financeCategoryFilter !== 'all' && data.category !== financeCategoryFilter) {
                return false;
            }

            // Filter by date range
            if (startDate && data.date < startDate) {
                return false;
            }
            if (endDate && data.date > endDate) {
                return false;
            }

            // Filter by bank account (using resolved metadata dynamically)
            if (bankAccountFilterValue !== 'all') {
                const accountMeta = window.getTransactionAccountMeta(data);
                if (bankAccountFilterValue === '__unassigned__') {
                    return accountMeta.type === 'bank' && !data.bankAccountId;
                }
                return data.bankAccountId === bankAccountFilterValue || data.destinationBankAccountId === bankAccountFilterValue;
            }

            // Client-side search filtering
            if (financeSearchQuery) {
                const lowerQuery = financeSearchQuery.toLowerCase();
                const accountMeta = window.getTransactionAccountMeta(data);
                return (data.description && data.description.toLowerCase().includes(lowerQuery)) || 
                       (data.category && data.category.toLowerCase().includes(lowerQuery)) ||
                       (accountMeta.label && accountMeta.label.toLowerCase().includes(lowerQuery)) ||
                       window.getPaymentModeLabel(data.paymentMode).toLowerCase().includes(lowerQuery);
            }

            return true;
        });

        const totalFilteredDocs = docs.length;
        const totalPages = Math.ceil(totalFilteredDocs / FINANCE_PAGE_SIZE) || 1;
        
        if (financeCurrentPage > totalPages) {
            financeCurrentPage = totalPages;
        }

        if (totalFilteredDocs === 0) {
            const message = financeSearchQuery
                ? 'No transactions found for this search'
                : 'No transactions found';

            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">${message}</td></tr>`;
            if (prevBtn) prevBtn.disabled = true;
            if (nextBtn) nextBtn.disabled = true;
            if (pageInfo) pageInfo.textContent = 'Page 1 of 1';
            return;
        }

        // Slice for current page
        const startIdx = (financeCurrentPage - 1) * FINANCE_PAGE_SIZE;
        const pageDocs = docs.slice(startIdx, startIdx + FINANCE_PAGE_SIZE);

        // Update Pagination UI
        if (prevBtn) prevBtn.disabled = financeCurrentPage === 1;
        if (nextBtn) nextBtn.disabled = startIdx + FINANCE_PAGE_SIZE >= totalFilteredDocs;
        if (pageInfo) pageInfo.textContent = `Page ${financeCurrentPage} of ${totalPages}`;

        const selectAll = document.getElementById('finance-select-all');
        if (selectAll) selectAll.checked = false;
        if (window.updateBulkActionsBar) window.updateBulkActionsBar();

        tbody.innerHTML = '';
        pageDocs.forEach(doc => {
            const data = doc.data();
            data.id = doc.id;
            const isIncome = data.type === 'income';
            const isTransfer = data.type === 'transfer';
            const colorClass = isTransfer ? 'text-primary' : (isIncome ? 'text-success' : 'text-danger');
            const sign = isTransfer ? '' : (isIncome ? '+' : '-');
            const modeBadge = isTransfer
                ? 'finance-mode-badge finance-mode-transfer'
                : (window.isUpiPaymentMode(data.paymentMode) ? 'finance-mode-badge finance-mode-upi' : 'finance-mode-badge finance-mode-standard');
            const modeText = window.getPaymentModeLabel(data.paymentMode);
            const accountMeta = window.getTransactionAccountMeta(data);
            const icon = window.getCategoryIcon(data.category);
            
            const isBankType = accountMeta.type === 'bank';
            
            let formattedDate = 'N/A';
            try {
                if (data.date) {
                    const parsedDate = new Date(data.date);
                    if (!isNaN(parsedDate.getTime())) {
                        formattedDate = parsedDate.toLocaleDateString();
                    }
                }
            } catch (e) {
                console.error("Error parsing date:", e);
            }

            const amountNum = Number(data.amount) || 0;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4">
                    <input type="checkbox" class="form-check-input finance-row-checkbox" data-id="${data.id}" onchange="window.onFinanceRowSelect()" ${isBankType ? '' : 'disabled title="Only bank-type transactions can be bulk-reassigned"'}>
                </td>
                <td class="text-muted fw-medium">${formattedDate}</td>
                <td data-label="Category">
                    <div class="fw-bold finance-row-title"><span class="me-2">${icon}</span>${data.category}</div>
                    <div class="small text-muted finance-row-description">${data.description || ''}</div>
                </td>
                <td><span class="badge finance-chip-badge ${window.getAccountBadgeClass(accountMeta.type)} rounded-pill px-3">${accountMeta.label}</span></td>
                <td><span class="badge finance-table-badge ${modeBadge} rounded-pill px-3">${modeText}</span></td>
                <td class="text-end ${colorClass} fw-bold pe-4 fs-6">${sign}₹${amountNum.toFixed(2)}</td>
                <td class="text-end pe-4" data-label="Actions">
                    <button class="btn btn-sm btn-outline-primary me-1 finance-row-action" onclick="editTransaction('${data.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger finance-row-action" onclick="deleteTransaction('${data.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            const financeLabels = ['Select', 'Date', 'Category & Desc', 'Account', 'Payment Mode', 'Amount', 'Actions'];
            Array.from(tr.children).forEach((cell, index) => {
                if (financeLabels[index]) cell.setAttribute('data-label', financeLabels[index]);
            });
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error loading finance data:", error);
    }
}

async function updateFinanceStats() {
    const user = auth.currentUser;
    if (!user) return;

    const startDate = document.getElementById('finance-start-date')?.value;
    const endDate = document.getElementById('finance-end-date')?.value;

    try {
        const docs = await getFinanceTransactionsData();
        let income = 0;
        let expense = 0;
        let cashIncome = 0;
        let cashExpense = 0;
        let bankIncome = 0;
        let bankExpense = 0;
        const lowerQuery = financeSearchQuery ? financeSearchQuery.toLowerCase() : '';

        // Filter client-side
        const filteredDocs = docs.filter(doc => {
            const data = doc.data();

            // Filter by type
            if (currentFinanceFilter !== 'all' && data.type !== currentFinanceFilter) {
                return false;
            }

            // Filter by category
            if (financeCategoryFilter !== 'all' && data.category !== financeCategoryFilter) {
                return false;
            }

            // Filter by date range
            if (startDate && data.date < startDate) {
                return false;
            }
            if (endDate && data.date > endDate) {
                return false;
            }

            // Keep summary cards aligned with the same client-side search used by the ledger table.
            if (lowerQuery) {
                const description = (data.description || '').toLowerCase();
                const category = (data.category || '').toLowerCase();
                const accountMeta = window.getTransactionAccountMeta(data);
                const accountLabel = (accountMeta.label || '').toLowerCase();
                const paymentMode = window.getPaymentModeLabel(data.paymentMode).toLowerCase();
                if (!description.includes(lowerQuery) && !category.includes(lowerQuery) && !accountLabel.includes(lowerQuery) && !paymentMode.includes(lowerQuery)) {
                    return false;
                }
            }

            return true;
        });

        filteredDocs.forEach(doc => {
            const data = doc.data();
            const amount = Number(data.amount) || 0;

            if (data.type === 'income') {
                income += amount;
            } else if (data.type === 'expense') {
                expense += amount;
            }

            if (data.type === 'transfer') {
                if (data.sourceAccountType === 'cash') cashExpense += amount;
                if (data.destinationAccountType === 'cash') cashIncome += amount;
                if (data.sourceAccountType === 'bank') bankExpense += amount;
                if (data.destinationAccountType === 'bank') bankIncome += amount;
                return;
            }

            const accountMeta = window.getTransactionAccountMeta(data);
            if (accountMeta.type === 'cash') {
                if (data.type === 'income') cashIncome += amount;
                else if (data.type === 'expense') cashExpense += amount;
            } else if (accountMeta.type === 'bank') {
                if (data.type === 'income') bankIncome += amount;
                else if (data.type === 'expense') bankExpense += amount;
            }
        });

        document.getElementById('stats-income').textContent = `₹${income.toFixed(2)}`;
        document.getElementById('stats-expense').textContent = `₹${expense.toFixed(2)}`;
        document.getElementById('stats-balance').textContent = `₹${(income - expense).toFixed(2)}`;
        document.getElementById('stats-cash-balance').textContent = `₹${(cashIncome - cashExpense).toFixed(2)}`;
        document.getElementById('stats-bank-balance').textContent = `₹${(bankIncome - bankExpense).toFixed(2)}`;
        document.getElementById('stats-cash-detail').textContent = `In ₹${cashIncome.toFixed(2)} | Out ₹${cashExpense.toFixed(2)}`;
        document.getElementById('stats-bank-detail').textContent = `In ₹${bankIncome.toFixed(2)} | Out ₹${bankExpense.toFixed(2)}`;

        // Compute per-account balances and render chips
        const perAccountBalances = {};
        filteredDocs.forEach(doc => {
            const data = doc.data();
            const amount = Number(data.amount) || 0;
            if (data.type === 'transfer') {
                if (data.bankAccountId) {
                    if (!perAccountBalances[data.bankAccountId]) perAccountBalances[data.bankAccountId] = 0;
                    if (data.sourceAccountType === 'bank') perAccountBalances[data.bankAccountId] -= amount;
                }
                if (data.destinationBankAccountId) {
                    if (!perAccountBalances[data.destinationBankAccountId]) perAccountBalances[data.destinationBankAccountId] = 0;
                    perAccountBalances[data.destinationBankAccountId] += amount;
                }
                return;
            }
            if (data.bankAccountId) {
                if (!perAccountBalances[data.bankAccountId]) perAccountBalances[data.bankAccountId] = 0;
                if (data.type === 'income') perAccountBalances[data.bankAccountId] += amount;
                else if (data.type === 'expense') perAccountBalances[data.bankAccountId] -= amount;
            }
        });

        if (window.renderBankAccountBalanceChips && window._bankAccountsCache) {
            window.renderBankAccountBalanceChips('finance-account-chips-row', perAccountBalances, window._bankAccountsCache);
        }
    } catch (e) { console.error("Error updating stats", e); }
}

window.searchFinance = function(query) {
    financeSearchQuery = query.trim();
    financeCurrentPage = 1;
    financeLastDocs = [];
    updateFinanceFilterSummary();
    loadFinanceData();
};

window.filterFinanceDate = function() {
    const startDate = document.getElementById('finance-start-date')?.value;
    const endDate = document.getElementById('finance-end-date')?.value;
    financeFinancialYearFilter = window.detectFinancialYearSelection(startDate, endDate);
    const fySelect = document.getElementById('finance-financial-year');
    if (fySelect) fySelect.value = financeFinancialYearFilter;
    financeCurrentPage = 1;
    financeLastDocs = [];
    updateFinanceFilterSummary();
    loadFinanceData();
};

window.resetFinanceFilters = function() {
    financeSearchQuery = '';
    financeCategoryFilter = 'all';
    financeAccountFilter = 'all';
    financeCurrentPage = 1;
    financeLastDocs = [];
    currentFinanceFilter = 'all';

    const searchInput = document.getElementById('finance-search');
    const categorySelect = document.getElementById('finance-category-filter');
    const accountSelect = document.getElementById('finance-bank-account-filter');
    const allFilter = document.getElementById('filter-all');

    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = 'all';
    if (accountSelect) accountSelect.value = 'all';
    window.applyFinanceDefaultLedgerRange();
    if (allFilter) allFilter.checked = true;

    updateFinanceFilterSummary();
    loadFinanceData('all');
};

window.clearFinanceDate = function() {
    document.getElementById('finance-start-date').value = '';
    document.getElementById('finance-end-date').value = '';
    financeFinancialYearFilter = 'all';
    const fySelect = document.getElementById('finance-financial-year');
    if (fySelect) fySelect.value = 'all';
    filterFinanceDate();
};

window.changeFinancePage = function(delta) {
    const newPage = financeCurrentPage + delta;
    if (newPage < 1) return;
    financeCurrentPage = newPage;
    loadFinanceData();
};

window.openTransferModal = async function(id = '', data = null) {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('transferModal'));
    const directionInput = document.getElementById('transfer-direction');
    const amountInput = document.getElementById('transfer-amount');
    const dateInput = document.getElementById('transfer-date');
    const descriptionInput = document.getElementById('transfer-description');
    const idInput = document.getElementById('transfer-id');
    const saveBtn = document.getElementById('save-transfer');

    idInput.value = id || '';
    directionInput.value = data?.transferDirection || 'cash_to_bank';
    amountInput.value = data?.amount || '';
    dateInput.value = data?.date || window.formatLocalDateForInput(new Date());
    descriptionInput.value = data?.description || '';
    if (saveBtn) window.setBtnLoading(saveBtn, false);

    // Populate bank account selects
    if (window.populateBankAccountSelect) {
        await window.populateBankAccountSelect('transfer-source-bank-account', {
            placeholder: 'Select source account…',
            selectedId: data?.bankAccountId || ''
        });
        await window.populateBankAccountSelect('transfer-dest-bank-account', {
            placeholder: 'Select destination account…',
            selectedId: data?.destinationBankAccountId || ''
        });
    }

    // Trigger direction change UI
    window.onTransferDirectionChange(directionInput.value);

    modal.show();
};

window.onTransferDirectionChange = function(direction) {
    const sourceRow = document.getElementById('transfer-source-bank-row');
    const destRow   = document.getElementById('transfer-dest-bank-row');
    if (!sourceRow || !destRow) return;

    // Show/hide bank account pickers based on direction
    sourceRow.classList.toggle('visible', direction === 'bank_to_cash' || direction === 'bank_to_bank');
    destRow.classList.toggle('visible', direction === 'cash_to_bank' || direction === 'bank_to_bank');
};

window.saveTransferTransaction = async function() {
    const user = auth.currentUser;
    if (!user) return;

    const btn = document.getElementById('save-transfer');
    const id = document.getElementById('transfer-id').value;
    const direction = document.getElementById('transfer-direction').value;
    const amount = parseFloat(document.getElementById('transfer-amount').value);
    const date = document.getElementById('transfer-date').value;
    const description = document.getElementById('transfer-description').value.trim();
    const sourceBankAccountId = document.getElementById('transfer-source-bank-account')?.value || '';
    const destBankAccountId = document.getElementById('transfer-dest-bank-account')?.value || '';

    if (!direction || !amount || amount <= 0 || !date) {
        if (window.dashboard) window.dashboard.showNotification('Enter a valid transfer amount and date', 'warning');
        return;
    }

    // Resolve account types and labels based on direction
    let sourceAccountType, destinationAccountType, sourceAccountLabel, destinationAccountLabel;
    let resolvedSourceBankId = null, resolvedDestBankId = null;
    let resolvedSourceBankName = null, resolvedDestBankName = null;

    if (direction === 'cash_to_bank') {
        sourceAccountType = 'cash';  destinationAccountType = 'bank';
        sourceAccountLabel = 'Cash';
        resolvedDestBankId = destBankAccountId || null;
        resolvedDestBankName = resolvedDestBankId ? (window.getBankAccountLabel ? window.getBankAccountLabel(resolvedDestBankId) : null) : null;
        destinationAccountLabel = resolvedDestBankName || window.getAccountTypeLabel('bank');
    } else if (direction === 'bank_to_cash') {
        sourceAccountType = 'bank';  destinationAccountType = 'cash';
        destinationAccountLabel = 'Cash';
        resolvedSourceBankId = sourceBankAccountId || null;
        resolvedSourceBankName = resolvedSourceBankId ? (window.getBankAccountLabel ? window.getBankAccountLabel(resolvedSourceBankId) : null) : null;
        sourceAccountLabel = resolvedSourceBankName || window.getAccountTypeLabel('bank');
    } else if (direction === 'bank_to_bank') {
        sourceAccountType = 'bank';  destinationAccountType = 'bank';
        resolvedSourceBankId = sourceBankAccountId || null;
        resolvedDestBankId = destBankAccountId || null;
        resolvedSourceBankName = resolvedSourceBankId ? (window.getBankAccountLabel ? window.getBankAccountLabel(resolvedSourceBankId) : null) : null;
        resolvedDestBankName = resolvedDestBankId ? (window.getBankAccountLabel ? window.getBankAccountLabel(resolvedDestBankId) : null) : null;
        sourceAccountLabel = resolvedSourceBankName || 'Bank';
        destinationAccountLabel = resolvedDestBankName || 'Bank';
    } else {
        sourceAccountType = 'cash'; destinationAccountType = 'bank';
        sourceAccountLabel = 'Cash'; destinationAccountLabel = 'Bank';
    }

    const payload = {
        userId: user.uid,
        type: 'transfer',
        category: 'Transfer',
        amount,
        date,
        description: description || `${sourceAccountLabel} to ${destinationAccountLabel}`,
        paymentMode: 'internal-transfer',
        accountType: 'transfer',
        accountLabel: `${sourceAccountLabel} -> ${destinationAccountLabel}`,
        transferDirection: direction,
        sourceAccountType,
        sourceAccountLabel,
        destinationAccountType,
        destinationAccountLabel,
        bankAccountId: resolvedSourceBankId,
        bankAccountName: resolvedSourceBankName,
        destinationBankAccountId: resolvedDestBankId,
        destinationBankAccountName: resolvedDestBankName,
        recurring: false,
        frequency: null,
        nextDueDate: null,
        relatedId: null
    };

    try {
        window.setBtnLoading(btn, true);
        if (id) {
            payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('transactions').doc(id).update(payload);
        } else {
            payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('transactions').add(payload);
        }

        bootstrap.Modal.getOrCreateInstance(document.getElementById('transferModal')).hide();
        document.getElementById('transfer-form').reset();

        if (window.dashboard) {
            window.dashboard.updateStats();
            window.dashboard.loadRecentTransactions();
            window.dashboard.updateFinanceChart();
            window.dashboard.showNotification(id ? 'Transfer updated successfully!' : 'Transfer saved successfully!', 'success');
        }

        // Refresh bank accounts cache so chips update
        if (window.invalidateBankAccountsCache) window.invalidateBankAccountsCache();

        loadFinanceData(currentFinanceFilter);
        if (typeof window.loadTransactionsSection === 'function' && document.getElementById('transactions-section')?.innerHTML.trim()) {
            window.loadTransactionsSection();
        }
    } catch (error) {
        console.error('Error saving transfer:', error);
        if (window.dashboard) window.dashboard.showNotification('Error saving transfer: ' + error.message, 'danger');
    } finally {
        window.setBtnLoading(btn, false);
    }
};

window.editTransaction = async function(id) {
    try {
        const doc = await db.collection('transactions').doc(id).get();
        if (!doc.exists) return;
        const data = doc.data();

        if (data.type === 'transfer') {
            window.openTransferModal(id, data);
            return;
        }

        if (window.dashboard) {
            await window.dashboard.loadTransactionCategories();
            await Promise.all([
                window.dashboard.populateTransactionCCSelect(),
                window.dashboard.populateTransactionWalletSelect(),
                window.dashboard.populateTransactionBankAccountSelect(data.bankAccountId || '')
            ]);
        }
        
        document.getElementById('transaction-id').value = id;
        document.getElementById('transaction-amount').value = data.amount;
        document.getElementById('transaction-mode').value = data.paymentMode || 'cash';
        document.getElementById('transaction-description').value = data.description;
        document.getElementById('transaction-date').value = data.date;
        document.getElementById('transaction-category').value = data.category;
        if (window.setCatSearchValue) window.setCatSearchValue(data.category);
        document.getElementById('transaction-credit-card').value = data.paymentMode === 'credit-card' ? (data.relatedId || '') : '';
        document.getElementById('transaction-wallet').value = data.paymentMode === 'wallet' ? (data.relatedId || '') : '';
        document.getElementById('transaction-mode').dispatchEvent(new Event('change'));

        // Pre-fill bank account selector
        const baSelect = document.getElementById('transaction-bank-account');
        if (baSelect && data.bankAccountId) {
            baSelect.value = data.bankAccountId;
            const baContainer = document.getElementById('bank-account-select-container');
            if (baContainer) baContainer.classList.remove('d-none');
        }
        
        if (data.type === 'income') document.getElementById('type-income').checked = true;
        else document.getElementById('type-expense').checked = true;
        
        if (data.recurring) {
            document.getElementById('recurring-transaction').checked = true;
            document.getElementById('recurring-options').classList.remove('d-none');
            document.getElementById('transaction-frequency').value = data.frequency || 'monthly';
        } else {
            document.getElementById('recurring-transaction').checked = false;
            document.getElementById('recurring-options').classList.add('d-none');
        }

        const btn = document.getElementById('save-transaction');
        if(btn) window.setBtnLoading(btn, false);

        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addTransactionModal'));
        modal.show();
    } catch (e) { console.error(e); }
};

window.deleteTransaction = async function(id) {
    if(confirm('Are you sure you want to delete this transaction?')) {
        if(window.dashboard) window.dashboard.showLoading();
        try {
            await db.collection('transactions').doc(id).delete();
            const activeInput = document.querySelector('input[name="finance-filter"]:checked');
            const activeFilter = activeInput ? activeInput.id.replace('filter-', '') : 'all';
            loadFinanceData(activeFilter); 
            if (typeof window.loadTransactionsSection === 'function' && document.getElementById('transactions-section')?.innerHTML.trim()) {
                window.loadTransactionsSection();
            }
            if(window.dashboard) window.dashboard.updateStats();
            if(window.dashboard) window.dashboard.updateFinanceChart();
            if(window.dashboard) window.dashboard.showNotification('Transaction deleted', 'success');
        } catch(e) {
            if(window.dashboard) window.dashboard.showNotification('Error deleting transaction', 'danger');
        } finally {
            if(window.dashboard) window.dashboard.hideLoading();
        }
    }
};

function filterFinance(type, resetPage = false) {
    const input = document.getElementById(`filter-${type}`);
    if (input) input.checked = true;

    if (resetPage || type !== currentFinanceFilter) {
        financeCurrentPage = 1;
        financeLastDocs = [];
    }
    currentFinanceFilter = type;
    updateFinanceFilterSummary();
    loadFinanceData(type);
}

window.exportFinanceCSV = async function() {
    const user = auth.currentUser;
    if (!user) return;

    if (window.dashboard) window.dashboard.showLoading();

    try {
        let docs = await getFinanceTransactionsData();
        const bankAccountFilterValue = financeAccountFilter || 'all';
        const startDate = document.getElementById('finance-start-date')?.value;
        const endDate = document.getElementById('finance-end-date')?.value;

        // Apply client-side filters
        docs = docs.filter(doc => {
            const data = doc.data();

            // Filter by type
            if (currentFinanceFilter !== 'all' && data.type !== currentFinanceFilter) {
                return false;
            }

            // Filter by category
            if (financeCategoryFilter !== 'all' && data.category !== financeCategoryFilter) {
                return false;
            }

            // Filter by date range
            if (startDate && data.date < startDate) {
                return false;
            }
            if (endDate && data.date > endDate) {
                return false;
            }

            // Filter by bank account (using resolved metadata dynamically)
            if (bankAccountFilterValue !== 'all') {
                const accountMeta = window.getTransactionAccountMeta(data);
                if (bankAccountFilterValue === '__unassigned__') {
                    return accountMeta.type === 'bank' && !data.bankAccountId;
                }
                return data.bankAccountId === bankAccountFilterValue || data.destinationBankAccountId === bankAccountFilterValue;
            }

            // Client-side search filtering
            if (financeSearchQuery) {
                const lowerQuery = financeSearchQuery.toLowerCase();
                const accountMeta = window.getTransactionAccountMeta(data);
                return (data.description && data.description.toLowerCase().includes(lowerQuery)) || 
                       (data.category && data.category.toLowerCase().includes(lowerQuery)) ||
                       (accountMeta.label && accountMeta.label.toLowerCase().includes(lowerQuery)) ||
                       window.getPaymentModeLabel(data.paymentMode).toLowerCase().includes(lowerQuery);
            }

            return true;
        });
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Type,Category,Description,Account,Payment Mode,Amount\n";

        docs.forEach(doc => {
            const data = doc.data();
            const accountMeta = window.getTransactionAccountMeta(data);
            const row = [
                `"${data.date}"`,
                data.type,
                `"${(data.category || '').replace(/"/g, '""')}"`,
                `"${(data.description || '').replace(/"/g, '""')}"`,
                `"${accountMeta.label}"`,
                `"${window.getPaymentModeLabel(data.paymentMode)}"`,
                data.amount
            ].join(",");
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `finance_export_${currentFinanceFilter}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (window.dashboard) window.dashboard.showNotification('Export successful!', 'success');
    } catch (error) {
        console.error("Error exporting CSV:", error);
        if (window.dashboard) window.dashboard.showNotification('Export failed', 'danger');
    } finally {
        if (window.dashboard) window.dashboard.hideLoading();
    }
};

/* ───────────────────────────────────────────────────────────
   CATEGORY PALETTE & EMOJI DATA
─────────────────────────────────────────────────────────── */
const CAT_PALETTE = [
    '#4f46e5','#7c3aed','#db2777','#dc2626','#ea580c',
    '#d97706','#16a34a','#0891b2','#0284c7','#6366f1',
    '#8b5cf6','#ec4899','#f97316','#22c55e','#14b8a6',
    '#3b82f6','#a855f7','#84cc16','#f59e0b','#10b981'
];

const CAT_EMOJI_GROUPS = [
    { label: 'Money & Finance',
      emojis: ['💰','💵','💳','🪙','💴','💶','💷','📈','📉','📊','🏦','💸','🤑','💼','🧾','📑'] },
    { label: 'Food & Dining',
      emojis: ['🍔','🍕','🍣','🍜','🥗','🍱','🥩','🥪','🧆','🍞','☕','🧃','🍷','🍺','🥂','🍰'] },
    { label: 'Transport',
      emojis: ['🚗','🚕','🚙','🏍','🚌','🚆','✈️','⛽','🅿️','🛵','🚁','🛳','🚲','🛺','🚡'] },
    { label: 'Shopping',
      emojis: ['🛍️','🛒','👗','👟','👜','💄','⌚','🕶','📱','💻','🎁','🏷️','🛋','📦','🧴'] },
    { label: 'Health',
      emojis: ['💊','🏥','⚕️','🩺','🩹','🏋️','🧘','🚴','🥗','🍎','🧬','💉','😷','🩻'] },
    { label: 'Home & Bills',
      emojis: ['🏠','🏡','💡','💧','🔥','🧹','🛁','🪑','📺','🔑','🏗','🌿','🪟','🧰','🔧'] },
    { label: 'Entertainment',
      emojis: ['🎬','🎮','🎵','🎤','🎭','📚','🎨','🎯','🎲','🏖','🏕','🎡','⚽','🏀','🎸'] },
    { label: 'Education',
      emojis: ['📚','✏️','🎓','🖊','📐','🔬','🧪','💡','🏫','📓','🗺','🔭','🧮'] },
    { label: 'Work & Income',
      emojis: ['💼','🏢','🤝','📋','📊','🖥','⌨️','🖨','📞','✉️','🗂','📂','💡','🔐'] },
    { label: 'Savings & Goals',
      emojis: ['🎯','⭐','🏆','🥇','🎖','🌟','🎪','🪴','🌈','🦋','🌸','🌻','🍀','💎'] }
];

let catSelectedColor = '#4f46e5';
let catSelectedEmoji = '🏷️';
let catEmojiPickerOpen = false;

/* ── Colour Swatch Renderer ── */
function renderCatColorSwatches() {
    const row = document.getElementById('cat-color-row');
    if (!row) return;
    row.innerHTML = CAT_PALETTE.map(c => `
        <span class="cat-color-swatch${catSelectedColor === c ? ' selected' : ''}"
              style="background:${c}"
              title="${c}"
              onclick="selectCatColor('${c}')"></span>
    `).join('');
}

window.selectCatColor = function(color) {
    catSelectedColor = color;
    document.getElementById('new-category-color').value = color;
    renderCatColorSwatches();
};

/* ── Emoji Picker ── */
window.toggleEmojiPicker = function(event) {
    event.stopPropagation();
    const existing = document.getElementById('cat-emoji-picker-popover');
    if (existing) { existing.remove(); catEmojiPickerOpen = false; return; }

    const trigger = document.getElementById('cat-emoji-trigger');
    const triggerRect = trigger.getBoundingClientRect();

    const picker = document.createElement('div');
    picker.className = 'cat-emoji-picker';
    picker.id = 'cat-emoji-picker-popover';
    picker.style.top = (triggerRect.bottom + window.scrollY + 6) + 'px';
    picker.style.left = Math.min(triggerRect.left + window.scrollX, window.innerWidth - 260) + 'px';

    picker.innerHTML = `
        <div class="cat-emoji-picker-title">Pick an Icon</div>
        <input class="cat-emoji-search" id="cat-emoji-search-input" placeholder="Search emojis…" oninput="filterCatEmojis(this.value)">
        <div id="cat-emoji-picker-groups"></div>
    `;
    document.body.appendChild(picker);
    catEmojiPickerOpen = true;
    renderEmojiGroups(CAT_EMOJI_GROUPS);
    document.getElementById('cat-emoji-search-input')?.focus();

    setTimeout(() => {
        document.addEventListener('click', closeCatEmojiPicker, { once: true });
    }, 0);
};

function renderEmojiGroups(groups) {
    const container = document.getElementById('cat-emoji-picker-groups');
    if (!container) return;
    container.innerHTML = groups.map(g => `
        <div class="cat-emoji-picker-group-label">${g.label}</div>
        <div class="cat-emoji-grid">${g.emojis.map(e =>
            `<span class="cat-emoji-opt" onclick="selectCatEmoji('${e}')">${e}</span>`
        ).join('')}</div>
    `).join('');
}

window.filterCatEmojis = function(query) {
    if (!query.trim()) { renderEmojiGroups(CAT_EMOJI_GROUPS); return; }
    // Simple filter – just show all emojis in a single flat grid
    const all = CAT_EMOJI_GROUPS.flatMap(g => g.emojis);
    const container = document.getElementById('cat-emoji-picker-groups');
    if (!container) return;
    container.innerHTML = `<div class="cat-emoji-grid">${all.map(e =>
        `<span class="cat-emoji-opt" onclick="selectCatEmoji('${e}')">${e}</span>`
    ).join('')}</div>`;
};

window.selectCatEmoji = function(emoji) {
    catSelectedEmoji = emoji;
    document.getElementById('new-category-icon').value = emoji;
    const btn = document.getElementById('cat-emoji-trigger');
    if (btn) btn.textContent = emoji;
    closeCatEmojiPicker();
};

function closeCatEmojiPicker() {
    const p = document.getElementById('cat-emoji-picker-popover');
    if (p) p.remove();
    catEmojiPickerOpen = false;
}

/* ── Tab counter refresh ── */
async function refreshCatTabCounts() {
    const user = auth.currentUser;
    if (!user) return;
    try {
        const snap = await db.collection('categories').where('userId', '==', user.uid).get();
        let income = 0, expense = 0;
        snap.forEach(d => { if (d.data().type === 'income') income++; else expense++; });
        const iEl = document.getElementById('cat-count-income');
        const eEl = document.getElementById('cat-count-expense');
        if (iEl) iEl.textContent = income;
        if (eEl) eEl.textContent = expense;
    } catch(e) { /* silent */ }
}

/* ─────────────────────────────────────────────────────────
   PUBLIC API
───────────────────────────────────────────────────────── */
window.openCategoriesModal = function() {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('categoriesModal'));

    // Reset form
    resetCategoryForm();

    // Default to Income tab
    currentCategoryType = 'income';
    _activateCatTab('income');

    // Init swatches
    catSelectedColor = '#4f46e5';
    catSelectedEmoji = '🏷️';
    document.getElementById('new-category-color').value = catSelectedColor;
    renderCatColorSwatches();

    modal.show();
    loadCategories('income');
    refreshCatTabCounts();

    document.getElementById('categoriesModal').addEventListener('hidden.bs.modal', () => {
        resetCategoryForm();
        closeCatEmojiPicker();
    }, { once: true });
};

function _activateCatTab(type) {
    const incomeBtn = document.getElementById('cat-tab-income');
    const expenseBtn = document.getElementById('cat-tab-expense');
    if (!incomeBtn || !expenseBtn) return;
    incomeBtn.classList.remove('active-income','active-expense');
    expenseBtn.classList.remove('active-income','active-expense');
    if (type === 'income') {
        incomeBtn.classList.add('active-income');
    } else {
        expenseBtn.classList.add('active-expense');
    }
    // Update save-btn colour
    const saveBtn = document.getElementById('btn-add-category');
    if (saveBtn) {
        saveBtn.classList.toggle('income-mode', type === 'income');
        saveBtn.classList.toggle('expense-mode', type === 'expense');
    }
}

window.switchCategoryTab = function(type, element) {
    currentCategoryType = type;
    _activateCatTab(type);
    loadCategories(type);
};

window.loadCategories = async function(type) {
    const user = auth.currentUser;
    const container = document.getElementById('categories-list');
    if (!container) return;
    container.innerHTML = '<div class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div></div>';

    try {
        const snapshot = await db.collection('categories')
            .where('userId', '==', user.uid)
            .where('type', '==', type)
            .get();

        if (currentCategoryType !== type) return; // race guard

        // Sort alphabetically
        const docs = [];
        snapshot.forEach(doc => docs.push({ id: doc.id, data: doc.data() }));
        docs.sort((a, b) => (a.data.name || '').localeCompare(b.data.name || ''));

        // Update tab count badge
        const countEl = document.getElementById(`cat-count-${type}`);
        if (countEl) countEl.textContent = docs.length;

        if (docs.length === 0) {
            container.innerHTML = `
                <div class="cat-empty-state">
                    <div class="cat-empty-icon">${type === 'income' ? '💰' : '💸'}</div>
                    <div class="cat-empty-title">No ${type} categories yet</div>
                    <div class="cat-empty-sub">Use the form above to add your first ${type} category.</div>
                </div>`;
            return;
        }

        container.innerHTML = '<div class="cat-grid" id="cat-grid-inner"></div>';
        const grid = document.getElementById('cat-grid-inner');

        docs.forEach(({ id, data }) => {
            const icon  = data.icon  || window.getCategoryIcon(data.name);
            const color = data.color || '#818cf8';
            const safeName = (data.name || '').replace(/"/g, '&quot;').replace(/'/g, "\\'");
            const safeIcon = icon.replace(/'/g, "\\'");

            const card = document.createElement('div');
            card.className = 'cat-card';
            card.style.setProperty('--cat-color', color);
            card.innerHTML = `
                <div class="cat-card-top">
                    <span class="cat-card-emoji">${icon}</span>
                    <div class="cat-card-actions">
                        <button class="cat-card-action-btn edit-btn" title="Edit"
                            onclick="editCategory('${id}','${safeName}','${color}','${safeIcon}')">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="cat-card-action-btn delete-btn" title="Delete"
                            onclick="deleteCategory('${id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="cat-card-name">${data.name}</div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        container.innerHTML = '<div class="cat-empty-state"><div class="cat-empty-title" style="color:#dc2626">Failed to load categories</div></div>';
    }
};

window.addCategory = async function() {
    const nameInput = document.getElementById('new-category-name');
    const colorInput = document.getElementById('new-category-color');
    const iconInput  = document.getElementById('new-category-icon');
    const name  = nameInput.value.trim();
    const color = colorInput.value || catSelectedColor;
    const icon  = iconInput.value  || catSelectedEmoji;
    const user  = auth.currentUser;
    const btn   = document.getElementById('btn-add-category');

    if (!name) {
        if (window.dashboard) window.dashboard.showNotification('Please enter a category name', 'warning');
        nameInput.focus();
        return;
    }

    try {
        window.setBtnLoading(btn, true);
        await db.collection('categories').add({
            userId: user.uid,
            name,
            type: currentCategoryType,
            color,
            icon,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Reset form fields but keep colour/emoji
        nameInput.value = '';
        loadCategories(currentCategoryType);
        refreshCatTabCounts();

        if (window.dashboard?.loadTransactionCategories) {
            await window.dashboard.loadTransactionCategories();
            // Highlight the newly added category in the picker
            if (window.setCatSearchValue) window.setCatSearchValue(name);
        }
        if (window.populateCategoryFilter) window.populateCategoryFilter();
        await window.refreshCategoryIcons();

        window.setBtnLoading(btn, false);
        if (window.dashboard) window.dashboard.showNotification('Category added ✓', 'success');
    } catch (error) {
        window.setBtnLoading(btn, false);
        console.error('Error adding category:', error);
        if (window.dashboard) window.dashboard.showNotification('Failed to add category', 'danger');
    }
};

window.editCategory = function(id, name, color, icon) {
    document.getElementById('edit-category-id').value = id;
    document.getElementById('new-category-name').value  = name;
    document.getElementById('new-category-color').value = color  || '#4f46e5';
    document.getElementById('new-category-icon').value  = icon   || '🏷️';

    catSelectedColor = color || '#4f46e5';
    catSelectedEmoji = icon  || '🏷️';

    const emojiBtn = document.getElementById('cat-emoji-trigger');
    if (emojiBtn) emojiBtn.textContent = catSelectedEmoji;
    renderCatColorSwatches();

    // Update form heading
    const heading = document.getElementById('cat-form-heading');
    if (heading) heading.textContent = 'Edit Category';

    const saveBtn = document.getElementById('btn-add-category');
    saveBtn.innerHTML = '<i class="fas fa-check"></i> Update';
    saveBtn.onclick = updateCategory;

    const cancelBtn = document.getElementById('btn-cancel-category');
    cancelBtn.classList.remove('d-none');

    // Scroll form into view
    document.getElementById('cat-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    document.getElementById('new-category-name')?.focus();
};

window.resetCategoryForm = function() {
    const editId = document.getElementById('edit-category-id');
    if (editId) editId.value = '';
    const nameInput = document.getElementById('new-category-name');
    if (nameInput) nameInput.value = '';

    catSelectedColor = '#4f46e5';
    catSelectedEmoji = '🏷️';
    const colorInput = document.getElementById('new-category-color');
    if (colorInput) colorInput.value = catSelectedColor;
    const iconInput = document.getElementById('new-category-icon');
    if (iconInput) iconInput.value = catSelectedEmoji;

    const emojiBtn = document.getElementById('cat-emoji-trigger');
    if (emojiBtn) emojiBtn.textContent = catSelectedEmoji;

    renderCatColorSwatches();

    const heading = document.getElementById('cat-form-heading');
    if (heading) heading.textContent = 'Add New Category';

    const saveBtn = document.getElementById('btn-add-category');
    if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-plus"></i> Add Category';
        saveBtn.onclick = addCategory;
        saveBtn.classList.toggle('income-mode', currentCategoryType === 'income');
        saveBtn.classList.toggle('expense-mode', currentCategoryType === 'expense');
    }

    const cancelBtn = document.getElementById('btn-cancel-category');
    if (cancelBtn) cancelBtn.classList.add('d-none');
};

window.updateCategory = async function() {
    const user = auth.currentUser;
    const id    = document.getElementById('edit-category-id').value;
    const name  = document.getElementById('new-category-name').value.trim();
    const color = document.getElementById('new-category-color').value || catSelectedColor;
    const icon  = document.getElementById('new-category-icon').value  || catSelectedEmoji;
    const btn   = document.getElementById('btn-add-category');

    if (!name) {
        if (window.dashboard) window.dashboard.showNotification('Please enter a category name', 'warning');
        return;
    }

    try {
        window.setBtnLoading(btn, true);

        const oldDoc  = await db.collection('categories').doc(id).get();
        const oldName = oldDoc.data()?.name;

        await db.collection('categories').doc(id).update({
            name, color, icon,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Cascade name change to transactions
        if (oldName && oldName !== name) {
            const batch  = db.batch();
            const txSnap = await db.collection('transactions')
                .where('userId', '==', user.uid)
                .where('category', '==', oldName)
                .get();
            txSnap.forEach(d => batch.update(d.ref, { category: name }));
            await batch.commit();
        }

        resetCategoryForm();
        await window.refreshCategoryIcons();
        loadCategories(currentCategoryType);
        loadFinanceData(currentFinanceFilter);

        if (window.dashboard?.loadTransactionCategories) {
            await window.dashboard.loadTransactionCategories();
        }
        if (window.populateCategoryFilter) window.populateCategoryFilter();

        window.setBtnLoading(btn, false);
        if (window.dashboard) window.dashboard.showNotification('Category updated ✓', 'success');
    } catch (e) {
        window.setBtnLoading(btn, false);
        console.error(e);
        if (window.dashboard) window.dashboard.showNotification('Error updating category', 'danger');
    }
};

window.deleteCategory = async function(id) {
    if (!confirm('Delete this category? Existing transactions will keep their category name.')) return;

    try {
        if (window.dashboard) window.dashboard.showLoading();
        await db.collection('categories').doc(id).delete();
        loadCategories(currentCategoryType);
        refreshCatTabCounts();
        if (window.populateCategoryFilter) window.populateCategoryFilter();
        if (window.dashboard) window.dashboard.showNotification('Category deleted', 'success');
    } catch (error) {
        console.error('Error deleting category:', error);
        if (window.dashboard) window.dashboard.showNotification('Error deleting category', 'danger');
    } finally {
        if (window.dashboard) window.dashboard.hideLoading();
    }
};

/* ──────────────────────────────────────────────────────────
   DEFAULT CATEGORY SEED — adds only missing categories
   ────────────────────────────────────────────────────────── */
const DEFAULT_CATEGORIES = {
    income: [
        { name: 'Salary',          icon: '💰', color: '#16a34a' },
        { name: 'Freelance',       icon: '💻', color: '#0891b2' },
        { name: 'Business',        icon: '🏢', color: '#4f46e5' },
        { name: 'Investment',      icon: '📈', color: '#7c3aed' },
        { name: 'Rental Income',   icon: '🏠', color: '#ea580c' },
        { name: 'Interest',        icon: '🏦', color: '#0284c7' },
        { name: 'Dividend',        icon: '💹', color: '#059669' },
        { name: 'Bonus',           icon: '🎁', color: '#d97706' },
        { name: 'Gifts Received',  icon: '🎀', color: '#db2777' },
        { name: 'Refund',          icon: '↩️',  color: '#64748b' },
        { name: 'Cashback',        icon: '🤑', color: '#16a34a' },
        { name: 'Side Income',     icon: '💡', color: '#8b5cf6' },
        { name: 'Pension',         icon: '👴', color: '#6366f1' },
    ],
    expense: [
        // Food & Drinks
        { name: 'Groceries',       icon: '🛒', color: '#16a34a' },
        { name: 'Restaurant',      icon: '🍽️', color: '#ea580c' },
        { name: 'Snacks',          icon: '🍿', color: '#f97316' },
        { name: 'Tea & Coffee',    icon: '☕', color: '#d97706' },
        { name: 'Juice & Drinks',  icon: '🥤', color: '#22c55e' },
        { name: 'Alcohol',         icon: '🍺', color: '#854d0e' },
        // Transport
        { name: 'Petrol',          icon: '⛽', color: '#dc2626' },
        { name: 'Auto / Cab',      icon: '🚕', color: '#f97316' },
        { name: 'Bus / Train',     icon: '🚌', color: '#0891b2' },
        { name: 'Parking',         icon: '🅿️', color: '#64748b' },
        { name: 'Toll',            icon: '🛣️', color: '#78716c' },
        { name: 'Vehicle Service', icon: '🔧', color: '#92400e' },
        // Housing
        { name: 'Rent',            icon: '🏠', color: '#4f46e5' },
        { name: 'Electricity',     icon: '💡', color: '#eab308' },
        { name: 'Water Bill',      icon: '💧', color: '#0891b2' },
        { name: 'Gas / LPG',       icon: '🔥', color: '#dc2626' },
        { name: 'Maintenance',     icon: '🏗️', color: '#92400e' },
        // Health
        { name: 'Medicines',       icon: '💊', color: '#16a34a' },
        { name: 'Doctor',          icon: '🏥', color: '#dc2626' },
        { name: 'Lab Tests',       icon: '🧪', color: '#7c3aed' },
        { name: 'Health Insurance',icon: '🛡️', color: '#0284c7' },
        // Finance
        { name: 'EMI',             icon: '🏦', color: '#4f46e5' },
        { name: 'Loan Payment',    icon: '💸', color: '#dc2626' },
        { name: 'Credit Card',     icon: '💳', color: '#7c3aed' },
        { name: 'Insurance',       icon: '🛡️', color: '#0891b2' },
        // Shopping
        { name: 'Clothing',        icon: '👕', color: '#db2777' },
        { name: 'Electronics',     icon: '📱', color: '#6366f1' },
        { name: 'Online Shopping', icon: '📦', color: '#f97316' },
        { name: 'Household Items', icon: '🛋️', color: '#8b5cf6' },
        // Communication
        { name: 'Mobile Recharge', icon: '📶', color: '#0891b2' },
        { name: 'Internet Bill',   icon: '🌐', color: '#4f46e5' },
        { name: 'DTH / Cable',     icon: '📡', color: '#64748b' },
        // Entertainment & Lifestyle
        { name: 'Movies',          icon: '🎬', color: '#7c3aed' },
        { name: 'OTT Subscription',icon: '📺', color: '#dc2626' },
        { name: 'Games',           icon: '🎮', color: '#4f46e5' },
        { name: 'Gym / Fitness',   icon: '🏋️', color: '#16a34a' },
        { name: 'Salon / Grooming',icon: '💈', color: '#db2777' },
        // Education
        { name: 'Education',       icon: '🎓', color: '#0284c7' },
        { name: 'Books',           icon: '📚', color: '#ea580c' },
        { name: 'Courses',         icon: '🖥️', color: '#8b5cf6' },
        // Travel
        { name: 'Travel',          icon: '✈️', color: '#0891b2' },
        { name: 'Hotel Stay',      icon: '🏨', color: '#d97706' },
        // Giving & Social
        { name: 'Gifts Given',     icon: '🎁', color: '#db2777' },
        { name: 'Donations',       icon: '🤲', color: '#16a34a' },
        { name: 'Family Support',  icon: '👨‍👩‍👧', color: '#ea580c' },
        // Misc
        { name: 'Miscellaneous',   icon: '🏷️', color: '#64748b' },
    ]
};

window.seedDefaultCategories = async function() {
    const user = auth.currentUser;
    if (!user) return;

    const btn = document.getElementById('btn-seed-defaults');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...'; }

    try {
        // Fetch all existing category names (case-insensitive) for this user
        const existingSnap = await db.collection('categories')
            .where('userId', '==', user.uid)
            .where('type', '==', currentCategoryType)
            .get();

        const existingNames = new Set();
        existingSnap.forEach(d => existingNames.add((d.data().name || '').toLowerCase().trim()));

        const toAdd = DEFAULT_CATEGORIES[currentCategoryType].filter(
            c => !existingNames.has(c.name.toLowerCase().trim())
        );

        if (toAdd.length === 0) {
            if (window.dashboard) window.dashboard.showNotification(`All default ${currentCategoryType} categories already exist!`, 'info');
            return;
        }

        // Batch write — Firestore limit is 500 per batch
        const batch = db.batch();
        const now = firebase.firestore.FieldValue.serverTimestamp();
        toAdd.forEach(cat => {
            const ref = db.collection('categories').doc();
            batch.set(ref, {
                userId: user.uid,
                name:   cat.name,
                type:   currentCategoryType,
                icon:   cat.icon,
                color:  cat.color,
                createdAt: now
            });
        });
        await batch.commit();

        // Refresh UI
        await window.refreshCategoryIcons();
        loadCategories(currentCategoryType);
        refreshCatTabCounts();
        if (window.populateCategoryFilter) window.populateCategoryFilter();
        if (window.dashboard?.loadTransactionCategories) window.dashboard.loadTransactionCategories();

        if (window.dashboard) window.dashboard.showNotification(
            `✓ Added ${toAdd.length} default ${currentCategoryType} categories`, 'success'
        );
    } catch (e) {
        console.error('Error seeding defaults:', e);
        if (window.dashboard) window.dashboard.showNotification('Error adding default categories', 'danger');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-magic"></i> Add Defaults'; }
    }
};

window.exportFinancePDF = async function() {
    const user = auth.currentUser;
    if (!user) return;

    if (!window.jspdf) {
        if (window.dashboard) window.dashboard.showNotification('PDF library not loaded', 'danger');
        return;
    }

    if (window.dashboard) window.dashboard.showLoading();

    try {
        let docs = await getFinanceTransactionsData();
        const bankAccountFilterValue = financeAccountFilter || 'all';
        const startDate = document.getElementById('finance-start-date')?.value;
        const endDate = document.getElementById('finance-end-date')?.value;

        // Apply client-side filters
        docs = docs.filter(doc => {
            const data = doc.data();

            // Filter by type
            if (currentFinanceFilter !== 'all' && data.type !== currentFinanceFilter) {
                return false;
            }

            // Filter by category
            if (financeCategoryFilter !== 'all' && data.category !== financeCategoryFilter) {
                return false;
            }

            // Filter by date range
            if (startDate && data.date < startDate) {
                return false;
            }
            if (endDate && data.date > endDate) {
                return false;
            }

            // Filter by bank account (using resolved metadata dynamically)
            if (bankAccountFilterValue !== 'all') {
                const accountMeta = window.getTransactionAccountMeta(data);
                if (bankAccountFilterValue === '__unassigned__') {
                    return accountMeta.type === 'bank' && !data.bankAccountId;
                }
                return data.bankAccountId === bankAccountFilterValue || data.destinationBankAccountId === bankAccountFilterValue;
            }

            // Client-side search filtering
            if (financeSearchQuery) {
                const lowerQuery = financeSearchQuery.toLowerCase();
                const accountMeta = window.getTransactionAccountMeta(data);
                return (data.description && data.description.toLowerCase().includes(lowerQuery)) || 
                       (data.category && data.category.toLowerCase().includes(lowerQuery)) ||
                       (accountMeta.label && accountMeta.label.toLowerCase().includes(lowerQuery)) ||
                       window.getPaymentModeLabel(data.paymentMode).toLowerCase().includes(lowerQuery);
            }

            return true;
        });

        if (docs.length === 0) {
             if (window.dashboard) window.dashboard.showNotification('No data to export', 'warning');
             if (window.dashboard) window.dashboard.hideLoading();
             return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.text("Finance Report", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
        if (startDate || endDate) {
             doc.text(`Period: ${startDate || 'Start'} to ${endDate || 'End'}`, 14, 27);
        }

        const tableColumn = ["Date", "Type", "Category", "Description", "Account", "Mode", "Amount"];
        const tableRows = [];

        docs.forEach(doc => {
            const data = doc.data();
            const accountMeta = window.getTransactionAccountMeta(data);
            const row = [
                new Date(data.date).toLocaleDateString(),
                data.type,
                data.category || '',
                data.description || '',
                accountMeta.label,
                window.getPaymentModeLabel(data.paymentMode),
                data.amount.toFixed(2)
            ];
            tableRows.push(row);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: startDate || endDate ? 32 : 25,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [79, 70, 229] },
            didParseCell: function(data) {
                if (data.section === 'body' && data.column.index === 1) {
                    if (data.cell.raw === 'income') {
                        data.cell.styles.textColor = [25, 135, 84];
                    } else {
                        data.cell.styles.textColor = [220, 53, 69];
                    }
                }
            }
        });

        doc.save(`finance_export_${currentFinanceFilter}_${new Date().toISOString().split('T')[0]}.pdf`);

        if (window.dashboard) window.dashboard.showNotification('PDF Export successful!', 'success');
    } catch (error) {
        console.error("Error exporting PDF:", error);
        if (window.dashboard) window.dashboard.showNotification('Export failed', 'danger');
    } finally {
        if (window.dashboard) window.dashboard.hideLoading();
    }
};

window.deleteCategory = async function(id) {
    if (!confirm('Delete this category?')) return;
    
    try {
        if(window.dashboard) window.dashboard.showLoading();
        await db.collection('categories').doc(id).delete();
        loadCategories(currentCategoryType);
        if (window.populateCategoryFilter) window.populateCategoryFilter();
        if(window.dashboard) window.dashboard.showNotification('Category deleted', 'success');
    } catch (error) {
        console.error("Error deleting category:", error);
        if(window.dashboard) window.dashboard.showNotification('Error deleting category', 'danger');
    } finally {
        if(window.dashboard) window.dashboard.hideLoading();
    }
};

/* ───────────────────────────────────────────────────────────
   BULK TRANSACTION REASSIGNMENT & ACTIONS
   ─────────────────────────────────────────────────────────── */

window.toggleSelectAllFinance = function(master) {
    const checkboxes = document.querySelectorAll('.finance-row-checkbox:not(:disabled)');
    checkboxes.forEach(cb => {
        cb.checked = master.checked;
    });
    window.updateBulkActionsBar();
};

window.onFinanceRowSelect = function() {
    const checkboxes = document.querySelectorAll('.finance-row-checkbox:not(:disabled)');
    const checkedBoxes = document.querySelectorAll('.finance-row-checkbox:not(:disabled):checked');
    const selectAll = document.getElementById('finance-select-all');
    if (selectAll) {
        selectAll.checked = checkboxes.length > 0 && checkboxes.length === checkedBoxes.length;
    }
    window.updateBulkActionsBar();
};

window.updateBulkActionsBar = async function() {
    const bar = document.getElementById('bulk-actions-bar');
    const countSpan = document.getElementById('bulk-selected-count');
    const checkedBoxes = document.querySelectorAll('.finance-row-checkbox:checked');
    
    if (!bar || !countSpan) return;
    
    if (checkedBoxes.length > 0) {
        countSpan.textContent = `${checkedBoxes.length} selected`;
        bar.classList.remove('d-none');
        
        // Populate the bank account dropdown in the bulk actions bar
        const select = document.getElementById('bulk-bank-account-select');
        if (select && select.children.length <= 1) { // populate only if empty or just has placeholder
            const accounts = await window.getUserBankAccounts();
            select.innerHTML = '<option value="" selected disabled>Assign to Bank Account...</option>';
            accounts.forEach(acc => {
                const opt = document.createElement('option');
                opt.value = acc.id;
                opt.textContent = `${acc.icon || '🏦'} ${acc.name}`;
                select.appendChild(opt);
            });
        }
    } else {
        bar.classList.add('d-none');
        const select = document.getElementById('bulk-bank-account-select');
        if (select) select.value = ""; // Reset select
    }
};

window.bulkAssignBankAccount = async function(bankAccountId) {
    const user = auth.currentUser;
    if (!user) return;
    if (!bankAccountId) return;
    
    const checkedBoxes = document.querySelectorAll('.finance-row-checkbox:checked');
    if (checkedBoxes.length === 0) return;
    
    const bankAccountName = window.getBankAccountLabel ? window.getBankAccountLabel(bankAccountId) : 'Bank';
    
    if (window.dashboard) window.dashboard.showLoading();
    
    try {
        const batch = db.batch();
        checkedBoxes.forEach(cb => {
            const id = cb.dataset.id;
            const docRef = db.collection('transactions').doc(id);
            batch.update(docRef, {
                bankAccountId: bankAccountId,
                bankAccountName: bankAccountName,
                accountType: 'bank', // Force update to bank type
                accountLabel: bankAccountName,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        
        await batch.commit();
        
        // Invalidate bank accounts cache
        if (window.invalidateBankAccountsCache) window.invalidateBankAccountsCache();
        
        // Clear selection
        window.clearBulkSelection();
        
        if (window.dashboard) {
            window.dashboard.updateStats();
            window.dashboard.loadRecentTransactions();
            window.dashboard.updateFinanceChart();
            window.dashboard.showNotification(`Successfully reassigned ${checkedBoxes.length} transactions to ${bankAccountName}!`, 'success');
        }
        
        // Reload table
        await loadFinanceData();
    } catch (e) {
        console.error('Error in bulk assigning bank account:', e);
        if (window.dashboard) window.dashboard.showNotification('Failed to bulk assign bank account: ' + e.message, 'danger');
    } finally {
        if (window.dashboard) window.dashboard.hideLoading();
    }
};

window.bulkDeleteTransactions = async function() {
    const checkedBoxes = document.querySelectorAll('.finance-row-checkbox:checked');
    if (checkedBoxes.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete all ${checkedBoxes.length} selected transactions? This cannot be undone.`)) {
        return;
    }
    
    if (window.dashboard) window.dashboard.showLoading();
    
    try {
        const batch = db.batch();
        checkedBoxes.forEach(cb => {
            const id = cb.dataset.id;
            const docRef = db.collection('transactions').doc(id);
            batch.delete(docRef);
        });
        
        await batch.commit();
        
        if (window.invalidateBankAccountsCache) window.invalidateBankAccountsCache();
        window.clearBulkSelection();
        
        if (window.dashboard) {
            window.dashboard.updateStats();
            window.dashboard.loadRecentTransactions();
            window.dashboard.updateFinanceChart();
            window.dashboard.showNotification(`Successfully deleted ${checkedBoxes.length} transactions!`, 'success');
        }
        
        await loadFinanceData();
    } catch (e) {
        console.error('Error in bulk deleting transactions:', e);
        if (window.dashboard) window.dashboard.showNotification('Failed to bulk delete transactions: ' + e.message, 'danger');
    } finally {
        if (window.dashboard) window.dashboard.hideLoading();
    }
};

window.clearBulkSelection = function() {
    const checkboxes = document.querySelectorAll('.finance-row-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = false;
    });
    const selectAll = document.getElementById('finance-select-all');
    if (selectAll) selectAll.checked = false;
    window.updateBulkActionsBar();
};


