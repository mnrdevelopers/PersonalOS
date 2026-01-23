window.loadLoansSection = async function() {
    const container = document.getElementById('loans-section');
    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Loans & Debts</h2>
            <button class="btn btn-primary" onclick="showAddLoanModal()">
                <i class="fas fa-plus me-2"></i>Add Loan/Debt
            </button>
        </div>
        
        <!-- Stats Row -->
        <div class="row g-3 mb-4">
            <div class="col-6 col-md-3">
                <div class="card bg-light h-100 border-danger shadow-sm">
                    <div class="card-body p-3">
                        <h6 class="card-title text-danger small" id="loan-stat-title-1">Total Borrowed</h6>
                        <h4 class="mb-0" id="loan-stat-borrowed">₹0.00</h4>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card bg-light h-100 border-success shadow-sm">
                    <div class="card-body p-3">
                        <h6 class="card-title text-success small" id="loan-stat-title-2">Total Lent</h6>
                        <h4 class="mb-0" id="loan-stat-lent">₹0.00</h4>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card bg-light h-100 border-primary shadow-sm">
                    <div class="card-body p-3">
                        <h6 class="card-title text-primary small" id="loan-stat-title-3">Net Position</h6>
                        <h4 class="mb-0" id="loan-stat-net">₹0.00</h4>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card bg-light h-100 border-warning shadow-sm">
                    <div class="card-body p-3">
                        <h6 class="card-title text-dark small">Monthly EMI</h6>
                        <h4 class="mb-0" id="loan-stat-emi">₹0.00</h4>
                    </div>
                </div>
            </div>
        </div>

        <ul class="nav nav-tabs mb-4">
            <li class="nav-item">
                <a class="nav-link active" href="javascript:void(0)" onclick="filterLoans('active', this)">Active</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="javascript:void(0)" onclick="filterLoans('closed', this)">Closed</a>
            </li>
        </ul>

        <div class="row g-4" id="loans-grid">
            <div class="col-12 text-center"><div class="spinner-border text-primary"></div></div>
        </div>
        
        <!-- Add Loan Modal -->
        <div class="modal fade" id="addLoanModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add Loan or Debt</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="loan-form">
                            <input type="hidden" id="loan-id">
                            <div class="mb-3">
                                <label class="form-label">Type</label>
                                <div class="btn-group w-100" role="group">
                                    <input type="radio" class="btn-check" name="loan-type" id="type-borrowed" value="borrowed" checked onchange="updateLoanModalUI(this.value)">
                                    <label class="btn btn-outline-danger" for="type-borrowed">I Borrowed (Liability)</label>
                                    <input type="radio" class="btn-check" name="loan-type" id="type-lent" value="lent" onchange="updateLoanModalUI(this.value)">
                                    <label class="btn btn-outline-success" for="type-lent">I Lent (Asset)</label>
                                    <input type="radio" class="btn-check" name="loan-type" id="type-emi" value="emi" onchange="updateLoanModalUI(this.value)">
                                    <label class="btn btn-outline-warning" for="type-emi">Product EMI</label>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label" id="label-loan-name">Person / Institution Name</label>
                                <input type="text" class="form-control" id="loan-name" placeholder="e.g. HDFC Bank or Friend Name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Total Amount</label>
                                <div class="input-group">
                                    <span class="input-group-text">₹</span>
                                    <input type="number" class="form-control" id="loan-amount" step="0.01" min="0" required>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Start Date</label>
                                    <input type="date" class="form-control" id="loan-start-date" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Due Date</label>
                                    <input type="date" class="form-control" id="loan-due-date">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Interest Rate (%)</label>
                                    <input type="number" class="form-control" id="loan-interest" step="0.1" min="0" placeholder="Optional">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">EMI Amount</label>
                                    <input type="number" class="form-control" id="loan-emi" step="0.01" min="0" placeholder="Optional">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Payment Mode</label>
                                <select class="form-select" id="loan-payment-mode">
                                    <option value="cash">Cash</option>
                                    <option value="bank">Bank Transfer</option>
                                    <option value="upi">UPI</option>
                                    <option value="credit-card">Credit Card</option>
                                    <option value="debit-card">Debit Card</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="loan-link-ledger" checked>
                                <label class="form-check-label" for="loan-link-ledger" id="label-link-ledger">
                                    Add record to Transaction Ledger
                                </label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveLoan()">Save</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Repayment Modal -->
        <div class="modal fade" id="repaymentModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add Repayment</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="repayment-form">
                            <input type="hidden" id="repay-loan-id">
                            <div class="mb-3">
                                <label class="form-label">Amount</label>
                                <div class="input-group">
                                    <span class="input-group-text">₹</span>
                                    <input type="number" class="form-control" id="repay-amount" step="0.01" min="0" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Date</label>
                                <input type="date" class="form-control" id="repay-date" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Payment Mode</label>
                                <select class="form-select" id="repay-payment-mode">
                                    <option value="cash">Cash</option>
                                    <option value="bank">Bank Transfer</option>
                                    <option value="upi">UPI</option>
                                    <option value="credit-card">Credit Card</option>
                                    <option value="debit-card">Debit Card</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="repay-link-ledger" checked>
                                <label class="form-check-label" for="repay-link-ledger">
                                    Add record to Transaction Ledger
                                </label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveRepayment()">Save Repayment</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Repayment Modal -->
        <div class="modal fade" id="editRepaymentModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Repayment</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="edit-repayment-form">
                            <input type="hidden" id="edit-repay-loan-id">
                            <input type="hidden" id="edit-repay-id">
                            <div class="mb-3">
                                <label class="form-label">Amount</label>
                                <div class="input-group">
                                    <span class="input-group-text">₹</span>
                                    <input type="number" class="form-control" id="edit-repay-amount" step="0.01" min="0" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Date</label>
                                <input type="date" class="form-control" id="edit-repay-date" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveEditedRepayment()">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Repayment History Modal -->
        <div class="modal fade" id="historyModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Repayment History</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead><tr><th>Date</th><th>Amount</th><th>Actions</th></tr></thead>
                                <tbody id="history-table-body">
                                    <tr><td colspan="3" class="text-center">Loading...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    await loadLoansGrid('active');
};

window.updateLoanModalUI = function(type) {
    const nameLabel = document.getElementById('label-loan-name');
    const ledgerCheck = document.getElementById('loan-link-ledger');
    const ledgerLabel = document.getElementById('label-link-ledger');
    const emiInput = document.getElementById('loan-emi');
    
    if (type === 'emi') {
        if(nameLabel) nameLabel.textContent = 'Product Name / Financier';
        if(ledgerCheck) {
            ledgerCheck.checked = false;
            ledgerCheck.disabled = true;
        }
        if(ledgerLabel) ledgerLabel.textContent = 'Link to Ledger (Disabled for EMI creation)';
        if(emiInput) emiInput.placeholder = 'Required';
    } else {
        if(nameLabel) nameLabel.textContent = 'Person / Institution Name';
        if(ledgerCheck) {
            ledgerCheck.disabled = false;
            if (!document.getElementById('loan-id').value) ledgerCheck.checked = true;
        }
        if(ledgerLabel) ledgerLabel.textContent = 'Add record to Transaction Ledger';
        if(emiInput) emiInput.placeholder = 'Optional';
    }
};

window.showAddLoanModal = function() {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addLoanModal'));
    document.getElementById('loan-form').reset();
    document.getElementById('loan-id').value = '';
    document.getElementById('loan-start-date').value = new Date().toISOString().split('T')[0];
    
    // Reset UI
    document.getElementById('type-borrowed').checked = true;
    updateLoanModalUI('borrowed');
    
    modal.show();
};

window.filterLoans = function(status, element) {
    document.querySelectorAll('#loans-section .nav-link').forEach(l => l.classList.remove('active'));
    element.classList.add('active');
    loadLoansGrid(status);
};

window.saveLoan = async function() {
    const id = document.getElementById('loan-id').value;
    const type = document.querySelector('input[name="loan-type"]:checked').value;
    const name = document.getElementById('loan-name').value;
    const amount = parseFloat(document.getElementById('loan-amount').value);
    const startDate = document.getElementById('loan-start-date').value;
    const dueDate = document.getElementById('loan-due-date').value;
    const interest = parseFloat(document.getElementById('loan-interest').value) || 0;
    const emi = parseFloat(document.getElementById('loan-emi').value) || 0;
    const linkLedger = document.getElementById('loan-link-ledger').checked;
    const paymentMode = document.getElementById('loan-payment-mode').value;
    const user = auth.currentUser;

    if (!name || !amount || !startDate) {
        alert('Please fill in required fields');
        return;
    }
    
    if (type === 'emi' && emi <= 0) {
        alert('Please enter EMI amount for Product EMI type');
        return;
    }

    try {
        const loan = {
            userId: user.uid,
            type, name, totalAmount: amount, paidAmount: 0,
            startDate, dueDate, interestRate: interest, emiAmount: emi,
            status: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        let loanRef;
        if (id) {
            // Update existing loan (logic simplified for now, usually editing amount is complex)
            await db.collection('loans').doc(id).update({ 
                name, 
                totalAmount: amount,
                startDate,
                dueDate, 
                interestRate: interest, 
                emiAmount: emi, 
                type 
            });

            // Update associated transaction
            const txQuery = await db.collection('transactions')
                .where('userId', '==', user.uid)
                .where('loanId', '==', id)
                .where('category', '==', 'Loan')
                .get();

            if (!txQuery.empty) {
                const txDoc = txQuery.docs[0];
                await db.collection('transactions').doc(txDoc.id).update({
                    amount: amount,
                    date: startDate,
                    type: type === 'borrowed' ? 'income' : 'expense',
                    description: `${type === 'borrowed' ? 'Loan from' : (type === 'lent' ? 'Loan to' : 'EMI Purchase:')} ${name}`,
                    paymentMode: paymentMode,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        } else {
            const docRef = await db.collection('loans').add(loan);
            loanRef = docRef.id;

            if (linkLedger) {
                const transaction = {
                    userId: user.uid,
                    loanId: loanRef,
                    date: startDate,
                    amount: amount,
                    type: type === 'borrowed' ? 'income' : (type === 'lent' ? 'expense' : 'expense'),
                    category: 'Loan',
                    description: `${type === 'borrowed' ? 'Loan from' : (type === 'lent' ? 'Loan to' : 'EMI Purchase:')} ${name}`,
                    paymentMode: paymentMode,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                await db.collection('transactions').add(transaction);
            }
        }
        
        bootstrap.Modal.getOrCreateInstance(document.getElementById('addLoanModal')).hide();
        loadLoansGrid('active');
        if(window.dashboard) {
            window.dashboard.updateStats();
            window.dashboard.loadRecentTransactions();
            window.dashboard.updateFinanceChart();
            window.dashboard.showNotification('Loan saved successfully!', 'success');
        }
    } catch (error) {
        console.error("Error saving loan:", error);
    }
};

window.loadLoansGrid = async function(status = 'active') {
    const user = auth.currentUser;
    const snapshot = await db.collection('loans')
        .where('userId', '==', user.uid)
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .get();

    const container = document.getElementById('loans-grid');
    if (snapshot.empty) {
        container.innerHTML = `<div class="col-12 text-center text-muted py-5">No ${status} loans found.</div>`;
        return;
    }

    // Calculate Stats
    let totalBorrowed = 0;
    let totalLent = 0;
    let totalEmi = 0;

    snapshot.forEach(doc => {
        const data = doc.data();
        // If active, calculate outstanding. If closed, calculate total/paid.
        const amount = status === 'active' ? (data.totalAmount - (data.paidAmount || 0)) : data.totalAmount;
        
        if (data.type === 'borrowed' || data.type === 'emi') {
            totalBorrowed += amount;
            if (status === 'active' && data.emiAmount && amount > 0) {
                totalEmi += data.emiAmount;
            }
        } else if (data.type === 'lent') {
            totalLent += amount;
        }
    });

    if(document.getElementById('loan-stat-borrowed')) document.getElementById('loan-stat-borrowed').textContent = `₹${totalBorrowed.toFixed(2)}`;
    if(document.getElementById('loan-stat-lent')) document.getElementById('loan-stat-lent').textContent = `₹${totalLent.toFixed(2)}`;
    if(document.getElementById('loan-stat-net')) document.getElementById('loan-stat-net').textContent = `₹${(totalLent - totalBorrowed).toFixed(2)}`;
    if(document.getElementById('loan-stat-emi')) document.getElementById('loan-stat-emi').textContent = `₹${totalEmi.toFixed(2)}`;
    
    // Update titles based on status
    document.getElementById('loan-stat-title-1').textContent = status === 'active' ? 'Outstanding Debt' : 'Total Repaid Debt';
    document.getElementById('loan-stat-title-2').textContent = status === 'active' ? 'Outstanding Assets' : 'Total Repaid Assets';

    container.innerHTML = '';
    snapshot.forEach(doc => {
        const data = doc.data();
        const progress = Math.min(100, Math.round((data.paidAmount / data.totalAmount) * 100));
        let typeBadge = '<span class="badge bg-danger">Liability</span>';
        if (data.type === 'lent') typeBadge = '<span class="badge bg-success">Asset</span>';
        else if (data.type === 'emi') typeBadge = '<span class="badge bg-warning text-dark">Product EMI</span>';
        
        const isFullyPaid = data.paidAmount >= data.totalAmount;
        
        let emiSection = '';
        if (data.emiAmount && data.emiAmount > 0) {
            const totalInstallments = Math.ceil(data.totalAmount / data.emiAmount);
            const paidInstallments = Math.floor((data.paidAmount || 0) / data.emiAmount);
            const remaining = Math.max(0, totalInstallments - paidInstallments);
            const instProgress = Math.min(100, (paidInstallments / totalInstallments) * 100);
            
            let estimatedCompletionHtml = '';
            if (remaining > 0) {
                const estDate = new Date();
                estDate.setMonth(estDate.getMonth() + remaining);
                estimatedCompletionHtml = `<div class="mt-1 small text-muted"><i class="fas fa-flag-checkered me-1"></i> Est. End: ${estDate.toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}</div>`;
            }

            emiSection = `
                <div class="mb-2 small"><i class="fas fa-calendar-alt me-1"></i> EMI: ₹${data.emiAmount}</div>
                <div class="mb-2 bg-light p-2 rounded border">
                    <div class="d-flex justify-content-between small text-muted mb-1">
                        <span>Installments: ${paidInstallments}/${totalInstallments}</span>
                        <span class="fw-bold text-primary">${remaining} left</span>
                    </div>
                    <div class="progress" style="height: 6px;">
                        <div class="progress-bar bg-info" role="progressbar" style="width: ${instProgress}%"></div>
                    </div>
                    ${estimatedCompletionHtml}
                </div>
            `;
        }

        const col = document.createElement('div');
        col.className = 'col-md-6';
        col.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h5 class="card-title mb-0">${data.name}</h5>
                            ${typeBadge}
                        </div>
                        <div class="dropdown">
                            <button class="btn btn-link text-muted p-0" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item" href="javascript:void(0)" onclick="viewRepaymentHistory('${doc.id}')">View History</a></li>
                                <li><a class="dropdown-item" href="javascript:void(0)" onclick="editLoan('${doc.id}')">Edit</a></li>
                                <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="deleteLoan('${doc.id}')">Delete</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="mb-3">
                        <h3 class="mb-0">₹${(data.totalAmount - data.paidAmount).toFixed(2)}</h3>
                        <small class="text-muted">Remaining of ₹${data.totalAmount.toFixed(2)}</small>
                    </div>
                    <div class="progress mb-2" style="height: 8px;">
                        <div class="progress-bar bg-primary" role="progressbar" style="width: ${progress}%"></div>
                    </div>
                    <div class="d-flex justify-content-between small text-muted mb-3">
                        <span>Paid: ₹${data.paidAmount.toFixed(2)}</span>
                        <span>${progress}%</span>
                    </div>
                    ${emiSection}
                    ${data.dueDate ? `<div class="mb-2 small"><i class="fas fa-clock me-1"></i> Due: ${new Date(data.dueDate).toLocaleDateString()}</div>` : ''}
                    
                    ${!isFullyPaid ? `
                    <div class="mt-3 text-end">
                        <button class="btn btn-sm btn-outline-primary" onclick="showRepaymentModal('${doc.id}')">
                            <i class="fas fa-plus-circle me-1"></i>Record Payment
                        </button>
                    </div>` : '<div class="mt-3 text-end text-success fw-bold"><i class="fas fa-check-circle me-1"></i>Closed</div>'}
                </div>
            </div>
        `;
        container.appendChild(col);
    });
};

window.editLoan = async function(id) {
    try {
        const doc = await db.collection('loans').doc(id).get();
        if (!doc.exists) return;
        const data = doc.data();
        
        document.getElementById('loan-id').value = id;
        document.getElementById('loan-name').value = data.name;
        document.getElementById('loan-amount').value = data.totalAmount;
        document.getElementById('loan-start-date').value = data.startDate;
        document.getElementById('loan-due-date').value = data.dueDate || '';
        document.getElementById('loan-interest').value = data.interestRate || '';
        document.getElementById('loan-emi').value = data.emiAmount || '';
        
        // Set radio button
        const typeRadio = document.querySelector(`input[name="loan-type"][value="${data.type}"]`);
        if (typeRadio) {
            typeRadio.checked = true;
            updateLoanModalUI(data.type);
        }
        
        // Disable link ledger for edits to avoid duplicate transactions
        const ledgerCheck = document.getElementById('loan-link-ledger');
        if (ledgerCheck) ledgerCheck.checked = false;
        
        // Fetch associated transaction to get payment mode
        const user = auth.currentUser;
        const txQuery = await db.collection('transactions')
            .where('userId', '==', user.uid)
            .where('loanId', '==', id)
            .where('category', '==', 'Loan')
            .limit(1)
            .get();
            
        if (!txQuery.empty) {
            const txData = txQuery.docs[0].data();
            if (txData.paymentMode) {
                document.getElementById('loan-payment-mode').value = txData.paymentMode;
            }
        }

        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addLoanModal'));
        modal.show();
    } catch (e) { console.error("Error editing loan:", e); }
};

window.deleteLoan = async function(id) {
    if(confirm('Delete this loan record? This cannot be undone.')) {
        try {
            const user = auth.currentUser;
            const batch = db.batch();
            const loanRef = db.collection('loans').doc(id);
            
            // Delete loan document
            batch.delete(loanRef);

            // Delete related transactions
            const transactionsSnap = await db.collection('transactions')
                .where('userId', '==', user.uid)
                .where('loanId', '==', id)
                .get();
            transactionsSnap.forEach(doc => batch.delete(doc.ref));

            // Delete repayment history
            const repaymentsSnap = await loanRef.collection('repayments')
                .where('userId', '==', user.uid)
                .get();
            repaymentsSnap.forEach(doc => batch.delete(doc.ref));

            await batch.commit();

            const activeTab = document.querySelector('#loans-section .nav-link.active');
            const status = activeTab ? activeTab.textContent.toLowerCase() : 'active';
            loadLoansGrid(status);
            if(window.dashboard) window.dashboard.showNotification('Loan deleted successfully', 'success');
        } catch(e) {
            console.error(e);
            if(window.dashboard) window.dashboard.showNotification('Error deleting loan', 'danger');
        }
    }
};

window.showRepaymentModal = function(loanId) {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('repaymentModal'));
    document.getElementById('repayment-form').reset();
    document.getElementById('repay-loan-id').value = loanId;
    document.getElementById('repay-date').value = new Date().toISOString().split('T')[0];
    modal.show();
};

window.saveRepayment = async function() {
    const loanId = document.getElementById('repay-loan-id').value;
    const amount = parseFloat(document.getElementById('repay-amount').value);
    const date = document.getElementById('repay-date').value;
    const linkLedger = document.getElementById('repay-link-ledger').checked;
    const paymentMode = document.getElementById('repay-payment-mode').value;
    const user = auth.currentUser;

    if (!amount || !date) {
        alert('Please enter amount and date');
        return;
    }

    try {
        const loanDoc = await db.collection('loans').doc(loanId).get();
        const loanData = loanDoc.data();
        const newPaidAmount = (loanData.paidAmount || 0) + amount;
        const status = newPaidAmount >= loanData.totalAmount ? 'closed' : 'active';

        await db.collection('loans').doc(loanId).update({
            paidAmount: newPaidAmount,
            status: status,
            lastPaymentDate: date
        });

        if (linkLedger) {
            const type = loanData.type === 'lent' ? 'income' : 'expense';
            const description = `Repayment: ${loanData.name} (${loanData.type === 'emi' ? 'EMI' : 'Loan'})`;
            
            await db.collection('transactions').add({
                userId: user.uid,
                loanId: loanId,
                date: date,
                amount: amount,
                type: type,
                category: 'Loan Repayment',
                description: description,
                paymentMode: paymentMode,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Also add to a subcollection for history tracking
            await db.collection('loans').doc(loanId).collection('repayments').add({
                userId: user.uid,
                amount: amount,
                date: date,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        bootstrap.Modal.getOrCreateInstance(document.getElementById('repaymentModal')).hide();
        loadLoansGrid('active');
        if(window.dashboard) window.dashboard.showNotification('Repayment recorded!', 'success');
    } catch (error) {
        console.error("Error saving repayment:", error);
        if(window.dashboard) window.dashboard.showNotification('Error recording repayment', 'danger');
    }
};

window.viewRepaymentHistory = async function(loanId) {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('historyModal'));
    modal.show();
    
    const tbody = document.getElementById('history-table-body');
    tbody.innerHTML = '<tr><td colspan="3" class="text-center">Loading...</td></tr>';
    
    try {
        const user = auth.currentUser;
        const snapshot = await db.collection('loans').doc(loanId).collection('repayments')
            .where('userId', '==', user.uid)
            .orderBy('date', 'desc')
            .get();
        
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No history found.</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            tbody.innerHTML += `
                <tr>
                    <td>${new Date(data.date).toLocaleDateString()}</td>
                    <td>₹${data.amount.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="editRepayment('${loanId}', '${doc.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteRepayment('${loanId}', '${doc.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
        });
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Error loading history.</td></tr>';
    }
};

window.editRepayment = async function(loanId, repaymentId) {
    try {
        const repaymentDoc = await db.collection('loans').doc(loanId).collection('repayments').doc(repaymentId).get();
        if (!repaymentDoc.exists) {
            if(window.dashboard) window.dashboard.showNotification('Repayment not found.', 'danger');
            return;
        }
        const repaymentData = repaymentDoc.data();

        document.getElementById('edit-repay-loan-id').value = loanId;
        document.getElementById('edit-repay-id').value = repaymentId;
        document.getElementById('edit-repay-amount').value = repaymentData.amount;
        document.getElementById('edit-repay-date').value = repaymentData.date;
        
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('editRepaymentModal'));
        modal.show();
    } catch (error) {
        console.error("Error loading repayment for edit:", error);
        if(window.dashboard) window.dashboard.showNotification('Error loading repayment data.', 'danger');
    }
};

window.saveEditedRepayment = async function() {
    const loanId = document.getElementById('edit-repay-loan-id').value;
    const repaymentId = document.getElementById('edit-repay-id').value;
    const newAmount = parseFloat(document.getElementById('edit-repay-amount').value);
    const newDate = document.getElementById('edit-repay-date').value;
    const user = auth.currentUser;

    if (!newAmount || !newDate) {
        alert('Please fill in all fields.');
        return;
    }

    const repaymentRef = db.collection('loans').doc(loanId).collection('repayments').doc(repaymentId);

    try {
        const repaymentDoc = await repaymentRef.get();
        if (!repaymentDoc.exists) {
            if(window.dashboard) window.dashboard.showNotification('Repayment not found.', 'danger');
            return;
        }
        const originalAmount = repaymentDoc.data().amount;
        const originalDate = repaymentDoc.data().date;

        const amountDifference = newAmount - originalAmount;

        // Find and update the associated transaction
        const transactionsSnap = await db.collection('transactions')
            .where('userId', '==', user.uid)
            .where('loanId', '==', loanId)
            .where('category', '==', 'Loan Repayment')
            .where('amount', '==', originalAmount)
            .where('date', '==', originalDate)
            .limit(1)
            .get();

        const batch = db.batch();

        if (!transactionsSnap.empty) {
            const txRef = transactionsSnap.docs[0].ref;
            batch.update(txRef, { amount: newAmount, date: newDate });
        }

        // Update the repayment
        batch.update(repaymentRef, { amount: newAmount, date: newDate });

        // Update the loan's paid amount
        const loanRef = db.collection('loans').doc(loanId);
        const newPaidAmount = firebase.firestore.FieldValue.increment(amountDifference);
        batch.update(loanRef, { paidAmount: newPaidAmount });

        await batch.commit();

        bootstrap.Modal.getOrCreateInstance(document.getElementById('editRepaymentModal')).hide();
        if(window.dashboard) window.dashboard.showNotification('Repayment updated successfully!', 'success');
        
        // Refresh views
        viewRepaymentHistory(loanId);
        const activeTab = document.querySelector('#loans-section .nav-link.active');
        const status = activeTab ? activeTab.textContent.toLowerCase() : 'active';
        loadLoansGrid(status);

    } catch (error) {
        console.error("Error saving edited repayment:", error);
        if(window.dashboard) window.dashboard.showNotification('Error updating repayment.', 'danger');
    }
};

window.deleteRepayment = async function(loanId, repaymentId) {
    if (!confirm('Are you sure you want to delete this repayment? This will also delete the associated transaction.')) {
        return;
    }

    const user = auth.currentUser;
    const repaymentRef = db.collection('loans').doc(loanId).collection('repayments').doc(repaymentId);

    try {
        const repaymentDoc = await repaymentRef.get();
        if (!repaymentDoc.exists) {
            if(window.dashboard) window.dashboard.showNotification('Repayment not found.', 'danger');
            return;
        }
        const repaymentData = repaymentDoc.data();
        const amountToDelete = repaymentData.amount;

        // Find and delete the associated transaction
        const transactionsSnap = await db.collection('transactions')
            .where('userId', '==', user.uid)
            .where('loanId', '==', loanId)
            .where('category', '==', 'Loan Repayment')
            .where('amount', '==', amountToDelete)
            .where('date', '==', repaymentData.date)
            .limit(1)
            .get();

        const batch = db.batch();

        if (!transactionsSnap.empty) {
            batch.delete(transactionsSnap.docs[0].ref);
        }

        // Delete the repayment
        batch.delete(repaymentRef);

        // Update the loan's paid amount
        const loanRef = db.collection('loans').doc(loanId);
        const newPaidAmount = firebase.firestore.FieldValue.increment(-amountToDelete);
        batch.update(loanRef, { paidAmount: newPaidAmount });

        await batch.commit();
        
        if(window.dashboard) window.dashboard.showNotification('Repayment deleted successfully!', 'success');
        
        // Refresh views
        viewRepaymentHistory(loanId);
        const activeTab = document.querySelector('#loans-section .nav-link.active');
        const status = activeTab ? activeTab.textContent.toLowerCase() : 'active';
        loadLoansGrid(status);

    } catch (error) {
        console.error("Error deleting repayment:", error);
        if(window.dashboard) window.dashboard.showNotification('Error deleting repayment.', 'danger');
    }
};
