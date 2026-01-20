window.loadMemoriesSection = async function() {
    const container = document.getElementById('memories-section');
    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Memories</h2>
            <button class="btn btn-primary" onclick="window.handleQuickAction('add-memory')">
                <i class="fas fa-camera me-2"></i>Add Memory
            </button>
        </div>
        <div class="row g-4" id="memories-grid">
            <div class="col-12 text-center"><div class="spinner-border text-primary"></div></div>
        </div>
    `;
    await loadMemoriesGrid();
};

async function loadMemoriesGrid() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const snapshot = await db.collection('memories')
            .where('userId', '==', user.uid)
            .orderBy('date', 'desc')
            .get();

    const container = document.getElementById('memories-grid');
    if (snapshot.empty) {
        container.innerHTML = '<div class="col-12 text-center text-muted py-5">No memories captured yet.</div>';
        return;
    }

    container.innerHTML = '';
    snapshot.forEach(doc => {
        const data = doc.data();
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';
        
        let imageHtml = '';
        if (data.imageUrl) {
            imageHtml = `<img src="${data.imageUrl}" class="card-img-top" alt="${data.title}" style="height: 200px; object-fit: cover;">`;
        } else {
            imageHtml = `<div class="card-img-top bg-secondary d-flex align-items-center justify-content-center" style="height: 200px;">
                            <i class="fas fa-image fa-3x text-white-50"></i>
                         </div>`;
        }

        col.innerHTML = `
            <div class="card h-100">
                ${imageHtml}
                <div class="card-body">
                    <h5 class="card-title">${data.title}</h5>
                    <p class="card-text text-muted small mb-2"><i class="far fa-calendar-alt me-1"></i> ${new Date(data.date).toLocaleDateString()}</p>
                    <p class="card-text">${data.description || ''}</p>
                    <div class="mt-2">
                        ${(data.tags || []).map(tag => `<span class="badge bg-light text-dark border me-1">#${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="card-footer bg-transparent border-top-0 text-end">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editMemory('${doc.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteMemory('${doc.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
    } catch (error) {
        console.error("Error loading memories:", error);
        document.getElementById('memories-grid').innerHTML = '<div class="col-12 text-center text-danger">Error loading memories.</div>';
    }
}

window.editMemory = async function(id) {
    try {
        const doc = await db.collection('memories').doc(id).get();
        if (!doc.exists) return;
        const data = doc.data();
        
        document.getElementById('memory-id').value = id;
        document.getElementById('memory-title').value = data.title;
        document.getElementById('memory-description').value = data.description;
        document.getElementById('memory-date').value = data.date;
        document.getElementById('memory-tags').value = (data.tags || []).join(', ');
        
        const modal = new bootstrap.Modal(document.getElementById('addMemoryModal'));
        modal.show();
    } catch (e) { console.error(e); }
};

window.deleteMemory = async function(id) {
    if(confirm('Delete this memory?')) {
        await db.collection('memories').doc(id).delete();
        loadMemoriesGrid();
        if(window.dashboard) window.dashboard.updateStats();
    }
};