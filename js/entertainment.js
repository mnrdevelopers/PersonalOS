window.loadEntertainmentSection = async function() {
    const container = document.getElementById('entertainment-section');
    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Entertainment Tracker</h2>
            <button class="btn btn-primary" onclick="showAddEntertainmentModal()">
                <i class="fas fa-plus me-2"></i>Add Activity
            </button>
        </div>
        
        <ul class="nav nav-tabs mb-4">
            <li class="nav-item">
                <a class="nav-link active" href="javascript:void(0)" onclick="filterEntertainment('all', this)">All</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="javascript:void(0)" onclick="filterEntertainment('movie', this)">Movies</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="javascript:void(0)" onclick="filterEntertainment('tour', this)">Tours & Trips</a>
            </li>
        </ul>

        <div class="row g-4" id="entertainment-grid">
            <div class="col-12 text-center"><div class="spinner-border text-primary"></div></div>
        </div>
        
        <!-- Add Entertainment Modal -->
        <div class="modal fade" id="addEntertainmentModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Log Entertainment</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="entertainment-form">
                            <input type="hidden" id="ent-id">
                            <div class="mb-3">
                                <label class="form-label">Type</label>
                                <select class="form-select" id="ent-type">
                                    <option value="movie">Movie (Theater)</option>
                                    <option value="tour">Tour / Trip</option>
                                    <option value="other">Other Event</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Title / Name</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="ent-title" placeholder="e.g. Avatar 2 or Paris Trip" required>
                                    <button class="btn btn-outline-secondary" type="button" id="btn-fetch-movie" onclick="fetchMovieDetails()" title="Fetch Movie Details">
                                        <i class="fas fa-magic"></i>
                                    </button>
                                </div>
                                <div id="movie-preview" class="mt-2 d-none p-2 border rounded bg-light d-flex align-items-center">
                                    <img id="ent-poster-preview" src="" alt="Poster" style="height: 60px; width: auto; border-radius: 4px; margin-right: 10px;">
                                    <input type="hidden" id="ent-poster">
                                    <small class="text-muted">Poster & Rating fetched</small>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Location / Theater</label>
                                <input type="text" class="form-control" id="ent-location" placeholder="e.g. IMAX Cinema or France">
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Date</label>
                                    <input type="date" class="form-control" id="ent-date" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Cost</label>
                                    <div class="input-group">
                                        <span class="input-group-text">₹</span>
                                        <input type="number" class="form-control" id="ent-cost" min="0" step="0.01">
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="ent-add-ledger" onchange="toggleEntPaymentMode()">
                                    <label class="form-check-label" for="ent-add-ledger">Add to Transaction Ledger</label>
                                </div>
                            </div>
                            <div class="mb-3 d-none" id="ent-payment-div">
                                <label class="form-label">Payment Mode</label>
                                <select class="form-select" id="ent-payment-mode">
                                    <option value="upi">UPI</option>
                                    <option value="card">Card</option>
                                    <option value="cash">Cash</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Rating</label>
                                <div class="rating-select">
                                    <select class="form-select" id="ent-rating">
                                        <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
                                        <option value="4">⭐⭐⭐⭐ (Good)</option>
                                        <option value="3">⭐⭐⭐ (Average)</option>
                                        <option value="2">⭐⭐ (Poor)</option>
                                        <option value="1">⭐ (Terrible)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Notes / Review</label>
                                <textarea class="form-control" id="ent-notes" rows="2"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="btn-save-entertainment" onclick="saveEntertainment()">Save</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    await loadEntertainmentGrid();
};

window.showAddEntertainmentModal = function() {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addEntertainmentModal'));
    document.getElementById('entertainment-form').reset();
    document.getElementById('ent-id').value = '';
    document.getElementById('ent-poster').value = '';
    document.getElementById('movie-preview').classList.add('d-none');
    document.getElementById('ent-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('ent-add-ledger').checked = false;
    toggleEntPaymentMode();
    modal.show();
};

window.toggleEntPaymentMode = function() {
    const checked = document.getElementById('ent-add-ledger').checked;
    const div = document.getElementById('ent-payment-div');
    if (checked) div.classList.remove('d-none');
    else div.classList.add('d-none');
};

window.filterEntertainment = function(type, element) {
    document.querySelectorAll('#entertainment-section .nav-link').forEach(l => l.classList.remove('active'));
    element.classList.add('active');
    
    loadEntertainmentGrid(type);
};

window.fetchMovieDetails = async function() {
    const title = document.getElementById('ent-title').value;
    const type = document.getElementById('ent-type').value;
    
    if (!title) {
        if(window.dashboard) window.dashboard.showNotification('Please enter a title first', 'warning');
        return;
    }
    
    if (type !== 'movie') {
        if(window.dashboard) window.dashboard.showNotification('Auto-fetch is only available for movies', 'info');
        return;
    }

    const btn = document.getElementById('btn-fetch-movie');
    const originalIcon = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
    btn.disabled = true;

    try {
        // Using 'trilogy' as a demo key. Replace with your own OMDB API key in production.
        const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=a1b27d32`);
        const data = await response.json();

        if (data.Response === "True") {
            document.getElementById('ent-title').value = data.Title;
            
            if (data.Poster && data.Poster !== "N/A") {
                document.getElementById('ent-poster').value = data.Poster;
                document.getElementById('ent-poster-preview').src = data.Poster;
                document.getElementById('movie-preview').classList.remove('d-none');
            }

            if (data.imdbRating && data.imdbRating !== "N/A") {
                const rating = Math.round(parseFloat(data.imdbRating) / 2);
                document.getElementById('ent-rating').value = Math.max(1, Math.min(5, rating));
            }
            
            if(window.dashboard) window.dashboard.showNotification('Movie details found!', 'success');
        } else {
            if(window.dashboard) window.dashboard.showNotification('Movie not found', 'warning');
        }
    } catch (error) {
        console.error('Error fetching movie details:', error);
    } finally {
        btn.innerHTML = originalIcon;
        btn.disabled = false;
    }
};

window.saveEntertainment = async function() {
    const btn = document.getElementById('btn-save-entertainment');
    const id = document.getElementById('ent-id').value;
    const type = document.getElementById('ent-type').value;
    const title = document.getElementById('ent-title').value;
    const location = document.getElementById('ent-location').value;
    const date = document.getElementById('ent-date').value;
    const cost = parseFloat(document.getElementById('ent-cost').value) || 0;
    const rating = parseInt(document.getElementById('ent-rating').value);
    const notes = document.getElementById('ent-notes').value;
    const posterUrl = document.getElementById('ent-poster').value;
    const addToLedger = document.getElementById('ent-add-ledger').checked;
    const paymentMode = document.getElementById('ent-payment-mode').value;
    const user = auth.currentUser;

    if (!title || !date) {
        if(window.dashboard) window.dashboard.showNotification('Please fill in required fields', 'warning');
        return;
    }

    try {
        window.setBtnLoading(btn, true);

        const entry = {
            userId: user.uid,
            type, title, location, date, cost, rating, notes, posterUrl,
            status: 'watched' // Always set status to watched
        };

        let entId = id;

        if (id) {
            entry.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('entertainment').doc(id).update(entry);
        } else {
            entry.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await db.collection('entertainment').add(entry);
            entId = docRef.id;
        }

        // Handle Transaction Ledger
        const shouldHaveTransaction = cost > 0 && addToLedger;

        if (shouldHaveTransaction) {
            // Check for existing transaction to update, or create new
            let existingTx = null;
            if (id) {
                const txSnap = await db.collection('transactions')
                    .where('userId', '==', user.uid)
                    .where('relatedId', '==', entId)
                    .where('section', '==', 'entertainment')
                    .limit(1)
                    .get();
                if (!txSnap.empty) existingTx = txSnap.docs[0];
            }

            const txData = {
                userId: user.uid,
                date: date,
                amount: cost,
                type: 'expense',
                category: 'Entertainment',
                description: `Entertainment: ${title}`,
                paymentMode: paymentMode,
                relatedId: entId,
                section: 'entertainment',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (existingTx) {
                await existingTx.ref.update(txData);
            } else {
                txData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('transactions').add(txData);
            }
        } else if (id) {
            // If not adding to ledger, check if we need to delete an existing one (only for edits)
            const txSnap = await db.collection('transactions')
                .where('userId', '==', user.uid)
                .where('relatedId', '==', entId)
                .where('section', '==', 'entertainment')
                .get();
            
            if (!txSnap.empty) {
                const batch = db.batch();
                txSnap.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
            }
        }
        
        const modalEl = document.getElementById('addEntertainmentModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        
        loadEntertainmentGrid('all');
        if(window.dashboard) window.dashboard.showNotification(id ? 'Entry updated!' : 'Entry saved!', 'success');
    } catch (error) {
        window.setBtnLoading(btn, false);
        console.error("Error saving entertainment:", error);
        if(window.dashboard) window.dashboard.showNotification('Error saving entry', 'danger');
    }
};

window.loadEntertainmentGrid = async function(filter = 'all') {
    const user = auth.currentUser;
    let query = db.collection('entertainment')
        .where('userId', '==', user.uid)
        .orderBy('date', 'desc');
    
    if (filter !== 'all') {
        query = query.where('type', '==', filter);
    }

    const snapshot = await query.get();
    const container = document.getElementById('entertainment-grid');
    
    if (snapshot.empty) {
        container.innerHTML = '<div class="col-12 text-center text-muted py-5">No activities found.</div>';
        return;
    }

    container.innerHTML = '';
    snapshot.forEach(doc => {
        const data = doc.data();
        
        const icon = data.type === 'movie' ? 'fa-film' : (data.type === 'tour' ? 'fa-plane' : 'fa-ticket-alt');
        const stars = '⭐'.repeat(data.rating);
        
        let imageHtml = '';
        if (data.posterUrl) {
             imageHtml = `<img src="${data.posterUrl}" class="card-img-top" alt="${data.title}" style="height: 200px; object-fit: cover; object-position: top;">`;
        }

        let actionButtons = `
            <button class="btn btn-sm btn-outline-primary me-1" onclick="editEntertainment('${doc.id}')"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteEntertainment('${doc.id}')"><i class="fas fa-trash"></i></button>
        `;


        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';
        col.innerHTML = `
            <div class="card h-100">
                ${imageHtml}
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div class="d-flex align-items-center">
                            ${!data.posterUrl ? `<div class="bg-light rounded-circle p-2 me-3 text-primary"><i class="fas ${icon} fa-lg"></i></div>` : ''}
                            <div>
                                <h5 class="card-title mb-0">${data.title}</h5>
                                <small class="text-muted">${new Date(data.date).toLocaleDateString()}</small>
                            </div>
                        </div>
                        <span class="badge bg-secondary">${data.type.toUpperCase()}</span>
                    </div>
                    <div class="mb-2">
                        <small class="text-muted"><i class="fas fa-map-marker-alt me-1"></i> ${data.location || 'Unknown Location'}</small>
                    </div>
                    <div class="mb-2">${stars}</div>
                    <p class="card-text small text-muted">${data.notes || ''}</p>
                    ${data.cost > 0 ? `<div class="fw-bold text-success">₹${data.cost.toFixed(2)}</div>` : ''}
                </div>
                <div class="card-footer bg-transparent border-top-0 text-end">
                     ${actionButtons}
                </div>
            </div>
        `;
        container.appendChild(col);
    });
};

window.editEntertainment = async function(id) {
    const user = auth.currentUser;
    try {
        const doc = await db.collection('entertainment').doc(id).get();
        if (!doc.exists) return;
        const data = doc.data();
        
        document.getElementById('ent-id').value = id;
        document.getElementById('ent-type').value = data.type;
        document.getElementById('ent-title').value = data.title;
        document.getElementById('ent-location').value = data.location || '';
        document.getElementById('ent-date').value = data.date;
        document.getElementById('ent-cost').value = data.cost || '';
        document.getElementById('ent-rating').value = data.rating || 5;
        document.getElementById('ent-notes').value = data.notes || '';
        document.getElementById('ent-poster').value = data.posterUrl || '';
        
        if (data.posterUrl) {
            document.getElementById('ent-poster-preview').src = data.posterUrl;
            document.getElementById('movie-preview').classList.remove('d-none');
        } else {
            document.getElementById('movie-preview').classList.add('d-none');
        }
        
        // Check for linked transaction
        const txSnap = await db.collection('transactions')
            .where('userId', '==', user.uid)
            .where('relatedId', '==', id)
            .where('section', '==', 'entertainment')
            .limit(1)
            .get();
        
        if (!txSnap.empty) {
            document.getElementById('ent-add-ledger').checked = true;
            document.getElementById('ent-payment-mode').value = txSnap.docs[0].data().paymentMode || 'upi';
        } else {
            document.getElementById('ent-add-ledger').checked = false;
        }
        toggleEntPaymentMode();

        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addEntertainmentModal'));
        modal.show();
    } catch (e) { console.error(e); }
};

window.deleteEntertainment = async function(id) {
    if(confirm('Delete this entry?')) {
        if(window.dashboard) window.dashboard.showLoading();
        const user = auth.currentUser;
        try {
            // Delete linked transaction first
            const txSnap = await db.collection('transactions')
                .where('userId', '==', user.uid)
                .where('relatedId', '==', id)
                .where('section', '==', 'entertainment')
                .get();
            txSnap.forEach(doc => doc.ref.delete());

            await db.collection('entertainment').doc(id).delete();
            const activeTab = document.querySelector('#entertainment-section .nav-link.active');
            let filter = 'all';
            if (activeTab) {
                filter = activeTab.textContent.toLowerCase().includes('movie') ? 'movie' : 
                         (activeTab.textContent.toLowerCase().includes('tour') ? 'tour' : 'all');
            }
            loadEntertainmentGrid(filter);
            if(window.dashboard) window.dashboard.showNotification('Entry deleted', 'success');
        } catch(e) {
            if(window.dashboard) window.dashboard.showNotification('Error deleting entry', 'danger');
        } finally {
            if(window.dashboard) window.dashboard.hideLoading();
        }
    }
};
