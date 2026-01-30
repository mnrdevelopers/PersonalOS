let expirySearchQuery = '';
let currentExpiryFilter = 'all';

window.loadExpirySection = async function() {
    const container = document.getElementById('expiry-section');
    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Expiry Tracker</h2>
            <button class="btn btn-primary" onclick="showAddExpiryModal()">
                <i class="fas fa-plus me-2"></i>Add Document
            </button>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-8">
                <ul class="nav nav-tabs">
                    <li class="nav-item">
                        <a class="nav-link active" href="javascript:void(0)" onclick="filterExpiry('all', this)">All</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="javascript:void(0)" onclick="filterExpiry('expiring', this)">Expiring Soon</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="javascript:void(0)" onclick="filterExpiry('expired', this)">Expired</a>
                    </li>
                </ul>
            </div>
            <div class="col-md-4 mt-3 mt-md-0">
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input type="text" class="form-control" placeholder="Search documents..." onkeyup="window.searchExpiry(this.value)">
                </div>
            </div>
        </div>

        <div class="row g-4" id="expiry-grid">
            <div class="col-12 text-center"><div class="spinner-border text-primary"></div></div>
        </div>
        
        <!-- Add/Edit Modal -->
        <div class="modal fade" id="addExpiryModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="expiryModalTitle">Add Document</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="expiry-form">
                            <input type="hidden" id="expiry-id">
                            <div class="mb-3">
                                <label class="form-label">Document Name</label>
                                <input type="text" class="form-control" id="expiry-title" placeholder="e.g. Driving License" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Category</label>
                                <select class="form-select" id="expiry-category">
                                    <option value="Identity">Identity (Passport, PAN, Aadhaar)</option>
                                    <option value="Vehicle">Vehicle (RC, License, Pollution)</option>
                                    <option value="Insurance">Insurance (Health, Life, Car)</option>
                                    <option value="Financial">Financial (Cards, Deposits)</option>
                                    <option value="Subscription">Subscription</option>
                                    <option value="Warranty">Warranty</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Document Number (Optional)</label>
                                <input type="text" class="form-control" id="expiry-number" placeholder="XXXX-XXXX-XXXX">
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Issue Date</label>
                                    <input type="date" class="form-control" id="expiry-issue">
                                    <div class="form-text">Required for progress bar</div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Expiry Date</label>
                                    <input type="date" class="form-control" id="expiry-date" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Reminder (Days before)</label>
                                <select class="form-select" id="expiry-reminder">
                                    <option value="7">1 Week</option>
                                    <option value="15">15 Days</option>
                                    <option value="30" selected>1 Month</option>
                                    <option value="60">2 Months</option>
                                    <option value="90">3 Months</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Notes</label>
                                <textarea class="form-control" id="expiry-notes" rows="2"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveExpiry()">Save Document</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Renew Modal -->
        <div class="modal fade" id="renewExpiryModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Renew Document</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>Update the validity for <strong id="renew-doc-name"></strong>.</p>
                        <input type="hidden" id="renew-id">
                        <div class="mb-3">
                            <label class="form-label">New Issue Date</label>
                            <input type="date" class="form-control" id="renew-issue">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">New Expiry Date</label>
                            <input type="date" class="form-control" id="renew-date" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" onclick="confirmRenew()">Confirm Renewal</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    await loadExpiryGrid();
};

window.showAddExpiryModal = function() {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addExpiryModal'));
    document.getElementById('expiry-form').reset();
    document.getElementById('expiry-id').value = '';
    document.getElementById('expiryModalTitle').textContent = 'Add Document';
    modal.show();
};

window.searchExpiry = function(query) {
    expirySearchQuery = query.toLowerCase();
    loadExpiryGrid(currentExpiryFilter);
};

window.filterExpiry = function(filter, element) {
    currentExpiryFilter = filter;
    document.querySelectorAll('#expiry-section .nav-link').forEach(l => l.classList.remove('active'));
    element.classList.add('active');
    loadExpiryGrid(filter);
};

window.saveExpiry = async function() {
    const id = document.getElementById('expiry-id').value;
    const title = document.getElementById('expiry-title').value;
    const category = document.getElementById('expiry-category').value;
    const docNumber = document.getElementById('expiry-number').value;
    const issueDate = document.getElementById('expiry-issue').value;
    const expiryDate = document.getElementById('expiry-date').value;
    const reminderDays = parseInt(document.getElementById('expiry-reminder').value);
    const notes = document.getElementById('expiry-notes').value;
    const user = auth.currentUser;

    if (!title || !expiryDate) {
        alert('Please fill in required fields');
        return;
    }

    try {
        const docData = {
            userId: user.uid,
            title, category, docNumber, issueDate, expiryDate, reminderDays, notes
        };

        if (id) {
            docData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('expiry_docs').doc(id).update(docData);
        } else {
            docData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('expiry_docs').add(docData);
        }
        
        bootstrap.Modal.getInstance(document.getElementById('addExpiryModal')).hide();
        loadExpiryGrid(currentExpiryFilter);
        if(window.dashboard) window.dashboard.showNotification(id ? 'Document updated!' : 'Document added!', 'success');
    } catch (error) {
        console.error("Error saving document:", error);
        if(window.dashboard) window.dashboard.showNotification('Error saving document', 'danger');
    }
};

window.loadExpiryGrid = async function(filter = currentExpiryFilter) {
    const user = auth.currentUser;
    const container = document.getElementById('expiry-grid');
    
    try {
        const snapshot = await db.collection('expiry_docs')
            .where('userId', '==', user.uid)
            .orderBy('expiryDate', 'asc')
            .get();

        if (snapshot.empty) {
            container.innerHTML = '<div class="col-12 text-center text-muted py-5">No documents found.</div>';
            return;
        }

        container.innerHTML = '';
        const today = new Date();
        today.setHours(0,0,0,0);

        let docs = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id;
            const expiry = new Date(data.expiryDate);
            const diffTime = expiry - today;
            const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            data.daysRemaining = daysRemaining;
            docs.push(data);
        });

        // Search Filter
        if (expirySearchQuery) {
            docs = docs.filter(d => 
                d.title.toLowerCase().includes(expirySearchQuery) || 
                d.category.toLowerCase().includes(expirySearchQuery) ||
                (d.docNumber && d.docNumber.toLowerCase().includes(expirySearchQuery))
            );
        }

        // Category/Status Filter
        if (filter === 'expiring') {
            docs = docs.filter(d => d.daysRemaining >= 0 && d.daysRemaining <= 30);
        } else if (filter === 'expired') {
            docs = docs.filter(d => d.daysRemaining < 0);
        }

        if (docs.length === 0) {
            container.innerHTML = `<div class="col-12 text-center text-muted py-5">No matching documents found.</div>`;
            return;
        }

        docs.forEach(data => {
            let statusClass = 'bg-success';
            let statusText = 'Active';
            let borderClass = 'border-success';
            
            if (data.daysRemaining < 0) {
                statusClass = 'bg-danger';
                statusText = 'Expired';
                borderClass = 'border-danger';
            } else if (data.daysRemaining <= 30) {
                statusClass = 'bg-warning text-dark';
                statusText = `Expiring in ${data.daysRemaining} days`;
                borderClass = 'border-warning';
            } else {
                statusText = `${data.daysRemaining} days left`;
            }

            // Progress bar calculation (if issue date exists)
            let progressHtml = '';
            if (data.issueDate) {
                const start = new Date(data.issueDate).getTime();
                const end = new Date(data.expiryDate).getTime();
                const now = new Date().getTime();
                const total = end - start;
                const elapsed = now - start;
                let percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
                
                // Invert logic: 100% means expired/used up
                let barColor = 'bg-success';
                if (percent > 75) barColor = 'bg-warning';
                if (percent >= 100) barColor = 'bg-danger';

                progressHtml = `
                    <div class="mt-2">
                        <div class="d-flex justify-content-between small text-muted mb-1">
                            <span>Validity Used</span>
                            <span>${Math.round(percent)}%</span>
                        </div>
                        <div class="progress" style="height: 6px;">
                            <div class="progress-bar ${barColor}" role="progressbar" style="width: ${percent}%"></div>
                        </div>
                    </div>
                `;
            } else {
                progressHtml = `<div class="mt-2 small text-muted fst-italic">Add Issue Date to see progress</div>`;
            }

            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4';
            col.innerHTML = `
                <div class="card h-100 ${borderClass} shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <h5 class="card-title mb-0">${data.title}</h5>
                                <span class="badge bg-light text-dark border mt-1">${data.category}</span>
                            </div>
                            <div class="dropdown">
                                <button class="btn btn-link text-muted p-0" data-bs-toggle="dropdown">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li><a class="dropdown-item" href="javascript:void(0)" onclick="editExpiry('${data.id}')">Edit</a></li>
                                    <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="deleteExpiry('${data.id}')">Delete</a></li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <span class="badge ${statusClass} mb-2">${statusText}</span>
                            ${progressHtml}
                        </div>

                        <div class="small text-muted mb-3">
                            ${data.docNumber ? `<div class="mb-1"><i class="fas fa-id-card me-2"></i>${data.docNumber}</div>` : ''}
                            <div class="mb-1"><i class="fas fa-calendar-check me-2"></i>Expires: ${new Date(data.expiryDate).toLocaleDateString()}</div>
                            ${data.issueDate ? `<div><i class="fas fa-calendar me-2"></i>Issued: ${new Date(data.issueDate).toLocaleDateString()}</div>` : ''}
                        </div>
                        
                        ${data.notes ? `<p class="small text-muted bg-light p-2 rounded mb-3">${data.notes}</p>` : ''}

                        <button class="btn btn-outline-primary w-100" onclick="renewExpiry('${data.id}', '${data.title}')">
                            <i class="fas fa-sync-alt me-2"></i>Renew Document
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });

    } catch (error) {
        console.error("Error loading expiry grid:", error);
        container.innerHTML = '<div class="col-12 text-center text-danger">Error loading documents.</div>';
    }
};

window.editExpiry = async function(id) {
    try {
        const doc = await db.collection('expiry_docs').doc(id).get();
        if (!doc.exists) return;
        const data = doc.data();
        
        document.getElementById('expiry-id').value = id;
        document.getElementById('expiry-title').value = data.title;
        document.getElementById('expiry-category').value = data.category;
        document.getElementById('expiry-number').value = data.docNumber || '';
        document.getElementById('expiry-issue').value = data.issueDate || '';
        document.getElementById('expiry-date').value = data.expiryDate;
        document.getElementById('expiry-reminder').value = data.reminderDays || 30;
        document.getElementById('expiry-notes').value = data.notes || '';
        
        document.getElementById('expiryModalTitle').textContent = 'Edit Document';
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addExpiryModal'));
        modal.show();
    } catch (e) { console.error(e); }
};

window.deleteExpiry = async function(id) {
    if(confirm('Delete this document tracker?')) {
        await db.collection('expiry_docs').doc(id).delete();
        loadExpiryGrid(currentExpiryFilter);
        if(window.dashboard) window.dashboard.showNotification('Document deleted', 'success');
    }
};

window.renewExpiry = function(id, title) {
    document.getElementById('renew-id').value = id;
    document.getElementById('renew-doc-name').textContent = title;
    document.getElementById('renew-issue').value = new Date().toISOString().split('T')[0];
    document.getElementById('renew-date').value = '';
    
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('renewExpiryModal'));
    modal.show();
};

window.confirmRenew = async function() {
    const id = document.getElementById('renew-id').value;
    const newIssue = document.getElementById('renew-issue').value;
    const newExpiry = document.getElementById('renew-date').value;
    
    if (!newExpiry) {
        alert('Please select new expiry date');
        return;
    }

    try {
        await db.collection('expiry_docs').doc(id).update({
            issueDate: newIssue,
            expiryDate: newExpiry,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        bootstrap.Modal.getInstance(document.getElementById('renewExpiryModal')).hide();
        loadExpiryGrid(currentExpiryFilter);
        if(window.dashboard) window.dashboard.showNotification('Document renewed successfully!', 'success');
    } catch (error) {
        console.error("Error renewing document:", error);
    }
};

window.getExpiryEvents = async function() {
    const user = auth.currentUser;
    if (!user) return [];
    const snapshot = await db.collection('expiry_docs')
        .where('userId', '==', user.uid)
        .get();
    
    const events = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    snapshot.forEach(doc => {
        const data = doc.data();
        const expiry = new Date(data.expiryDate);
        const diffTime = expiry - today;
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        events.push({
            ...data,
            id: doc.id,
            date: expiry,
            daysRemaining: daysRemaining,
            status: daysRemaining < 0 ? 'expired' : (daysRemaining <= 30 ? 'warning' : 'normal')
        });
    });
    return events;
};
