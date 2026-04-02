let ledgerCurrentPage = 1;
const LEDGER_PAGE_SIZE = 50;
let ledgerAllEntries = [];
let ledgerFilteredEntries = [];
let ledgerSearchQuery = '';
let ledgerAccountFilter = 'all';
let ledgerFinancialYearFilter = 'all';

function createLedgerEntriesFromTransaction(data) {
    const categoryName = data.category || 'Other';
    const icon = window.getCategoryIcon ? window.getCategoryIcon(categoryName) : 'Txn';

    if (data.type === 'transfer') {
        const amount = Number(data.amount) || 0;
        const sourceLabel = data.sourceAccountLabel || window.getAccountTypeLabel(data.sourceAccountType || 'cash');
        const destinationLabel = data.destinationAccountLabel || window.getAccountTypeLabel(data.destinationAccountType || 'bank');
        const baseDescription = data.description || `${sourceLabel} to ${destinationLabel}`;

        return [
            {
                date: data.date,
                createdAt: data.createdAt,
                description: `${icon} Transfer to ${destinationLabel}: ${baseDescription}`,
                plainDescription: `Transfer to ${destinationLabel}: ${baseDescription}`,
                credit: 0,
                debit: amount,
                mode: window.getPaymentModeLabel ? window.getPaymentModeLabel(data.paymentMode) : 'INTERNAL TRANSFER',
                accountType: data.sourceAccountType || 'cash',
                accountLabel: sourceLabel
            },
            {
                date: data.date,
                createdAt: data.createdAt,
                description: `${icon} Transfer from ${sourceLabel}: ${baseDescription}`,
                plainDescription: `Transfer from ${sourceLabel}: ${baseDescription}`,
                credit: amount,
                debit: 0,
                mode: window.getPaymentModeLabel ? window.getPaymentModeLabel(data.paymentMode) : 'INTERNAL TRANSFER',
                accountType: data.destinationAccountType || 'bank',
                accountLabel: destinationLabel
            }
        ];
    }

    const accountMeta = window.getTransactionAccountMeta
        ? window.getTransactionAccountMeta(data)
        : { type: 'other', label: 'Other' };

    return [{
        date: data.date,
        createdAt: data.createdAt,
        description: `${icon} ${data.category}: ${data.description || 'Transaction'}`,
        plainDescription: `${data.category}: ${data.description || 'Transaction'}`,
        credit: data.type === 'income' ? data.amount : 0,
        debit: data.type === 'expense' ? data.amount : 0,
        mode: window.getPaymentModeLabel ? window.getPaymentModeLabel(data.paymentMode) : (data.paymentMode || 'N/A'),
        accountType: accountMeta.type,
        accountLabel: accountMeta.label
    }];
}

window.loadTransactionsSection = async function() {
    const container = document.getElementById('transactions-section');
    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2>Transaction Ledger</h2>
            <div>
                <button class="btn btn-outline-danger btn-sm me-2" onclick="exportLedgerPDF()">
                    <i class="fas fa-file-pdf me-2"></i>Export PDF
                </button>
                <button class="btn btn-outline-success btn-sm" onclick="exportLedgerCSV()">
                    <i class="fas fa-file-csv me-2"></i>Export CSV
                </button>
            </div>
        </div>

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
            <div class="col-md-3">
                <div class="input-group input-group-sm">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input type="text" class="form-control" id="ledger-search" placeholder="Search ledger..." onkeyup="searchLedger(this.value)">
                </div>
            </div>
            <div class="col-md-4">
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
            <div class="col-md-3">
                <select class="form-select form-select-sm" id="ledger-financial-year" onchange="applyLedgerFinancialYear(this.value)">
                    <option value="all">All Financial Years</option>
                </select>
            </div>
            <div class="col-md-2">
                <select class="form-select form-select-sm" id="ledger-account-filter" onchange="filterLedgerAccount(this.value)">
                    <option value="all">All Accounts</option>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                </select>
            </div>
            <div class="col-12 text-md-end">
                <div id="ledger-summary" class="text-end">
                    <h5 class="mb-0"><span id="ledger-balance-label">Balance</span>: <span id="ledger-balance" class="text-primary">Loading...</span></h5>
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
                                <th>Account</th>
                                <th>Payment Mode</th>
                                <th class="text-end">Credit (₹)</th>
                                <th class="text-end">Debit (₹)</th>
                                <th class="text-end">Balance (₹)</th>
                            </tr>
                        </thead>
                        <tbody id="ledger-table-body">
                            <tr><td colspan="7" class="text-center">Loading transactions...</td></tr>
                        </tbody>
                    </table>
                </div>

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

    window.populateFinancialYearSelect('ledger-financial-year', ledgerFinancialYearFilter);
    if (ledgerFinancialYearFilter !== 'all' && ledgerFinancialYearFilter !== 'custom') {
        const range = window.getFinancialYearRange(ledgerFinancialYearFilter);
        document.getElementById('ledger-start-date').value = range.start;
        document.getElementById('ledger-end-date').value = range.end;
    }
    if (window.refreshCategoryIcons) await window.refreshCategoryIcons();
    await loadLedgerData();
};

async function loadLedgerData() {
    const user = auth.currentUser;
    if (!user) return;

    if (window.dashboard) window.dashboard.showLoading();

    try {
        const transactionsSnap = await db.collection('transactions').where('userId', '==', user.uid).get();
        ledgerAllEntries = [];

        transactionsSnap.forEach(doc => {
            const data = doc.data();
            createLedgerEntriesFromTransaction(data).forEach(entry => ledgerAllEntries.push(entry));
        });

        ledgerAllEntries.sort((a, b) => {
            const dateA = new Date(`${a.date}T00:00:00`);
            const dateB = new Date(`${b.date}T00:00:00`);
            if (dateA - dateB !== 0) return dateA - dateB;
            return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
        });

        applyLedgerFilters();
        renderLedgerTable();
    } catch (error) {
        console.error("Error loading ledger data:", error);
        document.getElementById('ledger-table-body').innerHTML = '<tr><td colspan="7" class="text-center text-danger">Failed to load data.</td></tr>';
    } finally {
        if (window.dashboard) window.dashboard.hideLoading();
    }
}

function applyLedgerFilters() {
    let filteredEntries = [...ledgerAllEntries];

    const startDate = document.getElementById('ledger-start-date')?.value;
    const endDate = document.getElementById('ledger-end-date')?.value;

    if (startDate) {
        filteredEntries = filteredEntries.filter(entry => entry.date >= startDate);
    }
    if (endDate) {
        filteredEntries = filteredEntries.filter(entry => entry.date <= endDate);
    }
    if (ledgerAccountFilter !== 'all') {
        filteredEntries = filteredEntries.filter(entry => entry.accountType === ledgerAccountFilter);
    }
    if (ledgerSearchQuery) {
        const lowerQuery = ledgerSearchQuery.toLowerCase();
        filteredEntries = filteredEntries.filter(entry =>
            entry.description.toLowerCase().includes(lowerQuery) ||
            (entry.mode && entry.mode.toLowerCase().includes(lowerQuery)) ||
            (entry.accountLabel && entry.accountLabel.toLowerCase().includes(lowerQuery))
        );
    }

    let runningBalance = 0;
    filteredEntries = filteredEntries.map(entry => {
        runningBalance += entry.credit;
        runningBalance -= entry.debit;
        return { ...entry, balance: runningBalance };
    });

    ledgerFilteredEntries = filteredEntries.reverse();
    ledgerCurrentPage = 1;

    let totalCredit = 0;
    let totalDebit = 0;
    ledgerFilteredEntries.forEach(entry => {
        totalCredit += entry.credit;
        totalDebit += entry.debit;
    });

    if (document.getElementById('ledger-stats-credit')) document.getElementById('ledger-stats-credit').textContent = `₹${totalCredit.toFixed(2)}`;
    if (document.getElementById('ledger-stats-debit')) document.getElementById('ledger-stats-debit').textContent = `₹${totalDebit.toFixed(2)}`;
    if (document.getElementById('ledger-stats-net')) document.getElementById('ledger-stats-net').textContent = `₹${(totalCredit - totalDebit).toFixed(2)}`;
    if (document.getElementById('ledger-balance')) document.getElementById('ledger-balance').textContent = `₹${runningBalance.toFixed(2)}`;
    if (document.getElementById('ledger-balance-label')) {
        document.getElementById('ledger-balance-label').textContent = ledgerAccountFilter === 'all'
            ? 'Balance'
            : `${window.getAccountTypeLabel ? window.getAccountTypeLabel(ledgerAccountFilter) : ledgerAccountFilter} Balance`;
    }
}

function renderLedgerTable() {
    const tbody = document.getElementById('ledger-table-body');
    const prevBtn = document.getElementById('btn-ledger-prev');
    const nextBtn = document.getElementById('btn-ledger-next');
    const pageInfo = document.getElementById('ledger-page-info');

    if (ledgerFilteredEntries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No transactions found.</td></tr>';
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        if (pageInfo) pageInfo.textContent = 'Page 1';
        return;
    }

    const startIndex = (ledgerCurrentPage - 1) * LEDGER_PAGE_SIZE;
    const endIndex = startIndex + LEDGER_PAGE_SIZE;
    const pageEntries = ledgerFilteredEntries.slice(startIndex, endIndex);

    if (prevBtn) prevBtn.disabled = ledgerCurrentPage === 1;
    if (nextBtn) nextBtn.disabled = endIndex >= ledgerFilteredEntries.length;
    if (pageInfo) pageInfo.textContent = `Page ${ledgerCurrentPage}`;

    tbody.innerHTML = '';
    pageEntries.forEach(entry => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(entry.date).toLocaleDateString()}</td>
            <td>${entry.description}</td>
            <td><span class="badge ${window.getAccountBadgeClass ? window.getAccountBadgeClass(entry.accountType) : 'bg-secondary-subtle text-secondary'} rounded-pill px-3">${entry.accountLabel}</span></td>
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

window.applyLedgerFinancialYear = function(value) {
    ledgerFinancialYearFilter = value || 'all';

    if (ledgerFinancialYearFilter === 'all') {
        document.getElementById('ledger-start-date').value = '';
        document.getElementById('ledger-end-date').value = '';
    } else if (ledgerFinancialYearFilter !== 'custom') {
        const range = window.getFinancialYearRange(ledgerFinancialYearFilter);
        document.getElementById('ledger-start-date').value = range.start;
        document.getElementById('ledger-end-date').value = range.end;
    }

    applyLedgerFilters();
    renderLedgerTable();
};

window.filterLedgerDate = function() {
    const startDate = document.getElementById('ledger-start-date')?.value;
    const endDate = document.getElementById('ledger-end-date')?.value;
    ledgerFinancialYearFilter = window.detectFinancialYearSelection(startDate, endDate);
    const fySelect = document.getElementById('ledger-financial-year');
    if (fySelect) fySelect.value = ledgerFinancialYearFilter;
    applyLedgerFilters();
    renderLedgerTable();
};

window.clearLedgerDate = function() {
    document.getElementById('ledger-start-date').value = '';
    document.getElementById('ledger-end-date').value = '';
    ledgerFinancialYearFilter = 'all';
    const fySelect = document.getElementById('ledger-financial-year');
    if (fySelect) fySelect.value = 'all';
    filterLedgerDate();
};

window.filterLedgerAccount = function(accountType) {
    ledgerAccountFilter = accountType || 'all';
    applyLedgerFilters();
    renderLedgerTable();
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
    csvContent += "Date,Description,Account,Payment Mode,Credit,Debit,Balance\n";

    ledgerFilteredEntries.forEach(entry => {
        const row = [
            `"${entry.date}"`,
            `"${(entry.plainDescription || entry.description || '').replace(/"/g, '""')}"`,
            `"${entry.accountLabel || ''}"`,
            `"${entry.mode || ''}"`,
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

window.exportLedgerPDF = function() {
    if (ledgerFilteredEntries.length === 0) {
        if (window.dashboard) window.dashboard.showNotification('No data to export', 'warning');
        return;
    }

    if (!window.jspdf) {
        if (window.dashboard) window.dashboard.showNotification('PDF library not loaded', 'danger');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Transaction Ledger", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableColumn = ["Date", "Description", "Account", "Mode", "Credit", "Debit", "Balance"];
    const tableRows = [];

    ledgerFilteredEntries.forEach(entry => {
        tableRows.push([
            new Date(entry.date).toLocaleDateString(),
            entry.plainDescription || entry.description,
            entry.accountLabel || '',
            entry.mode,
            entry.credit > 0 ? entry.credit.toFixed(2) : '-',
            entry.debit > 0 ? entry.debit.toFixed(2) : '-',
            entry.balance.toFixed(2)
        ]);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 25,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`ledger_export_${new Date().toISOString().split('T')[0]}.pdf`);
    if (window.dashboard) window.dashboard.showNotification('PDF Export successful!', 'success');
};
