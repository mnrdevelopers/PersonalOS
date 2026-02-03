let currentLoanTypeFilter = 'all';
let currentLoanView = 'loans'; // 'loans' or 'cards'

const CREDIT_CARD_BANKS = [
  {"id": "hdfc", "name": "HDFC Bank"},
  {"id": "sbi", "name": "State Bank of India"},
  {"id": "icici", "name": "ICICI Bank"},
  {"id": "axis", "name": "Axis Bank"},
  {"id": "kotak", "name": "Kotak Mahindra Bank"},
  {"id": "indusind", "name": "IndusInd Bank"},
  {"id": "yes", "name": "Yes Bank"},
  {"id": "rbl", "name": "RBL Bank"},
  {"id": "idfc", "name": "IDFC First Bank"},
  {"id": "au", "name": "AU Small Finance Bank"},
  {"id": "utkarsh", "name": "Utkarsh Small Finance Bank"},
  {"id": "hsbc", "name": "HSBC Bank"},
  {"id": "standard_chartered", "name": "Standard Chartered Bank"},
  {"id": "citi", "name": "Citibank"},
  {"id": "american_express", "name": "American Express"},
  {"id": "bank_of_baroda", "name": "Bank of Baroda"},
  {"id": "pnb", "name": "Punjab National Bank"},
  {"id": "canara", "name": "Canara Bank"},
  {"id": "union", "name": "Union Bank of India"},
  {"id": "federal", "name": "Federal Bank"},
  {"id": "south_indian", "name": "South Indian Bank"},
  {"id": "idbi", "name": "IDBI Bank"},
  {"id": "bandhan", "name": "Bandhan Bank"},
  {"id": "onecard", "name": "OneCard (Federal/BOB/CSB)"},
  {"id": "csb", "name": "CSB Bank"},
  {"id": "slice", "name": "Slice"},
  {"id": "navi", "name": "Navi"},
  {"id": "uni", "name": "Uni Cards"}
];

window.loadLoansSection = async function() {
    const container = document.getElementById('loans-section');
    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold gradient-text mb-0">Loans & Credit Cards</h2>
            <div>
                <button class="btn btn-sm btn-outline-primary me-2" onclick="showAddCreditCardModal()">
                    <i class="fas fa-credit-card me-2"></i>Add Card
                </button>
                <button class="btn btn-sm btn-primary" onclick="showAddLoanModal()">
                    <i class="fas fa-plus me-2"></i>Add Loan
                </button>
            </div>
        </div>
        
        <!-- Stats Row -->
        <div class="row g-4 mb-5 animate-fade-in" id="loan-stats-container">
            <!-- Populated dynamically -->
        </div>

        <ul class="nav nav-pills mb-4 gap-2">
            <li class="nav-item">
                <a class="nav-link active" href="javascript:void(0)" onclick="switchLoanView('loans', this)">Loans & Debts</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="javascript:void(0)" onclick="switchLoanView('cards', this)">Credit Cards</a>
            </li>
        </ul>

        <!-- Loans View -->
        <div id="loans-view-container">
            <div class="d-flex justify-content-between mb-3 align-items-center">
                <ul class="nav nav-pills gap-2 small">
                    <li class="nav-item"><a class="nav-link active py-1 px-3" href="javascript:void(0)" onclick="filterLoans('active', this)">Active</a></li>
                    <li class="nav-item"><a class="nav-link py-1 px-3" href="javascript:void(0)" onclick="filterLoans('closed', this)">Closed</a></li>
                </ul>
                <select class="form-select form-select-sm w-auto" id="loan-type-filter" onchange="filterLoanType(this.value)">
                    <option value="all">All Types</option>
                    <option value="borrowed">Liabilities</option>
                    <option value="lent">Assets</option>
                    <option value="emi">EMIs</option>
                </select>
            </div>
            <div class="row g-4" id="loans-grid">
                <div class="col-12 text-center"><div class="spinner-border text-primary"></div></div>
            </div>
        </div>

        <!-- Credit Cards View -->
        <div id="cards-view-container" class="d-none">
            <div class="row g-4" id="cards-grid">
                <div class="col-12 text-center"><div class="spinner-border text-primary"></div></div>
            </div>
        </div>
        
        <!-- Add Loan Modal -->
        <div class="modal fade" id="addLoanModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
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
                                    <input type="number" class="form-control" id="loan-amount" step="0.01" min="0" required oninput="calculateEMIAmount()">
                                </div>
                            </div>
                            <div id="contact-fields" class="d-none bg-light p-3 rounded mb-3 border">
                                <div class="mb-3">
                                    <label class="form-label" id="label-contact-info">Borrower Mobile Number</label>
                                    <div class="input-group">
                                        <select class="form-select" id="loan-country-code" style="max-width: 110px;">
                                            <option value="91" selected>🇮🇳 +91</option>
                                            <option value="1">🇺🇸 +1</option>
                                            <option value="44">🇬🇧 +44</option>
                                            <option value="971">🇦🇪 +971</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <input type="text" class="form-control" id="loan-mobile" placeholder="Number / UPI ID">
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">UPI ID (for payments)</label>
                                    <input type="text" class="form-control" id="loan-upi-id" placeholder="e.g. username@bank">
                                </div>
                                <div class="mb-3 mb-0">
                                    <label class="form-label">Reminder Context (Message)</label>
                                    <input type="text" class="form-control" id="loan-message-context" placeholder="e.g. Tatkal, Hand Loan">
                                    <div class="form-text small">Used in WhatsApp: "Your [Context] payment..."</div>
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
                                    <label class="form-label" id="label-interest">Interest Rate (%)</label>
                                    <input type="number" class="form-control" id="loan-interest" step="0.1" min="0" placeholder="Optional">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">EMI Amount</label>
                                    <input type="number" class="form-control" id="loan-emi" step="0.01" min="0" placeholder="Optional">
                                </div>
                                <div class="col-md-6 mb-3 d-none" id="div-loan-duration">
                                    <label class="form-label">Duration (Months)</label>
                                    <input type="number" class="form-control" id="loan-duration" min="1" placeholder="Auto-calc EMI" oninput="calculateEMIAmount()">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Processing Fees</label>
                                    <input type="number" class="form-control" id="loan-processing-fee" step="0.01" min="0" placeholder="One-time charges">
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
                        <button type="button" class="btn btn-primary" id="btn-save-loan" onclick="saveLoan()">Save</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Repayment Modal -->
        <div class="modal fade" id="repaymentModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add Repayment</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="repayment-form">
                            <input type="hidden" id="repay-loan-id">
                            <div id="upi-pay-container" class="d-none mb-3">
                                <button type="button" class="btn btn-success w-100 py-2" onclick="triggerUpiPayment()">
                                    <i class="fas fa-mobile-alt me-2"></i> Pay via UPI
                                </button>
                                <div class="form-text text-center small mt-1">Opens UPI app with amount pre-filled</div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Amount</label>
                                <div class="input-group">
                                    <span class="input-group-text">₹</span>
                                    <input type="number" class="form-control" id="repay-amount" step="0.01" min="0" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Penalty / Bounce Charges</label>
                                <div class="input-group">
                                    <span class="input-group-text">₹</span>
                                    <input type="number" class="form-control" id="repay-penalty" step="0.01" min="0" value="0">
                                </div>
                                <div class="form-text small">Part of the amount above that is a penalty (doesn't reduce loan balance).</div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Processing Fees (if included)</label>
                                <div class="input-group">
                                    <span class="input-group-text">₹</span>
                                    <input type="number" class="form-control" id="repay-proc-fee" step="0.01" min="0" value="0">
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
                        <button type="button" class="btn btn-primary" id="btn-save-repayment" onclick="saveRepayment()">Save Repayment</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Repayment Modal -->
        <div class="modal fade" id="editRepaymentModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
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
                        <button type="button" class="btn btn-primary" id="btn-save-edit-repayment" onclick="saveChanges()">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Repayment History Modal -->
        <div class="modal fade" id="historyModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
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

        <!-- Add Credit Card Modal -->
        <div class="modal fade" id="addCreditCardModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add Credit Card</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="cc-form">
                            <input type="hidden" id="cc-id">
                            <div class="mb-3">
                                <label class="form-label">Card Name</label>
                                <input type="text" class="form-control" id="cc-name" placeholder="e.g. HDFC Regalia" required>
                            </div>
                            <div class="row">
                                <div class="col-6 mb-3">
                                    <label class="form-label">Bank Name</label>
                                    <select class="form-select" id="cc-bank">
                                        <option value="">Select Bank</option>
                                        ${CREDIT_CARD_BANKS.map(b => `<option value="${b.name}">${b.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="col-6 mb-3">
                                    <label class="form-label">Last 4 Digits</label>
                                    <input type="text" class="form-control" id="cc-last4" maxlength="4" placeholder="1234">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Total Credit Limit</label>
                                <div class="input-group">
                                    <span class="input-group-text">₹</span>
                                    <input type="number" class="form-control" id="cc-limit" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Current Outstanding</label>
                                <div class="input-group">
                                    <span class="input-group-text">₹</span>
                                    <input type="number" class="form-control" id="cc-outstanding" value="0">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-6 mb-3">
                                    <label class="form-label">Billing Day</label>
                                    <input type="number" class="form-control" id="cc-bill-day" min="1" max="31" placeholder="e.g. 15">
                                </div>
                                <div class="col-6 mb-3">
                                    <label class="form-label">Grace Period (Days)</label>
                                    <input type="number" class="form-control" id="cc-grace-days" value="20" placeholder="e.g. 20">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Card Color</label>
                                <input type="color" class="form-control form-control-color w-100" id="cc-color" value="#1f2937">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="btn-save-cc" onclick="saveCreditCard()">Save Card</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- CC Action Modal -->
        <div class="modal fade" id="ccActionModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="ccActionTitle">Card Action</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="action-cc-id">
                        <input type="hidden" id="action-type"> <!-- 'spend' or 'pay' -->
                        <div class="mb-3">
                            <label class="form-label">Amount</label>
                            <div class="input-group">
                                <span class="input-group-text">₹</span>
                                <input type="number" class="form-control" id="action-amount" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Date</label>
                            <input type="date" class="form-control" id="action-date" required>
                        </div>
                        <div class="mb-3" id="action-desc-div">
                            <label class="form-label">Description</label>
                            <input type="text" class="form-control" id="action-desc">
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="action-ledger" checked>
                            <label class="form-check-label">Record in Transaction Ledger</label>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="btn-save-cc-action" onclick="processCCAction()">Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    await loadLoansGrid('active');
};

window.switchLoanView = function(view, element) {
    currentLoanView = view;
    document.querySelectorAll('#loans-section > .nav-pills .nav-link').forEach(l => l.classList.remove('active'));
    element.classList.add('active');

    if (view === 'loans') {
        document.getElementById('loans-view-container').classList.remove('d-none');
        document.getElementById('cards-view-container').classList.add('d-none');
        loadLoansGrid('active');
    } else {
        document.getElementById('loans-view-container').classList.add('d-none');
        document.getElementById('cards-view-container').classList.remove('d-none');
        loadCreditCardsGrid();
    }
};

window.updateLoanModalUI = function(type) {
    const nameLabel = document.getElementById('label-loan-name');
    const ledgerCheck = document.getElementById('loan-link-ledger');
    const ledgerLabel = document.getElementById('label-link-ledger');
    const emiInput = document.getElementById('loan-emi');
    const contactFields = document.getElementById('contact-fields');
    const contactLabel = document.getElementById('label-contact-info');
    const durationDiv = document.getElementById('div-loan-duration');
    const interestLabel = document.getElementById('label-interest');
    
    if (type === 'emi') {
        if(nameLabel) nameLabel.textContent = 'Product Name / Financier';
        if(ledgerCheck) {
            ledgerCheck.checked = false;
            ledgerCheck.disabled = true;
        }
        if(ledgerLabel) ledgerLabel.textContent = 'Link to Ledger (Disabled for EMI creation)';
        if(emiInput) emiInput.placeholder = 'Required';
        if(contactFields) contactFields.classList.add('d-none');
        if(durationDiv) durationDiv.classList.remove('d-none');
        if(interestLabel) interestLabel.textContent = 'Down Payment (Optional)';
    } else {
        if(nameLabel) nameLabel.textContent = 'Person / Institution Name';
        if(ledgerCheck) {
            ledgerCheck.disabled = false;
            if (!document.getElementById('loan-id').value) ledgerCheck.checked = true;
        }
        if(ledgerLabel) ledgerLabel.textContent = 'Add record to Transaction Ledger';
        if(emiInput) emiInput.placeholder = 'Optional';
        if(durationDiv) durationDiv.classList.add('d-none');
        if(interestLabel) interestLabel.textContent = 'Interest Rate (%)';
        
        if (type === 'lent' || type === 'borrowed') {
            if(contactFields) contactFields.classList.remove('d-none');
            if(contactLabel) {
                contactLabel.textContent = type === 'lent' ? 'Borrower Mobile Number' : 'Lender Mobile Number';
            }
        } else {
            if(contactFields) contactFields.classList.add('d-none');
        }
    }
};

window.calculateEMIAmount = function() {
    const type = document.querySelector('input[name="loan-type"]:checked').value;
    if (type !== 'emi') return;

    const amount = parseFloat(document.getElementById('loan-amount').value) || 0;
    const months = parseFloat(document.getElementById('loan-duration').value) || 0;
    const emiInput = document.getElementById('loan-emi');

    if (amount > 0 && months > 0) {
        const emi = amount / months;
        emiInput.value = emi.toFixed(2);
    }
};

window.showAddLoanModal = function() {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addLoanModal'));
    document.getElementById('loan-form').reset();
    document.getElementById('loan-id').value = '';
    document.getElementById('loan-start-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('loan-mobile').value = '';
    document.getElementById('loan-country-code').value = '91';
    document.getElementById('loan-upi-id').value = '';
    document.getElementById('loan-message-context').value = '';
    document.getElementById('loan-duration').value = '';
    
    // Reset UI
    document.getElementById('type-borrowed').checked = true;
    updateLoanModalUI('borrowed');
    
    modal.show();
};

window.filterLoans = function(status, element) {
    document.querySelectorAll('#loans-view-container .nav-link').forEach(l => l.classList.remove('active'));
    element.classList.add('active');
    loadLoansGrid(status);
};

window.filterLoanType = function(type) {
    currentLoanTypeFilter = type;
    const activeTab = document.querySelector('#loans-view-container .nav-link.active');
    const status = activeTab ? activeTab.textContent.toLowerCase() : 'active';
    loadLoansGrid(status);
};

window.saveLoan = async function() {
    const btn = document.getElementById('btn-save-loan');
    const id = document.getElementById('loan-id').value;
    const type = document.querySelector('input[name="loan-type"]:checked').value;
    const name = document.getElementById('loan-name').value;
    const amount = parseFloat(document.getElementById('loan-amount').value);
    const startDate = document.getElementById('loan-start-date').value;
    const dueDate = document.getElementById('loan-due-date').value;
    const interest = parseFloat(document.getElementById('loan-interest').value) || 0;
    const emi = parseFloat(document.getElementById('loan-emi').value) || 0;
    const duration = parseInt(document.getElementById('loan-duration').value) || 0;
    const processingFee = parseFloat(document.getElementById('loan-processing-fee').value) || 0;
    const linkLedger = document.getElementById('loan-link-ledger').checked;
    const paymentMode = document.getElementById('loan-payment-mode').value;
    const countryCode = document.getElementById('loan-country-code').value;
    const mobileInput = document.getElementById('loan-mobile').value;
    const upiId = document.getElementById('loan-upi-id').value.trim();
    const messageContext = document.getElementById('loan-message-context').value;
    const user = auth.currentUser;

    if (!name || !amount || !startDate) {
        if(window.dashboard) window.dashboard.showNotification('Please fill in required fields', 'warning');
        return;
    }
    
    if (type === 'emi' && emi <= 0) {
        if(window.dashboard) window.dashboard.showNotification('Please enter EMI amount for Product EMI type', 'warning');
        return;
    }

    let fullMobile = '';
    if (mobileInput) {
        const cleanInput = mobileInput.trim(); // Don't strip non-digits yet as it might be a UPI ID (e.g. name@okicici)
        if (countryCode === 'other') {
            fullMobile = cleanInput;
        } else {
            // Prevent double code if user typed it
            fullMobile = cleanInput.startsWith(countryCode) ? cleanInput : (countryCode + cleanInput);
        }
    }

    try {
        window.setBtnLoading(btn, true);

        const loanDataToSave = {
            userId: user.uid,
            type, name, totalAmount: amount, 
            startDate, dueDate, interestRate: interest, emiAmount: emi,
            durationMonths: duration,
            processingFee: processingFee,
            totalPenalty: 0,
            mobile: fullMobile,
            messageContext: messageContext || '',
            upiId: upiId || '',
            status: 'active',
        };

        if (id) {
            // Update existing loan
            const updatePayload = { 
                name, 
                totalAmount: amount,
                startDate,
                dueDate, 
                interestRate: interest, 
                emiAmount: emi, 
                durationMonths: duration,
                processingFee: processingFee,
                type,
                mobile: fullMobile,
                upiId: upiId || '',
                messageContext: messageContext || ''
            };

            // If EMI, ensure initialDueDate is consistent with the new dueDate (which represents the NEXT due date)
            if (type === 'emi' || (type === 'borrowed' && emi > 0)) {
                const currentDoc = await db.collection('loans').doc(id).get();
                const currentData = currentDoc.data();
                const paidAmt = currentData.paidAmount || 0;
                const emiVal = emi > 0 ? emi : (currentData.emiAmount || 1);
                const installmentsPaid = Math.floor(paidAmt / emiVal);
                
                // Back-calculate initial due date from the user-provided NEXT due date
                const newInitial = new Date(dueDate);
                newInitial.setMonth(newInitial.getMonth() - installmentsPaid);
                updatePayload.initialDueDate = newInitial.toISOString().split('T')[0];
                updatePayload.dueDateUpdated = true;
            }

            await db.collection('loans').doc(id).update(updatePayload);

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
            loanDataToSave.paidAmount = 0;
            loanDataToSave.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            
            if (type === 'emi' || (type === 'borrowed' && emi > 0)) {
                loanDataToSave.initialDueDate = dueDate;
                loanDataToSave.dueDateUpdated = true;
            }
            
            const docRef = await db.collection('loans').add(loanDataToSave);
            const loanRef = docRef.id;

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

                // Add Processing Fee Transaction
                if (processingFee > 0) {
                    await db.collection('transactions').add({
                        userId: user.uid,
                        loanId: loanRef,
                        date: startDate,
                        amount: processingFee,
                        type: 'expense',
                        category: 'Loan Fees',
                        description: `Processing Fee: ${name}`,
                        paymentMode: paymentMode,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            }
        }
        
        window.setBtnLoading(btn, false);
        bootstrap.Modal.getOrCreateInstance(document.getElementById('addLoanModal')).hide();
        loadLoansGrid('active');
        if(window.dashboard) {
            window.dashboard.updateStats();
            window.dashboard.loadRecentTransactions();
            window.dashboard.updateFinanceChart();
            window.dashboard.showNotification('Loan saved successfully!', 'success');
        }
    } catch (error) {
        window.setBtnLoading(btn, false);
        console.error("Error saving loan:", error);
        if(window.dashboard) window.dashboard.showNotification('Error saving loan', 'danger');
    }
};

window.loadLoansGrid = async function(status = 'active') {
    const user = auth.currentUser;
    const snapshot = await db.collection('loans')
        .where('userId', '==', user.uid)
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .get();

    // Client-side filtering for type (since Firestore compound queries with != or multiple filters can be tricky without composite indexes)
    let docs = snapshot.docs;
    if (currentLoanTypeFilter !== 'all') {
        docs = docs.filter(doc => doc.data().type === currentLoanTypeFilter);
    }

    const container = document.getElementById('loans-grid');
    const statsContainer = document.getElementById('loan-stats-container');
    
    // Calculate Stats
    let totalBorrowed = 0;
    let totalLent = 0;
    let totalEmi = 0;

    docs.forEach(doc => {
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

    // Render Stats
    statsContainer.innerHTML = `
        <div class="col-6 col-md-3">
            <div class="stat-mini-card p-3 rounded-4 bg-white shadow-sm h-100 border-start border-4 border-danger">
                <div class="text-muted small mb-1 fw-medium">${status === 'active' ? 'Outstanding Debt' : 'Total Repaid Debt'}</div>
                <div class="d-flex align-items-center justify-content-between">
                    <h4 class="mb-0 fw-bold text-danger">₹${totalBorrowed.toFixed(0)}</h4>
                    <i class="fas fa-hand-holding-usd text-danger opacity-25 fa-2x"></i>
                </div>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="stat-mini-card p-3 rounded-4 bg-white shadow-sm h-100 border-start border-4 border-success">
                <div class="text-muted small mb-1 fw-medium">${status === 'active' ? 'Outstanding Assets' : 'Total Repaid Assets'}</div>
                <div class="d-flex align-items-center justify-content-between">
                    <h4 class="mb-0 fw-bold text-success">₹${totalLent.toFixed(0)}</h4>
                    <i class="fas fa-hand-holding-heart text-success opacity-25 fa-2x"></i>
                </div>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="stat-mini-card p-3 rounded-4 bg-white shadow-sm h-100 border-start border-4 border-primary">
                <div class="text-muted small mb-1 fw-medium">Net Position</div>
                <div class="d-flex align-items-center justify-content-between">
                    <h4 class="mb-0 fw-bold text-primary">₹${(totalLent - totalBorrowed).toFixed(0)}</h4>
                    <i class="fas fa-balance-scale text-primary opacity-25 fa-2x"></i>
                </div>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="stat-mini-card p-3 rounded-4 bg-white shadow-sm h-100 border-start border-4 border-warning">
                <div class="text-muted small mb-1 fw-medium">Monthly EMI</div>
                <div class="d-flex align-items-center justify-content-between">
                    <h4 class="mb-0 fw-bold text-warning">₹${totalEmi.toFixed(0)}</h4>
                    <i class="fas fa-calendar-check text-warning opacity-25 fa-2x"></i>
                </div>
            </div>
        </div>
    `;

    if (docs.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted py-5">No ${status} ${currentLoanTypeFilter !== 'all' ? currentLoanTypeFilter : ''} loans found.</div>`;
        return;
    }

    container.innerHTML = '';
    docs.forEach(doc => {
        const data = doc.data();
        const progress = Math.min(100, Math.round((data.paidAmount / data.totalAmount) * 100));
        let typeBadge = '<span class="badge bg-danger-subtle text-danger border border-danger-subtle">Liability</span>';
        let cardBorder = 'border-start border-4 border-danger';
        
        if (data.type === 'lent') {
            typeBadge = '<span class="badge bg-success-subtle text-success border border-success-subtle">Asset</span>';
            cardBorder = 'border-start border-4 border-success';
        } else if (data.type === 'emi') {
            typeBadge = '<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">EMI</span>';
            cardBorder = 'border-start border-4 border-warning';
        }
        
        const remainingAmount = data.totalAmount - data.paidAmount;
        const isFullyPaid = data.paidAmount >= data.totalAmount;
        
        // Calculate Next Due Date Logic
        let nextDueDateDisplay = 'No due date';
        let nextDueDateObj = null;

        if ((data.type === 'emi' || data.type === 'borrowed') && data.emiAmount > 0) {
            // For EMI: Start Date + (Paid Installments + 1) months
            const paidInstallments = Math.floor((data.paidAmount || 0) / data.emiAmount);
            const baseDate = data.dueDate ? new Date(data.dueDate) : new Date(data.startDate);
            
            // If dueDate is provided, that's the first EMI date. If not, assume 1 month after start.
            if (!data.dueDate) baseDate.setMonth(baseDate.getMonth() + 1);
            
            const nextDate = new Date(baseDate);
            nextDate.setMonth(baseDate.getMonth() + paidInstallments); // Add months for paid installments
            
            nextDueDateObj = nextDate;
            nextDueDateDisplay = nextDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
            if (data.dueDateUpdated && data.dueDate) {
                // If we are tracking updates, trust the DB field
                nextDueDateObj = new Date(data.dueDate);
                nextDueDateDisplay = nextDueDateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
            } else {
                // Legacy calculation for existing loans not yet migrated
                const paidInstallments = Math.floor((data.paidAmount || 0) / data.emiAmount);
                const baseDate = data.dueDate ? new Date(data.dueDate) : new Date(data.startDate);
                
                // If dueDate is provided, that's the first EMI date. If not, assume 1 month after start.
                if (!data.dueDate) baseDate.setMonth(baseDate.getMonth() + 1);
                
                const nextDate = new Date(baseDate);
                nextDate.setMonth(baseDate.getMonth() + paidInstallments); // Add months for paid installments
                
                nextDueDateObj = nextDate;
                nextDueDateDisplay = nextDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
            }
        } else if (data.dueDate) {
            // For standard loans
            nextDueDateObj = new Date(data.dueDate);
            nextDueDateDisplay = nextDueDateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
        }

        // Check if overdue
        let dateClass = 'text-muted';
        if (status === 'active' && nextDueDateObj && nextDueDateObj < new Date()) {
            dateClass = 'text-danger fw-bold';
            nextDueDateDisplay += ' (Overdue)';
        }

        let detailsHtml = '';
        if (data.emiAmount && data.emiAmount > 0) {
            const totalInstallments = Math.ceil(data.totalAmount / data.emiAmount);
            const paidInstallments = Math.floor((data.paidAmount || 0) / data.emiAmount);
            const remaining = Math.max(0, totalInstallments - paidInstallments);
            
            detailsHtml = `
                <div class="row g-2 mt-2 small">
                    <div class="col-6">
                        <div class="p-2 bg-light rounded">
                            <div class="text-muted" style="font-size: 0.75rem;">EMI Amount</div>
                            <div class="fw-bold">₹${data.emiAmount}</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-2 bg-light rounded">
                            <div class="text-muted" style="font-size: 0.75rem;">Installments</div>
                            <div class="fw-bold">${paidInstallments} / ${totalInstallments} <span class="text-muted fw-normal">(${remaining} left)</span></div>
                        </div>
                    </div>
                </div>
            `;
        } else {
             detailsHtml = `
                <div class="row g-2 mt-2 small">
                    <div class="col-6">
                        <div class="p-2 bg-light rounded">
                            <div class="text-muted" style="font-size: 0.75rem;">Interest Rate</div>
                            <div class="fw-bold">${data.interestRate ? data.interestRate + '%' : 'N/A'}</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-2 bg-light rounded">
                            <div class="text-muted" style="font-size: 0.75rem;">Start Date</div>
                            <div class="fw-bold">${new Date(data.startDate).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        let whatsappBtn = '';
        if (data.type === 'lent' && !isFullyPaid) {
            const safeName = (data.name || '').replace(/"/g, '&quot;');
            const safeMobile = (data.mobile || '').replace(/"/g, '&quot;');
            const safeContext = (data.messageContext || '').replace(/"/g, '&quot;');
            
            whatsappBtn = `
                <button class="btn btn-sm btn-success me-1" 
                    data-name="${safeName}" data-amount="${remainingAmount}" data-mobile="${safeMobile}" data-context="${safeContext}"
                    onclick="sendWhatsAppReminder('${doc.id}', this.getAttribute('data-name'), this.getAttribute('data-amount'), this.getAttribute('data-mobile'), this.getAttribute('data-context'))" 
                    title="Send WhatsApp Reminder">
                    <i class="fab fa-whatsapp"></i> Remind
                </button>`;
        }

        const col = document.createElement('div');
        col.className = 'col-md-6';
        col.innerHTML = `
            <div class="card h-100 border-0 shadow-sm rounded-4 animate-slide-up ${cardBorder}">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h5 class="card-title fw-bold mb-1">${data.name}</h5>
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
                    
                    <div class="d-flex justify-content-between align-items-end mb-3">
                        <div>
                            <small class="text-muted d-block">Outstanding</small>
                            <h3 class="mb-0 fw-bold text-primary">₹${remainingAmount.toFixed(2)}</h3>
                        </div>
                        <div class="text-end">
                            <small class="text-muted d-block">Total</small>
                            <span class="fw-medium">₹${data.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="progress mb-2" style="height: 6px;">
                        <div class="progress-bar bg-primary" role="progressbar" style="width: ${progress}%" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <div class="d-flex justify-content-between small text-muted mb-3">
                        <span>${progress}% Paid</span>
                        <span class="${dateClass}"><i class="far fa-clock me-1"></i> Due: ${nextDueDateDisplay}</span>
                    </div>
                    
                    ${detailsHtml}
                    
                    ${data.totalPenalty > 0 ? `
                    <div class="mt-2 small text-danger bg-danger bg-opacity-10 p-2 rounded">
                        <i class="fas fa-exclamation-circle me-1"></i> Total Penalties Paid: ₹${data.totalPenalty.toFixed(2)}
                    </div>` : ''}

                    ${!isFullyPaid ? `
                    <div class="mt-3 d-flex gap-2 justify-content-end">
                        ${whatsappBtn}
                        <button class="btn btn-sm btn-primary px-3" onclick="showRepaymentModal('${doc.id}')">
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
        document.getElementById('loan-duration').value = data.durationMonths || '';
        document.getElementById('loan-processing-fee').value = data.processingFee || '';
        
        // Handle Mobile Number Split
        const mobile = data.mobile || '';
        const codes = ['91', '1', '44', '971'];
        let selectedCode = 'other';
        let displayNum = mobile;
        for (const c of codes) {
            if (mobile.startsWith(c)) {
                selectedCode = c;
                displayNum = mobile.substring(c.length);
                break;
            }
        }
        document.getElementById('loan-country-code').value = selectedCode;
        document.getElementById('loan-mobile').value = displayNum;
        document.getElementById('loan-upi-id').value = data.upiId || '';
        
        document.getElementById('loan-message-context').value = data.messageContext || '';
        
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
            if(window.dashboard) window.dashboard.showLoading();
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

            const activeTab = document.querySelector('#loans-view-container .nav-link.active');
            const status = activeTab ? activeTab.textContent.toLowerCase() : 'active';
            loadLoansGrid(status);
            if(window.dashboard) window.dashboard.showNotification('Loan deleted successfully', 'success');
        } catch(e) {
            console.error(e);
            if(window.dashboard) window.dashboard.showNotification('Error deleting loan', 'danger');
        } finally {
            if(window.dashboard) window.dashboard.hideLoading();
        }
    }
};

window.showRepaymentModal = async function(loanId) {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('repaymentModal'));
    document.getElementById('repayment-form').reset();
    document.getElementById('repay-loan-id').value = loanId;
    document.getElementById('repay-date').value = new Date().toISOString().split('T')[0];
    
    // Check if we should show UPI button
    const upiContainer = document.getElementById('upi-pay-container');
    if (upiContainer) {
        upiContainer.classList.add('d-none'); // Hide by default
        try {
            const doc = await db.collection('loans').doc(loanId).get();
            if (doc.exists) {
                const data = doc.data();
                // Show if it's a liability (borrowed) and has contact info
                if (data.type === 'borrowed' && data.mobile) {
                    upiContainer.classList.remove('d-none');
                }
            }
        } catch (e) { console.error(e); }
    }
    
    modal.show();
};

window.saveRepayment = async function() {
    const btn = document.getElementById('btn-save-repayment');
    const loanId = document.getElementById('repay-loan-id').value;
    const amount = parseFloat(document.getElementById('repay-amount').value);
    const penalty = parseFloat(document.getElementById('repay-penalty').value) || 0;
    const processingFee = parseFloat(document.getElementById('repay-proc-fee').value) || 0;
    const date = document.getElementById('repay-date').value;
    const linkLedger = document.getElementById('repay-link-ledger').checked;
    const paymentMode = document.getElementById('repay-payment-mode').value;
    const user = auth.currentUser;

    if (!amount || !date) {
        if(window.dashboard) window.dashboard.showNotification('Please enter amount and date', 'warning');
        return;
    }

    try {
        window.setBtnLoading(btn, true);
        const loanDoc = await db.collection('loans').doc(loanId).get();
        const loanData = loanDoc.data();
        
        const effectiveAmount = amount - penalty - processingFee;
        const newPaidAmount = (loanData.paidAmount || 0) + effectiveAmount;
        const status = newPaidAmount >= loanData.totalAmount ? 'closed' : 'active';

        const updateData = {
            paidAmount: newPaidAmount,
            totalPenalty: (loanData.totalPenalty || 0) + penalty,
            status: status,
            lastPaymentDate: date
        };

        // Auto-update Due Date for EMIs
        if ((loanData.type === 'emi' || loanData.type === 'borrowed') && loanData.emiAmount > 0 && status === 'active') {
            // Determine the anchor date (First Due Date)
            let anchorDate;
            if (loanData.initialDueDate) {
                anchorDate = new Date(loanData.initialDueDate);
            } else {
                // First time migration: Assume current stored dueDate is the initial one (or calculate from start)
                // For safety, let's use the logic: StartDate + 1 month if dueDate missing, else dueDate.
                anchorDate = loanData.dueDate ? new Date(loanData.dueDate) : new Date(loanData.startDate);
                if (!loanData.dueDate) anchorDate.setMonth(anchorDate.getMonth() + 1);
                
                updateData.initialDueDate = anchorDate.toISOString().split('T')[0];
            }

            const paidInstallments = Math.floor(newPaidAmount / loanData.emiAmount);
            const nextDate = new Date(anchorDate);
            nextDate.setMonth(anchorDate.getMonth() + paidInstallments);
            
            updateData.dueDate = nextDate.toISOString().split('T')[0];
            updateData.dueDateUpdated = true; // Flag to tell grid to use this date directly
        }

        await db.collection('loans').doc(loanId).update(updateData);
        
        let transactionId = null;
        let penaltyTransactionId = null;
        let procFeeTransactionId = null;

        if (linkLedger) {
            const type = loanData.type === 'lent' ? 'income' : 'expense';
            const principalAmount = amount - penalty - processingFee;
            
            // 1. Record Principal Repayment
            if (principalAmount > 0) {
                const transactionRef = await db.collection('transactions').add({
                    userId: user.uid,
                    loanId: loanId,
                    date: date,
                    amount: principalAmount,
                    type: type,
                    category: 'Loan Repayment',
                    description: `Repayment: ${loanData.name}`,
                    paymentMode: paymentMode,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                transactionId = transactionRef.id;
            }

            // 2. Record Penalty Transaction
            if (penalty > 0) {
                const penaltyRef = await db.collection('transactions').add({
                    userId: user.uid,
                    loanId: loanId,
                    date: date,
                    amount: penalty,
                    type: type, // Income if lent, Expense if borrowed
                    category: 'Loan Penalty',
                    description: `Penalty/Charge: ${loanData.name}`,
                    paymentMode: paymentMode,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                penaltyTransactionId = penaltyRef.id;
            }

            // 3. Record Processing Fee Transaction
            if (processingFee > 0) {
                const pfRef = await db.collection('transactions').add({
                    userId: user.uid,
                    loanId: loanId,
                    date: date,
                    amount: processingFee,
                    type: 'expense',
                    category: 'Loan Fees',
                    description: `Processing Fee: ${loanData.name}`,
                    paymentMode: paymentMode,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                procFeeTransactionId = pfRef.id;
            }
        }

        // Always add to a subcollection for history tracking, linking transaction if created
        await db.collection('loans').doc(loanId).collection('repayments').add({
            userId: user.uid,
            amount: amount,
            penalty: penalty,
            processingFee: processingFee,
            date: date,
            transactionId: transactionId, // Will be null if not linked to ledger
            penaltyTransactionId: penaltyTransactionId,
            procFeeTransactionId: procFeeTransactionId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        window.setBtnLoading(btn, false);
        bootstrap.Modal.getOrCreateInstance(document.getElementById('repaymentModal')).hide();
        loadLoansGrid('active');
        if(window.dashboard) window.dashboard.showNotification('Repayment recorded!', 'success');
    } catch (error) {
        window.setBtnLoading(btn, false);
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
            let amountDisplay = `₹${data.amount.toFixed(2)}`;
            let details = [];
            if (data.penalty && data.penalty > 0) {
                details.push(`<span class="text-danger"><i class="fas fa-exclamation-circle me-1"></i>Penalty: ₹${data.penalty.toFixed(2)}</span>`);
            }
            if (data.processingFee && data.processingFee > 0) {
                details.push(`<span class="text-secondary"><i class="fas fa-file-invoice-dollar me-1"></i>Fee: ₹${data.processingFee.toFixed(2)}</span>`);
            }
            
            if (details.length > 0) {
                amountDisplay += `<div style="font-size: 0.7rem;">${details.join('<br>')}</div>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td class="align-middle">${new Date(data.date).toLocaleDateString()}</td>
                    <td class="align-middle">${amountDisplay}</td>
                    <td class="align-middle">
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

window.saveChanges = async function() {
    const btn = document.getElementById('btn-save-edit-repayment');
    const loanId = document.getElementById('edit-repay-loan-id').value;
    const repaymentId = document.getElementById('edit-repay-id').value;
    const newAmount = parseFloat(document.getElementById('edit-repay-amount').value);
    const newDate = document.getElementById('edit-repay-date').value;
    const user = auth.currentUser;

    if (!newAmount || !newDate) {
        if(window.dashboard) window.dashboard.showNotification('Please fill in all fields.', 'warning');
        return;
    }

    const repaymentRef = db.collection('loans').doc(loanId).collection('repayments').doc(repaymentId);

    try {
        window.setBtnLoading(btn, true);
        const repaymentDoc = await repaymentRef.get();
        if (!repaymentDoc.exists) {
            if(window.dashboard) window.dashboard.showNotification('Repayment not found.', 'danger');
            return;
        }
        const repaymentData = repaymentDoc.data();
        const originalAmount = repaymentData.amount;
        const transactionId = repaymentData.transactionId;

        const amountDifference = newAmount - originalAmount;

        const batch = db.batch();

        // If a transaction was linked, update it.
        if (transactionId) {
            const txRef = db.collection('transactions').doc(transactionId);
            batch.update(txRef, { amount: newAmount, date: newDate });
        } 

        // Update the repayment
        batch.update(repaymentRef, { amount: newAmount, date: newDate });

        // Update the loan's paid amount
        const loanRef = db.collection('loans').doc(loanId);
        const newPaidAmount = firebase.firestore.FieldValue.increment(amountDifference);
        batch.update(loanRef, { paidAmount: newPaidAmount });

        await batch.commit();

        window.setBtnLoading(btn, false);
        bootstrap.Modal.getOrCreateInstance(document.getElementById('editRepaymentModal')).hide();
        if(window.dashboard) window.dashboard.showNotification('Repayment updated successfully!', 'success');
        
        // Refresh views
        viewRepaymentHistory(loanId);
        const activeTab = document.querySelector('#loans-view-container .nav-link.active');
        const status = activeTab ? activeTab.textContent.toLowerCase() : 'active';
        loadLoansGrid(status);

    } catch (error) {
        window.setBtnLoading(btn, false);
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
        if(window.dashboard) window.dashboard.showLoading();
        const repaymentDoc = await repaymentRef.get();
        if (!repaymentDoc.exists) {
            if(window.dashboard) window.dashboard.showNotification('Repayment not found.', 'danger');
            return;
        }
        const repaymentData = repaymentDoc.data();
        const totalAmount = repaymentData.amount;
        const penalty = repaymentData.penalty || 0;
        const processingFee = repaymentData.processingFee || 0;
        const principal = totalAmount - penalty - processingFee;
        const transactionId = repaymentData.transactionId;
        const penaltyTransactionId = repaymentData.penaltyTransactionId;
        const procFeeTransactionId = repaymentData.procFeeTransactionId;

        const batch = db.batch();

        // If a transaction was linked, delete it.
        if (transactionId) {
            const txRef = db.collection('transactions').doc(transactionId);
            batch.delete(txRef);
        }
        
        // If a penalty transaction was linked, delete it.
        if (penaltyTransactionId) {
            const pTxRef = db.collection('transactions').doc(penaltyTransactionId);
            batch.delete(pTxRef);
        }

        // If a processing fee transaction was linked, delete it.
        if (procFeeTransactionId) {
            const pfTxRef = db.collection('transactions').doc(procFeeTransactionId);
            batch.delete(pfTxRef);
        }

        // Delete the repayment
        batch.delete(repaymentRef);

        // Update the loan's paid amount and total penalty
        const loanRef = db.collection('loans').doc(loanId);
        const updates = {
            paidAmount: firebase.firestore.FieldValue.increment(-principal)
        };
        if (penalty > 0) {
            updates.totalPenalty = firebase.firestore.FieldValue.increment(-penalty);
        }
        batch.update(loanRef, updates);

        await batch.commit();
        
        if(window.dashboard) window.dashboard.showNotification('Repayment deleted successfully!', 'success');
        
        // Refresh views
        viewRepaymentHistory(loanId);
        const activeTab = document.querySelector('#loans-view-container .nav-link.active');
        const status = activeTab ? activeTab.textContent.toLowerCase() : 'active';
        loadLoansGrid(status);

    } catch (error) {
        console.error("Error deleting repayment:", error);
        if(window.dashboard) window.dashboard.showNotification('Error deleting repayment.', 'danger');
    } finally {
        if(window.dashboard) window.dashboard.hideLoading();
    }
};

window.sendWhatsAppReminder = async function(id, name, amount, mobile, context) {
    try {
        let cleanMobile = '';
        let message = '';
        
        // Try synchronous path first (fixes iOS popup blocker)
        if (mobile && mobile !== 'null' && mobile !== 'undefined') {
            const remaining = parseFloat(amount);
            const msgContext = (context && context !== 'null' && context !== 'undefined') ? context : 'outstanding';
            
            message = `Hi ${name}, your ${msgContext} payment of ₹${remaining.toFixed(2)} is due. Please pay the amount at your earliest convenience. Thank you.`;
            cleanMobile = mobile.replace(/\D/g, '');
        } else {
            // Fallback to async fetch
            const doc = await db.collection('loans').doc(id).get();
            if (!doc.exists) return;
            const data = doc.data();
            
            const remaining = data.totalAmount - (data.paidAmount || 0);
            const msgContext = data.messageContext ? data.messageContext : 'outstanding';
            const dbMobile = data.mobile;
            
            if (!dbMobile) {
                if(window.dashboard) window.dashboard.showNotification('No mobile number saved for this loan.', 'warning');
                return;
            }
            message = `Hi ${data.name}, your ${msgContext} payment of ₹${remaining.toFixed(2)} is due. Please pay the amount at your earliest convenience. Thank you.`;
            cleanMobile = dbMobile.replace(/\D/g, '');
        }

        const encodedMsg = encodeURIComponent(message);
        
        // Use wa.me for better mobile compatibility (supports WhatsApp Business)
        window.open(`https://wa.me/${cleanMobile}?text=${encodedMsg}`, '_blank');
        
    } catch(e) {
        console.error("Error sending reminder:", e);
    }
};

window.triggerUpiPayment = async function() {
    const loanId = document.getElementById('repay-loan-id').value;
    const amount = document.getElementById('repay-amount').value;
    
    if (!amount || parseFloat(amount) <= 0) {
        if(window.dashboard) window.dashboard.showNotification('Please enter a valid amount first.', 'warning');
        return;
    }

    try {
        const doc = await db.collection('loans').doc(loanId).get();
        if (!doc.exists) return;
        const data = doc.data();
        
        let payeeAddress = data.upiId ? data.upiId.trim() : '';
        
        // Fallback to mobile if it looks like a VPA
        if (!payeeAddress && data.mobile) {
            const cleanMobile = data.mobile.replace(/\s+/g, '').replace(/-/g, '');
            if (cleanMobile.includes('@')) {
                payeeAddress = cleanMobile;
            }
        }
        
        if (!payeeAddress) {
            if(window.dashboard) window.dashboard.showNotification("A valid UPI ID is required for payment.", 'warning');
            return;
        }
        
        const payeeName = encodeURIComponent(data.name || 'Receiver');
        const note = encodeURIComponent(`Repayment`);
        const tr = 'T' + Date.now(); // Transaction Reference (Required by many apps)
        const formattedAmount = parseFloat(amount).toFixed(2);
        
        // Standard UPI Deep Link
        const upiUrl = `upi://pay?pa=${payeeAddress}&pn=${payeeName}&am=${formattedAmount}&cu=INR&tn=${note}&tr=${tr}`;
        
        window.location.href = upiUrl;
        
        setTimeout(() => {
            if(window.dashboard) window.dashboard.showNotification("Please click 'Save Repayment' once successful.", 'info');
        }, 1000);
        
    } catch (e) {
        console.error("Error triggering UPI:", e);
        if(window.dashboard) window.dashboard.showNotification("Could not trigger UPI app.", 'danger');
    }
};

// --- Credit Card Functions ---

window.loadCreditCardsGrid = async function() {
    const user = auth.currentUser;
    const container = document.getElementById('cards-grid');
    const statsContainer = document.getElementById('loan-stats-container');
    
    try {
        const snapshot = await db.collection('credit_cards')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();

        // Update Stats for Cards
        let totalLimit = 0;
        let totalOutstanding = 0;
        
        snapshot.forEach(doc => {
            const data = doc.data();
            totalLimit += (data.creditLimit || 0);
            totalOutstanding += (data.currentOutstanding || 0);
        });
        
        // Render Card Stats
        statsContainer.innerHTML = `
            <div class="col-6 col-md-4">
                <div class="stat-mini-card p-3 rounded-4 bg-white shadow-sm h-100 border-start border-4 border-primary">
                    <div class="text-muted small mb-1 fw-medium">Total Limit</div>
                    <h4 class="mb-0 fw-bold text-primary">₹${totalLimit.toFixed(0)}</h4>
                </div>
            </div>
            <div class="col-6 col-md-4">
                <div class="stat-mini-card p-3 rounded-4 bg-white shadow-sm h-100 border-start border-4 border-danger">
                    <div class="text-muted small mb-1 fw-medium">Total Outstanding</div>
                    <h4 class="mb-0 fw-bold text-danger">₹${totalOutstanding.toFixed(0)}</h4>
                </div>
            </div>
            <div class="col-12 col-md-4">
                <div class="stat-mini-card p-3 rounded-4 bg-white shadow-sm h-100 border-start border-4 border-success">
                    <div class="text-muted small mb-1 fw-medium">Available Credit</div>
                    <h4 class="mb-0 fw-bold text-success">₹${(totalLimit - totalOutstanding).toFixed(0)}</h4>
                </div>
            </div>
        `;

        if (snapshot.empty) {
            container.innerHTML = '<div class="col-12 text-center text-muted py-5">No credit cards added.</div>';
            return;
        }

        container.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const utilization = Math.min(100, Math.round((data.currentOutstanding / data.creditLimit) * 100));
            const available = data.creditLimit - data.currentOutstanding;
            const color = data.color || '#1f2937';
            
            // Calculate Due Date
            let dueDateText = 'N/A';
            if (data.billingDay && data.gracePeriod) {
                const today = new Date();
                const billDate = new Date();
                billDate.setDate(data.billingDay);
                
                // If billing day passed this month, due date is next month
                // This is a simple approximation
                if (today.getDate() > data.billingDay) {
                    billDate.setMonth(billDate.getMonth() + 1);
                }
                const dueDate = new Date(billDate);
                dueDate.setDate(dueDate.getDate() + parseInt(data.gracePeriod));
                dueDateText = dueDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
            }

            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4';
            col.innerHTML = `
                <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                    <div class="p-4 text-white position-relative" style="background: linear-gradient(135deg, ${color}, #000000);">
                        <div class="d-flex justify-content-between align-items-start mb-4">
                            <div>
                                <div class="small opacity-75 text-uppercase tracking-wide">${data.bank || 'Bank'}</div>
                                <h5 class="mb-0 fw-bold">${data.name}</h5>
                            </div>
                            <i class="fas fa-wifi opacity-50"></i>
                        </div>
                        <div class="mb-4 font-monospace fs-5">
                            **** **** **** ${data.last4 || 'XXXX'}
                        </div>
                        <div class="d-flex justify-content-between align-items-end">
                            <div>
                                <div class="small opacity-75">Outstanding</div>
                                <div class="fw-bold fs-5">₹${data.currentOutstanding.toFixed(2)}</div>
                            </div>
                            <div class="text-end">
                                <div class="small opacity-75">Limit</div>
                                <div class="fw-bold">₹${data.creditLimit.toFixed(0)}</div>
                            </div>
                        </div>
                        
                        <!-- Actions Dropdown -->
                        <div class="position-absolute top-0 end-0 p-3">
                            <div class="dropdown">
                                <button class="btn btn-link text-white p-0" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li><a class="dropdown-item" href="javascript:void(0)" onclick="editCreditCard('${doc.id}')">Edit</a></li>
                                    <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="deleteCreditCard('${doc.id}')">Delete</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-between small text-muted mb-1">
                            <span>Utilization: ${utilization}%</span>
                            <span>Available: ₹${available.toFixed(0)}</span>
                        </div>
                        <div class="progress mb-3" style="height: 6px;">
                            <div class="progress-bar ${utilization > 80 ? 'bg-danger' : (utilization > 30 ? 'bg-warning' : 'bg-success')}" 
                                 role="progressbar" style="width: ${utilization}%"></div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <small class="text-muted"><i class="far fa-calendar-alt me-1"></i> Due: ${dueDateText}</small>
                        </div>
                        <div class="d-grid gap-2 d-flex">
                            <button class="btn btn-sm btn-outline-danger flex-grow-1" onclick="showCCActionModal('${doc.id}', 'spend')">
                                <i class="fas fa-shopping-bag me-1"></i> Log Spend
                            </button>
                            <button class="btn btn-sm btn-outline-success flex-grow-1" onclick="showCCActionModal('${doc.id}', 'pay')">
                                <i class="fas fa-check-circle me-1"></i> Pay Bill
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });

    } catch (e) {
        console.error("Error loading credit cards:", e);
        container.innerHTML = '<div class="col-12 text-center text-danger">Error loading cards.</div>';
    }
};

window.showAddCreditCardModal = function() {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addCreditCardModal'));
    document.getElementById('cc-form').reset();
    document.getElementById('cc-id').value = '';
    document.getElementById('cc-color').value = '#1f2937';
    modal.show();
};

window.saveCreditCard = async function() {
    const btn = document.getElementById('btn-save-cc');
    const id = document.getElementById('cc-id').value;
    const name = document.getElementById('cc-name').value;
    const bank = document.getElementById('cc-bank').value;
    const last4 = document.getElementById('cc-last4').value;
    const limit = parseFloat(document.getElementById('cc-limit').value);
    const outstanding = parseFloat(document.getElementById('cc-outstanding').value) || 0;
    const billDay = parseInt(document.getElementById('cc-bill-day').value) || null;
    const gracePeriod = parseInt(document.getElementById('cc-grace-days').value) || 20;
    const color = document.getElementById('cc-color').value;
    const user = auth.currentUser;

    if (!name || !limit) {
        if(window.dashboard) window.dashboard.showNotification('Please fill required fields', 'warning');
        return;
    }

    try {
        window.setBtnLoading(btn, true);
        const data = {
            userId: user.uid,
            name, bank, last4, 
            creditLimit: limit, 
            currentOutstanding: outstanding,
            billingDay: billDay,
            gracePeriod,
            color
        };

        if (id) {
            data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('credit_cards').doc(id).update(data);
        } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('credit_cards').add(data);
        }

        window.setBtnLoading(btn, false);
        bootstrap.Modal.getInstance(document.getElementById('addCreditCardModal')).hide();
        loadCreditCardsGrid();
        if(window.dashboard) window.dashboard.showNotification(id ? 'Card updated' : 'Card added', 'success');
    } catch (e) {
        window.setBtnLoading(btn, false);
        console.error(e);
        if(window.dashboard) window.dashboard.showNotification('Error saving card', 'danger');
    }
};

window.editCreditCard = async function(id) {
    try {
        const doc = await db.collection('credit_cards').doc(id).get();
        if (!doc.exists) return;
        const data = doc.data();
        
        document.getElementById('cc-id').value = id;
        document.getElementById('cc-name').value = data.name;
        document.getElementById('cc-bank').value = data.bank || '';
        document.getElementById('cc-last4').value = data.last4 || '';
        document.getElementById('cc-limit').value = data.creditLimit;
        document.getElementById('cc-outstanding').value = data.currentOutstanding;
        document.getElementById('cc-bill-day').value = data.billingDay || '';
        document.getElementById('cc-grace-days').value = data.gracePeriod || 20;
        document.getElementById('cc-color').value = data.color || '#1f2937';
        
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addCreditCardModal'));
        modal.show();
    } catch (e) { console.error(e); }
};

window.deleteCreditCard = async function(id) {
    if (!confirm('Delete this credit card?')) return;
    try {
        await db.collection('credit_cards').doc(id).delete();
        loadCreditCardsGrid();
        if(window.dashboard) window.dashboard.showNotification('Card deleted', 'success');
    } catch (e) { console.error(e); }
};

window.showCCActionModal = function(id, type) {
    document.getElementById('action-cc-id').value = id;
    document.getElementById('action-type').value = type;
    document.getElementById('action-amount').value = '';
    document.getElementById('action-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('action-desc').value = type === 'spend' ? 'Purchase' : 'Bill Payment';
    document.getElementById('ccActionTitle').textContent = type === 'spend' ? 'Log Spend' : 'Record Payment';
    
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('ccActionModal'));
    modal.show();
};

window.processCCAction = async function() {
    const btn = document.getElementById('btn-save-cc-action');
    const id = document.getElementById('action-cc-id').value;
    const type = document.getElementById('action-type').value;
    const amount = parseFloat(document.getElementById('action-amount').value);
    const date = document.getElementById('action-date').value;
    const desc = document.getElementById('action-desc').value;
    const recordLedger = document.getElementById('action-ledger').checked;
    const user = auth.currentUser;

    if (!amount || amount <= 0) return;

    try {
        window.setBtnLoading(btn, true);
        const batch = db.batch();
        const cardRef = db.collection('credit_cards').doc(id);
        
        // Update Outstanding
        const change = type === 'spend' ? amount : -amount;
        batch.update(cardRef, {
            currentOutstanding: firebase.firestore.FieldValue.increment(change),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Add to Ledger
        if (recordLedger) {
            const cardDoc = await cardRef.get();
            const cardName = cardDoc.data().name;
            
            const txRef = db.collection('transactions').doc();
            batch.set(txRef, {
                userId: user.uid,
                date: date,
                amount: amount,
                type: 'expense', // Both spend and payment are outflows usually. 
                                 // Spend = Expense (Category: Shopping etc). Payment = Transfer/Expense (Category: Bill Payment).
                                 // For simplicity, let's mark Spend as Expense. 
                                 // Payment is tricky: It's money leaving bank to pay debt. So also Expense in cash flow terms.
                category: type === 'spend' ? 'Shopping' : 'Credit Card Bill',
                description: `${type === 'spend' ? 'CC Spend' : 'Bill Pay'}: ${cardName} - ${desc}`,
                paymentMode: type === 'spend' ? 'credit-card' : 'bank', // Spend is via CC. Payment is via Bank.
                relatedId: id,
                section: 'credit_cards',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        await batch.commit();
        
        window.setBtnLoading(btn, false);
        bootstrap.Modal.getInstance(document.getElementById('ccActionModal')).hide();
        loadCreditCardsGrid();
        if(window.dashboard) {
            window.dashboard.showNotification('Action recorded', 'success');
            window.dashboard.updateStats();
        }
    } catch (e) {
        window.setBtnLoading(btn, false);
        console.error(e);
        if(window.dashboard) window.dashboard.showNotification('Error processing action', 'danger');
    }
};
