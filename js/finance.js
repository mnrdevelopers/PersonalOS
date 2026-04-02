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
    if (mode === 'credit-card') return { type: 'credit-card', label: 'Credit Card' };
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
            </ul>
        </div>

        <!-- Ledger View -->
        <div id="finance-ledger-view">
            <div class="finance-filter-panel card border-0 shadow-sm rounded-4 mb-4 animate-slide-up" style="animation-delay: 0.38s;">
                <div class="card-body p-3 p-lg-4">
                    <div class="finance-filter-toolbar">
                        <div class="finance-filter-header">
                            <div class="finance-filter-copy">
                                <div class="finance-filter-title">Filters</div>
                                <div class="finance-filter-caption">Narrow the transaction register without disturbing totals, balances, or stored data.</div>
                            </div>
                            <button type="button" class="btn btn-sm btn-outline-secondary finance-reset-btn" onclick="resetFinanceFilters()">
                                <i class="fas fa-rotate-left me-2"></i>Reset All
                            </button>
                        </div>
                        <div class="finance-filter-presets-wrap">
                            <div class="finance-filter-mini-label">Quick Range</div>
                            <div class="finance-filter-presets">
                                <button type="button" class="btn btn-sm btn-outline-secondary finance-preset-btn" onclick="applyFinancePreset('today')">Today</button>
                                <button type="button" class="btn btn-sm btn-outline-secondary finance-preset-btn" onclick="applyFinancePreset('month')">This Month</button>
                                <button type="button" class="btn btn-sm btn-outline-secondary finance-preset-btn" onclick="applyFinancePreset('current-fy')">Current FY</button>
                                <button type="button" class="btn btn-sm btn-outline-secondary finance-preset-btn" onclick="applyFinancePreset('last-fy')">Last FY</button>
                            </div>
                        </div>
                    </div>
                    <div class="finance-filter-grid">
                        <div class="finance-filter-block finance-filter-search">
                            <div class="finance-filter-block-head">
                                <span class="finance-filter-icon"><i class="fas fa-search"></i></span>
                                <div>
                                    <div class="finance-filter-label">Search</div>
                                    <div class="finance-filter-subtitle">Find by description, category, account, or payment mode.</div>
                                </div>
                            </div>
                            <div class="input-group finance-search-input-group">
                                <span class="input-group-text finance-search-icon"><i class="fas fa-search text-muted"></i></span>
                                <input type="text" class="form-control finance-search-input" id="finance-search" placeholder="Search transactions..." onkeyup="searchFinance(this.value)">
                            </div>
                            <div class="finance-filter-hint">Try person, purpose, bank, cash, UPI, or category name.</div>
                        </div>
                        <div class="finance-filter-block finance-filter-category">
                            <div class="finance-filter-block-head">
                                <span class="finance-filter-icon"><i class="fas fa-tags"></i></span>
                                <div>
                                    <div class="finance-filter-label">Category</div>
                                    <div class="finance-filter-subtitle">See one category or keep the full register.</div>
                                </div>
                            </div>
                            <select class="form-select finance-filter-select" id="finance-category-filter" onchange="filterFinanceCategory(this.value)">
                                <option value="all">All Categories</option>
                                <!-- Populated via JS -->
                            </select>
                        </div>
                        <div class="finance-filter-block finance-filter-year">
                            <div class="finance-filter-block-head">
                                <span class="finance-filter-icon"><i class="fas fa-calendar-days"></i></span>
                                <div>
                                    <div class="finance-filter-label">Financial Year</div>
                                    <div class="finance-filter-subtitle">April to March filtering for proper yearly review.</div>
                                </div>
                            </div>
                            <select class="form-select finance-filter-select" id="finance-financial-year" onchange="applyFinanceFinancialYear(this.value)">
                                <option value="all">All Financial Years</option>
                            </select>
                        </div>
                        <div class="finance-filter-block finance-filter-date">
                            <div class="finance-filter-block-head">
                                <span class="finance-filter-icon"><i class="fas fa-clock"></i></span>
                                <div>
                                    <div class="finance-filter-label">Date Range</div>
                                    <div class="finance-filter-subtitle">Use a custom period when financial year is not enough.</div>
                                </div>
                            </div>
                            <div class="finance-date-range">
                                <div class="finance-date-field">
                                    <label class="finance-date-label" for="finance-start-date">From</label>
                                    <input type="date" class="form-control finance-date-input" id="finance-start-date" onchange="filterFinanceDate()">
                                </div>
                                <div class="finance-date-field">
                                    <label class="finance-date-label" for="finance-end-date">To</label>
                                    <input type="date" class="form-control finance-date-input" id="finance-end-date" onchange="filterFinanceDate()">
                                </div>
                                <button class="btn btn-outline-secondary finance-date-clear" type="button" onclick="clearFinanceDate()" title="Clear Dates">
                                    <i class="fas fa-times"></i><span>Clear</span>
                                </button>
                            </div>
                        </div>
                        <div class="finance-filter-block finance-filter-type">
                            <div class="finance-filter-block-head">
                                <span class="finance-filter-icon"><i class="fas fa-sliders"></i></span>
                                <div>
                                    <div class="finance-filter-label">View</div>
                                    <div class="finance-filter-subtitle">Switch between all, income, expense, and transfer entries.</div>
                                </div>
                            </div>
                            <div class="finance-pill-group w-100" role="group" aria-label="Transaction type filters">
                                <input type="radio" class="btn-check" name="finance-filter" id="filter-all" autocomplete="off" checked>
                                <label class="btn btn-outline-primary" for="filter-all">All</label>

                                <input type="radio" class="btn-check" name="finance-filter" id="filter-income" autocomplete="off">
                                <label class="btn btn-outline-success" for="filter-income">Income</label>

                                <input type="radio" class="btn-check" name="finance-filter" id="filter-expense" autocomplete="off">
                                <label class="btn btn-outline-danger" for="filter-expense">Expense</label>

                                <input type="radio" class="btn-check" name="finance-filter" id="filter-transfer" autocomplete="off">
                                <label class="btn btn-outline-dark" for="filter-transfer">Transfer</label>
                            </div>
                        </div>
                    </div>
                    <div class="finance-active-filters-wrap">
                        <div class="finance-filter-mini-label">Active Filters</div>
                        <div class="finance-active-filters" id="finance-active-filters"></div>
                    </div>
                </div>
            </div>
            <div class="card table-card finance-table-card animate-slide-up" style="animation-delay: 0.42s;">
                <div class="card-body p-0">
                    <div class="finance-table-intro">
                        <div>
                            <div class="finance-filter-label mb-1">Transaction Register</div>
                            <div class="text-muted small">Transfers change cash and bank positions, but stay out of income and expense totals.</div>
                        </div>
                        <span class="finance-register-note">Live view of filtered finance entries</span>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th class="ps-4">Date</th>
                                    <th>Category & Desc</th>
                                    <th>Account</th>
                                    <th>Payment Mode</th>
                                    <th class="text-end pe-4">Amount</th>
                                    <th class="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="finance-table-body">
                                <tr><td colspan="6" class="text-center">Loading...</td></tr>
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
        </div>

        <!-- Categories Modal -->
        <div class="modal fade" id="categoriesModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Manage Categories</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <ul class="nav nav-tabs mb-3">
                            <li class="nav-item">
                                <a class="nav-link active" href="javascript:void(0)" onclick="switchCategoryTab('income', this)">Income</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="javascript:void(0)" onclick="switchCategoryTab('expense', this)">Expense</a>
                            </li>
                        </ul>
                        
                        <div class="mb-3">
                            <div class="input-group mb-2">
                                <input type="text" class="form-control" id="new-category-name" placeholder="Category Name">
                                <input type="color" class="form-control form-control-color" id="new-category-color" value="#4361ee" title="Choose color">
                                <button class="btn btn-primary" id="btn-add-category" onclick="addCategory()">Add</button>
                                <button class="btn btn-outline-secondary d-none" id="btn-cancel-category" onclick="resetCategoryForm()">Cancel</button>
                            </div>
                            <input type="hidden" id="new-category-icon" value="🏷️">
                            <input type="hidden" id="edit-category-id">
                        </div>
                        
                        <div id="categories-list" class="list-group">
                            <!-- Categories loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="transferModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered finance-transfer-dialog">
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
                                <select class="form-select" id="transfer-direction" required>
                                    <option value="cash_to_bank">Cash to Bank</option>
                                    <option value="bank_to_cash">Bank to Cash</option>
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
    document.querySelectorAll('#finance-section .finance-tabs .nav-link').forEach(l => l.classList.remove('active'));
    element.classList.add('active');

    if (tab === 'ledger') {
        document.getElementById('finance-ledger-view').classList.remove('d-none');
        document.getElementById('finance-recurring-view').classList.add('d-none');
        loadFinanceData();
    } else {
        document.getElementById('finance-ledger-view').classList.add('d-none');
        document.getElementById('finance-recurring-view').classList.remove('d-none');
        loadRecurringTransactions();
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

async function loadFinanceData(filter = null) {
    const user = auth.currentUser;
    if (!user) return;

    if (filter !== null) {
        currentFinanceFilter = filter;
        financeCurrentPage = 1;
        financeLastDocs = [];
    }

    let query = db.collection('transactions')
        .where('userId', '==', user.uid)
        .orderBy('date', 'desc')
        .orderBy('createdAt', 'desc');

    if (currentFinanceFilter !== 'all') {
        query = query.where('type', '==', currentFinanceFilter);
    }

    if (financeCategoryFilter !== 'all') {
        query = query.where('category', '==', financeCategoryFilter);
    }

    const startDate = document.getElementById('finance-start-date')?.value;
    const endDate = document.getElementById('finance-end-date')?.value;
    if (startDate) {
        query = query.where('date', '>=', startDate);
    }
    if (endDate) {
        query = query.where('date', '<=', endDate);
    }

    // Apply pagination
    if (financeCurrentPage > 1 && financeLastDocs[financeCurrentPage - 2]) {
        query = query.startAfter(financeLastDocs[financeCurrentPage - 2]);
    }

    // Update stats (only on first page load or filter change to save reads)
    if (financeCurrentPage === 1) updateFinanceStats();

    try {
        const snapshot = await query.limit(FINANCE_PAGE_SIZE).get();
        const tbody = document.getElementById('finance-table-body');
        const prevBtn = document.getElementById('btn-finance-prev');
        const nextBtn = document.getElementById('btn-finance-next');
        const pageInfo = document.getElementById('finance-page-info');
        
        // Client-side search filtering if query exists (Firestore doesn't support partial text search easily)
        let docs = snapshot.docs;
        if (financeSearchQuery) {
            const lowerQuery = financeSearchQuery.toLowerCase();
            docs = docs.filter(doc => {
                const data = doc.data();
                const accountMeta = window.getTransactionAccountMeta(data);
                return (data.description && data.description.toLowerCase().includes(lowerQuery)) || 
                       (data.category && data.category.toLowerCase().includes(lowerQuery)) ||
                       (accountMeta.label && accountMeta.label.toLowerCase().includes(lowerQuery)) ||
                       window.getPaymentModeLabel(data.paymentMode).toLowerCase().includes(lowerQuery);
            });
        }

        if (snapshot.empty || docs.length === 0) {
            const message = financeSearchQuery
                ? 'No transactions found for this search'
                : 'No transactions found';

            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">${message}</td></tr>`;
            if (financeCurrentPage > 1) {
                // If we are on a page > 1 and it's empty, it means we went too far or data was deleted.
                // But usually Next button logic prevents this.
            } else {
                if (prevBtn) prevBtn.disabled = true;
                if (nextBtn) nextBtn.disabled = true;
                if (pageInfo) pageInfo.textContent = 'Page 1';
            }
            return;
        }

        // Store last doc for next page
        financeLastDocs[financeCurrentPage - 1] = snapshot.docs[snapshot.docs.length - 1];

        // Update Pagination UI
        if (prevBtn) prevBtn.disabled = financeCurrentPage === 1;
        if (nextBtn) nextBtn.disabled = snapshot.docs.length < FINANCE_PAGE_SIZE || financeSearchQuery; // Disable next on search as we are filtering current page results
        if (pageInfo) pageInfo.textContent = `Page ${financeCurrentPage}`;

        tbody.innerHTML = '';
        docs.forEach(doc => {
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
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4 text-muted fw-medium">${new Date(data.date).toLocaleDateString()}</td>
                <td data-label="Category">
                    <div class="fw-bold finance-row-title"><span class="me-2">${icon}</span>${data.category}</div>
                    <div class="small text-muted finance-row-description">${data.description || ''}</div>
                </td>
                <td><span class="badge finance-chip-badge ${window.getAccountBadgeClass(accountMeta.type)} rounded-pill px-3">${accountMeta.label}</span></td>
                <td><span class="badge finance-table-badge ${modeBadge} rounded-pill px-3">${modeText}</span></td>
                <td class="text-end ${colorClass} fw-bold pe-4 fs-6">${sign}₹${data.amount.toFixed(2)}</td>
                <td class="text-end pe-4" data-label="Actions">
                    <button class="btn btn-sm btn-outline-primary me-1 finance-row-action" onclick="editTransaction('${data.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger finance-row-action" onclick="deleteTransaction('${data.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            const financeLabels = ['Date', 'Category & Desc', 'Account', 'Payment Mode', 'Amount', 'Actions'];
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

    let query = db.collection('transactions')
        .where('userId', '==', user.uid);

    if (currentFinanceFilter !== 'all') {
        query = query.where('type', '==', currentFinanceFilter);
    }

    if (financeCategoryFilter !== 'all') {
        query = query.where('category', '==', financeCategoryFilter);
    }

    const startDate = document.getElementById('finance-start-date')?.value;
    const endDate = document.getElementById('finance-end-date')?.value;
    if (startDate) {
        query = query.where('date', '>=', startDate);
    }
    if (endDate) {
        query = query.where('date', '<=', endDate);
    }

    try {
        const snapshot = await query.get();
        let income = 0;
        let expense = 0;
        let cashIncome = 0;
        let cashExpense = 0;
        let bankIncome = 0;
        let bankExpense = 0;
        const lowerQuery = financeSearchQuery ? financeSearchQuery.toLowerCase() : '';

        snapshot.forEach(doc => {
            const data = doc.data();
            const amount = Number(data.amount) || 0;

            // Keep summary cards aligned with the same client-side search used by the ledger table.
            if (lowerQuery) {
                const description = (data.description || '').toLowerCase();
                const category = (data.category || '').toLowerCase();
                const accountLabel = window.getTransactionAccountMeta(data).label.toLowerCase();
                const paymentMode = window.getPaymentModeLabel(data.paymentMode).toLowerCase();
                if (!description.includes(lowerQuery) && !category.includes(lowerQuery) && !accountLabel.includes(lowerQuery) && !paymentMode.includes(lowerQuery)) {
                    return;
                }
            }

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
    financeCurrentPage = 1;
    financeLastDocs = [];
    currentFinanceFilter = 'all';

    const searchInput = document.getElementById('finance-search');
    const categorySelect = document.getElementById('finance-category-filter');
    const allFilter = document.getElementById('filter-all');

    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = 'all';
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

window.openTransferModal = function(id = '', data = null) {
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

    modal.show();
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

    if (!direction || !amount || amount <= 0 || !date) {
        if (window.dashboard) window.dashboard.showNotification('Enter a valid transfer amount and date', 'warning');
        return;
    }

    const isCashToBank = direction === 'cash_to_bank';
    const sourceAccountType = isCashToBank ? 'cash' : 'bank';
    const destinationAccountType = isCashToBank ? 'bank' : 'cash';
    const sourceAccountLabel = window.getAccountTypeLabel(sourceAccountType);
    const destinationAccountLabel = window.getAccountTypeLabel(destinationAccountType);

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
                window.dashboard.populateTransactionWalletSelect()
            ]);
        }
        
        document.getElementById('transaction-id').value = id;
        document.getElementById('transaction-amount').value = data.amount;
        document.getElementById('transaction-mode').value = data.paymentMode || 'cash';
        document.getElementById('transaction-description').value = data.description;
        document.getElementById('transaction-date').value = data.date;
        document.getElementById('transaction-category').value = data.category;
        document.getElementById('transaction-credit-card').value = data.paymentMode === 'credit-card' ? (data.relatedId || '') : '';
        document.getElementById('transaction-wallet').value = data.paymentMode === 'wallet' ? (data.relatedId || '') : '';
        document.getElementById('transaction-mode').dispatchEvent(new Event('change'));
        
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

        // Reset button state
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
        let query = db.collection('transactions')
            .where('userId', '==', user.uid)
            .orderBy('date', 'desc')
            .orderBy('createdAt', 'desc');

        if (currentFinanceFilter !== 'all') {
            query = query.where('type', '==', currentFinanceFilter);
        }

        if (financeCategoryFilter !== 'all') {
            query = query.where('category', '==', financeCategoryFilter);
        }

        const startDate = document.getElementById('finance-start-date')?.value;
        const endDate = document.getElementById('finance-end-date')?.value;
        if (startDate) {
            query = query.where('date', '>=', startDate);
        }
        if (endDate) {
            query = query.where('date', '<=', endDate);
        }

        const snapshot = await query.get();
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Type,Category,Description,Account,Payment Mode,Amount\n";

        snapshot.forEach(doc => {
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

window.openCategoriesModal = function() {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('categoriesModal'));
    
    // Reset form and state to ensure clean slate
    resetCategoryForm();
    
    // Default to Income tab
    currentCategoryType = 'income';
    document.querySelectorAll('#categoriesModal .nav-link').forEach(l => l.classList.remove('active'));
    const incomeTab = document.querySelector('#categoriesModal .nav-link[onclick*="income"]');
    if (incomeTab) incomeTab.classList.add('active');
    
    modal.show();
    loadCategories('income');
    
    // Ensure form resets when modal closes to prevent state leaking
    document.getElementById('categoriesModal').addEventListener('hidden.bs.modal', resetCategoryForm, { once: true });
};

window.switchCategoryTab = function(type, element) {
    currentCategoryType = type;
    document.querySelectorAll('#categoriesModal .nav-link').forEach(l => l.classList.remove('active'));
    element.classList.add('active');
    loadCategories(type);
};

window.loadCategories = async function(type) {
    const user = auth.currentUser;
    const container = document.getElementById('categories-list');
    container.innerHTML = '<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>';
    
    try {
        const snapshot = await db.collection('categories')
            .where('userId', '==', user.uid)
            .where('type', '==', type)
            .orderBy('createdAt', 'desc')
            .get();
            
        // Prevent race condition if tab switched while loading
        if (currentCategoryType !== type) return;

        container.innerHTML = '';
        
        if (snapshot.empty) {
            container.innerHTML = '<div class="text-center text-muted py-3">No categories found.</div>';
            return;
        }
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const safeName = (data.name || '').replace(/'/g, "\\'");
            const safeIcon = (data.icon || window.getCategoryIcon(data.name)).replace(/'/g, "\\'");
            
            const item = document.createElement('div');
            item.className = 'list-group-item d-flex justify-content-between align-items-center';
            item.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="me-3 fs-5">${data.icon || window.getCategoryIcon(data.name)}</div>
                    <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${data.color}; margin-right: 10px;"></div>
                    <span class="fw-medium">${data.name}</span>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary border-0 me-1" onclick="editCategory('${doc.id}', '${safeName}', '${data.color}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger border-0" onclick="deleteCategory('${doc.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            container.appendChild(item);
        });
    } catch (error) {
        console.error("Error loading categories:", error);
        container.innerHTML = '<div class="text-center text-danger">Error loading categories</div>';
    }
};

window.addCategory = async function() {
    const nameInput = document.getElementById('new-category-name');
    const colorInput = document.getElementById('new-category-color');
    const name = nameInput.value.trim();
    const color = colorInput.value;
    const icon = '🏷️';
    const user = auth.currentUser;
    const btn = document.getElementById('btn-add-category');
    
    if (!name) {
        if(window.dashboard) window.dashboard.showNotification('Please enter a category name', 'warning');
        return;
    }
    
    try {
        window.setBtnLoading(btn, true);
        await db.collection('categories').add({
            userId: user.uid,
            name: name,
            type: currentCategoryType,
            color: color,
            icon: icon,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        nameInput.value = '';
        loadCategories(currentCategoryType);

        // Refresh dashboard transaction dropdown if available
        if (window.dashboard && window.dashboard.loadTransactionCategories) {
            await window.dashboard.loadTransactionCategories();
            // Auto-select the new category
            const catSelect = document.getElementById('transaction-category');
            if (catSelect) catSelect.value = name;
        }
        // Refresh filter dropdown
        if (window.populateCategoryFilter) window.populateCategoryFilter();

        window.setBtnLoading(btn, false);
        if(window.dashboard) window.dashboard.showNotification('Category added', 'success');
    } catch (error) {
        window.setBtnLoading(btn, false);
        console.error("Error adding category:", error);
        if(window.dashboard) window.dashboard.showNotification('Failed to add category', 'danger');
    }
};

window.editCategory = function(id, name, color) {
    document.getElementById('edit-category-id').value = id;
    document.getElementById('new-category-name').value = name;
    document.getElementById('new-category-color').value = color;
    
    const btn = document.getElementById('btn-add-category');
    btn.textContent = 'Update';
    btn.className = 'btn btn-success';
    btn.onclick = updateCategory;
    
    document.getElementById('btn-cancel-category').classList.remove('d-none');
};

window.resetCategoryForm = function() {
    document.getElementById('edit-category-id').value = '';
    document.getElementById('new-category-name').value = '';
    document.getElementById('new-category-color').value = '#4361ee';
    
    const btn = document.getElementById('btn-add-category');
    btn.textContent = 'Add';
    btn.className = 'btn btn-primary';
    btn.onclick = addCategory;
    
    document.getElementById('btn-cancel-category').classList.add('d-none');
};

window.updateCategory = async function() {
    const id = document.getElementById('edit-category-id').value;
    const name = document.getElementById('new-category-name').value.trim();
    const color = document.getElementById('new-category-color').value;
    const btn = document.getElementById('btn-add-category');
    
    if (!name) {
        if(window.dashboard) window.dashboard.showNotification('Please enter a category name', 'warning');
        return;
    }
    
    try {
        window.setBtnLoading(btn, true);
        
        // Get old data to check for name change
        const oldDoc = await db.collection('categories').doc(id).get();
        const oldName = oldDoc.data().name;

        await db.collection('categories').doc(id).update({
            name, color,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // If name changed, update all associated transactions
        if (oldName && oldName !== name) {
            const batch = db.batch();
            const txSnap = await db.collection('transactions')
                .where('userId', '==', user.uid)
                .where('category', '==', oldName)
                .get();
            
            txSnap.forEach(doc => batch.update(doc.ref, { category: name }));
            await batch.commit();
        }

        resetCategoryForm();
        await window.refreshCategoryIcons();
        loadCategories(currentCategoryType);
        loadFinanceData(currentFinanceFilter); // Refresh grid to show new icons/names
        
        // Refresh dashboard transaction dropdown if available
        if (window.dashboard && window.dashboard.loadTransactionCategories) {
            await window.dashboard.loadTransactionCategories();
        }
        // Refresh filter dropdown
        if (window.populateCategoryFilter) window.populateCategoryFilter();
        
        window.setBtnLoading(btn, false);
        if(window.dashboard) window.dashboard.showNotification('Category updated', 'success');
    } catch(e) {
        window.setBtnLoading(btn, false);
        console.error(e);
        if(window.dashboard) window.dashboard.showNotification('Error updating category', 'danger');
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
        let query = db.collection('transactions')
            .where('userId', '==', user.uid)
            .orderBy('date', 'desc')
            .orderBy('createdAt', 'desc');

        if (currentFinanceFilter !== 'all') {
            query = query.where('type', '==', currentFinanceFilter);
        }

        if (financeCategoryFilter !== 'all') {
            query = query.where('category', '==', financeCategoryFilter);
        }

        const startDate = document.getElementById('finance-start-date')?.value;
        const endDate = document.getElementById('finance-end-date')?.value;
        if (startDate) {
            query = query.where('date', '>=', startDate);
        }
        if (endDate) {
            query = query.where('date', '<=', endDate);
        }

        const snapshot = await query.get();
        
        if (snapshot.empty) {
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

        snapshot.forEach(doc => {
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


