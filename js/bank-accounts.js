/* ═══════════════════════════════════════════════════════════════
   BANK ACCOUNTS MODULE  –  PersonalOS
   Manages user's multiple bank accounts (savings, current, salary…)
   and provides helpers used by finance.js, dashboard.js & loans.js
   ═══════════════════════════════════════════════════════════════ */

/* ── In-memory cache ── */
let _bankAccountsCache = null;
let _bankAccountsCacheUid = null;

/* ── Account type display labels & icons ── */
const BANK_ACCOUNT_TYPE_META = {
    savings:  { label: 'Savings',  icon: '🏦', color: '#0284c7' },
    current:  { label: 'Current',  icon: '🏪', color: '#7c3aed' },
    salary:   { label: 'Salary',   icon: '💰', color: '#16a34a' },
    fd:       { label: 'FD',       icon: '📈', color: '#d97706' },
    nri:      { label: 'NRI',      icon: '🌍', color: '#0891b2' },
    joint:    { label: 'Joint',    icon: '👥', color: '#8b5cf6' },
    other:    { label: 'Other',    icon: '🏧', color: '#64748b' }
};

const BANK_ACCOUNT_COLORS = [
    '#4f46e5','#0284c7','#16a34a','#dc2626','#d97706',
    '#7c3aed','#0891b2','#db2777','#ea580c','#059669',
    '#6366f1','#14b8a6','#f59e0b','#8b5cf6','#84cc16'
];

/* ══════════════════════════════════════════
   PUBLIC API — Data helpers
   ══════════════════════════════════════════ */

/**
 * Fetches and caches the current user's bank accounts.
 * @returns {Promise<Array>} array of {id, name, bankName, accountType, last4, color, icon, isDefault}
 */
window.getUserBankAccounts = async function(forceRefresh = false) {
    const user = auth.currentUser;
    if (!user) return [];

    if (!forceRefresh && _bankAccountsCache && _bankAccountsCacheUid === user.uid) {
        return _bankAccountsCache;
    }

    try {
        const snap = await db.collection('bank_accounts')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'asc')
            .get();

        _bankAccountsCache = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        _bankAccountsCacheUid = user.uid;
        window._bankAccountsCache = _bankAccountsCache; // expose for stats rendering
        return _bankAccountsCache;
    } catch (e) {
        console.error('Error fetching bank accounts:', e);
        return [];
    }
};

/** Invalidates the in-memory cache (call after create/update/delete). */
window.invalidateBankAccountsCache = function() {
    _bankAccountsCache = null;
    window._bankAccountsCache = null;
};

/**
 * Returns the display label for a given bankAccountId.
 * Falls back to "Bank" for legacy/untagged entries.
 */
window.getBankAccountLabel = function(id) {
    if (!id || !_bankAccountsCache) return 'Bank';
    const acc = _bankAccountsCache.find(a => a.id === id);
    return acc ? acc.name : 'Bank';
};

/**
 * Populates a <select> element with the user's bank accounts.
 * @param {string} selectId  – the select element's id
 * @param {object} opts      – { placeholder, includeBlank, selectedId }
 */
window.populateBankAccountSelect = async function(selectId, opts = {}) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const accounts = await window.getUserBankAccounts();

    const placeholder = opts.placeholder || 'Select bank account…';
    select.innerHTML = `<option value="" ${opts.includeBlank === false ? 'disabled' : ''} selected>${placeholder}</option>`;

    if (accounts.length === 0) {
        select.innerHTML += `<option value="" disabled>No accounts added yet — add from Finance → Bank Accounts</option>`;
        return;
    }

    accounts.forEach(acc => {
        const typeMeta = BANK_ACCOUNT_TYPE_META[acc.accountType] || BANK_ACCOUNT_TYPE_META.other;
        const last4Part = acc.last4 ? ` (..${acc.last4})` : '';
        const opt = document.createElement('option');
        opt.value = acc.id;
        opt.textContent = `${typeMeta.icon} ${acc.name}${last4Part}`;
        if (opts.selectedId && opts.selectedId === acc.id) opt.selected = true;
        select.appendChild(opt);
    });
};

/* ══════════════════════════════════════════
   BANK ACCOUNTS SECTION UI
   ══════════════════════════════════════════ */

window.loadBankAccountsSection = async function() {
    const user = auth.currentUser;
    if (!user) return;

    const container = document.getElementById('finance-accounts-view');
    if (!container) return;

    container.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>`;

    const accounts = await window.getUserBankAccounts(true);

    // Fetch per-account balances from transactions
    let txSnap = null;
    try {
        txSnap = await db.collection('transactions')
            .where('userId', '==', user.uid)
            .get();
    } catch (e) { console.error(e); }

    const balances = {};
    const txCounts = {};
    if (txSnap) {
        txSnap.forEach(doc => {
            const d = doc.data();
            
            if (d.type === 'transfer') {
                if (d.sourceAccountType === 'bank' && d.bankAccountId) {
                    const srcKey = d.bankAccountId;
                    if (!balances[srcKey]) { balances[srcKey] = 0; txCounts[srcKey] = 0; }
                    balances[srcKey] -= Number(d.amount) || 0;
                    txCounts[srcKey]++;
                }
                if (d.destinationAccountType === 'bank' && d.destinationBankAccountId) {
                    const dstKey = d.destinationBankAccountId;
                    if (!balances[dstKey]) { balances[dstKey] = 0; txCounts[dstKey] = 0; }
                    balances[dstKey] += Number(d.amount) || 0;
                    txCounts[dstKey]++;
                }
            } else {
                const accountMeta = window.getTransactionAccountMeta ? window.getTransactionAccountMeta(d) : null;
                const isBank = accountMeta ? (accountMeta.type === 'bank') : (d.accountType === 'bank' || d.paymentMode === 'bank' || d.paymentMode === 'upi' || d.paymentMode === 'debit-card');
                
                if (isBank) {
                    const key = d.bankAccountId || '__unassigned__';
                    if (!balances[key]) { balances[key] = 0; txCounts[key] = 0; }
                    txCounts[key]++;
                    if (d.type === 'income') balances[key] += Number(d.amount) || 0;
                    else if (d.type === 'expense') balances[key] -= Number(d.amount) || 0;
                }
            }
        });
    }

    container.innerHTML = `
        <div class="ba-section">
            <!-- Header -->
            <div class="ba-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <div class="ba-kicker">Accounts</div>
                    <h4 class="ba-title mb-0">Your Bank Accounts</h4>
                    <div class="ba-subtitle">Track balances across all your bank accounts in one place.</div>
                </div>
                <button class="btn btn-dark btn-sm ba-add-btn" onclick="openBankAccountModal()">
                    <i class="fas fa-plus me-2"></i>Add Account
                </button>
            </div>

            <!-- Account Cards Grid -->
            <div class="ba-grid" id="ba-cards-grid">
                ${accounts.length === 0 ? renderBankAccountEmptyState() : accounts.map(acc => renderBankAccountCard(acc, balances, txCounts)).join('')}
            </div>

            ${Object.keys(balances).includes('__unassigned__') && balances['__unassigned__'] !== undefined ? `
            <!-- Unassigned Bank Transactions Note -->
            <div class="ba-unassigned-note mt-3">
                <i class="fas fa-info-circle me-2"></i>
                <span><strong>Unassigned bank transactions</strong> — ₹${Math.abs(balances['__unassigned__'] || 0).toFixed(2)} in historical transactions not linked to a named account. Assign them by editing each transaction.</span>
            </div>` : ''}
        </div>

        <!-- Add/Edit Bank Account Modal -->
        ${renderBankAccountModal()}
    `;

    // Wire up modal close
    document.getElementById('ba-modal-close')?.addEventListener('click', closeBankAccountModal);
    document.getElementById('ba-modal-cancel')?.addEventListener('click', closeBankAccountModal);
};

function renderBankAccountEmptyState() {
    return `
        <div class="ba-empty-state">
            <div class="ba-empty-icon">🏦</div>
            <div class="ba-empty-title">No bank accounts yet</div>
            <div class="ba-empty-sub">Add your bank accounts to track balances accurately. Each transaction can then be linked to the right account.</div>
            <button class="btn btn-primary mt-3" onclick="openBankAccountModal()">
                <i class="fas fa-plus me-2"></i>Add Your First Account
            </button>
        </div>`;
}

function renderBankAccountCard(acc, balances, txCounts) {
    const typeMeta = BANK_ACCOUNT_TYPE_META[acc.accountType] || BANK_ACCOUNT_TYPE_META.other;
    const balance = balances[acc.id] || 0;
    const count = txCounts[acc.id] || 0;
    const balanceClass = balance >= 0 ? 'text-success' : 'text-danger';
    const balanceSign = balance >= 0 ? '' : '-';
    const color = acc.color || typeMeta.color;
    const icon = acc.icon || typeMeta.icon;
    const last4Part = acc.last4 ? `<span class="ba-card-last4">••••  ${acc.last4}</span>` : '';
    const defaultBadge = acc.isDefault ? `<span class="ba-default-badge">Default</span>` : '';

    return `
        <div class="ba-card" style="--ba-color: ${color}">
            <div class="ba-card-accent"></div>
            <div class="ba-card-body">
                <div class="ba-card-top">
                    <div class="ba-card-icon-wrap" style="background:${color}20; color:${color}">
                        <span class="ba-card-icon">${icon}</span>
                    </div>
                    <div class="ba-card-actions">
                        ${defaultBadge}
                        <button class="ba-action-btn" onclick="openBankAccountModal('${acc.id}')" title="Edit">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="ba-action-btn ba-action-delete" onclick="deleteBankAccount('${acc.id}', '${(acc.name || '').replace(/'/g, "\\'")}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="ba-card-name">${acc.name || 'Unnamed Account'}</div>
                ${acc.bankName ? `<div class="ba-card-bank">${acc.bankName}</div>` : ''}
                <div class="ba-card-meta">
                    <span class="ba-type-badge" style="background:${color}18; color:${color}">${typeMeta.icon} ${typeMeta.label}</span>
                    ${last4Part}
                </div>
                <div class="ba-card-balance-row">
                    <div>
                        <div class="ba-balance-label">Net Balance</div>
                        <div class="ba-balance-amount ${balanceClass}">${balanceSign}₹${Math.abs(balance).toFixed(2)}</div>
                    </div>
                    <div class="ba-tx-count">
                        <i class="fas fa-receipt"></i> ${count} txns
                    </div>
                </div>
            </div>
        </div>`;
}

function renderBankAccountModal() {
    return `
        <div class="ba-modal-overlay d-none" id="ba-modal-overlay" onclick="closeBankAccountModal()">
            <div class="ba-modal" onclick="event.stopPropagation()">
                <div class="ba-modal-header">
                    <span id="ba-modal-title" class="ba-modal-title-text">Add Bank Account</span>
                    <button class="ba-modal-close-btn" id="ba-modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="ba-modal-body">
                    <input type="hidden" id="ba-edit-id">
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Account Name <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="ba-name" placeholder="e.g. SBI Savings, HDFC Salary">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Bank Name</label>
                        <input type="text" class="form-control" id="ba-bank-name" placeholder="e.g. State Bank of India">
                    </div>
                    <div class="row mb-3">
                        <div class="col-6">
                            <label class="form-label fw-semibold">Account Type</label>
                            <select class="form-select" id="ba-account-type">
                                <option value="savings">Savings</option>
                                <option value="current">Current</option>
                                <option value="salary">Salary</option>
                                <option value="fd">Fixed Deposit</option>
                                <option value="nri">NRI</option>
                                <option value="joint">Joint</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="col-6">
                            <label class="form-label fw-semibold">Last 4 Digits (optional)</label>
                            <input type="text" class="form-control" id="ba-last4" maxlength="4" placeholder="1234">
                        </div>
                    </div>
                    <!-- Icon & Color -->
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Icon</label>
                        <div class="d-flex align-items-center gap-2">
                            <button type="button" class="ba-icon-btn" id="ba-icon-trigger" onclick="toggleBaIconPicker(event)">🏦</button>
                            <span class="text-muted small">Click to change icon</span>
                        </div>
                        <input type="hidden" id="ba-icon" value="🏦">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Color</label>
                        <div class="ba-color-row" id="ba-color-row"></div>
                        <input type="hidden" id="ba-color" value="#0284c7">
                    </div>
                    <div class="form-check mb-0">
                        <input class="form-check-input" type="checkbox" id="ba-is-default">
                        <label class="form-check-label" for="ba-is-default">Set as default account</label>
                    </div>
                </div>
                <div class="ba-modal-footer">
                    <button class="btn btn-secondary" id="ba-modal-cancel">Cancel</button>
                    <button class="btn btn-primary" id="ba-modal-save" onclick="saveBankAccount()">Save Account</button>
                </div>
            </div>
        </div>`;
}

/* ── Color swatches ── */
let _baSelectedColor = '#0284c7';
function renderBaColorSwatches() {
    const row = document.getElementById('ba-color-row');
    if (!row) return;
    row.innerHTML = BANK_ACCOUNT_COLORS.map(c => `
        <span class="ba-color-swatch${_baSelectedColor === c ? ' selected' : ''}"
              style="background:${c}" title="${c}"
              onclick="selectBaColor('${c}')"></span>
    `).join('');
}
window.selectBaColor = function(c) {
    _baSelectedColor = c;
    document.getElementById('ba-color').value = c;
    renderBaColorSwatches();
};

/* ── Mini emoji picker for bank accounts ── */
const BA_BANK_EMOJIS = ['🏦','🏪','💳','💰','🏧','💵','🪙','📈','💹','🏛️','🏗️','🌍','👥','💼','🔑','💡'];
window.toggleBaIconPicker = function(event) {
    event.stopPropagation();
    const existing = document.getElementById('ba-icon-picker-pop');
    if (existing) { existing.remove(); return; }

    const trigger = document.getElementById('ba-icon-trigger');
    const rect = trigger.getBoundingClientRect();
    const picker = document.createElement('div');
    picker.id = 'ba-icon-picker-pop';
    picker.className = 'cat-emoji-picker';
    picker.style.top = (rect.bottom + window.scrollY + 6) + 'px';
    picker.style.left = Math.min(rect.left + window.scrollX, window.innerWidth - 250) + 'px';
    picker.innerHTML = `
        <div class="cat-emoji-picker-title">Pick Bank Icon</div>
        <div class="cat-emoji-grid">
            ${BA_BANK_EMOJIS.map(e => `<span class="cat-emoji-opt" onclick="selectBaIcon('${e}')">${e}</span>`).join('')}
        </div>`;
    document.body.appendChild(picker);
    setTimeout(() => document.addEventListener('click', () => picker.remove(), { once: true }), 0);
};
window.selectBaIcon = function(emoji) {
    document.getElementById('ba-icon').value = emoji;
    const btn = document.getElementById('ba-icon-trigger');
    if (btn) btn.textContent = emoji;
    document.getElementById('ba-icon-picker-pop')?.remove();
};

/* ── Open modal ── */
window.openBankAccountModal = async function(id = '') {
    // Ensure section is rendered first (modal lives inside it)
    const overlay = document.getElementById('ba-modal-overlay');
    if (!overlay) {
        await window.loadBankAccountsSection();
    }

    const editOverlay = document.getElementById('ba-modal-overlay');
    if (!editOverlay) return;

    // Reset form
    document.getElementById('ba-edit-id').value = '';
    document.getElementById('ba-name').value = '';
    document.getElementById('ba-bank-name').value = '';
    document.getElementById('ba-account-type').value = 'savings';
    document.getElementById('ba-last4').value = '';
    document.getElementById('ba-icon').value = '🏦';
    document.getElementById('ba-icon-trigger').textContent = '🏦';
    document.getElementById('ba-is-default').checked = false;
    _baSelectedColor = '#0284c7';
    document.getElementById('ba-color').value = _baSelectedColor;
    renderBaColorSwatches();

    if (id) {
        // Edit mode — load existing data
        document.getElementById('ba-modal-title').textContent = 'Edit Bank Account';
        try {
            const doc = await db.collection('bank_accounts').doc(id).get();
            if (doc.exists) {
                const d = doc.data();
                document.getElementById('ba-edit-id').value = id;
                document.getElementById('ba-name').value = d.name || '';
                document.getElementById('ba-bank-name').value = d.bankName || '';
                document.getElementById('ba-account-type').value = d.accountType || 'savings';
                document.getElementById('ba-last4').value = d.last4 || '';
                document.getElementById('ba-icon').value = d.icon || '🏦';
                document.getElementById('ba-icon-trigger').textContent = d.icon || '🏦';
                document.getElementById('ba-is-default').checked = !!d.isDefault;
                _baSelectedColor = d.color || '#0284c7';
                document.getElementById('ba-color').value = _baSelectedColor;
                renderBaColorSwatches();
            }
        } catch (e) { console.error(e); }
    } else {
        document.getElementById('ba-modal-title').textContent = 'Add Bank Account';
    }

    editOverlay.classList.remove('d-none');
    editOverlay.classList.add('ba-modal-visible');
    document.getElementById('ba-name')?.focus();
};

window.closeBankAccountModal = function() {
    const overlay = document.getElementById('ba-modal-overlay');
    if (overlay) { overlay.classList.add('d-none'); overlay.classList.remove('ba-modal-visible'); }
};

/* ── Save (create/update) ── */
window.saveBankAccount = async function() {
    const user = auth.currentUser;
    if (!user) return;

    const id = document.getElementById('ba-edit-id').value;
    const name = document.getElementById('ba-name').value.trim();
    const bankName = document.getElementById('ba-bank-name').value.trim();
    const accountType = document.getElementById('ba-account-type').value;
    const last4 = document.getElementById('ba-last4').value.trim().slice(-4);
    const icon = document.getElementById('ba-icon').value || '🏦';
    const color = document.getElementById('ba-color').value || '#0284c7';
    const isDefault = document.getElementById('ba-is-default').checked;

    if (!name) {
        if (window.dashboard) window.dashboard.showNotification('Please enter an account name', 'warning');
        document.getElementById('ba-name')?.focus();
        return;
    }

    const btn = document.getElementById('ba-modal-save');
    if (btn) window.setBtnLoading(btn, true);

    const payload = { userId: user.uid, name, bankName, accountType, last4, icon, color, isDefault };

    try {
        // If setting as default, unset others first
        if (isDefault) {
            const existing = await db.collection('bank_accounts').where('userId', '==', user.uid).where('isDefault', '==', true).get();
            const batch = db.batch();
            existing.forEach(doc => { if (doc.id !== id) batch.update(doc.ref, { isDefault: false }); });
            await batch.commit();
        }

        if (id) {
            payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('bank_accounts').doc(id).update(payload);
        } else {
            payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('bank_accounts').add(payload);
        }

        window.invalidateBankAccountsCache();
        closeBankAccountModal();
        await window.loadBankAccountsSection();
        if (window.dashboard) window.dashboard.showNotification(id ? 'Account updated ✓' : 'Account added ✓', 'success');
    } catch (e) {
        console.error('Error saving bank account:', e);
        if (window.dashboard) window.dashboard.showNotification('Error saving account: ' + e.message, 'danger');
    } finally {
        if (btn) window.setBtnLoading(btn, false);
    }
};

/* ── Delete ── */
window.deleteBankAccount = async function(id, name) {
    if (!confirm(`Delete "${name}"?\n\nExisting transactions linked to this account will still show the account name but will become "unassigned". This cannot be undone.`)) return;

    if (window.dashboard) window.dashboard.showLoading();
    try {
        await db.collection('bank_accounts').doc(id).delete();
        window.invalidateBankAccountsCache();
        await window.loadBankAccountsSection();
        if (window.dashboard) window.dashboard.showNotification('Account deleted', 'success');
    } catch (e) {
        console.error(e);
        if (window.dashboard) window.dashboard.showNotification('Error deleting account', 'danger');
    } finally {
        if (window.dashboard) window.dashboard.hideLoading();
    }
};

/* ══════════════════════════════════════════
   PER-ACCOUNT BALANCE CHIPS (Finance Hero)
   ══════════════════════════════════════════ */

/**
 * Renders compact per-account balance chips into a container element.
 * Called by finance.js after updateFinanceStats().
 * @param {string} containerId
 * @param {object} perAccountBalances  – { [bankAccountId]: number }
 * @param {Array}  accounts            – from getUserBankAccounts()
 */
window.renderBankAccountBalanceChips = function(containerId, perAccountBalances, accounts) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!accounts || accounts.length === 0) {
        container.innerHTML = '';
        return;
    }

    const chips = accounts.map(acc => {
        const balance = perAccountBalances[acc.id] || 0;
        const color = acc.color || '#0284c7';
        const balanceClass = balance >= 0 ? 'text-success' : 'text-danger';
        const icon = acc.icon || '🏦';
        return `
            <div class="ba-balance-chip" style="--ba-chip-color:${color}">
                <span class="ba-chip-icon">${icon}</span>
                <div class="ba-chip-info">
                    <span class="ba-chip-name">${acc.name}</span>
                    <span class="ba-chip-amount ${balanceClass}">₹${Math.abs(balance).toFixed(2)}</span>
                </div>
            </div>`;
    }).join('');

    container.innerHTML = `<div class="ba-chips-scroller">${chips}</div>`;
};
