window.loadNotificationsSection = async function() {
    const container = document.getElementById('notifications-section');
    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold gradient-text mb-0">Notifications & Alerts</h2>
            <div>
                <button class="btn btn-sm btn-outline-secondary me-2" onclick="window.switchSection('settings')">
                    <i class="fas fa-cog me-2"></i>Settings
                </button>
                <button class="btn btn-sm btn-outline-secondary me-2" onclick="window.clearAllReadNotifications()">
                    <i class="fas fa-trash-alt me-2"></i>Clear Read
                </button>
                <button class="btn btn-sm btn-outline-primary" onclick="window.dashboard.markAllNotificationsRead()">
                    <i class="fas fa-check-double me-2"></i>Mark System Read
                </button>
            </div>
        </div>

        <ul class="nav nav-pills mb-4 gap-2">
            <li class="nav-item">
                <a class="nav-link active" href="javascript:void(0)" onclick="filterNotificationView('all', this)">All</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="javascript:void(0)" onclick="filterNotificationView('urgent', this)">Urgent & Overdue</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="javascript:void(0)" onclick="filterNotificationView('tasks', this)">Tasks</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="javascript:void(0)" onclick="filterNotificationView('expiry', this)">Expiry & Vehicles</a>
            </li>
        </ul>

        <div id="notifications-feed" class="row g-3">
            <div class="col-12 text-center py-5"><div class="spinner-border text-primary"></div></div>
        </div>
    `;

    await loadAggregatedNotifications('all');
};

window.filterNotificationView = function(filter, element) {
    document.querySelectorAll('#notifications-section .nav-link').forEach(l => l.classList.remove('active'));
    element.classList.add('active');
    loadAggregatedNotifications(filter);
};

async function loadAggregatedNotifications(filter) {
    const container = document.getElementById('notifications-feed');
    const user = auth.currentUser;
    if (!user) return;

    try {
        const allItems = [];

        // Parallel Fetching for Speed Optimization
        const [sysSnap, tasks, expiryDocs, vehicleEvents] = await Promise.all([
            db.collection('notifications')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get(),
            window.getReminderEvents ? window.getReminderEvents() : Promise.resolve([]),
            window.getExpiryEvents ? window.getExpiryEvents() : Promise.resolve([]),
            window.calculateMaintenanceEvents ? window.calculateMaintenanceEvents() : Promise.resolve([])
        ]);
        
        sysSnap.forEach(doc => {
            const data = doc.data();
            allItems.push({
                type: 'system',
                source: 'System',
                title: data.title,
                message: data.message,
                date: data.createdAt ? data.createdAt.toDate() : new Date(),
                status: data.read ? 'read' : 'unread',
                priority: 'normal',
                id: doc.id,
                raw: data
            });
        });

        // 2. Fetch Tasks (Reminders)
            tasks.forEach(t => {
                allItems.push({
                    type: 'task',
                    source: 'Task',
                    title: t.title,
                    message: `Due: ${t.date.toLocaleDateString()} (${t.subtitle})`,
                    date: t.date,
                    status: t.status, // overdue, pending
                    priority: t.status === 'overdue' || t.priority === 'high' ? 'high' : 'normal',
                    id: t.id,
                    raw: t
                });
            });

        // 3. Fetch Expiry Docs
            expiryDocs.forEach(d => {
                // Only show if expired or expiring within 60 days
                if (d.daysRemaining <= 60) {
                    allItems.push({
                        type: 'expiry',
                        source: 'Expiry',
                        title: d.title,
                        message: d.daysRemaining < 0 ? `Expired ${Math.abs(d.daysRemaining)} days ago` : `Expires in ${d.daysRemaining} days`,
                        date: d.date,
                        status: d.status, // expired, warning
                        priority: d.status === 'expired' ? 'high' : (d.daysRemaining < 30 ? 'high' : 'normal'),
                        id: d.id,
                        raw: d
                    });
                }
            });

        // 4. Fetch Vehicle Alerts
            vehicleEvents.forEach(v => {
                // Only show overdue or soon
                if (v.status === 'overdue' || v.status === 'soon') {
                    allItems.push({
                        type: 'vehicle',
                        source: 'Vehicle',
                        title: v.title,
                        message: `${v.vehicleName} - ${v.status === 'overdue' ? 'Overdue!' : 'Due soon'}`,
                        date: v.date,
                        status: v.status,
                        priority: v.status === 'overdue' ? 'high' : 'normal',
                        id: v.id,
                        raw: v
                    });
                }
            });

        // Filter out snoozed items
        const now = new Date();
        const activeItems = allItems.filter(item => {
            if (item.raw.snoozeUntil && item.raw.snoozeUntil.toDate() > now) return false;
            return true;
        });

        // Filter Logic
        let filtered = activeItems;
        if (filter === 'urgent') {
            filtered = allItems.filter(i => i.priority === 'high' || i.status === 'overdue' || i.status === 'expired' || (i.type === 'system' && !i.raw.read));
        } else if (filter === 'tasks') {
            filtered = allItems.filter(i => i.type === 'task');
        } else if (filter === 'expiry') {
            filtered = allItems.filter(i => i.type === 'expiry' || i.type === 'vehicle');
        }

        // Sort: High priority/Unread first, then by date
        filtered.sort((a, b) => {
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (b.priority === 'high' && a.priority !== 'high') return 1;
            return b.date - a.date; // Newest first
        });

        if (filtered.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-muted py-5">No notifications found.</div>';
            return;
        }

        container.innerHTML = '';
        
        // Group by Date
        const groups = { 'Today': [], 'Yesterday': [], 'Older': [] };
        const today = new Date(); today.setHours(0,0,0,0);
        const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

        filtered.forEach(item => {
            const d = new Date(item.date); d.setHours(0,0,0,0);
            if (d.getTime() === today.getTime()) groups['Today'].push(item);
            else if (d.getTime() === yesterday.getTime()) groups['Yesterday'].push(item);
            else groups['Older'].push(item);
        });

        Object.keys(groups).forEach(group => {
            if (groups[group].length === 0) return;
            
            const header = document.createElement('div');
            header.className = 'col-12 mt-3 mb-2';
            header.innerHTML = `<h6 class="fw-bold text-muted border-bottom pb-2">${group} <span class="badge bg-light text-dark border ms-1">${groups[group].length}</span></h6>`;
            container.appendChild(header);

            groups[group].forEach(item => {
                let icon = 'fa-bell';
                let colorClass = 'border-start border-4 border-secondary';
                let bgIcon = 'bg-secondary';

                if (item.type === 'system') { icon = 'fa-info-circle'; colorClass = item.raw.read ? 'border-secondary' : 'border-primary'; bgIcon = 'bg-primary'; }
                else if (item.type === 'task') { icon = 'fa-check-square'; colorClass = 'border-info'; bgIcon = 'bg-info'; }
                else if (item.type === 'expiry') { icon = 'fa-passport'; colorClass = 'border-warning'; bgIcon = 'bg-warning'; }
                else if (item.type === 'vehicle') { icon = 'fa-car'; colorClass = 'border-danger'; bgIcon = 'bg-danger'; }

                if (item.priority === 'high') {
                    colorClass = 'border-start border-4 border-danger';
                    bgIcon = 'bg-danger';
                }

                const div = document.createElement('div');
                div.className = 'col-md-6 col-lg-4 animate-slide-up';
                div.innerHTML = `
                    <div class="card h-100 shadow-sm ${colorClass}">
                        <div class="card-body d-flex align-items-start">
                            <div class="${bgIcon} bg-opacity-10 text-${bgIcon.replace('bg-', '')} rounded-circle p-3 me-3">
                                <i class="fas ${icon} fa-lg"></i>
                            </div>
                            <div class="flex-grow-1">
                                <div class="d-flex justify-content-between">
                                    <h6 class="fw-bold mb-1">${item.title}</h6>
                                    <small class="text-muted" style="font-size: 0.7rem;">${item.source}</small>
                                </div>
                                <p class="mb-1 text-muted small">${item.message}</p>
                                <small class="text-muted" style="font-size: 0.7rem;">${item.date.toLocaleDateString()} ${item.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                                
                                <div class="mt-2 pt-2 border-top d-flex justify-content-end gap-2">
                                    <div class="dropdown">
                                        <button class="btn btn-xs btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" style="font-size: 0.7rem;">
                                            <i class="fas fa-clock me-1"></i>Snooze
                                        </button>
                                        <ul class="dropdown-menu dropdown-menu-end" style="font-size: 0.8rem;">
                                            <li><a class="dropdown-item" href="javascript:void(0)" onclick="window.snoozeItem('${item.type}', '${item.id}', 1)">1 Day</a></li>
                                            <li><a class="dropdown-item" href="javascript:void(0)" onclick="window.snoozeItem('${item.type}', '${item.id}', 3)">3 Days</a></li>
                                            <li><a class="dropdown-item" href="javascript:void(0)" onclick="window.snoozeItem('${item.type}', '${item.id}', 7)">1 Week</a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(div);
            });
        });

    } catch (e) {
        console.error("Error loading notifications:", e);
        container.innerHTML = '<div class="col-12 text-center text-danger">Error loading data.</div>';
    }
}

window.snoozeItem = async function(type, id, days) {
    const user = auth.currentUser;
    if (!user) return;

    const snoozeDate = new Date();
    snoozeDate.setDate(snoozeDate.getDate() + days);
    
    let collection = '';
    if (type === 'system') collection = 'notifications';
    else if (type === 'task') collection = 'reminders';
    else if (type === 'expiry') collection = 'expiry_docs';
    else if (type === 'vehicle') collection = 'service_alerts';

    if (!collection) return;

    try {
        if (window.dashboard) window.dashboard.showLoading();
        await db.collection(collection).doc(id).update({
            snoozeUntil: firebase.firestore.Timestamp.fromDate(snoozeDate)
        });
        
        if (window.dashboard) window.dashboard.showNotification(`Snoozed for ${days} day(s)`, 'success');
        
        // Refresh
        const activeTab = document.querySelector('#notifications-section .nav-link.active');
        const filter = activeTab ? activeTab.getAttribute('onclick').match(/'([^']+)'/)[1] : 'all';
        loadAggregatedNotifications(filter);
    } catch (e) {
        console.error("Error snoozing:", e);
        if (window.dashboard) window.dashboard.showNotification('Error snoozing item', 'danger');
    } finally {
        if (window.dashboard) window.dashboard.hideLoading();
    }
};

window.clearAllReadNotifications = async function() {
    if (!confirm('Delete all read system notifications?')) return;
    const user = auth.currentUser;
    if (!user) return;
    
    try {
        if (window.dashboard) window.dashboard.showLoading();
        const batch = db.batch();
        const snapshot = await db.collection('notifications')
            .where('userId', '==', user.uid)
            .where('read', '==', true)
            .get();
            
        snapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        
        const activeTab = document.querySelector('#notifications-section .nav-link.active');
        const filter = activeTab ? activeTab.getAttribute('onclick').match(/'([^']+)'/)[1] : 'all';
        loadAggregatedNotifications(filter);
        if (window.dashboard) window.dashboard.showNotification('Read notifications cleared', 'success');
    } catch (e) {
        console.error(e);
    } finally {
        if (window.dashboard) window.dashboard.hideLoading();
    }
};
