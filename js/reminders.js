window.loadRemindersSection = async function() {
    const container = document.getElementById('reminders-section');
    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Tasks & Reminders</h2>
            <button class="btn btn-primary" onclick="window.handleQuickAction('add-reminder')">
                <i class="fas fa-plus me-2"></i>New Task
            </button>
        </div>
        
        <ul class="nav nav-tabs mb-4">
            <li class="nav-item">
                <a class="nav-link active" href="javascript:void(0)" onclick="filterTasks('pending', this)">Pending</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="javascript:void(0)" onclick="filterTasks('completed', this)">Completed</a>
            </li>
        </ul>

        <div id="tasks-list" class="list-group">
            <div class="text-center py-4"><div class="spinner-border text-primary"></div></div>
        </div>
    `;
    await loadTasks('pending');
};

window.filterTasks = function(status, element) {
    document.querySelectorAll('#reminders-section .nav-link').forEach(l => l.classList.remove('active'));
    element.classList.add('active');
    loadTasks(status);
};

async function loadTasks(status) {
    const user = auth.currentUser;
    if (!user) return;

    const isCompleted = status === 'completed';
    try {
        const snapshot = await db.collection('reminders')
            .where('userId', '==', user.uid)
            .where('completed', '==', isCompleted)
            .orderBy('dueDate', isCompleted ? 'desc' : 'asc')
            .get();

    const container = document.getElementById('tasks-list');
    if (snapshot.empty) {
        container.innerHTML = `<div class="text-center text-muted py-5">No ${status} tasks found.</div>`;
        return;
    }

    container.innerHTML = '';
    snapshot.forEach(doc => {
        const task = doc.data();
        const priorityColors = { low: 'success', medium: 'warning', high: 'danger' };
        const priorityColor = priorityColors[task.priority] || 'secondary';
        
        const item = document.createElement('div');
        item.className = `list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3 ${task.completed ? 'bg-light' : ''}`;
        item.innerHTML = `
            <div class="d-flex align-items-center">
                <input class="form-check-input me-3" type="checkbox" 
                    ${task.completed ? 'checked' : ''} 
                    onchange="window.toggleTaskCompletion('${doc.id}', this.checked); setTimeout(() => loadTasks('${status}'), 500);">
                <div>
                    <h6 class="mb-1 ${task.completed ? 'text-decoration-line-through text-muted' : ''}">${task.title}</h6>
                    <small class="text-muted">
                        <i class="far fa-calendar me-1"></i> ${new Date(task.dueDate).toLocaleDateString()}
                        ${task.time ? `<i class="far fa-clock ms-2 me-1"></i> ${task.time}` : ''}
                    </small>
                </div>
            </div>
            <div class="d-flex align-items-center">
                <span class="badge bg-${priorityColor} me-3">${task.priority}</span>
                <button class="btn btn-sm btn-outline-info me-1" onclick="viewTask('${doc.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editReminder('${doc.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTask('${doc.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(item);
    });
    } catch (error) {
        console.error("Error loading tasks:", error);
        document.getElementById('tasks-list').innerHTML = '<div class="text-center text-danger py-5">Error loading tasks.</div>';
    }
}

window.editReminder = async function(id) {
    try {
        const doc = await db.collection('reminders').doc(id).get();
        if (!doc.exists) return;
        const data = doc.data();
        
        document.getElementById('reminder-id').value = id;
        document.getElementById('reminder-title').value = data.title;
        document.getElementById('reminder-description').value = data.description;
        document.getElementById('reminder-due-date').value = data.dueDate;
        document.getElementById('reminder-time').value = data.time || '';
        document.getElementById('reminder-priority').value = data.priority;
        
        const modal = new bootstrap.Modal(document.getElementById('addReminderModal'));
        modal.show();
    } catch (e) { console.error(e); }
};

window.deleteTask = async function(id) {
    if(confirm('Delete this task?')) {
        await db.collection('reminders').doc(id).delete();
        const activeTab = document.querySelector('#reminders-section .nav-link.active');
        const status = activeTab.textContent.toLowerCase();
        loadTasks(status);
        if(window.dashboard) window.dashboard.updateStats();
    }
};

window.viewTask = async function(id) {
    try {
        const doc = await db.collection('reminders').doc(id).get();
        if (!doc.exists) return;
        const data = doc.data();
        
        document.getElementById('view-task-title').textContent = data.title;
        document.getElementById('view-task-desc').textContent = data.description || 'No description provided.';
        document.getElementById('view-task-date').textContent = new Date(data.dueDate).toLocaleDateString();
        document.getElementById('view-task-time').textContent = data.time || 'All day';
        
        const priorityBadge = document.getElementById('view-task-priority');
        priorityBadge.textContent = data.priority.toUpperCase();
        priorityBadge.className = `badge bg-${data.priority === 'high' ? 'danger' : (data.priority === 'medium' ? 'warning' : 'success')}`;
        
        const statusBadge = document.getElementById('view-task-status');
        statusBadge.textContent = data.completed ? 'Completed' : 'Pending';
        statusBadge.className = `badge bg-${data.completed ? 'success' : 'secondary'} me-2`;

        document.getElementById('view-task-edit-btn').onclick = () => {
            bootstrap.Modal.getInstance(document.getElementById('viewTaskModal')).hide();
            editReminder(id);
        };

        const modal = new bootstrap.Modal(document.getElementById('viewTaskModal'));
        modal.show();
    } catch (e) { console.error(e); }
};
