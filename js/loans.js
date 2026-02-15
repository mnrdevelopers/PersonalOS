let currentLoanTypeFilter = 'all';
let currentLoanView = 'loans'; // 'loans', 'cards', 'investments', or 'wallets'

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

const METALPRICE_API_KEY = 'goldapi-1tsml7nm4zv-io'; // Enter your API Key here from goldapi.io

window.loadLoansSection = async function() {
    const container = document.getElementById('loans-section');
    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold gradient-text mb-0">Finance</h2>
        </div>
        
        <!-- Tabs -->
        <ul class="nav nav-pills mb-4 gap-2 p-1 bg-light rounded-pill d-inline-flex">
            <li class="nav-item">
                <a class="nav-link active rounded-pill" href="javascript:void(0)" onclick="switchLoanView('loans', this)">Loans & Debts</a>
            </li>
            <li class="nav-item">
                <a class="nav-link rounded-pill" href="javascript:void(0)" onclick="switchLoanView('investments', this)">Investments</a>
            </li>
            <li class="nav-item">
                <a class="nav-link rounded-pill" href="javascript:void(0)" onclick="switchLoanView('wallets', this)">Wallets</a>
            </li>
            <li class="nav-item">
                <a class="nav-link rounded-pill" href="javascript:void(0)" onclick="switchLoanView('cards', this)">Credit Cards</a>
            </li>
        </ul>

        <!-- Dynamic Toolbar -->
        <div id="finance-toolbar" class="d-flex justify-content-end gap-2 mb-4">
            <!-- Buttons will be injected here based on active tab -->
        </div>

        <!-- Stats Row -->
        <div class="row g-4 mb-4 animate-fade-in" id="loan-stats-container">
            <!-- Populated dynamically -->
        </div>

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

        <!-- Investments View -->
        <div id="investments-view-container" class="d-none">
            <div class="row g-4" id="investments-grid">
                <div class="col-12 text-center"><div class="spinner-border text-primary"></div></div>
            </div>
        </div>

        <!-- Credit Cards View -->
        <div id="cards-view-container" class="d-none">
            <div class="row g-4" id="cards-grid">
                <div class="col-12 text-center"><div class="spinner-border text-primary"></div></div>
            </div>
        </div>

        <!-- Wallets View -->
        <div id="wallets-view-container" class="d-none">
            <div class="row g-4" id="wallets-grid">
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
                                    <option value="wallet">Wallet</option>
                                    <option value="debit-card">Debit Card</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="mb-3 d-none" id="div-loan-cc">
                                <label class="form-label">Select Credit Card</label>
                                <select class="form-select" id="loan-credit-card">
                                    <option value="">Select Card</option>
                                    <!-- Populated via JS -->
                                </select>
                                <div class="form-text small">Amount will be added to card outstanding.</div>
                            </div>
                            <div class="mb-3 d-none" id="div-loan-wallet">
                                <label class="form-label">Select Wallet</label>
                                <select class="form-select" id="loan-wallet">
                                    <option value="">Select Wallet</option>
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
                                    <option value="wallet">Wallet</option>
                                    <option value="debit-card">Debit Card</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="mb-3 d-none" id="div-repay-cc">
                                <label class="form-label">Select Credit Card</label>
                                <select class="form-select" id="repay-credit-card">
                                    <option value="">Select Card</option>
                                    <!-- Populated via JS -->
                                </select>
                                <div class="form-text small">Amount will be added to card outstanding.</div>
                            </div>
                            <div class="mb-3 d-none" id="div-repay-wallet">
                                <label class="form-label">Select Wallet</label>
                                <select class="form-select" id="repay-wallet">
                                    <option value="">Select Wallet</option>
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
                            <div class="mb-3 d-none" id="div-action-source">
                                <label class="form-label">Payment Source</label>
                                <select class="form-select" id="action-payment-mode" onchange="toggleLoanPaymentFields('action')">
                                    <option value="bank">Bank Transfer</option>
                                    <option value="upi">UPI</option>
                                    <option value="wallet">Wallet</option>
                                    <option value="cash">Cash</option>
                                </select>
                            </div>
                            <div class="mb-3 d-none" id="div-action-wallet">
                                <label class="form-label">Select Wallet</label>
                                <select class="form-select" id="action-wallet">
                                    <option value="">Select Wallet</option>
                                </select>
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

        <!-- Credit Card History Modal -->
        <div class="modal fade" id="ccHistoryModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Card History</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="table-responsive">
                            <table class="table table-sm align-middle">
                                <thead><tr><th>Date</th><th>Description</th><th class="text-end">Amount</th><th></th></tr></thead>
                                <tbody id="cc-history-body"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Investment Modal -->
        <div class="modal fade" id="addInvestmentModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add Investment</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="investment-form">
                            <input type="hidden" id="inv-id">
                            <div class="mb-3">
                                <label class="form-label">Investment Type</label>
                                <select class="form-select" id="inv-type" onchange="toggleInvestmentFields()">
                                    <option value="mutual_fund">Mutual Fund / SIP</option>
                                    <option value="stock">Stock / Equity</option>
                                    <option value="gold">Gold</option>
                                    <option value="silver">Silver</option>
                                    <option value="fd">Fixed Deposit</option>
                                    <option value="real_estate">Real Estate</option>
                                    <option value="crypto">Crypto</option>
                                    <option value="other">Other Asset</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Name / Description</label>
                                <input type="text" class="form-control" id="inv-name" placeholder="e.g. HDFC Top 100, Gold Ring, Bitcoin" required>
                            </div>
                            <div class="row">
                                <div class="col-6 mb-3">
                                    <label class="form-label">Invested Amount</label>
                                    <input type="number" class="form-control" id="inv-amount" step="0.01" required>
                                </div>
                                <div class="col-6 mb-3">
                                    <label class="form-label">Current Value</label>
                                    <div class="input-group">
                                        <input type="number" class="form-control" id="inv-current-value" step="0.01" placeholder="Optional">
                                        <button class="btn btn-outline-secondary" type="button" id="btn-fetch-price" onclick="fetchLiveMetalPrice()" style="display:none;" title="Fetch Live Price">
                                            <i class="fas fa-sync-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="row" id="inv-qty-row">
                                <div class="col-6 mb-3">
                                    <label class="form-label" id="inv-qty-label">Quantity (Units/Grams)</label>
                                    <input type="number" class="form-control" id="inv-quantity" step="0.001">
                                </div>
                            </div>
                            <div class="mb-3 bg-light p-3 rounded border">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="inv-is-sip" onchange="toggleSipFields()">
                                    <label class="form-check-label fw-bold" for="inv-is-sip">This is a SIP (Systematic Plan)</label>
                                </div>
                                <div id="inv-sip-fields" class="mt-3 d-none">
                                    <div class="row">
                                        <div class="col-6 mb-2">
                                            <label class="form-label small">Frequency</label>
                                            <select class="form-select form-select-sm" id="inv-sip-freq">
                                                <option value="monthly">Monthly</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="daily">Daily</option>
                                            </select>
                                        </div>
                                        <div class="col-6 mb-2">
                                            <label class="form-label small">SIP Amount</label>
                                            <input type="number" class="form-control form-control-sm" id="inv-sip-amount">
                                        </div>
                                        <div class="col-12">
                                            <label class="form-label small">Next Due Date</label>
                                            <input type="date" class="form-control form-control-sm" id="inv-sip-date">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr>
                            <div class="form-check form-switch mb-3">
                                <input class="form-check-input" type="checkbox" id="inv-link-ledger" checked>
                                <label class="form-check-label" for="inv-link-ledger">Add to Transaction Ledger</label>
                            </div>
                            <div id="inv-ledger-fields">
                                <div class="mb-3">
                                    <label class="form-label">Payment Mode</label>
                                    <select class="form-select" id="inv-payment-mode" onchange="toggleLoanCCField('inv')">
                                        <option value="bank">Bank Transfer</option>
                                        <option value="upi">UPI</option>
                                        <option value="credit-card">Credit Card</option>
                                        <option value="cash">Cash</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div class="mb-3 d-none" id="div-inv-cc">
                                    <label class="form-label">Select Credit Card</label>
                                    <select class="form-select" id="inv-credit-card">
                                        <option value="">Select Card</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Notes</label>
                                <textarea class="form-control" id="inv-notes" rows="2"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="btn-save-inv" onclick="saveInvestment()">Save Investment</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Amortization Calculator Modal -->
        <div class="modal fade" id="amortizationModal" tabindex="-1">
            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-calculator me-2"></i>Loan Amortization Calculator</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row g-3 mb-4">
                            <div class="col-md-4">
                                <label class="form-label">Loan Amount</label>
                                <div class="input-group">
                                    <span class="input-group-text">₹</span>
                                    <input type="number" class="form-control" id="calc-amount" placeholder="e.g. 500000">
                                </div>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Interest Rate (% p.a)</label>
                                <input type="number" class="form-control" id="calc-rate" placeholder="e.g. 10.5" step="0.1">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Tenure</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" id="calc-tenure" placeholder="e.g. 5">
                                    <select class="form-select" id="calc-tenure-type" style="max-width: 100px;">
                                        <option value="years">Years</option>
                                        <option value="months">Months</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-12 text-end">
                                <button class="btn btn-primary px-4" onclick="calculateAmortization()">Calculate</button>
                            </div>
                        </div>

                        <div id="calc-results" class="d-none">
                            <div class="row g-3 mb-4">
                                <div class="col-md-4">
                                    <div class="p-3 bg-light rounded text-center border">
                                        <div class="text-muted small text-uppercase fw-bold">Monthly EMI</div>
                                        <h3 class="mb-0 text-primary fw-bold" id="calc-result-emi">₹0</h3>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="p-3 bg-light rounded text-center border">
                                        <div class="text-muted small text-uppercase fw-bold">Total Interest</div>
                                        <h3 class="mb-0 text-danger fw-bold" id="calc-result-interest">₹0</h3>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="p-3 bg-light rounded text-center border">
                                        <div class="text-muted small text-uppercase fw-bold">Total Payment</div>
                                        <h3 class="mb-0 text-dark fw-bold" id="calc-result-total">₹0</h3>
                                    </div>
                                </div>
                            </div>

                            <h6 class="fw-bold mb-3">Amortization Schedule</h6>
                            <div class="table-responsive" style="max-height: 300px;">
                                <table class="table table-sm table-striped table-hover small">
                                    <thead class="table-light sticky-top">
                                        <tr>
                                            <th>Month</th>
                                            <th>Principal Paid</th>
                                            <th>Interest Paid</th>
                                            <th>Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody id="calc-schedule-body"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Wallet Modal -->
        <div class="modal fade" id="addWalletModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add Wallet</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="wallet-form">
                            <input type="hidden" id="wallet-id">
                            <div class="mb-3">
                                <label class="form-label">Wallet Name</label>
                                <input type="text" class="form-control" id="wallet-name" placeholder="e.g. Paytm, IRCTC" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Current Balance</label>
                                <div class="input-group">
                                    <span class="input-group-text">₹</span>
                                    <input type="number" class="form-control" id="wallet-balance" step="0.01" required>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="btn-save-wallet" onclick="saveWallet()">Save Wallet</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Transfer Wallet Modal -->
        <div class="modal fade" id="transferWalletModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Transfer Money</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="transfer-form">
                            <div class="mb-3">
                                <label class="form-label">Transfer Type</label>
                                <select class="form-select" id="transfer-type" onchange="toggleTransferType()">
                                    <option value="bank_to_wallet">Bank to Wallet</option>
                                    <option value="wallet_to_wallet">Wallet to Wallet</option>
                                </select>
                            </div>
                            <div class="mb-3 d-none" id="div-source-wallet">
                                <label class="form-label">From Wallet</label>
                                <select class="form-select" id="transfer-source-wallet">
                                    <option value="">Select Source Wallet</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label" id="label-dest-wallet">To Wallet</label>
                                <select class="form-select" id="transfer-dest-wallet">
                                    <option value="">Select Destination Wallet</option>
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
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="transfer-ledger" checked>
                                <label class="form-check-label">Record in Ledger</label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="btn-save-transfer" onclick="saveWalletTransfer()">Transfer</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Withdraw Investment Modal -->
        <div class="modal fade" id="withdrawInvestmentModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Withdraw Investment</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="withdraw-form">
                            <input type="hidden" id="withdraw-id">
                            <div class="mb-3">
                                <label class="form-label">Withdrawal Amount</label>
                                <div class="input-group">
                                    <span class="input-group-text">₹</span>
                                    <input type="number" class="form-control" id="withdraw-amount" step="0.01" required>
                                </div>
                            </div>
                            <div class="mb-3" id="div-withdraw-qty">
                                <label class="form-label">Quantity Sold (Optional)</label>
                                <input type="number" class="form-control" id="withdraw-quantity" step="0.001">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Date</label>
                                <input type="date" class="form-control" id="withdraw-date" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Deposit To</label>
                                <select class="form-select" id="withdraw-to" onchange="toggleWithdrawalFields()">
                                    <option value="bank">Bank Account</option>
                                    <option value="wallet">Wallet</option>
                                    <option value="cash">Cash</option>
                                </select>
                            </div>
                            <div class="mb-3 d-none" id="div-withdraw-wallet">
                                <label class="form-label">Select Wallet</label>
                                <select class="form-select" id="withdraw-wallet">
                                    <option value="">Select Wallet</option>
                                </select>
                            </div>
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="withdraw-close">
                                <label class="form-check-label" for="withdraw-close">
                                    Close/Delete this investment (Fully withdrawn)
                                </label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="btn-save-withdraw" onclick="saveWithdrawal()">Confirm Withdrawal</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Deposit Investment Modal -->
        <div class="modal fade" id="depositInvestmentModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Deposit / Add Funds</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="deposit-form">
                            <input type="hidden" id="deposit-id">
                            <div class="mb-3">
                                <label class="form-label">Amount to Invest</label>
                                <div class="input-group">
                                    <span class="input-group-text">₹</span>
                                    <input type="number" class="form-control" id="deposit-amount" step="0.01" required>
                                </div>
                            </div>
                            <div class="mb-3" id="div-deposit-qty">
                                <label class="form-label">Quantity / Units (Optional)</label>
                                <input type="number" class="form-control" id="deposit-quantity" step="0.001">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Date</label>
                                <input type="date" class="form-control" id="deposit-date" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Payment Mode</label>
                                <select class="form-select" id="deposit-payment-mode" onchange="toggleDepositFields()">
                                    <option value="bank">Bank Transfer</option>
                                    <option value="upi">UPI</option>
                                    <option value="wallet">Wallet</option>
                                    <option value="credit-card">Credit Card</option>
                                    <option value="cash">Cash</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="mb-3 d-none" id="div-deposit-wallet">
                                <label class="form-label">Select Wallet</label>
                                <select class="form-select" id="deposit-wallet">
                                    <option value="">Select Wallet</option>
                                </select>
                            </div>
                            <div class="mb-3 d-none" id="div-deposit-credit-card">
                                <label class="form-label">Select Credit Card</label>
                                <select class="form-select" id="deposit-credit-card">
                                    <option value="">Select Card</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" id="btn-save-deposit" onclick="saveDeposit()">Confirm Deposit</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize default tab state immediately so toolbar actions are available
    // without waiting for data reads.
    const defaultLoanTab = document.querySelector('#loans-section > .nav-pills .nav-link');
    switchLoanView('loans', defaultLoanTab);
};

window.switchLoanView = function(view, element) {
    currentLoanView = view;
    if(element) {
        document.querySelectorAll('#loans-section > .nav-pills .nav-link').forEach(l => l.classList.remove('active'));
        element.classList.add('active');
    }

    // Update Toolbar Buttons
    const toolbar = document.getElementById('finance-toolbar');
    if(toolbar) {
        let buttons = '';
        if (view === 'loans') {
            buttons = `
                <button class="btn btn-sm btn-outline-secondary" onclick="showAmortizationCalculator()">
                    <i class="fas fa-calculator me-2"></i>EMI Calc
                </button>
                <button class="btn btn-sm btn-primary" onclick="showAddLoanModal()">
                    <i class="fas fa-plus me-2"></i>Add Loan
                </button>
            `;
        } else if (view === 'investments') {
            buttons = `
                <button class="btn btn-sm btn-outline-warning" onclick="updateAllMetalPrices()" id="btn-update-metals">
                    <i class="fas fa-sync-alt me-1"></i>Update Prices
                </button>
                <button class="btn btn-sm btn-success" onclick="showAddInvestmentModal()">
                    <i class="fas fa-chart-line me-2"></i>Add Investment
                </button>
            `;
        } else if (view === 'wallets') {
            buttons = `
                <button class="btn btn-sm btn-outline-secondary" onclick="showTransferWalletModal()">
                    <i class="fas fa-exchange-alt me-2"></i>Transfer
                </button>
                <button class="btn btn-sm btn-info text-white" onclick="showAddWalletModal()">
                    <i class="fas fa-wallet me-2"></i>Add Wallet
                </button>
            `;
        } else if (view === 'cards') {
            buttons = `
                <button class="btn btn-sm btn-primary" onclick="showAddCreditCardModal()">
                    <i class="fas fa-credit-card me-2"></i>Add Card
                </button>
            `;
        }
        toolbar.innerHTML = buttons;
    }

    // Toggle Views
    if (view === 'loans') {
        document.getElementById('loans-view-container').classList.remove('d-none');
        document.getElementById('investments-view-container').classList.add('d-none');
        document.getElementById('cards-view-container').classList.add('d-none');
        document.getElementById('wallets-view-container').classList.add('d-none');
        loadLoansGrid('active');
    } else if (view === 'investments') {
        document.getElementById('loans-view-container').classList.add('d-none');
        document.getElementById('investments-view-container').classList.remove('d-none');
        document.getElementById('cards-view-container').classList.add('d-none');
        document.getElementById('wallets-view-container').classList.add('d-none');
        loadInvestmentsGrid();
    } else if (view === 'cards') {
        document.getElementById('loans-view-container').classList.add('d-none');
        document.getElementById('investments-view-container').classList.add('d-none');
        document.getElementById('cards-view-container').classList.remove('d-none');
        document.getElementById('wallets-view-container').classList.add('d-none');
        loadCreditCardsGrid();
    } else {
        document.getElementById('loans-view-container').classList.add('d-none');
        document.getElementById('investments-view-container').classList.add('d-none');
        document.getElementById('cards-view-container').classList.add('d-none');
        document.getElementById('wallets-view-container').classList.remove('d-none');
        loadWalletsGrid();
    }
};

window.populateLoanPaymentSelects = async function() {
    const user = auth.currentUser;
    const ccSnapshot = await db.collection('credit_cards').where('userId', '==', user.uid).get();
    const walletSnapshot = await db.collection('wallets').where('userId', '==', user.uid).get();
    
    const ccOptions = '<option value="">Select Card</option>' + 
        ccSnapshot.docs.map(doc => `<option value="${doc.id}">${doc.data().name} (..${doc.data().last4 || ''})</option>`).join('');
    
    const walletOptions = '<option value="">Select Wallet</option>' + 
        walletSnapshot.docs.map(doc => `<option value="${doc.id}">${doc.data().name} (₹${doc.data().balance})</option>`).join('');
    
    ['loan', 'repay', 'inv', 'withdraw', 'deposit', 'action'].forEach(type => {
        const ccEl = document.getElementById(`${type}-credit-card`);
        if(ccEl) ccEl.innerHTML = ccOptions;
        
        const walletEl = document.getElementById(`${type}-wallet`);
        if(walletEl) walletEl.innerHTML = walletOptions;
    });
};

window.toggleLoanPaymentFields = function(type) {
    const mode = document.getElementById(`${type}-payment-mode`).value;
    const ccDiv = document.getElementById(`div-${type}-cc`);
    const walletDiv = document.getElementById(`div-${type}-wallet`);
    
    if (ccDiv) ccDiv.classList.add('d-none');
    if (walletDiv) walletDiv.classList.add('d-none');

    if (mode === 'credit-card') {
        if (ccDiv) ccDiv.classList.remove('d-none');
        window.populateLoanPaymentSelects();
    } else if (mode === 'wallet') {
        if (walletDiv) walletDiv.classList.remove('d-none');
        window.populateLoanPaymentSelects();
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

window.resetLoanForm = function() {
    document.getElementById('loan-form').reset();
    document.getElementById('loan-id').value = '';
    document.getElementById('loan-start-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('loan-mobile').value = '';
    document.getElementById('loan-country-code').value = '91';
    document.getElementById('loan-upi-id').value = '';
    document.getElementById('loan-message-context').value = '';
    document.getElementById('loan-duration').value = '';

    // Reset payment mode and dependent fields
    document.getElementById('loan-payment-mode').value = 'bank';
    document.getElementById('loan-payment-mode').onchange = () => toggleLoanPaymentFields('loan');
    toggleLoanPaymentFields('loan');

    // Default to borrowed UI for fresh form
    document.getElementById('type-borrowed').checked = true;
    updateLoanModalUI('borrowed');
};

window.showAddLoanModal = function() {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addLoanModal'));
    window.resetLoanForm();
    
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

function normalizeLoanAccountName(name) {
    return (name || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}

async function findMatchingActiveLoanAccount(userId, type, name) {
    if (!userId || !name || (type !== 'lent' && type !== 'borrowed')) return null;

    const snapshot = await db.collection('loans')
        .where('userId', '==', userId)
        .where('type', '==', type)
        .where('status', '==', 'active')
        .get();

    const normalizedTarget = normalizeLoanAccountName(name);
    const match = snapshot.docs.find(doc => {
        const data = doc.data();
        return normalizeLoanAccountName(data.name) === normalizedTarget;
    });

    return match || null;
}

function buildLoanStatusPayload(loanData, newPaidAmount, paymentDate = '') {
    const clampedPaid = Math.max(0, newPaidAmount || 0);
    const totalAmount = Number(loanData.totalAmount) || 0;
    // Khata-style running accounts: keep lent/borrowed entries active even at zero due.
    const isRunningKhataType = loanData.type === 'lent' || loanData.type === 'borrowed';
    const status = (!isRunningKhataType && clampedPaid >= totalAmount) ? 'closed' : 'active';

    const payload = {
        paidAmount: clampedPaid,
        status: status
    };

    if (paymentDate) {
        payload.lastPaymentDate = paymentDate;
    } else if (clampedPaid <= 0) {
        payload.lastPaymentDate = null;
    }

    if ((loanData.type === 'emi' || loanData.type === 'borrowed') && loanData.emiAmount > 0 && status === 'active') {
        let anchorDate;
        if (loanData.initialDueDate) {
            anchorDate = new Date(loanData.initialDueDate);
        } else {
            anchorDate = loanData.dueDate ? new Date(loanData.dueDate) : new Date(loanData.startDate);
            if (!loanData.dueDate) anchorDate.setMonth(anchorDate.getMonth() + 1);
            payload.initialDueDate = anchorDate.toISOString().split('T')[0];
        }

        const paidInstallments = Math.floor(clampedPaid / loanData.emiAmount);
        const nextDate = new Date(anchorDate);
        nextDate.setMonth(anchorDate.getMonth() + paidInstallments);
        payload.dueDate = nextDate.toISOString().split('T')[0];
        payload.dueDateUpdated = true;
    }

    return payload;
}

async function applyCarryForwardToOppositeLoan(userId, loanData, carryForwardAmount, date) {
    if (!userId || !loanData || !carryForwardAmount || carryForwardAmount <= 0) return null;
    if (loanData.type !== 'lent' && loanData.type !== 'borrowed') return null;

    const oppositeType = loanData.type === 'lent' ? 'borrowed' : 'lent';
    const matchDoc = await findMatchingActiveLoanAccount(userId, oppositeType, loanData.name);

    if (matchDoc) {
        await db.collection('loans').doc(matchDoc.id).update({
            totalAmount: firebase.firestore.FieldValue.increment(carryForwardAmount),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return matchDoc.id;
    }

    const payload = {
        userId: userId,
        type: oppositeType,
        name: loanData.name,
        totalAmount: carryForwardAmount,
        paidAmount: 0,
        startDate: date || new Date().toISOString().split('T')[0],
        dueDate: '',
        interestRate: 0,
        emiAmount: 0,
        durationMonths: 0,
        processingFee: 0,
        totalPenalty: 0,
        mobile: loanData.mobile || '',
        messageContext: loanData.messageContext || '',
        upiId: loanData.upiId || '',
        status: 'active',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    const newRef = await db.collection('loans').add(payload);
    return newRef.id;
}

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
    const creditCardId = document.getElementById('loan-credit-card')?.value;
    const walletId = document.getElementById('loan-wallet')?.value;
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
            let loanRef = null;

            // Khata-style behavior:
            // For lent/borrowed, append to existing active account for same person+type.
            if (type === 'lent' || type === 'borrowed') {
                const existingAccountDoc = await findMatchingActiveLoanAccount(user.uid, type, name);
                if (existingAccountDoc) {
                    loanRef = existingAccountDoc.id;
                    const existingData = existingAccountDoc.data();

                    const mergePayload = {
                        totalAmount: firebase.firestore.FieldValue.increment(amount),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    };

                    if (startDate && (!existingData.startDate || startDate < existingData.startDate)) {
                        mergePayload.startDate = startDate;
                    }
                    if (dueDate) {
                        mergePayload.dueDate = dueDate;
                    }
                    if (interest > 0) {
                        mergePayload.interestRate = interest;
                    }
                    if (fullMobile) {
                        mergePayload.mobile = fullMobile;
                    }
                    if (upiId) {
                        mergePayload.upiId = upiId;
                    }
                    if (messageContext) {
                        mergePayload.messageContext = messageContext;
                    }

                    await db.collection('loans').doc(loanRef).update(mergePayload);
                }
            }

            // Create a fresh loan account if no active match was found.
            if (!loanRef) {
            loanDataToSave.paidAmount = 0;
            loanDataToSave.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            
            if (type === 'emi' || (type === 'borrowed' && emi > 0)) {
                loanDataToSave.initialDueDate = dueDate;
                loanDataToSave.dueDateUpdated = true;
            }
            
            const docRef = await db.collection('loans').add(loanDataToSave);
            loanRef = docRef.id;
            }

            // Handle Credit Card Deduction (Only if I Lent money or paid for EMI)
            if (paymentMode === 'credit-card' && creditCardId && (type === 'lent' || type === 'emi')) {
                await db.collection('credit_cards').doc(creditCardId).update({
                    currentOutstanding: firebase.firestore.FieldValue.increment(amount)
                });
            }

            // Handle Wallet Deduction (Only if I Lent money or paid for EMI)
            if (paymentMode === 'wallet' && walletId && (type === 'lent' || type === 'emi')) {
                await db.collection('wallets').doc(walletId).update({
                    balance: firebase.firestore.FieldValue.increment(-amount)
                });
            }

            // Handle Wallet Addition (If I Borrowed money into a Wallet)
            if (paymentMode === 'wallet' && walletId && type === 'borrowed') {
                await db.collection('wallets').doc(walletId).update({
                    balance: firebase.firestore.FieldValue.increment(amount)
                });
            }

            if (linkLedger) {
                const transaction = {
                    userId: user.uid,
                    loanId: loanRef,
                    date: startDate,
                    amount: amount,
                    type: type === 'borrowed' ? 'income' : (type === 'lent' ? 'expense' : 'expense'),
                    category: 'Loan',
                    description: `${type === 'borrowed' ? 'Loan from' : (type === 'lent' ? 'Loan to' : 'EMI Purchase:')} ${name}`,
                    relatedId: (paymentMode === 'credit-card' ? creditCardId : (paymentMode === 'wallet' ? walletId : null)),
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

window.openLoanTopUpModal = async function(loanId) {
    try {
        const loanDoc = await db.collection('loans').doc(loanId).get();
        if (!loanDoc.exists) return;
        const data = loanDoc.data();

        // Open as a NEW entry so khata-merge logic appends to same account.
        window.resetLoanForm();
        document.getElementById('loan-id').value = '';
        document.getElementById('loan-name').value = data.name || '';
        document.getElementById('loan-amount').value = '';
        document.getElementById('loan-start-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('loan-due-date').value = data.dueDate || '';
        document.getElementById('loan-interest').value = data.interestRate || '';
        document.getElementById('loan-emi').value = data.emiAmount || '';
        document.getElementById('loan-duration').value = data.durationMonths || '';
        document.getElementById('loan-processing-fee').value = 0;
        document.getElementById('loan-upi-id').value = data.upiId || '';
        document.getElementById('loan-message-context').value = data.messageContext || '';

        const typeRadio = document.querySelector(`input[name="loan-type"][value="${data.type}"]`);
        if (typeRadio) typeRadio.checked = true;
        updateLoanModalUI(data.type);

        if (data.mobile) {
            document.getElementById('loan-mobile').value = data.mobile;
        }

        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addLoanModal'));
        modal.show();
    } catch (e) {
        console.error("Error opening top-up modal:", e);
        if(window.dashboard) window.dashboard.showNotification('Unable to open member record', 'danger');
    }
};

window.loadLoansGrid = async function(status = 'active') {
    const user = auth.currentUser;
    if (!user) return;

    const [snapshot, invSnapshot] = await Promise.all([
        db.collection('loans')
            .where('userId', '==', user.uid)
            .where('status', '==', status)
            .orderBy('createdAt', 'desc')
            .get(),
        db.collection('investments')
            .where('userId', '==', user.uid)
            .get()
    ]);

    // Client-side filtering for type (since Firestore compound queries with != or multiple filters can be tricky without composite indexes)
    let docs = snapshot.docs;
    if (currentLoanTypeFilter !== 'all') {
        docs = docs.filter(doc => doc.data().type === currentLoanTypeFilter);
    }

    const container = document.getElementById('loans-grid');
    const statsContainer = document.getElementById('loan-stats-container');
    
    if (currentLoanView !== 'loans') return;

    // Calculate Stats
    let totalBorrowed = 0;
    let totalLent = 0;
    let totalEmi = 0;
    let totalInvested = 0;

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

    invSnapshot.forEach(doc => {
        const data = doc.data();
        totalInvested += (data.currentValue || data.investedAmount || 0);
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
                <div class="text-muted small mb-1 fw-medium">Total Assets</div>
                <div class="d-flex align-items-center justify-content-between">
                    <h4 class="mb-0 fw-bold text-success">₹${(totalLent + totalInvested).toFixed(0)}</h4>
                    <i class="fas fa-hand-holding-heart text-success opacity-25 fa-2x"></i>
                </div>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="stat-mini-card p-3 rounded-4 bg-white shadow-sm h-100 border-start border-4 border-primary">
                <div class="text-muted small mb-1 fw-medium">Net Position</div>
                <div class="d-flex align-items-center justify-content-between">
                    <h4 class="mb-0 fw-bold text-primary">₹${((totalLent + totalInvested) - totalBorrowed).toFixed(0)}</h4>
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
        const dueLabel = data.type === 'lent' ? 'Due from Member' : 'Due to Member';
        const isRunningKhataType = data.type === 'lent' || data.type === 'borrowed';
        const showActionButtons = status === 'active' && (isRunningKhataType || !isFullyPaid);
        
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
        if (data.type === 'lent' && status === 'active') {
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
                            <small class="text-muted d-block">${dueLabel}</small>
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

                    ${showActionButtons ? `
                    <div class="mt-3 d-flex gap-2 justify-content-end flex-wrap">
                        ${whatsappBtn}
                        ${data.type === 'lent' ? `
                            <button class="btn btn-sm btn-success px-3" onclick="showRepaymentModal('${doc.id}')">
                                <i class="fas fa-arrow-down me-1"></i>Payment In
                            </button>
                            <button class="btn btn-sm btn-outline-danger px-3" onclick="openLoanTopUpModal('${doc.id}')">
                                <i class="fas fa-arrow-up me-1"></i>Payment Out
                            </button>
                            <button class="btn btn-sm btn-outline-warning px-2" onclick="closeLoanAccount('${doc.id}')" title="Close Account">
                                <i class="fas fa-check-circle"></i>
                            </button>
                        ` : data.type === 'borrowed' ? `
                            <button class="btn btn-sm btn-success px-3" onclick="openLoanTopUpModal('${doc.id}')">
                                <i class="fas fa-arrow-down me-1"></i>Payment In
                            </button>
                            <button class="btn btn-sm btn-outline-danger px-3" onclick="showRepaymentModal('${doc.id}')">
                                <i class="fas fa-arrow-up me-1"></i>Payment Out
                            </button>
                            <button class="btn btn-sm btn-outline-warning px-2" onclick="closeLoanAccount('${doc.id}')" title="Close Account">
                                <i class="fas fa-check-circle"></i>
                            </button>
                        ` : `
                            <button class="btn btn-sm btn-primary px-3" onclick="showRepaymentModal('${doc.id}')">
                                <i class="fas fa-plus-circle me-1"></i>Record Payment
                            </button>
                        `}
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

window.closeLoanAccount = async function(id) {
    if (!confirm('Move this account to Closed section?')) return;

    try {
        if(window.dashboard) window.dashboard.showLoading();
        await db.collection('loans').doc(id).update({
            status: 'closed',
            closedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        loadLoansGrid('active');
        if(window.dashboard) window.dashboard.showNotification('Account moved to Closed', 'success');
    } catch (error) {
        console.error("Error closing loan account:", error);
        if(window.dashboard) window.dashboard.showNotification('Error closing account', 'danger');
    } finally {
        if(window.dashboard) window.dashboard.hideLoading();
    }
};

window.showRepaymentModal = async function(loanId) {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('repaymentModal'));
    document.getElementById('repayment-form').reset();
    document.getElementById('repay-loan-id').value = loanId;
    document.getElementById('repay-date').value = new Date().toISOString().split('T')[0];
    
    // Reset Payment Mode
    document.getElementById('repay-payment-mode').onchange = () => toggleLoanPaymentFields('repay');
    toggleLoanPaymentFields('repay');

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
    const creditCardId = document.getElementById('repay-credit-card')?.value;
    const walletId = document.getElementById('repay-wallet')?.value;
    const user = auth.currentUser;

    if (!amount || !date) {
        if(window.dashboard) window.dashboard.showNotification('Please enter amount and date', 'warning');
        return;
    }
    if ((amount - penalty - processingFee) <= 0) {
        if(window.dashboard) window.dashboard.showNotification('Amount must be greater than penalty + processing fee', 'warning');
        return;
    }

    try {
        window.setBtnLoading(btn, true);
        const loanDoc = await db.collection('loans').doc(loanId).get();
        const loanData = loanDoc.data();
        
        const effectiveAmount = amount - penalty - processingFee;
        const outstandingBefore = Math.max(0, (loanData.totalAmount || 0) - (loanData.paidAmount || 0));
        const appliedPrincipal = Math.min(effectiveAmount, outstandingBefore);
        const carryForwardAmount = Math.max(0, effectiveAmount - appliedPrincipal);
        const newPaidAmount = (loanData.paidAmount || 0) + appliedPrincipal;
        const updateData = buildLoanStatusPayload(loanData, newPaidAmount, date);
        updateData.totalPenalty = (loanData.totalPenalty || 0) + penalty;

        await db.collection('loans').doc(loanId).update(updateData);

        let carryForwardLoanId = null;
        if (carryForwardAmount > 0) {
            carryForwardLoanId = await applyCarryForwardToOppositeLoan(user.uid, loanData, carryForwardAmount, date);
        }
        
        let transactionId = null;
        let penaltyTransactionId = null;
        let procFeeTransactionId = null;

        // Handle Credit Card Deduction (If I am paying back a loan using CC)
        if (paymentMode === 'credit-card' && creditCardId && loanData.type === 'borrowed') {
            await db.collection('credit_cards').doc(creditCardId).update({
                currentOutstanding: firebase.firestore.FieldValue.increment(amount)
            });
        }

        // Handle Wallet Deduction (If I am paying back a loan using Wallet)
        if (paymentMode === 'wallet' && walletId && loanData.type === 'borrowed') {
            await db.collection('wallets').doc(walletId).update({
                balance: firebase.firestore.FieldValue.increment(-amount)
            });
        }

        // Handle Wallet Addition (If I am receiving repayment for a Lent loan into Wallet)
        if (paymentMode === 'wallet' && walletId && loanData.type === 'lent') {
            await db.collection('wallets').doc(walletId).update({
                balance: firebase.firestore.FieldValue.increment(amount)
            });
        }

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
                    relatedId: (paymentMode === 'credit-card' ? creditCardId : (paymentMode === 'wallet' ? walletId : null)),
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
            appliedPrincipal: appliedPrincipal,
            carryForwardAmount: carryForwardAmount,
            carryForwardLoanId: carryForwardLoanId,
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
        if(window.dashboard) {
            const note = carryForwardAmount > 0
                ? `Repayment recorded. Carry-forward due created: ₹${carryForwardAmount.toFixed(2)}`
                : 'Repayment recorded!';
            window.dashboard.showNotification(note, 'success');
        }
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
            if (data.carryForwardAmount && data.carryForwardAmount > 0) {
                details.push(`<span class="text-warning"><i class="fas fa-exchange-alt me-1"></i>Carry Forward: ₹${data.carryForwardAmount.toFixed(2)}</span>`);
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
            window.setBtnLoading(btn, false);
            return;
        }
        const repaymentData = repaymentDoc.data();
        const loanRef = db.collection('loans').doc(loanId);
        const loanDoc = await loanRef.get();
        if (!loanDoc.exists) {
            if(window.dashboard) window.dashboard.showNotification('Loan not found.', 'danger');
            window.setBtnLoading(btn, false);
            return;
        }
        const loanData = loanDoc.data();
        const originalAmount = repaymentData.amount;
        const penalty = repaymentData.penalty || 0;
        const processingFee = repaymentData.processingFee || 0;
        const carryForwardAmount = repaymentData.carryForwardAmount || 0;
        const transactionId = repaymentData.transactionId;
        if (carryForwardAmount > 0) {
            if(window.dashboard) window.dashboard.showNotification('This entry includes carry-forward. Delete and add repayment again instead of editing.', 'warning');
            window.setBtnLoading(btn, false);
            return;
        }
        const oldPrincipal = repaymentData.appliedPrincipal !== undefined
            ? repaymentData.appliedPrincipal
            : (originalAmount - penalty - processingFee);
        const newPrincipal = newAmount - penalty - processingFee;
        if (newPrincipal <= 0) {
            if(window.dashboard) window.dashboard.showNotification('Repayment amount is too low after penalty/fee.', 'warning');
            window.setBtnLoading(btn, false);
            return;
        }
        const amountDifference = newPrincipal - oldPrincipal;

        const batch = db.batch();

        // If a transaction was linked, update it.
        if (transactionId) {
            const txRef = db.collection('transactions').doc(transactionId);
            batch.update(txRef, { amount: newPrincipal, date: newDate });
        } 

        // Update the repayment
        batch.update(repaymentRef, { amount: newAmount, date: newDate });

        // Update the loan's paid amount + status consistency
        const recalculatedPaid = (loanData.paidAmount || 0) + amountDifference;
        const loanUpdatePayload = buildLoanStatusPayload(loanData, recalculatedPaid, newDate);
        batch.update(loanRef, loanUpdatePayload);

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
        const loanRef = db.collection('loans').doc(loanId);
        const loanDoc = await loanRef.get();
        if (!loanDoc.exists) {
            if(window.dashboard) window.dashboard.showNotification('Loan not found.', 'danger');
            return;
        }
        const loanData = loanDoc.data();
        const repaymentData = repaymentDoc.data();
        const totalAmount = repaymentData.amount;
        const penalty = repaymentData.penalty || 0;
        const processingFee = repaymentData.processingFee || 0;
        const principal = repaymentData.appliedPrincipal !== undefined
            ? repaymentData.appliedPrincipal
            : (totalAmount - penalty - processingFee);
        const carryForwardAmount = repaymentData.carryForwardAmount || 0;
        const carryForwardLoanId = repaymentData.carryForwardLoanId || null;
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
        const newPaidAmount = (loanData.paidAmount || 0) - principal;
        const updates = buildLoanStatusPayload(loanData, newPaidAmount);
        if (penalty > 0) {
            updates.totalPenalty = firebase.firestore.FieldValue.increment(-penalty);
        }
        batch.update(loanRef, updates);

        // Reverse auto carry-forward on opposite account, if present.
        if (carryForwardLoanId && carryForwardAmount > 0) {
            const cfRef = db.collection('loans').doc(carryForwardLoanId);
            const cfDoc = await cfRef.get();
            if (cfDoc.exists) {
                const cfData = cfDoc.data();
                const newTotal = (cfData.totalAmount || 0) - carryForwardAmount;
                const safeTotal = Math.max(0, newTotal);

                if (safeTotal <= 0 && (cfData.paidAmount || 0) <= 0) {
                    batch.delete(cfRef);
                } else {
                    const cfStatusPayload = buildLoanStatusPayload(
                        { ...cfData, totalAmount: safeTotal },
                        cfData.paidAmount || 0
                    );
                    batch.update(cfRef, {
                        totalAmount: safeTotal,
                        ...cfStatusPayload,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            }
        }

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
    
    if (currentLoanView !== 'cards') return;

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
                                    <li><a class="dropdown-item" href="javascript:void(0)" onclick="viewCreditCardHistory('${doc.id}')">View History</a></li>
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
    document.getElementById('ccActionTitle').textContent = type === 'spend' ? 'Log Spend' : 'Record Payment';
    
    const sourceDiv = document.getElementById('div-action-source');
    const descInput = document.getElementById('action-desc');
    
    if (type === 'pay') {
        sourceDiv.classList.remove('d-none');
        descInput.value = 'Bill Payment';
        // Reset payment mode to bank by default
        document.getElementById('action-payment-mode').value = 'bank';
    } else {
        sourceDiv.classList.add('d-none');
        descInput.value = 'Purchase';
    }
    
    // Reset wallet field visibility
    window.toggleLoanPaymentFields('action');
    
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('ccActionModal'));
    window.populateLoanPaymentSelects(); // Ensure wallets are loaded
    modal.show();
};

window.processCCAction = async function() {
    const btn = document.getElementById('btn-save-cc-action');
    const id = document.getElementById('action-cc-id').value;
    const type = document.getElementById('action-type').value;
    const amount = parseFloat(document.getElementById('action-amount').value);
    const date = document.getElementById('action-date').value;
    const desc = document.getElementById('action-desc').value;
    const paymentMode = document.getElementById('action-payment-mode').value;
    const walletId = document.getElementById('action-wallet').value;
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

        // Handle Wallet Deduction for Bill Payment
        if (type === 'pay' && paymentMode === 'wallet' && walletId) {
            await db.collection('wallets').doc(walletId).update({
                balance: firebase.firestore.FieldValue.increment(-amount)
            });
        }

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
                paymentMode: type === 'spend' ? 'credit-card' : paymentMode, // Spend is via CC. Payment is via selected mode.
                relatedId: id, // Always link to Card ID for history visibility
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

window.viewCreditCardHistory = async function(cardId) {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('ccHistoryModal'));
    const tbody = document.getElementById('cc-history-body');
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">Loading...</td></tr>';
    modal.show();

    try {
        const user = auth.currentUser;
        const snapshot = await db.collection('transactions')
            .where('userId', '==', user.uid)
            .where('relatedId', '==', cardId)
            .orderBy('date', 'desc')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No history found.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const isSpend = data.description && data.description.startsWith('CC Spend');
            const colorClass = isSpend ? 'text-danger' : 'text-success';
            const sign = isSpend ? '+' : '-';
            
            tbody.innerHTML += `
                <tr>
                    <td class="small">${new Date(data.date).toLocaleDateString()}</td>
                    <td class="small text-truncate" style="max-width: 150px;">${data.description}</td>
                    <td class="text-end ${colorClass} fw-bold small">${sign}₹${data.amount.toFixed(2)}</td>
                    <td class="text-end">
                        <button class="btn btn-link text-danger p-0 btn-sm" onclick="deleteCCHistoryItem('${cardId}', '${doc.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading history.</td></tr>';
    }
};

window.deleteCCHistoryItem = async function(cardId, txId) {
    if (!confirm('Delete this transaction? This will adjust the card outstanding balance.')) return;
    try {
        const txRef = db.collection('transactions').doc(txId);
        const txDoc = await txRef.get();
        if (!txDoc.exists) return;
        const data = txDoc.data();
        const amount = data.amount;
        
        const isBillPayment = data.category === 'Credit Card Bill' || (data.description && data.description.includes('Bill Pay'));
        const isSpend = data.paymentMode === 'credit-card' && !isBillPayment;
        const adjustment = isSpend ? -amount : amount;
        
        const batch = db.batch();
        batch.delete(txRef);
        batch.update(db.collection('credit_cards').doc(cardId), {
            currentOutstanding: firebase.firestore.FieldValue.increment(adjustment),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await batch.commit();
        viewCreditCardHistory(cardId);
        loadCreditCardsGrid();
        if(window.dashboard) window.dashboard.showNotification('Transaction deleted', 'success');
    } catch (e) {
        console.error(e);
        if(window.dashboard) window.dashboard.showNotification('Error deleting item', 'danger');
    }
};

// --- Wallet Functions ---

window.loadWalletsGrid = async function() {
    const user = auth.currentUser;
    const container = document.getElementById('wallets-grid');
    const statsContainer = document.getElementById('loan-stats-container');

    if (currentLoanView !== 'wallets') return;

    try {
        const snapshot = await db.collection('wallets')
            .where('userId', '==', user.uid)
            .orderBy('updatedAt', 'desc')
            .get();

        let totalBalance = 0;
        snapshot.forEach(doc => totalBalance += (doc.data().balance || 0));

        // Update Stats
        statsContainer.innerHTML = `
            <div class="col-12 col-md-4">
                <div class="stat-mini-card p-3 rounded-4 bg-white shadow-sm h-100 border-start border-4 border-info">
                    <div class="text-muted small mb-1 fw-medium">Total Wallet Balance</div>
                    <h4 class="mb-0 fw-bold text-info">₹${totalBalance.toFixed(2)}</h4>
                </div>
            </div>
        `;

        if (snapshot.empty) {
            container.innerHTML = '<div class="col-12 text-center text-muted py-5">No wallets added.</div>';
            return;
        }

        container.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4';
            col.innerHTML = `
                <div class="card h-100 border-0 shadow-sm rounded-4">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="d-flex align-items-center">
                                <div class="bg-info bg-opacity-10 text-info rounded-circle p-3 me-3">
                                    <i class="fas fa-wallet fa-lg"></i>
                                </div>
                                <div>
                                    <h5 class="mb-0 fw-bold">${data.name}</h5>
                                    <small class="text-muted">Wallet</small>
                                </div>
                            </div>
                            <div class="dropdown">
                                <button class="btn btn-link text-muted p-0" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li><a class="dropdown-item" href="javascript:void(0)" onclick="editWallet('${doc.id}')">Edit</a></li>
                                    <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="deleteWallet('${doc.id}')">Delete</a></li>
                                </ul>
                            </div>
                        </div>
                        <h3 class="fw-bold mb-0">₹${(data.balance || 0).toFixed(2)}</h3>
                        <div class="small text-muted mt-2">Last updated: ${data.updatedAt ? new Date(data.updatedAt.toDate()).toLocaleDateString() : 'N/A'}</div>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });

    } catch (e) {
        console.error("Error loading wallets:", e);
        container.innerHTML = '<div class="col-12 text-center text-danger">Error loading wallets.</div>';
    }
};

window.showAddWalletModal = function() {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addWalletModal'));
    document.getElementById('wallet-form').reset();
    document.getElementById('wallet-id').value = '';
    modal.show();
};

window.saveWallet = async function() {
    const btn = document.getElementById('btn-save-wallet');
    const id = document.getElementById('wallet-id').value;
    const name = document.getElementById('wallet-name').value;
    const balance = parseFloat(document.getElementById('wallet-balance').value);
    const user = auth.currentUser;

    if (!name || isNaN(balance)) {
        if(window.dashboard) window.dashboard.showNotification('Please fill required fields', 'warning');
        return;
    }

    try {
        window.setBtnLoading(btn, true);
        const data = {
            userId: user.uid,
            name, balance,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (id) {
            await db.collection('wallets').doc(id).update(data);
        } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('wallets').add(data);
        }

        window.setBtnLoading(btn, false);
        bootstrap.Modal.getInstance(document.getElementById('addWalletModal')).hide();
        loadWalletsGrid();
        if(window.dashboard) window.dashboard.showNotification(id ? 'Wallet updated' : 'Wallet added', 'success');
    } catch (e) {
        window.setBtnLoading(btn, false);
        console.error(e);
        if(window.dashboard) window.dashboard.showNotification('Error saving wallet', 'danger');
    }
};

window.editWallet = async function(id) {
    try {
        const doc = await db.collection('wallets').doc(id).get();
        if (!doc.exists) return;
        const data = doc.data();
        
        document.getElementById('wallet-id').value = id;
        document.getElementById('wallet-name').value = data.name;
        document.getElementById('wallet-balance').value = data.balance;
        
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addWalletModal'));
        modal.show();
    } catch (e) { console.error(e); }
};

window.deleteWallet = async function(id) {
    if (!confirm('Delete this wallet?')) return;
    try {
        await db.collection('wallets').doc(id).delete();
        loadWalletsGrid();
        if(window.dashboard) window.dashboard.showNotification('Wallet deleted', 'success');
    } catch (e) { console.error(e); }
};

window.showTransferWalletModal = async function() {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('transferWalletModal'));
    document.getElementById('transfer-form').reset();
    document.getElementById('transfer-date').value = new Date().toISOString().split('T')[0];
    
    // Populate Wallets
    const user = auth.currentUser;
    const snapshot = await db.collection('wallets').where('userId', '==', user.uid).get();
    let options = '<option value="">Select Wallet</option>';
    snapshot.forEach(doc => {
        options += `<option value="${doc.id}">${doc.data().name} (₹${doc.data().balance})</option>`;
    });
    
    document.getElementById('transfer-source-wallet').innerHTML = options;
    document.getElementById('transfer-dest-wallet').innerHTML = options;
    
    toggleTransferType();
    modal.show();
};

window.toggleTransferType = function() {
    const type = document.getElementById('transfer-type').value;
    const sourceDiv = document.getElementById('div-source-wallet');
    
    if (type === 'wallet_to_wallet') {
        sourceDiv.classList.remove('d-none');
    } else {
        sourceDiv.classList.add('d-none');
    }
};

window.saveWalletTransfer = async function() {
    const btn = document.getElementById('btn-save-transfer');
    const type = document.getElementById('transfer-type').value;
    const sourceId = document.getElementById('transfer-source-wallet').value;
    const destId = document.getElementById('transfer-dest-wallet').value;
    const amount = parseFloat(document.getElementById('transfer-amount').value);
    const date = document.getElementById('transfer-date').value;
    const recordLedger = document.getElementById('transfer-ledger').checked;
    const user = auth.currentUser;

    if (!destId || !amount || amount <= 0) {
        if(window.dashboard) window.dashboard.showNotification('Please fill required fields', 'warning');
        return;
    }

    if (type === 'wallet_to_wallet') {
        if (!sourceId) {
            if(window.dashboard) window.dashboard.showNotification('Select source wallet', 'warning');
            return;
        }
        if (sourceId === destId) {
            if(window.dashboard) window.dashboard.showNotification('Source and destination cannot be same', 'warning');
            return;
        }
    }

    try {
        window.setBtnLoading(btn, true);
        const batch = db.batch();
        
        // Destination Update
        const destRef = db.collection('wallets').doc(destId);
        batch.update(destRef, {
            balance: firebase.firestore.FieldValue.increment(amount),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        let description = '';
        let paymentMode = 'wallet';
        
        if (type === 'wallet_to_wallet') {
            // Source Update
            const sourceRef = db.collection('wallets').doc(sourceId);
            batch.update(sourceRef, {
                balance: firebase.firestore.FieldValue.increment(-amount),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            const sourceName = document.getElementById('transfer-source-wallet').options[document.getElementById('transfer-source-wallet').selectedIndex].text.split(' (')[0];
            const destName = document.getElementById('transfer-dest-wallet').options[document.getElementById('transfer-dest-wallet').selectedIndex].text.split(' (')[0];
            description = `Transfer: ${sourceName} -> ${destName}`;
        } else {
            const destName = document.getElementById('transfer-dest-wallet').options[document.getElementById('transfer-dest-wallet').selectedIndex].text.split(' (')[0];
            description = `Bank Transfer to ${destName}`;
            paymentMode = 'bank';
        }

        if (recordLedger) {
            const txRef = db.collection('transactions').doc();
            batch.set(txRef, {
                userId: user.uid,
                date: date,
                amount: amount,
                type: 'transfer', // Neutral type for transfers
                category: 'Transfer',
                description: description,
                paymentMode: paymentMode,
                relatedId: destId,
                section: 'wallets',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        await batch.commit();
        
        window.setBtnLoading(btn, false);
        bootstrap.Modal.getInstance(document.getElementById('transferWalletModal')).hide();
        loadWalletsGrid();
        if(window.dashboard) window.dashboard.showNotification('Transfer successful', 'success');
    } catch (e) {
        window.setBtnLoading(btn, false);
        console.error(e);
        if(window.dashboard) window.dashboard.showNotification('Error processing transfer', 'danger');
    }
};

// --- Investment Functions ---

window.showAddInvestmentModal = function() {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addInvestmentModal'));
    document.getElementById('investment-form').reset();
    document.getElementById('inv-id').value = '';
    toggleInvestmentFields();
    toggleLoanPaymentFields('inv'); // Reset CC field
    toggleSipFields();
    modal.show();
};

window.toggleInvestmentFields = function() {
    const type = document.getElementById('inv-type').value;
    const qtyLabel = document.getElementById('inv-qty-label');
    const fetchBtn = document.getElementById('btn-fetch-price');
    
    if (type === 'gold' || type === 'silver') {
        qtyLabel.textContent = 'Weight (Grams)';
    } else if (type === 'mutual_fund' || type === 'stock' || type === 'crypto') {
        qtyLabel.textContent = 'Quantity (Units)';
    } else {
        qtyLabel.textContent = 'Quantity (Optional)';
    }

    if (fetchBtn) {
        fetchBtn.style.display = (type === 'gold' || type === 'silver') ? 'block' : 'none';
    }
};

window.toggleSipFields = function() {
    const isSip = document.getElementById('inv-is-sip').checked;
    const sipFields = document.getElementById('inv-sip-fields');
    if (isSip) {
        sipFields.classList.remove('d-none');
    } else {
        sipFields.classList.add('d-none');
    }
};

window.fetchLiveMetalPrice = async function() {
    const type = document.getElementById('inv-type').value;
    const qty = parseFloat(document.getElementById('inv-quantity').value);
    const btn = document.getElementById('btn-fetch-price');
    
    if (!['gold', 'silver'].includes(type)) return;
    
    if (!qty || qty <= 0) {
        if(window.dashboard) window.dashboard.showNotification('Please enter weight (grams) first', 'warning');
        return;
    }

    if (!METALPRICE_API_KEY) {
         if(window.dashboard) window.dashboard.showNotification('API Key not configured in js/loans.js', 'warning');
         return;
    }

    const originalHtml = btn.innerHTML;
    try {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
        
        const symbol = type === 'gold' ? 'XAU' : 'XAG';
        const response = await fetch(`https://www.goldapi.io/api/${symbol}/INR`, {
            headers: { 'x-access-token': METALPRICE_API_KEY }
        });
        
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);

        // GoldAPI returns price for 1 Troy Ounce (31.1035 grams)
        const pricePerGramINR = data.price / 31.1035;
        
        const totalValue = pricePerGramINR * qty;
        document.getElementById('inv-current-value').value = totalValue.toFixed(2);
        
        if(window.dashboard) window.dashboard.showNotification(`Updated ${type} price`, 'success');

    } catch (e) {
        console.error(e);
        if(window.dashboard) window.dashboard.showNotification('Failed to fetch price', 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }
};

window.updateAllMetalPrices = async function() {
    const btn = document.getElementById('btn-update-metals');
    const user = auth.currentUser;
    
    if (!METALPRICE_API_KEY) {
         if(window.dashboard) window.dashboard.showNotification('API Key not configured', 'warning');
         return;
    }

    try {
        if(btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Updating...';
        }

        // 1. Get all metal investments
        const snapshot = await db.collection('investments')
            .where('userId', '==', user.uid)
            .where('type', 'in', ['gold', 'silver'])
            .get();

        if (snapshot.empty) {
            if(window.dashboard) window.dashboard.showNotification('No gold/silver investments found', 'info');
            return;
        }

        // 2. Fetch Live Rates (GoldAPI requires separate calls)
        const headers = { 'x-access-token': METALPRICE_API_KEY };
        
        const [goldRes, silverRes] = await Promise.all([
            fetch(`https://www.goldapi.io/api/XAU/INR`, { headers }),
            fetch(`https://www.goldapi.io/api/XAG/INR`, { headers })
        ]);

        const goldData = await goldRes.json();
        const silverData = await silverRes.json();
        
        const goldPricePerGram = (goldData.price || 0) / 31.1035;
        const silverPricePerGram = (silverData.price || 0) / 31.1035;

        // 3. Update Documents
        const batch = db.batch();
        let updateCount = 0;
        let totalValueChange = 0;

        snapshot.forEach(doc => {
            const inv = doc.data();
            if (inv.quantity > 0) {
                let newPrice = 0;
                if (inv.type === 'gold') newPrice = goldPricePerGram * inv.quantity;
                else if (inv.type === 'silver') newPrice = silverPricePerGram * inv.quantity;
                
                if (newPrice > 0) {
                    batch.update(doc.ref, { 
                        currentValue: parseFloat(newPrice.toFixed(2)),
                        lastPriceUpdate: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    updateCount++;

                    // Live DOM Update (No Refresh)
                    const valEl = document.getElementById(`inv-val-${doc.id}`);
                    const profitEl = document.getElementById(`inv-profit-${doc.id}`);
                    const updatedEl = document.getElementById(`inv-updated-${doc.id}`);

                    if (valEl) {
                        valEl.textContent = `₹${newPrice.toLocaleString()}`;
                        // Flash effect
                        valEl.style.transition = 'color 0.5s';
                        valEl.style.color = '#198754'; // Success green
                        setTimeout(() => valEl.style.color = '', 1000);
                    }

                    if (profitEl) {
                        const profit = newPrice - (inv.investedAmount || 0);
                        const profitPercent = inv.investedAmount > 0 ? ((profit / inv.investedAmount) * 100).toFixed(1) : 0;
                        const profitClass = profit >= 0 ? 'text-success' : 'text-danger';
                        const profitIcon = profit >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
                        
                        profitEl.className = `${profitClass} fw-bold small`;
                        profitEl.innerHTML = `<i class="fas ${profitIcon} me-1"></i> ₹${Math.abs(profit).toLocaleString()} (${profitPercent}%)`;
                    }

                    if (updatedEl) {
                        updatedEl.textContent = `Price updated: ${new Date().toLocaleDateString()}`;
                    }
                }
            }
        });

        if (updateCount > 0) {
            await batch.commit();
            if(window.dashboard) window.dashboard.showNotification(`Updated ${updateCount} investments`, 'success');
            // loadInvestmentsGrid(); // Removed to prevent grid reload flicker
            updateInvestmentSummary();
            if(window.dashboard) window.dashboard.updateStats(); // Update dashboard stats
        } else {
            if(window.dashboard) window.dashboard.showNotification('No updates needed', 'info');
        }

    } catch (e) {
        console.error(e);
        if(window.dashboard) window.dashboard.showNotification('Failed to update prices', 'danger');
    } finally {
        if(btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync-alt me-1"></i>Update Gold/Silver Prices';
        }
    }
};

window.updateInvestmentSummary = async function() {
    const user = auth.currentUser;
    try {
        const snapshot = await db.collection('investments').where('userId', '==', user.uid).get();
        let totalInvested = 0;
        let totalCurrent = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            totalInvested += (data.investedAmount || 0);
            totalCurrent += (data.currentValue || data.investedAmount || 0);
        });

        if (document.getElementById('total-portfolio-value')) {
            const totalProfit = totalCurrent - totalInvested;
            const profitClass = totalProfit >= 0 ? 'text-success' : 'text-danger';
            const profitSign = totalProfit >= 0 ? '+' : '';
            
            document.getElementById('total-portfolio-value').textContent = `₹${totalCurrent.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}`;
            document.getElementById('total-invested-value').textContent = `₹${totalInvested.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}`;
            
            const profitEl = document.getElementById('total-profit-value');
            if (profitEl) {
                profitEl.className = `mb-0 fw-bold ${profitClass}`;
                profitEl.textContent = `${profitSign}₹${Math.abs(totalProfit).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}`;
            }
        }
    } catch (e) {
        console.error("Error updating investment summary:", e);
    }
};

window.saveInvestment = async function() {
    const btn = document.getElementById('btn-save-inv');
    const user = auth.currentUser;
    const id = document.getElementById('inv-id').value;
    const type = document.getElementById('inv-type').value;
    const name = document.getElementById('inv-name').value;
    const investedAmount = parseFloat(document.getElementById('inv-amount').value);
    const currentValue = parseFloat(document.getElementById('inv-current-value').value) || investedAmount;
    const quantity = parseFloat(document.getElementById('inv-quantity').value) || 0;
    const isSip = document.getElementById('inv-is-sip').checked;
    const notes = document.getElementById('inv-notes').value;
    const linkLedger = document.getElementById('inv-link-ledger').checked;
    const paymentMode = document.getElementById('inv-payment-mode').value;
    const creditCardId = document.getElementById('inv-credit-card')?.value;
    const walletId = document.getElementById('inv-wallet')?.value;
    
    if (!name || isNaN(investedAmount)) {
        if(window.dashboard) window.dashboard.showNotification('Please fill required fields', 'warning');
        return;
    }

    const data = {
        userId: user.uid,
        type, name, investedAmount, currentValue, quantity, isSip, notes
    };

    if (isSip) {
        data.sipFrequency = document.getElementById('inv-sip-freq').value;
        data.sipAmount = parseFloat(document.getElementById('inv-sip-amount').value) || 0;
        data.sipNextDate = document.getElementById('inv-sip-date').value;
    }

    try {
        window.setBtnLoading(btn, true);
        let invRefId = id;

        if (id) {
            data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('investments').doc(id).update(data);
        } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await db.collection('investments').add(data);
            invRefId = docRef.id;

            // Handle Credit Card Deduction
            if (paymentMode === 'credit-card' && creditCardId) {
                await db.collection('credit_cards').doc(creditCardId).update({
                    currentOutstanding: firebase.firestore.FieldValue.increment(investedAmount)
                });
            }

            // Handle Wallet Deduction
            if (paymentMode === 'wallet' && walletId) {
                await db.collection('wallets').doc(walletId).update({
                    balance: firebase.firestore.FieldValue.increment(-investedAmount)
                });
            }

            // Add to Ledger
            if (linkLedger) {
                await db.collection('transactions').add({
                    userId: user.uid,
                    date: new Date().toISOString().split('T')[0],
                    amount: investedAmount,
                    type: 'expense',
                    category: 'Investment',
                    description: `Investment: ${name}`,
                    paymentMode: paymentMode,
                    relatedId: (paymentMode === 'credit-card' && creditCardId) ? creditCardId : invRefId,
                    investmentId: invRefId,
                    section: 'investments',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        }
        
        window.setBtnLoading(btn, false);
        bootstrap.Modal.getInstance(document.getElementById('addInvestmentModal')).hide();
        loadInvestmentsGrid();
        if(window.dashboard) window.dashboard.showNotification('Investment saved', 'success');
    } catch (e) {
        window.setBtnLoading(btn, false);
        console.error(e);
        if(window.dashboard) window.dashboard.showNotification('Error saving investment', 'danger');
    }
};

window.loadInvestmentsGrid = async function() {
    const user = auth.currentUser;
    const container = document.getElementById('investments-grid');
    const statsContainer = document.getElementById('loan-stats-container');
    
    try {
        const snapshot = await db.collection('investments')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();

        let totalInvested = 0;
        let totalCurrent = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            totalInvested += (data.investedAmount || 0);
            totalCurrent += (data.currentValue || data.investedAmount || 0);
        });

        const totalProfit = totalCurrent - totalInvested;
        const profitClass = totalProfit >= 0 ? 'text-success' : 'text-danger';

        // Render Stats
        statsContainer.innerHTML = `
            <div class="col-12 col-md-4">
                <div class="stat-mini-card p-3 rounded-4 bg-white shadow-sm h-100 border-start border-4 border-primary">
                    <div class="text-muted small mb-1 fw-medium">Current Portfolio Value</div>
                    <h4 class="mb-0 fw-bold text-primary">₹${totalCurrent.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</h4>
                </div>
            </div>
            <div class="col-6 col-md-4">
                <div class="stat-mini-card p-3 rounded-4 bg-white shadow-sm h-100 border-start border-4 border-secondary">
                    <div class="text-muted small mb-1 fw-medium">Invested Amount</div>
                    <h4 class="mb-0 fw-bold text-secondary">₹${totalInvested.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</h4>
                </div>
            </div>
            <div class="col-6 col-md-4">
                <div class="stat-mini-card p-3 rounded-4 bg-white shadow-sm h-100 border-start border-4 ${totalProfit >= 0 ? 'border-success' : 'border-danger'}">
                    <div class="text-muted small mb-1 fw-medium">Total Profit/Loss</div>
                    <h4 class="mb-0 fw-bold ${profitClass}">₹${totalProfit.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</h4>
                </div>
            </div>
        `;

        if (snapshot.empty) {
            container.innerHTML = '<div class="col-12 text-center text-muted py-5">No investments found. Start building your portfolio!</div>';
            return;
        }

        container.innerHTML = '';

        snapshot.forEach(doc => {
            const data = doc.data();
            
            const profit = (data.currentValue || 0) - (data.investedAmount || 0);
            const profitClass = profit >= 0 ? 'text-success' : 'text-danger';
            const profitIcon = profit >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
            const profitPercent = data.investedAmount > 0 ? ((profit / data.investedAmount) * 100).toFixed(1) : 0;

            let icon = 'fa-chart-line';
            let color = 'primary';
            let typeLabel = 'Investment';

            switch(data.type) {
                case 'gold': icon = 'fa-ring'; color = 'warning'; typeLabel = 'Gold'; break;
                case 'silver': icon = 'fa-coins'; color = 'secondary'; typeLabel = 'Silver'; break;
                case 'mutual_fund': icon = 'fa-chart-pie'; color = 'success'; typeLabel = 'Mutual Fund'; break;
                case 'stock': icon = 'fa-chart-bar'; color = 'info'; typeLabel = 'Stock'; break;
                case 'fd': icon = 'fa-university'; color = 'dark'; typeLabel = 'Fixed Deposit'; break;
                case 'crypto': icon = 'fa-bitcoin'; color = 'warning'; typeLabel = 'Crypto'; break;
                case 'real_estate': icon = 'fa-building'; color = 'primary'; typeLabel = 'Real Estate'; break;
            }

            let sipBadge = '';
            if (data.isSip) {
                sipBadge = `<span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 ms-2"><i class="fas fa-sync-alt me-1"></i>SIP</span>`;
            }

            let lastUpdateInfo = '';
            if ((data.type === 'gold' || data.type === 'silver') && data.lastPriceUpdate) {
                const d = data.lastPriceUpdate.toDate ? data.lastPriceUpdate.toDate() : new Date(data.lastPriceUpdate);
                lastUpdateInfo = `<div class="text-end mt-1" style="font-size: 0.65rem; color: #aaa;" id="inv-updated-${doc.id}">Price updated: ${d.toLocaleDateString()}</div>`;
            }

            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4';
            col.innerHTML = `
                <div class="card h-100 border-0 shadow-sm rounded-4">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="d-flex align-items-center">
                                <div class="bg-${color} bg-opacity-10 text-${color} rounded-circle p-3 me-3">
                                    <i class="fas ${icon} fa-lg"></i>
                                </div>
                                <div>
                                    <h5 class="mb-0 fw-bold">${data.name}</h5>
                                    <div class="small text-muted">${typeLabel} ${sipBadge}</div>
                                </div>
                            </div>
                            <div class="dropdown">
                                <button class="btn btn-link text-muted p-0" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li><a class="dropdown-item" href="javascript:void(0)" onclick="editInvestment('${doc.id}')">Edit</a></li>
                                    <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="deleteInvestment('${doc.id}')">Delete</a></li>
                                </ul>
                            </div>
                        </div>

                        <div class="row g-2 mb-3">
                            <div class="col-6">
                                <div class="p-2 bg-light rounded">
                                    <div class="small text-muted">Invested</div>
                                    <div class="fw-bold">₹${data.investedAmount.toLocaleString()}</div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="p-2 bg-light rounded">
                                    <div class="small text-muted">Current Value</div>
                                    <div class="fw-bold" id="inv-val-${doc.id}">₹${data.currentValue.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center">
                            <div class="${profitClass} fw-bold small" id="inv-profit-${doc.id}">
                                <i class="fas ${profitIcon} me-1"></i> ₹${Math.abs(profit).toLocaleString()} (${profitPercent}%)
                            </div>
                            ${data.quantity ? `<div class="small text-muted">${data.quantity} ${data.type === 'gold' || data.type === 'silver' ? 'g' : 'units'}</div>` : ''}
                        </div>
                        ${lastUpdateInfo}

                        ${data.isSip ? `
                        <div class="mt-3 pt-3 border-top small">
                            <div class="d-flex justify-content-between text-muted">
                                <span><i class="fas fa-clock me-1"></i> ${data.sipFrequency} SIP</span>
                                <span class="fw-bold text-dark">₹${data.sipAmount}</span>
                            </div>
                        </div>` : ''}

                        <div class="d-flex gap-2 mt-3">
                            <button class="btn btn-sm btn-outline-success flex-grow-1" onclick="showDepositInvestmentModal('${doc.id}')">
                                <i class="fas fa-plus-circle me-1"></i>Deposit
                            </button>
                            <button class="btn btn-sm btn-outline-danger flex-grow-1" onclick="showWithdrawInvestmentModal('${doc.id}')">
                                <i class="fas fa-minus-circle me-1"></i>Withdraw
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="col-12 text-center text-danger">Error loading investments.</div>';
    }
};

window.editInvestment = async function(id) {
    try {
        const doc = await db.collection('investments').doc(id).get();
        if (!doc.exists) return;
        const data = doc.data();
        
        document.getElementById('inv-id').value = id;
        document.getElementById('inv-type').value = data.type;
        document.getElementById('inv-name').value = data.name;
        document.getElementById('inv-amount').value = data.investedAmount;
        document.getElementById('inv-current-value').value = data.currentValue;
        document.getElementById('inv-quantity').value = data.quantity || '';
        document.getElementById('inv-notes').value = data.notes || '';
        
        const isSip = data.isSip || false;
        document.getElementById('inv-is-sip').checked = isSip;
        toggleSipFields();
        
        if (isSip) {
            document.getElementById('inv-sip-freq').value = data.sipFrequency || 'monthly';
            document.getElementById('inv-sip-amount').value = data.sipAmount || '';
            document.getElementById('inv-sip-date').value = data.sipNextDate || '';
        }
        
        toggleInvestmentFields();
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addInvestmentModal'));
        modal.show();
    } catch (e) { console.error(e); }
};

window.showWithdrawInvestmentModal = function(id) {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('withdrawInvestmentModal'));
    document.getElementById('withdraw-form').reset();
    document.getElementById('withdraw-id').value = id;
    document.getElementById('withdraw-date').value = new Date().toISOString().split('T')[0];
    toggleWithdrawalFields();
    window.populateLoanPaymentSelects(); // Ensure wallets are loaded
    modal.show();
};

window.toggleWithdrawalFields = function() {
    const mode = document.getElementById('withdraw-to').value;
    const walletDiv = document.getElementById('div-withdraw-wallet');
    if (mode === 'wallet') {
        walletDiv.classList.remove('d-none');
    } else {
        walletDiv.classList.add('d-none');
    }
};

window.saveWithdrawal = async function() {
    const btn = document.getElementById('btn-save-withdraw');
    const id = document.getElementById('withdraw-id').value;
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    const qty = parseFloat(document.getElementById('withdraw-quantity').value) || 0;
    const date = document.getElementById('withdraw-date').value;
    const mode = document.getElementById('withdraw-to').value;
    const walletId = document.getElementById('withdraw-wallet').value;
    const closeInv = document.getElementById('withdraw-close').checked;
    const user = auth.currentUser;

    if (!amount || amount <= 0) {
        if(window.dashboard) window.dashboard.showNotification('Invalid amount', 'warning');
        return;
    }

    try {
        window.setBtnLoading(btn, true);
        const invRef = db.collection('investments').doc(id);
        const invDoc = await invRef.get();
        
        if (!invDoc.exists) throw new Error("Investment not found");
        const invData = invDoc.data();

        const batch = db.batch();

        // 1. Update Investment
        if (closeInv) {
            batch.delete(invRef);
        } else {
            const updates = {
                currentValue: firebase.firestore.FieldValue.increment(-amount),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            if (qty > 0) {
                updates.quantity = firebase.firestore.FieldValue.increment(-qty);
                // Proportional reduction of invested amount based on quantity
                const oldQty = invData.quantity || 0;
                if (oldQty > 0) {
                    const ratio = qty / oldQty;
                    const reduction = (invData.investedAmount || 0) * ratio;
                    updates.investedAmount = firebase.firestore.FieldValue.increment(-reduction);
                } else {
                    // Fallback to value based if quantity wasn't tracked before
                    const oldVal = invData.currentValue || amount;
                    const ratio = amount / oldVal;
                    const reduction = (invData.investedAmount || 0) * ratio;
                    updates.investedAmount = firebase.firestore.FieldValue.increment(-reduction);
                }
            } else {
                // Proportional reduction based on value if no quantity
                const oldVal = invData.currentValue || amount; // Avoid div by zero
                const ratio = amount / oldVal;
                const reduction = (invData.investedAmount || 0) * ratio;
                updates.investedAmount = firebase.firestore.FieldValue.increment(-reduction);
            }
            batch.update(invRef, updates);
        }

        // 2. Add Transaction (Income)
        const txRef = db.collection('transactions').doc();
        batch.set(txRef, {
            userId: user.uid,
            date: date,
            amount: amount,
            type: 'income',
            category: 'Investment Return',
            description: `Withdrawal from ${invData.name}`,
            paymentMode: mode,
            relatedId: id, // Link to investment ID even if deleted (for history)
            section: 'investments',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 3. Update Wallet if selected
        if (mode === 'wallet' && walletId) {
            const walletRef = db.collection('wallets').doc(walletId);
            batch.update(walletRef, {
                balance: firebase.firestore.FieldValue.increment(amount),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        await batch.commit();
        
        window.setBtnLoading(btn, false);
        bootstrap.Modal.getInstance(document.getElementById('withdrawInvestmentModal')).hide();
        loadInvestmentsGrid();
        if(window.dashboard) {
            window.dashboard.showNotification('Withdrawal successful', 'success');
            window.dashboard.updateStats();
        }
    } catch (e) {
        window.setBtnLoading(btn, false);
        console.error(e);
        if(window.dashboard) window.dashboard.showNotification('Error processing withdrawal', 'danger');
    }
};

window.showDepositInvestmentModal = function(id) {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('depositInvestmentModal'));
    document.getElementById('deposit-form').reset();
    document.getElementById('deposit-id').value = id;
    document.getElementById('deposit-date').value = new Date().toISOString().split('T')[0];
    toggleDepositFields();
    window.populateLoanPaymentSelects();
    modal.show();
};

window.toggleDepositFields = function() {
    const mode = document.getElementById('deposit-payment-mode').value;
    const walletDiv = document.getElementById('div-deposit-wallet');
    const ccDiv = document.getElementById('div-deposit-credit-card');
    
    walletDiv.classList.add('d-none');
    ccDiv.classList.add('d-none');

    if (mode === 'wallet') {
        walletDiv.classList.remove('d-none');
    } else if (mode === 'credit-card') {
        ccDiv.classList.remove('d-none');
    }
};

window.saveDeposit = async function() {
    const btn = document.getElementById('btn-save-deposit');
    const id = document.getElementById('deposit-id').value;
    const amount = parseFloat(document.getElementById('deposit-amount').value);
    const qty = parseFloat(document.getElementById('deposit-quantity').value) || 0;
    const date = document.getElementById('deposit-date').value;
    const mode = document.getElementById('deposit-payment-mode').value;
    const walletId = document.getElementById('deposit-wallet').value;
    const creditCardId = document.getElementById('deposit-credit-card').value;
    const user = auth.currentUser;

    if (!amount || amount <= 0) {
        if(window.dashboard) window.dashboard.showNotification('Invalid amount', 'warning');
        return;
    }

    try {
        window.setBtnLoading(btn, true);
        const invRef = db.collection('investments').doc(id);
        const invDoc = await invRef.get();
        if (!invDoc.exists) throw new Error("Investment not found");
        const invData = invDoc.data();

        const batch = db.batch();

        // 1. Update Investment
        batch.update(invRef, {
            investedAmount: firebase.firestore.FieldValue.increment(amount),
            currentValue: firebase.firestore.FieldValue.increment(amount), // Assuming value increases by deposit amount
            quantity: firebase.firestore.FieldValue.increment(qty),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 2. Add Transaction (Expense)
        const txRef = db.collection('transactions').doc();
        batch.set(txRef, {
            userId: user.uid,
            date: date,
            amount: amount,
            type: 'expense',
            category: 'Investment',
            description: `Deposit to ${invData.name}`,
            paymentMode: mode,
            relatedId: (mode === 'credit-card' && creditCardId) ? creditCardId : id,
            investmentId: id,
            section: 'investments',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 3. Deduct from Wallet if selected
        if (mode === 'wallet' && walletId) {
            const walletRef = db.collection('wallets').doc(walletId);
            batch.update(walletRef, {
                balance: firebase.firestore.FieldValue.increment(-amount),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        // 4. Add to Credit Card Outstanding if selected
        if (mode === 'credit-card' && creditCardId) {
            const ccRef = db.collection('credit_cards').doc(creditCardId);
            batch.update(ccRef, {
                currentOutstanding: firebase.firestore.FieldValue.increment(amount),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        await batch.commit();
        
        window.setBtnLoading(btn, false);
        bootstrap.Modal.getInstance(document.getElementById('depositInvestmentModal')).hide();
        loadInvestmentsGrid();
        if(window.dashboard) {
            window.dashboard.showNotification('Deposit successful', 'success');
            window.dashboard.updateStats();
        }
    } catch (e) {
        window.setBtnLoading(btn, false);
        console.error(e);
        if(window.dashboard) window.dashboard.showNotification('Error processing deposit', 'danger');
    }
};

window.deleteInvestment = async function(id) {
    if (!confirm('Delete this investment record?')) return;
    try {
        await db.collection('investments').doc(id).delete();
        loadInvestmentsGrid();
        if(window.dashboard) window.dashboard.showNotification('Investment deleted', 'success');
    } catch (e) { console.error(e); }
};

// --- Amortization Calculator Functions ---

window.showAmortizationCalculator = function() {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('amortizationModal'));
    modal.show();
};

window.calculateAmortization = function() {
    const principal = parseFloat(document.getElementById('calc-amount').value);
    const rate = parseFloat(document.getElementById('calc-rate').value);
    const tenure = parseFloat(document.getElementById('calc-tenure').value);
    const tenureType = document.getElementById('calc-tenure-type').value;

    if (!principal || !rate || !tenure) {
        if(window.dashboard) window.dashboard.showNotification('Please fill all fields', 'warning');
        return;
    }

    let months = tenureType === 'years' ? tenure * 12 : tenure;
    let monthlyRate = rate / 12 / 100;
    
    // EMI Formula
    let emi = 0;
    if (rate === 0) {
        emi = principal / months;
    } else {
        emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    }
    
    let totalPayment = emi * months;
    let totalInterest = totalPayment - principal;

    document.getElementById('calc-result-emi').textContent = `₹${emi.toFixed(2)}`;
    document.getElementById('calc-result-interest').textContent = `₹${totalInterest.toFixed(2)}`;
    document.getElementById('calc-result-total').textContent = `₹${totalPayment.toFixed(2)}`;

    let balance = principal;
    let scheduleHtml = '';
    
    for (let i = 1; i <= months; i++) {
        let interest = balance * monthlyRate;
        let principalPaid = emi - interest;
        if (i === months) { principalPaid = balance; balance = 0; } // Adjust last month
        else balance -= principalPaid;
        if (balance < 0) balance = 0;

        scheduleHtml += `<tr><td>${i}</td><td>₹${principalPaid.toFixed(2)}</td><td>₹${interest.toFixed(2)}</td><td>₹${balance.toFixed(2)}</td></tr>`;
    }
    document.getElementById('calc-schedule-body').innerHTML = scheduleHtml;
    document.getElementById('calc-results').classList.remove('d-none');
};
