window.loadHabitsSection = async function() {
    const container = document.getElementById('habits-section');
    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Habit Tracker</h2>
            <button class="btn btn-primary" onclick="window.handleQuickAction('add-habit')">
                <i class="fas fa-plus me-2"></i>New Habit
            </button>
        </div>
        <div class="row" id="habits-grid">
            <div class="col-12 text-center"><div class="spinner-border text-primary"></div></div>
        </div>
    `;
    await loadHabitsGrid();
};

async function loadHabitsGrid() {
    const user = auth.currentUser;
    if (!user) return;

    const snapshot = await db.collection('habits')
        .where('userId', '==', user.uid)
        .where('active', '==', true)
        .get();

    const container = document.getElementById('habits-grid');
    if (snapshot.empty) {
        container.innerHTML = '<div class="col-12 text-center text-muted">No active habits. Start by adding one!</div>';
        return;
    }

    container.innerHTML = '';
    
    // Get today's logs for all habits to check completion status
    const today = new Date().toISOString().split('T')[0];
    const logsSnapshot = await db.collection('habit_logs')
        .where('userId', '==', user.uid)
        .where('date', '==', today)
        .get();
    
    const completedHabits = new Set();
    logsSnapshot.forEach(doc => {
        if(doc.data().completed) completedHabits.add(doc.data().habitId);
    });

    snapshot.forEach(doc => {
        const habit = doc.data();
        const isCompleted = completedHabits.has(doc.id);
        const isBad = habit.type === 'bad';
        
        let statsHtml = '';
        let actionBtnHtml = '';
        let streakLabel = 'Current Streak';
        let streakValue = habit.streak || 0;
        let cardClass = 'h-100';
        
        if (isBad) {
            // Bad Habit Logic (Quit Mode)
            cardClass = 'h-100 border-danger';
            const startDate = habit.createdAt ? habit.createdAt.toDate() : new Date();
            const today = new Date();
            
            // Calculate Savings: (Days Active - Relapses) * Cost
            const totalDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
            const relapses = habit.totalCompletions || 0;
            const cleanDays = Math.max(0, totalDays - relapses);
            const savings = (cleanDays * (habit.cost || 0)).toFixed(0);
            
            // Calculate Days Clean (Streak)
            // If relapsed today (isCompleted), streak is 0. Else days since lastLogDate.
            if (isCompleted) {
                streakValue = 0;
            } else {
                const lastRelapse = habit.lastLogDate ? new Date(habit.lastLogDate) : startDate;
                const diffTime = Math.abs(today - lastRelapse);
                streakValue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            }
            
            statsHtml = `<div class="mt-2 text-success small fw-bold"><i class="fas fa-piggy-bank me-1"></i>Saved: ₹${savings}</div>`;
            streakLabel = 'Days Clean';
            
            actionBtnHtml = `
                <button class="btn ${isCompleted ? 'btn-danger' : 'btn-outline-danger'} rounded-circle p-3" 
                        style="width: 60px; height: 60px;"
                        onclick="window.toggleHabitCompletion('${doc.id}').then(() => loadHabitsGrid());"
                        title="${isCompleted ? 'Undo (I stayed clean)' : 'I Slipped Up (Log Relapse)'}">
                    <i class="fas ${isCompleted ? 'fa-skull' : 'fa-ban'} fa-lg"></i>
                </button>
                ${isCompleted ? '<div class="text-center text-danger small mt-2 fw-bold">Relapsed</div>' : '<div class="text-center text-success small mt-2 fw-bold">Clean Today</div>'}
            `;
        } else {
            // Good Habit Logic (Build Mode)
            actionBtnHtml = `
                <button class="btn ${isCompleted ? 'btn-success' : 'btn-outline-primary'} rounded-circle p-3" 
                        style="width: 60px; height: 60px;"
                        onclick="window.toggleHabitCompletion('${doc.id}').then(() => loadHabitsGrid());">
                    <i class="fas ${isCompleted ? 'fa-check' : 'fa-check'} fa-lg"></i>
                </button>
            `;
        }

        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        col.innerHTML = `
            <div class="card ${cardClass}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <div class="d-flex align-items-center mb-1">
                                <h5 class="card-title mb-0 me-2">${habit.name}</h5>
                                ${isBad ? '<span class="badge bg-danger">Quit</span>' : '<span class="badge bg-success">Build</span>'}
                            </div>
                            <span class="badge bg-light text-dark border">${habit.frequency}</span>
                            ${statsHtml}
                        </div>
                        <div class="dropdown">
                            <button class="btn btn-link text-muted p-0" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item" href="#" onclick="editHabit('${doc.id}')">Edit</a></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="deleteHabit('${doc.id}')">Delete</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-4">
                        <div class="text-center">
                            <h4 class="mb-0 ${isBad ? 'text-danger' : 'text-primary'}">${streakValue}</h4>
                            <small class="text-muted">${streakLabel}</small>
                        </div>
                        <div class="d-flex flex-column align-items-center">
                            ${actionBtnHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

window.editHabit = async function(id) {
    try {
        const doc = await db.collection('habits').doc(id).get();
        if (!doc.exists) return;
        const data = doc.data();
        
        if (data.type === 'bad') {
            document.getElementById('type-bad').checked = true;
            if (window.dashboard) window.dashboard.updateHabitModalUI('bad');
        } else {
            document.getElementById('type-good').checked = true;
            if (window.dashboard) window.dashboard.updateHabitModalUI('good');
        }
        
        document.getElementById('habit-id').value = id;
        document.getElementById('habit-name').value = data.name;
        document.getElementById('habit-category').value = data.category;
        document.getElementById('habit-frequency').value = data.frequency;
        document.getElementById('habit-target').value = data.target;
        document.getElementById('habit-reminder-time').value = data.reminderTime || '';
        document.getElementById('habit-cost').value = data.cost || '';
        
        const modal = new bootstrap.Modal(document.getElementById('addHabitModal'));
        modal.show();
    } catch (e) { console.error(e); }
};

window.deleteHabit = async function(id) {
    if(confirm('Delete this habit?')) {
        await db.collection('habits').doc(id).update({ active: false });
        loadHabitsGrid();
        if(window.dashboard) window.dashboard.updateStats();
    }
};