let ledgerCurrentPage = 1;
const LEDGER_PAGE_SIZE = 50;
let ledgerAllEntries = [];
let ledgerFilteredEntries = [];
let ledgerSearchQuery = '';

window.loadTransactionsSection = async function() {
    const container = document.getElementById('transactions-section');
    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2>Transaction Ledger</h2>
            <div>
                <button class="btn btn-outline-success btn-sm" onclick="exportLedgerCSV()">
                    <i class="fas fa-file-csv me-2"></i>Export CSV
                </button>
            </div>
        </div>

        <!-- Stats Row -->
        <div class="row g-3 mb-4">
            <div class="col-md-4">
                <div class="card border-success h-100 shadow-sm">
                    <div class="card-body">
                        <h6 class="card-title text-success">Total Credit</h6>
                        <h4 class="mb-0" id="ledger-stats-credit">₹0.00</h4>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card border-danger h-100 shadow-sm">
                    <div class="card-body">
                        <h6 class="card-title text-danger">Total Debit</h6>
                        <h4 class="mb-0" id="ledger-stats-debit">₹0.00</h4>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card border-primary h-100 shadow-sm">
                    <div class="card-body">
                        <h6 class="card-title text-primary">Net Change</h6>
                        <h4 class="mb-0" id="ledger-stats-net">₹0.00</h4>
                    </div>
                </div>
            </div>
        </div>

        <div class="row g-2 mb-4">
            <div class="col-md-4">
                <div class="input-group input-group-sm">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input type="text" class="form-control" id="ledger-search" placeholder="Search ledger..." onkeyup="searchLedger(this.value)">
                </div>
            </div>
            <div class="col-md-5">
                <div class="input-group input-group-sm">
                    <span class="input-group-text">Date</span>
                    <input type="date" class="form-control" id="ledger-start-date" onchange="filterLedgerDate()">
                    <span class="input-group-text">to</span>
                    <input type="date" class="form-control" id="ledger-end-date" onchange="filterLedgerDate()">
                    <button class="btn btn-outline-secondary" type="button" onclick="clearLedgerDate()" title="Clear Dates">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="col-md-3 text-md-end">
                <div id="ledger-summary" class="text-end">
                    <h5 class="mb-0">Balance: <span id="ledger-balance" class="text-primary">Loading...</span></h5>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Payment Mode</th>
                                <th class="text-end">Credit (₹)</th>
                                <th class="text-end">Debit (₹)</th>
                                <th class="text-end">Balance (₹)</th>
                            </tr>
                        </thead>
                        <tbody id="ledger-table-body">
                            <tr><td colspan="5" class="text-center">Loading transactions...</td></tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="d-flex justify-content-between align-items-center mt-3 border-top pt-3">
                    <span class="text-muted small" id="ledger-page-info">Page 1</span>
                    <div class="btn-group">
                        <button class="btn btn-outline-secondary btn-sm" id="btn-ledger-prev" onclick="changeLedgerPage(-1)" disabled>
                            <i class="fas fa-chevron-left"></i> Previous
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" id="btn-ledger-next" onclick="changeLedgerPage(1)" disabled>
                            Next <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    await loadLedgerData();
};

async function loadLedgerData() {
    const user = auth.currentUser;
    if (!user) return;

    if (window.dashboard) window.dashboard.showLoading();

    try {
        const [transactionsSnap, entertainmentSnap] = await Promise.all([
            db.collection('transactions').where('userId', '==', user.uid).get(),
            db.collection('entertainment').where('userId', '==', user.uid).get()
        ]);

        ledgerAllEntries = [];

        transactionsSnap.forEach(doc => {
            const data = doc.data();
            ledgerAllEntries.push({
                date: data.date,
                createdAt: data.createdAt,
                description: `${data.category}: ${data.description || 'Transaction'}`,
                credit: data.type === 'income' ? data.amount : 0,
                debit: data.type === 'expense' ? data.amount : 0,
                mode: data.paymentMode || 'N/A',
            });
        });

        entertainmentSnap.forEach(doc => {
            const data = doc.data();
            if (data.cost > 0) {
                ledgerAllEntries.push({
                    date: data.date,
                    createdAt: data.createdAt,
                    description: `Entertainment: ${data.title}`,
                    credit: 0,
                    debit: data.cost,
                    mode: 'other',
                });
            }
        });

        // Sort all entries chronologically to calculate running balance
        ledgerAllEntries.sort((a, b) => {
            const dateA = new Date(`${a.date}T00:00:00`);
            const dateB = new Date(`${b.date}T00:00:00`);
            if (dateA - dateB !== 0) return dateA - dateB;
            // If dates are same, use timestamp
            return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
        });

        let runningBalance = 0;
        ledgerAllEntries.forEach(entry => {
            runningBalance += entry.credit;
            runningBalance -= entry.debit;
            entry.balance = runningBalance;
        });

        // Initial filter application (will populate ledgerFilteredEntries)
        applyLedgerFilters();

        const balanceEl = document.getElementById('ledger-balance');
        if (balanceEl) {
            balanceEl.textContent = `₹${runningBalance.toFixed(2)}`;
        }

        renderLedgerTable();

    } catch (error) {
        console.error("Error loading ledger data:", error);
        document.getElementById('ledger-table-body').innerHTML = '<tr><td colspan="5" class="text-center text-danger">Failed to load data.</td></tr>';
    } finally {
        if (window.dashboard) window.dashboard.hideLoading();
    }
}

function applyLedgerFilters() {
    ledgerFilteredEntries = [...ledgerAllEntries];

    // Date Filter
    const startDate = document.getElementById('ledger-start-date')?.value;
    const endDate = document.getElementById('ledger-end-date')?.value;

    if (startDate) {
        ledgerFilteredEntries = ledgerFilteredEntries.filter(entry => entry.date >= startDate);
    }
    if (endDate) {
        ledgerFilteredEntries = ledgerFilteredEntries.filter(entry => entry.date <= endDate);
    }

    // Search Filter
    if (ledgerSearchQuery) {
        const lowerQuery = ledgerSearchQuery.toLowerCase();
        ledgerFilteredEntries = ledgerFilteredEntries.filter(entry => 
            entry.description.toLowerCase().includes(lowerQuery) ||
            (entry.mode && entry.mode.toLowerCase().includes(lowerQuery))
        );
    }

    // Reverse for display (most recent first)
    ledgerFilteredEntries.reverse();
    
    // Reset to page 1 on filter change
    ledgerCurrentPage = 1;

    // Update Stats
    let totalCredit = 0;
    let totalDebit = 0;
    ledgerFilteredEntries.forEach(entry => {
        totalCredit += entry.credit;
        totalDebit += entry.debit;
    });

    if(document.getElementById('ledger-stats-credit')) document.getElementById('ledger-stats-credit').textContent = `₹${totalCredit.toFixed(2)}`;
    if(document.getElementById('ledger-stats-debit')) document.getElementById('ledger-stats-debit').textContent = `₹${totalDebit.toFixed(2)}`;
    if(document.getElementById('ledger-stats-net')) document.getElementById('ledger-stats-net').textContent = `₹${(totalCredit - totalDebit).toFixed(2)}`;
}

function renderLedgerTable() {
    const tbody = document.getElementById('ledger-table-body');
    const prevBtn = document.getElementById('btn-ledger-prev');
    const nextBtn = document.getElementById('btn-ledger-next');
    const pageInfo = document.getElementById('ledger-page-info');

    if (ledgerFilteredEntries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No transactions found.</td></tr>';
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        if (pageInfo) pageInfo.textContent = 'Page 1';
        return;
    }

    // Pagination Logic
    const startIndex = (ledgerCurrentPage - 1) * LEDGER_PAGE_SIZE;
    const endIndex = startIndex + LEDGER_PAGE_SIZE;
    const pageEntries = ledgerFilteredEntries.slice(startIndex, endIndex);

    // Update Pagination UI
    if (prevBtn) prevBtn.disabled = ledgerCurrentPage === 1;
    if (nextBtn) nextBtn.disabled = endIndex >= ledgerFilteredEntries.length;
    if (pageInfo) pageInfo.textContent = `Page ${ledgerCurrentPage}`;

    tbody.innerHTML = '';
    pageEntries.forEach(entry => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(entry.date).toLocaleDateString()}</td>
            <td>${entry.description}</td>
            <td>${entry.mode}</td>
            <td class="text-end text-success">${entry.credit > 0 ? `+${entry.credit.toFixed(2)}` : '-'}</td>
            <td class="text-end text-danger">${entry.debit > 0 ? `-${entry.debit.toFixed(2)}` : '-'}</td>
            <td class="text-end fw-bold">₹${entry.balance.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}

window.searchLedger = function(query) {
    ledgerSearchQuery = query.trim();
    applyLedgerFilters();
    renderLedgerTable();
};

window.filterLedgerDate = function() {
    applyLedgerFilters();
    renderLedgerTable();
};

window.clearLedgerDate = function() {
    document.getElementById('ledger-start-date').value = '';
    document.getElementById('ledger-end-date').value = '';
    filterLedgerDate();
};

window.changeLedgerPage = function(delta) {
    const newPage = ledgerCurrentPage + delta;
    if (newPage < 1) return;
    ledgerCurrentPage = newPage;
    renderLedgerTable();
};

window.exportLedgerCSV = function() {
    if (ledgerFilteredEntries.length === 0) {
        if (window.dashboard) window.dashboard.showNotification('No data to export', 'warning');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Description,Credit,Debit,Balance\n";

    ledgerFilteredEntries.forEach(entry => {
        const row = [
            `"${entry.date}"`,
            `"${(entry.description || '').replace(/"/g, '""')}"`,
            entry.credit,
            entry.debit,
            entry.balance
        ].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (window.dashboard) window.dashboard.showNotification('Export successful!', 'success');
};