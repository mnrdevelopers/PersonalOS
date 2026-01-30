window.loadGoalsSection = async function() {
    const container = document.getElementById('goals-section');
    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Goals</h2>
            <button class="btn btn-primary" onclick="showAddGoalModal()">
                <i class="fas fa-plus me-2"></i>New Goal
            </button>
        </div>
        <div class="row g-4" id="goals-grid">
            <div class="col-12 text-center"><div class="spinner-border text-primary"></div></div>
        </div>
        
        <!-- Add Goal Modal -->
        <div class="modal fade" id="addGoalModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Set New Goal</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="goal-form">
                            <input type="hidden" id="goal-id">
                            <div class="mb-3">
                                <label class="form-label">Goal Title</label>
                                <input type="text" class="form-control" id="goal-title" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Target Amount/Value</label>
                                <input type="number" class="form-control" id="goal-target" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Current Progress</label>
                                <input type="number" class="form-control" id="goal-current" value="0">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Deadline</label>
                                <input type="date" class="form-control" id="goal-deadline">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Category</label>
                                <select class="form-select" id="goal-category">
                                    <option value="financial">Financial</option>
                                    <option value="personal">Personal</option>
                                    <option value="health">Health</option>
                                    <option value="career">Career</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveGoal()">Save Goal</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    await loadGoalsGrid();
};

window.showAddGoalModal = function() {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addGoalModal'));
    document.getElementById('goal-id').value = '';
    modal.show();
};

window.saveGoal = async function() {
    const id = document.getElementById('goal-id').value;
    const title = document.getElementById('goal-title').value;
    const target = parseFloat(document.getElementById('goal-target').value);
    const current = parseFloat(document.getElementById('goal-current').value) || 0;
    const deadline = document.getElementById('goal-deadline').value;
    const category = document.getElementById('goal-category').value;
    const user = auth.currentUser;

    if (!title || !target) {
        alert('Please fill in required fields');
        return;
    }

    try {
        const goal = {
            userId: user.uid,
            title,
            target,
            current,
            deadline,
            category,
            completed: current >= target
        };

        if (id) {
            goal.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('goals').doc(id).update(goal);
        } else {
            goal.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('goals').add(goal);
        }
        
        const modalEl = document.getElementById('addGoalModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        
        loadGoalsGrid();
        if(window.dashboard) window.dashboard.showNotification(id ? 'Goal updated successfully!' : 'Goal saved successfully!', 'success');
    } catch (error) {
        console.error("Error saving goal:", error);
        if(window.dashboard) window.dashboard.showNotification('Error saving goal', 'danger');
    }
};

async function loadGoalsGrid() {
    const user = auth.currentUser;
    const snapshot = await db.collection('goals')
        .where('userId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .get();

    const container = document.getElementById('goals-grid');
    if (snapshot.empty) {
        container.innerHTML = '<div class="col-12 text-center text-muted">No goals set yet.</div>';
        return;
    }

    container.innerHTML = '';
    snapshot.forEach(doc => {
        const data = doc.data();
        const percent = Math.min(100, Math.round((data.current / data.target) * 100));
        const color = percent >= 100 ? 'success' : 'primary';
        
        const col = document.createElement('div');
        col.className = 'col-md-6';
        col.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title">${data.title}</h5>
                        <span class="badge bg-secondary">${data.category}</span>
                    </div>
                    <div class="progress mb-2" style="height: 10px;">
                        <div class="progress-bar bg-${color}" role="progressbar" style="width: ${percent}%"></div>
                    </div>
                    <div class="d-flex justify-content-between small text-muted mb-3">
                        <span>${data.current} / ${data.target}</span>
                        <span>${percent}%</span>
                    </div>
                    <div class="input-group input-group-sm">
                        <input type="number" class="form-control" placeholder="Add progress" id="progress-${doc.id}">
                        <button class="btn btn-outline-primary" onclick="updateGoalProgress('${doc.id}', ${data.current})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    ${data.deadline ? `<small class="text-muted mt-2 d-block"><i class="far fa-clock me-1"></i> Due: ${new Date(data.deadline).toLocaleDateString()}</small>` : ''}
                </div>
                <div class="card-footer bg-transparent border-top-0 text-end">
                     <button class="btn btn-sm btn-outline-primary me-1" onclick="editGoal('${doc.id}')"><i class="fas fa-edit"></i></button>
                     <button class="btn btn-sm btn-outline-danger" onclick="deleteGoal('${doc.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

window.updateGoalProgress = async function(id, currentVal) {
    const input = document.getElementById(`progress-${id}`);
    const addVal = parseFloat(input.value);
    if (!addVal) return;

    const newVal = currentVal + addVal;
    
    await db.collection('goals').doc(id).update({
        current: newVal
    });
    loadGoalsGrid();
};

window.editGoal = async function(id) {
    try {
        const doc = await db.collection('goals').doc(id).get();
        if (!doc.exists) return;
        const data = doc.data();
        
        document.getElementById('goal-id').value = id;
        document.getElementById('goal-title').value = data.title;
        document.getElementById('goal-target').value = data.target;
        document.getElementById('goal-current').value = data.current;
        document.getElementById('goal-deadline').value = data.deadline;
        document.getElementById('goal-category').value = data.category;
        
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addGoalModal'));
        modal.show();
    } catch (e) { console.error(e); }
};

window.deleteGoal = async function(id) {
    if(confirm('Delete this goal?')) {
        await db.collection('goals').doc(id).delete();
        loadGoalsGrid();
    }
};
