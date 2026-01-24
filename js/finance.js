let currentCategoryType = 'income';
let currentFinanceFilter = 'all';
let financeLastDocs = [];
let financeCurrentPage = 1;
const FINANCE_PAGE_SIZE = 50;
let financeSearchQuery = '';

window.loadFinanceSection = async function() {
    const container = document.getElementById('finance-section');
    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="fw-bold gradient-text mb-0">Income & Expenses</h2>
            <div>
                <button class="btn btn-outline-danger me-2" onclick="exportFinancePDF()">
                    <i class="fas fa-file-pdf me-2"></i>Export PDF
                </button>
                <button class="btn btn-outline-success me-2" onclick="exportFinanceCSV()">
                    <i class="fas fa-file-csv me-2"></i>Export CSV
                </button>
                <button class="btn btn-outline-primary" onclick="openCategoriesModal()">
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

        <div class="row g-2 mb-4">
            <div class="col-md-4">
                <div class="input-group">
                    <span class="input-group-text bg-white border-end-0 rounded-start-pill ps-3"><i class="fas fa-search text-muted"></i></span>
                    <input type="text" class="form-control border-start-0 rounded-end-pill" id="finance-search" placeholder="Search transactions..." onkeyup="searchFinance(this.value)">
                </div>
            </div>
            <div class="col-md-5">
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

        <!-- Categories Modal -->
        <div class="modal fade" id="categoriesModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
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
                        
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" id="new-category-name" placeholder="New category name">
                            <input type="color" class="form-control form-control-color" id="new-category-color" value="#4361ee" title="Choose color">
                            <button class="btn btn-primary" onclick="addCategory()">Add</button>
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
    await loadFinanceData();

    // Setup filters
    document.getElementById('filter-all').addEventListener('click', () => filterFinance('all', true));
    document.getElementById('filter-income').addEventListener('click', () => filterFinance('income', true));
    document.getElementById('filter-expense').addEventListener('click', () => filterFinance('expense', true));
};

async function loadFinanceData(filter = null) {
    const user = auth.currentUser;
    if (!user) return;

    if (filter) {
        currentFinanceFilter = filter;
        financeCurrentPage = 1;
        financeLastDocs = [];
        financeSearchQuery = '';
    }

    let query = db.collection('transactions')
        .where('userId', '==', user.uid)
        .orderBy('date', 'desc')
        .orderBy('createdAt', 'desc');

    if (currentFinanceFilter !== 'all') {
        query = query.where('type', '==', currentFinanceFilter);
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

        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No transactions found</td></tr>';
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
            const modeBadge = data.paymentMode === 'upi' ? 'bg-info' : 'bg-warning text-dark';
            const modeText = data.paymentMode ? data.paymentMode.toUpperCase() : 'CASH';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4 text-muted fw-medium">${new Date(data.date).toLocaleDateString()}</td>
                <td>
                    <div class="fw-bold text-dark">${data.category}</div>
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

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.type === 'income') income += data.amount;
            else if (data.type === 'expense') expense += data.amount;
        });

        document.getElementById('stats-income').textContent = `₹${income.toFixed(2)}`;
        document.getElementById('stats-expense').textContent = `₹${expense.toFixed(2)}`;
        document.getElementById('stats-balance').textContent = `₹${(income - expense).toFixed(2)}`;
    } catch (e) { console.error("Error updating stats", e); }
}

window.searchFinance = function(query) {
    financeSearchQuery = query.trim();
    // Reset pagination when searching because we are filtering the current page's results or need to fetch all to filter properly (simplified here to filter current fetch)
    // For true full-text search across all data, a third-party service like Algolia is recommended with Firestore.
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
        
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addTransactionModal'));
        modal.show();
    } catch (e) { console.error(e); }
};

window.deleteTransaction = async function(id) {
    if(confirm('Are you sure you want to delete this transaction?')) {
        await db.collection('transactions').doc(id).delete();
        const activeFilter = document.querySelector('.btn-group .active').id.replace('filter-', '');
        // Reload current page or reset to 1? Resetting to 1 is safer to avoid empty pages.
        loadFinanceData(activeFilter); 
        if(window.dashboard) window.dashboard.updateStats();
        if(window.dashboard) window.dashboard.updateFinanceChart();
    }
};

function filterFinance(type, resetPage = false) {
    document.querySelectorAll('#finance-section .btn-group .btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`filter-${type}`).classList.add('active');
    if (resetPage) {
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
    modal.show();
    loadCategories('income');
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
            const item = document.createElement('div');
            item.className = 'list-group-item d-flex justify-content-between align-items-center';
            item.innerHTML = `
                <div class="d-flex align-items-center">
                    <div style="width: 15px; height: 15px; border-radius: 50%; background-color: ${data.color}; margin-right: 10px;"></div>
                    <span>${data.name}</span>
                </div>
                <button class="btn btn-sm btn-outline-danger border-0" onclick="deleteCategory('${doc.id}')">
                    <i class="fas fa-times"></i>
                </button>
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
    const user = auth.currentUser;
    
    if (!name) return;
    
    try {
        await db.collection('categories').add({
            userId: user.uid,
            name: name,
            type: currentCategoryType,
            color: color,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        nameInput.value = '';
        loadCategories(currentCategoryType);
    } catch (error) {
        console.error("Error adding category:", error);
        alert("Failed to add category");
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
        await db.collection('categories').doc(id).delete();
        loadCategories(currentCategoryType);
    } catch (error) {
        console.error("Error deleting category:", error);
    }
};
