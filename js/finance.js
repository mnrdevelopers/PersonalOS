let currentCategoryType = 'income';
let currentFinanceFilter = 'all';
let financeCategoryFilter = 'all';
let financeLastDocs = [];
let financeCurrentPage = 1;
const FINANCE_PAGE_SIZE = 50;
let financeSearchQuery = '';
window.userCategoryIcons = {};

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
        'credit-card': 'CREDIT CARD',
        'debit-card': 'DEBIT CARD',
        wallet: 'WALLET',
        other: 'OTHER'
    };
    return labels[mode] || mode.toUpperCase();
};

window.isUpiPaymentMode = function(mode) {
    return mode === 'upi' || (typeof mode === 'string' && mode.startsWith('upi-'));
};

window.loadFinanceSection = async function() {
    const container = document.getElementById('finance-section');
    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="fw-bold gradient-text mb-0">Income & Expenses</h2>
            <div>
                <button class="btn btn-sm btn-outline-danger me-2" onclick="exportFinancePDF()">
                    <i class="fas fa-file-pdf me-2"></i>Export PDF
                </button>
                <button class="btn btn-sm btn-outline-success me-2" onclick="exportFinanceCSV()">
                    <i class="fas fa-file-csv me-2"></i>Export CSV
                </button>
                <button class="btn btn-sm btn-outline-primary" onclick="openCategoriesModal()">
                    <i class="fas fa-tags me-2"></i>Categories
                </button>
            </div>
        </div>

        <!-- Stats Row -->
        <div class="row g-4 mb-4">
            <div class="col-md-4 animate-slide-up" style="animation-delay: 0.1s;">
                <div class="card border-0 shadow-lg h-100 overflow-hidden premium-card-income rounded-4">
                    <div class="card-body p-4 text-white position-relative">
                        <div class="d-flex justify-content-between align-items-start z-1 position-relative">
                            <div>
                                <p class="mb-1 opacity-75 fw-medium">Total Income</p>
                                <h2 class="display-6 fw-bold mb-0" id="stats-income">₹0.00</h2>
                            </div>
                            <div class="icon-box bg-white bg-opacity-25 rounded-circle p-3 backdrop-blur"><i class="fas fa-arrow-down fa-lg"></i></div>
                        </div>
                        <div class="decorative-circle"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-4 animate-slide-up" style="animation-delay: 0.2s;">
                <div class="card border-0 shadow-lg h-100 overflow-hidden premium-card-expense rounded-4">
                    <div class="card-body p-4 text-white position-relative">
                        <div class="d-flex justify-content-between align-items-start z-1 position-relative">
                            <div>
                                <p class="mb-1 opacity-75 fw-medium">Total Expense</p>
                                <h2 class="display-6 fw-bold mb-0" id="stats-expense">₹0.00</h2>
                            </div>
                            <div class="icon-box bg-white bg-opacity-25 rounded-circle p-3 backdrop-blur"><i class="fas fa-arrow-up fa-lg"></i></div>
                        </div>
                        <div class="decorative-circle"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-4 animate-slide-up" style="animation-delay: 0.3s;">
                <div class="card border-0 shadow-lg h-100 overflow-hidden premium-card-balance rounded-4">
                    <div class="card-body p-4 text-white position-relative">
                        <div class="d-flex justify-content-between align-items-start z-1 position-relative">
                            <div>
                                <p class="mb-1 opacity-75 fw-medium">Net Balance</p>
                                <h2 class="display-6 fw-bold mb-0" id="stats-balance">₹0.00</h2>
                            </div>
                            <div class="icon-box bg-white bg-opacity-25 rounded-circle p-3 backdrop-blur"><i class="fas fa-wallet fa-lg"></i></div>
                        </div>
                        <div class="decorative-circle"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabs -->
        <ul class="nav nav-tabs mb-4">
            <li class="nav-item">
                <a class="nav-link active" href="javascript:void(0)" onclick="switchFinanceTab('ledger', this)">Transactions</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="javascript:void(0)" onclick="switchFinanceTab('recurring', this)">Recurring Rules</a>
            </li>
        </ul>

        <!-- Ledger View -->
        <div id="finance-ledger-view">
            <div class="row g-2 mb-4">
                <div class="col-md-3">
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0 rounded-start-pill ps-3"><i class="fas fa-search text-muted"></i></span>
                        <input type="text" class="form-control border-start-0 rounded-end-pill" id="finance-search" placeholder="Search transactions..." onkeyup="searchFinance(this.value)">
                    </div>
                </div>
                <div class="col-md-2">
                    <select class="form-select rounded-pill" id="finance-category-filter" onchange="filterFinanceCategory(this.value)">
                        <option value="all">All Categories</option>
                        <!-- Populated via JS -->
                    </select>
                </div>
                <div class="col-md-4">
                    <div class="input-group">
                        <span class="input-group-text bg-white rounded-start-pill">Date</span>
                        <input type="date" class="form-control" id="finance-start-date" onchange="filterFinanceDate()">
                        <span class="input-group-text">to</span>
                        <input type="date" class="form-control" id="finance-end-date" onchange="filterFinanceDate()">
                        <button class="btn btn-outline-secondary rounded-end-pill" type="button" onclick="clearFinanceDate()" title="Clear Dates">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="col-md-3 text-md-end">
                    <div class="btn-group w-100" role="group">
                        <input type="radio" class="btn-check" name="finance-filter" id="filter-all" autocomplete="off" checked>
                        <label class="btn btn-outline-primary" for="filter-all">All</label>

                        <input type="radio" class="btn-check" name="finance-filter" id="filter-income" autocomplete="off">
                        <label class="btn btn-outline-success" for="filter-income">Income</label>

                        <input type="radio" class="btn-check" name="finance-filter" id="filter-expense" autocomplete="off">
                        <label class="btn btn-outline-danger" for="filter-expense">Expense</label>
                    </div>
                </div>
            </div>
            <div class="card table-card animate-slide-up" style="animation-delay: 0.4s;">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th class="ps-4">Date</th>
                                    <th>Category & Desc</th>
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
                    <div class="d-flex justify-content-between align-items-center p-3 border-top bg-light">
                        <span class="text-muted small" id="finance-page-info">Page 1</span>
                        <div class="btn-group">
                            <button class="btn btn-outline-secondary btn-sm" id="btn-finance-prev" onclick="changeFinancePage(-1)" disabled>
                                <i class="fas fa-chevron-left"></i> Previous
                            </button>
                            <button class="btn btn-outline-secondary btn-sm" id="btn-finance-next" onclick="changeFinancePage(1)" disabled>
                                Next <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recurring View -->
        <div id="finance-recurring-view" class="d-none">
            <div class="card table-card animate-slide-up">
                <div class="card-body p-0">
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
    `;

    // Load data
    await window.refreshCategoryIcons();
    await window.populateCategoryFilter();

    const activeFilterInput = document.getElementById(`filter-${currentFinanceFilter}`) || document.getElementById('filter-all');
    if (activeFilterInput) activeFilterInput.checked = true;

    await loadFinanceData();

    // Setup filters
    document.getElementById('filter-all').addEventListener('click', () => filterFinance('all', true));
    document.getElementById('filter-income').addEventListener('click', () => filterFinance('income', true));
    document.getElementById('filter-expense').addEventListener('click', () => filterFinance('expense', true));
};

window.switchFinanceTab = function(tab, element) {
    document.querySelectorAll('#finance-section .nav-tabs .nav-link').forEach(l => l.classList.remove('active'));
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
        
        select.value = financeCategoryFilter;
    } catch (e) { console.error("Error populating categories:", e); }
};

window.filterFinanceCategory = function(category) {
    financeCategoryFilter = category;
    financeCurrentPage = 1;
    financeLastDocs = [];
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
                <td class="ps-4">
                    <div class="fw-bold text-dark">${data.description || 'Recurring Transaction'}</div>
                </td>
                <td>
                    <span class="me-2">${icon}</span>${data.category}
                </td>
                <td><span class="badge bg-info text-dark">${(data.frequency || 'Monthly').toUpperCase()}</span></td>
                <td>${data.nextDueDate ? new Date(data.nextDueDate).toLocaleDateString() : 'N/A'}</td>
                <td class="text-end ${colorClass} fw-bold pe-4">₹${data.amount.toFixed(2)}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editTransaction('${doc.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="stopRecurring('${doc.id}')" title="Stop Recurring">
                        <i class="fas fa-stop-circle"></i>
                    </button>
                </td>
            `;
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
                return (data.description && data.description.toLowerCase().includes(lowerQuery)) || 
                       (data.category && data.category.toLowerCase().includes(lowerQuery));
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
            const colorClass = isIncome ? 'text-success' : 'text-danger';
            const sign = isIncome ? '+' : '-';
            const modeBadge = window.isUpiPaymentMode(data.paymentMode) ? 'bg-info' : 'bg-warning text-dark';
            const modeText = window.getPaymentModeLabel(data.paymentMode);
            const icon = window.getCategoryIcon(data.category);
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4 text-muted fw-medium">${new Date(data.date).toLocaleDateString()}</td>
                <td>
                    <div class="fw-bold text-dark"><span class="me-2">${icon}</span>${data.category}</div>
                    <div class="small text-muted">${data.description || ''}</div>
                </td>
                <td><span class="badge ${modeBadge} rounded-pill px-3">${modeText}</span></td>
                <td class="text-end ${colorClass} fw-bold pe-4 fs-6">${sign}₹${data.amount.toFixed(2)}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editTransaction('${data.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteTransaction('${data.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
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
        const lowerQuery = financeSearchQuery ? financeSearchQuery.toLowerCase() : '';

        snapshot.forEach(doc => {
            const data = doc.data();
            const amount = Number(data.amount) || 0;

            // Keep summary cards aligned with the same client-side search used by the ledger table.
            if (lowerQuery) {
                const description = (data.description || '').toLowerCase();
                const category = (data.category || '').toLowerCase();
                if (!description.includes(lowerQuery) && !category.includes(lowerQuery)) {
                    return;
                }
            }

            if (data.type === 'income') income += amount;
            else if (data.type === 'expense') expense += amount;
        });

        document.getElementById('stats-income').textContent = `₹${income.toFixed(2)}`;
        document.getElementById('stats-expense').textContent = `₹${expense.toFixed(2)}`;
        document.getElementById('stats-balance').textContent = `₹${(income - expense).toFixed(2)}`;
    } catch (e) { console.error("Error updating stats", e); }
}

window.searchFinance = function(query) {
    financeSearchQuery = query.trim();
    financeCurrentPage = 1;
    financeLastDocs = [];
    loadFinanceData();
};

window.filterFinanceDate = function() {
    financeCurrentPage = 1;
    financeLastDocs = [];
    loadFinanceData();
};

window.clearFinanceDate = function() {
    document.getElementById('finance-start-date').value = '';
    document.getElementById('finance-end-date').value = '';
    filterFinanceDate();
};

window.changeFinancePage = function(delta) {
    const newPage = financeCurrentPage + delta;
    if (newPage < 1) return;
    financeCurrentPage = newPage;
    loadFinanceData();
};

window.editTransaction = async function(id) {
    try {
        if (window.dashboard) {
            await window.dashboard.loadTransactionCategories();
        }

        const doc = await db.collection('transactions').doc(id).get();
        if (!doc.exists) return;
        const data = doc.data();
        
        document.getElementById('transaction-id').value = id;
        document.getElementById('transaction-amount').value = data.amount;
        document.getElementById('transaction-mode').value = data.paymentMode || 'cash';
        document.getElementById('transaction-description').value = data.description;
        document.getElementById('transaction-date').value = data.date;
        document.getElementById('transaction-category').value = data.category;
        
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
        csvContent += "Date,Type,Category,Description,Payment Mode,Amount\n";

        snapshot.forEach(doc => {
            const data = doc.data();
            const row = [
                `"${data.date}"`,
                data.type,
                `"${(data.category || '').replace(/"/g, '""')}"`,
                `"${(data.description || '').replace(/"/g, '""')}"`,
                data.paymentMode || 'cash',
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

        doc.text("Income & Expenses Report", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
        if (startDate || endDate) {
             doc.text(`Period: ${startDate || 'Start'} to ${endDate || 'End'}`, 14, 27);
        }

        const tableColumn = ["Date", "Type", "Category", "Description", "Mode", "Amount"];
        const tableRows = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            const row = [
                new Date(data.date).toLocaleDateString(),
                data.type,
                data.category || '',
                data.description || '',
                data.paymentMode || 'cash',
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


