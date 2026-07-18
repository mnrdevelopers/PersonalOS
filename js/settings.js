window.loadSettingsSection = async function() {
    const user = auth.currentUser;
    const userDoc = await db.collection('users').doc(user.uid).get();
    const settings = userDoc.data()?.settings || {};

    const container = document.getElementById('settings-section');
    container.innerHTML = `
        <h2 class="mb-4">App Settings</h2>
        
        <!-- Quick Guide -->
        <details class="section-guide-card mb-4 animate-fade-in">
            <summary class="section-guide-header">
                <span class="section-guide-title"><i class="fas fa-compass"></i> Settings Guide</span>
            </summary>
            <div class="section-guide-content">
                <ul class="section-guide-steps">
                    <li><strong>Appearance Customization</strong>: Change system themes (Light, Dark, Auto) and default currency displays globally.</li>
                    <li><strong>Granular Notifications</strong>: Enable or disable browser push alerts and audio sounds for tasks, expiries, vehicles, and loan payouts.</li>
                    <li><strong>Data Export & Backups</strong>: Download all logged records of transactions, habits, and tasks into a portable JSON backup file.</li>
                    <li><strong>Account Security</strong>: Permanently delete your user profile and Firestore database records from the Danger Zone.</li>
                </ul>
            </div>
        </details>

        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">Appearance & Preferences</h5>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <label class="form-label">Theme</label>
                    <select class="form-select" id="setting-theme" onchange="updateSetting('theme', this.value)">
                        <option value="auto" ${settings.theme === 'auto' ? 'selected' : ''}>System Default</option>
                        <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Light Mode</option>
                        <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Dark Mode</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Currency Symbol</label>
                    <select class="form-select" id="setting-currency" onchange="updateSetting('currency', this.value)">
                        <option value="INR" ${settings.currency === 'INR' ? 'selected' : ''}>Indian Rupee (₹)</option>
                        <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>US Dollar ($)</option>
                        <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>Euro (€)</option>
                    </select>
                </div>
                
                <h6 class="mt-4 mb-3 border-bottom pb-2">Notification Preferences</h6>
                <div class="list-group list-group-flush">
                    <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
                        <div>
                            <div class="fw-bold">Browser Notifications</div>
                            <div class="small text-muted">Receive push alerts for urgent items</div>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="setting-notif-browser" 
                                ${settings.notifications_browser !== false ? 'checked' : ''} onchange="updateSetting('notifications_browser', this.checked)">
                        </div>
                    </div>
                    ${this.renderToggle('Notification Sounds', 'notification_sound', settings.notification_sound !== false)}
                    ${this.renderToggle('Tasks & Reminders', 'notifications_tasks', settings.notifications_tasks !== false)}
                    ${this.renderToggle('Document Expiry', 'notifications_expiry', settings.notifications_expiry !== false)}
                    ${this.renderToggle('Vehicle Alerts', 'notifications_vehicles', settings.notifications_vehicles !== false)}
                    ${this.renderToggle('Loan Repayments', 'notifications_loans', settings.notifications_loans !== false)}
                    <div class="list-group-item px-0 pt-1 border-top-0">
                        <div class="d-flex justify-content-end align-items-center">
                            <label class="small text-muted me-2">Alert days before due:</label>
                            <input type="number" class="form-control form-control-sm" style="width: 80px;" 
                                value="${settings.notifications_loans_days !== undefined ? settings.notifications_loans_days : 0}" min="0" max="60"
                                onchange="updateSetting('notifications_loans_days', parseInt(this.value))">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">System</h5>
            </div>
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-bold">Global Alerts System</div>
                        <div class="small text-muted">Master switch for all app notifications</div>
                    </div>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="setting-notif" 
                            ${settings.notifications !== false ? 'checked' : ''} onchange="updateSetting('notifications', this.checked)">
                    </div>
                </div>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">Data Management</h5>
            </div>
            <div class="card-body">
                <button type="button" class="btn btn-outline-primary mb-2" onclick="exportData()">
                    <i class="fas fa-download me-2"></i>Export All Data (JSON)
                </button>
                <div class="text-muted small">Download a copy of your transactions, habits, and reminders.</div>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">AI Assistant Preferences</h5>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <label class="form-label fw-semibold">Gemini API Key</label>
                    <div class="input-group">
                        <input type="password" class="form-control" id="setting-ai-key" placeholder="Enter your Gemini API key..." 
                               value="${settings.gemini_api_key || ''}" onchange="updateSetting('gemini_api_key', this.value)">
                        <button class="btn btn-outline-secondary" type="button" onclick="togglePasswordVisibility('setting-ai-key')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    <div class="form-text">
                        Don't have a key? You can get a free, developer-tier Gemini API key from the <a href="https://aistudio.google.com/" target="_blank">Google AI Studio</a>.
                    </div>
                </div>
            </div>
        </div>

        <div class="card mb-4" id="push-settings-card">
            <div class="card-header d-flex align-items-center gap-2">
                <i class="fas fa-bell text-primary fs-5"></i>
                <h5 class="mb-0">Web Push Notifications</h5>
            </div>
            <div class="card-body">
                <p class="text-muted small mb-3">
                    Configure and manage Web Push notifications for reminders, bills, birthdays, and AI responses. 
                    Runs locally via standard VAPID Web Push protocol.
                </p>

                <div class="mb-3">
                    <label class="form-label fw-semibold">Push Server URL</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="push-server-url-input"
                               placeholder="http://localhost:3001"
                               value="${localStorage.getItem('pushServerUrl') || 'http://localhost:3001'}">
                        <button type="button" class="btn btn-outline-primary" onclick="savePushServerUrl()">Save</button>
                        <button type="button" class="btn btn-outline-secondary" onclick="updatePushSettingsUI()">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                    <div class="form-text">Default server port: 3001</div>
                </div>

                <!-- Status Badge -->
                <div id="push-status-area" class="mb-3">
                    <label class="form-label small fw-semibold d-block mb-1">Notification Status</label>
                    <div class="badge p-2 bg-light border text-dark fs-7 d-inline-flex align-items-center gap-2" id="push-status-badge">
                        <span class="spinner-border spinner-border-sm text-secondary" id="push-status-spinner"></span>
                        <span id="push-status-text">Checking permission...</span>
                    </div>
                </div>

                <!-- Controls -->
                <div class="d-flex gap-2 mb-3">
                    <button type="button" class="btn btn-primary btn-sm" id="btn-enable-push" onclick="enablePushNotifications()" style="display:none;">
                        <i class="fas fa-bell me-1"></i>Enable Notifications
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-sm" id="btn-disable-push" onclick="disablePushNotifications()" style="display:none;">
                        <i class="fas fa-bell-slash me-1"></i>Disable Notifications
                    </button>
                    <button type="button" class="btn btn-outline-secondary btn-sm" id="btn-test-push" onclick="sendTestPushNotification()" style="display:none;">
                        <i class="fas fa-paper-plane me-1"></i>Send Test Notification
                    </button>
                </div>

                <!-- Notification History -->
                <div class="border-top pt-3 mt-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <label class="form-label small fw-semibold mb-0">📋 Notification History</label>
                        <button type="button" class="btn btn-sm btn-link p-0 text-decoration-none text-muted" onclick="loadNotificationHistory()">Refresh History</button>
                    </div>
                    <div id="push-history-container" class="rounded border p-2 bg-light overflow-y-auto" style="max-height: 200px; font-size: 0.85rem;">
                        <div class="text-center text-muted py-3">Loading history...</div>
                    </div>
                </div>
            </div>
        </div>


        <div class="card border-danger">
            <div class="card-header bg-danger text-white">
                <h5 class="mb-0">Danger Zone</h5>
            </div>
            <div class="card-body">
                <p>Once you delete your account, there is no going back. Please be certain.</p>
                <button type="button" class="btn btn-danger" onclick="deleteAccount()">Delete Account</button>
            </div>
        </div>
    `;

    setTimeout(() => {
        if (typeof updatePushSettingsUI === 'function') updatePushSettingsUI();
    }, 100);
};

window.renderToggle = function(label, key, isChecked) {
    return `
        <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
            <span>${label}</span>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" 
                    ${isChecked ? 'checked' : ''} onchange="updateSetting('${key}', this.checked)">
            </div>
        </div>
    `;
};

window.updateSetting = async function(key, value) {
    const user = auth.currentUser;
    const update = {};
    update[`settings.${key}`] = value;
    
    try {
        await db.collection('users').doc(user.uid).update(update);
        
        if (key === 'theme') {
            if(window.dashboard) window.dashboard.applyTheme(value);
        }
        // Show toast
        if(window.dashboard) window.dashboard.showNotification('Settings saved', 'success');
    } catch (error) {
        console.error("Error updating setting:", error);
        if(window.dashboard) window.dashboard.showNotification('Error saving settings', 'danger');
    }
};

window.exportData = async function() {
    const user = auth.currentUser;
    const data = {};
    
    // Fetch all collections
    const collections = ['transactions', 'habits', 'reminders'];
    
    try {
        if(window.dashboard) window.dashboard.showLoading();
        
        for (const col of collections) {
            const snap = await db.collection(col).where('userId', '==', user.uid).get();
            data[col] = snap.docs.map(doc => doc.data());
        }
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `personal-os-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        if(window.dashboard) window.dashboard.hideLoading();
        if(window.dashboard) window.dashboard.showNotification('Data export started', 'success');
    } catch (error) {
        console.error("Error exporting data:", error);
        if(window.dashboard) window.dashboard.hideLoading();
        if(window.dashboard) window.dashboard.showNotification('Error exporting data', 'danger');
    }
};

window.deleteAccount = async function() {
    if (confirm('Are you strictly sure? This will delete ALL your data permanently.')) {
        const user = auth.currentUser;
        try {
            if(window.dashboard) window.dashboard.showLoading();
            // In a real app, you'd trigger a cloud function to recursively delete subcollections
            // Here we just delete the user doc and auth
            await db.collection('users').doc(user.uid).delete();
            await user.delete();
            window.location.href = 'auth.html';
        } catch (error) {
            if(window.dashboard) window.dashboard.hideLoading();
            console.error("Error deleting account:", error);
            if(window.dashboard) window.dashboard.showNotification("Error deleting account. You may need to re-login first.", 'danger');
        }
    }
};

window.togglePasswordVisibility = function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'password') {
        el.type = 'text';
    } else {
        el.type = 'password';
    }
};

// ─── Web Push Settings Helpers ────────────────────────────────────────────────

function getPushServerUrl() {
    return (localStorage.getItem('pushServerUrl') || 'http://localhost:3001').replace(/\/$/, '');
}

window.savePushServerUrl = function() {
    const val = (document.getElementById('push-server-url-input')?.value || '').trim();
    if (val) {
        localStorage.setItem('pushServerUrl', val);
        if (window.dashboard) window.dashboard.showNotification('Push server URL saved', 'success');
        window.updatePushSettingsUI();
    }
};

window.updatePushSettingsUI = async function() {
    const badge = document.getElementById('push-status-badge');
    const spinner = document.getElementById('push-status-spinner');
    const statusText = document.getElementById('push-status-text');
    const btnEnable = document.getElementById('btn-enable-push');
    const btnDisable = document.getElementById('btn-disable-push');
    const btnTest = document.getElementById('btn-test-push');

    if (!badge || !statusText) return;

    if (spinner) spinner.style.display = 'inline-block';
    statusText.textContent = 'Checking...';

    if (btnEnable) btnEnable.style.display = 'none';
    if (btnDisable) btnDisable.style.display = 'none';
    if (btnTest) btnTest.style.display = 'none';

    const status = await window.getPushStatus();
    if (spinner) spinner.style.display = 'none';

    if (status === 'unsupported') {
        badge.className = 'badge p-2 bg-danger-subtle border border-danger text-danger fs-7';
        statusText.textContent = 'Unsupported browser';
    } else if (status === 'denied') {
        badge.className = 'badge p-2 bg-danger-subtle border border-danger text-danger fs-7';
        statusText.textContent = 'Blocked by browser';
    } else if (status === 'subscribed') {
        badge.className = 'badge p-2 bg-success-subtle border border-success text-success fs-7';
        statusText.textContent = 'Subscribed & Active';
        if (btnDisable) btnDisable.style.display = 'inline-block';
        if (btnTest) btnTest.style.display = 'inline-block';

        // Auto-heal check: if backend server database has no subscriptions for this user, re-send it
        (async () => {
            try {
                const user = firebase.auth().currentUser;
                if (!user) return;
                const idToken = await user.getIdToken();
                const serverUrl = getPushServerUrl();
                const checkRes = await fetch(`${serverUrl}/api/push/subscriptions`, {
                    headers: { 'Authorization': `Bearer ${idToken}` }
                });
                if (checkRes.ok) {
                    const activeSubs = await checkRes.json();
                    if (activeSubs.length === 0) {
                        console.log('[PushSettings] Server database is empty. Re-registering this device...');
                        const registration = await navigator.serviceWorker.ready;
                        const subscription = await registration.pushManager.getSubscription();
                        if (subscription) {
                            await fetch(`${serverUrl}/api/push/subscribe`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${idToken}`
                                },
                                body: JSON.stringify({
                                    subscription,
                                    metadata: window.getDeviceMetadata ? window.getDeviceMetadata() : {}
                                })
                            });
                            console.log('[PushSettings] Successfully re-synced device subscription with server.');
                        }
                    }
                }
            } catch (e) {
                console.warn('[PushSettings] Background subscription sync failed:', e.message);
            }
        })();
    } else if (status === 'default' || status === 'granted_but_unsubscribed') {
        badge.className = 'badge p-2 bg-warning-subtle border border-warning text-warning fs-7';
        statusText.textContent = 'Not Subscribed';
        if (btnEnable) btnEnable.style.display = 'inline-block';
    } else {
        badge.className = 'badge p-2 bg-secondary-subtle border border-secondary text-secondary fs-7';
        statusText.textContent = 'Check Offline or Error';
        if (btnEnable) btnEnable.style.display = 'inline-block';
    }

    loadNotificationHistory();
};

window.enablePushNotifications = async function() {
    try {
        if (window.dashboard) window.dashboard.showLoading();
        await window.subscribeToPush();
        if (window.dashboard) window.dashboard.showNotification('Push notifications enabled!', 'success');
    } catch (err) {
        if (window.dashboard) window.dashboard.showNotification(err.message, 'danger');
    } finally {
        if (window.dashboard) window.dashboard.hideLoading();
        window.updatePushSettingsUI();
    }
};

window.disablePushNotifications = async function() {
    try {
        if (window.dashboard) window.dashboard.showLoading();
        await window.unsubscribeFromPush();
        if (window.dashboard) window.dashboard.showNotification('Push notifications disabled.', 'info');
    } catch (err) {
        if (window.dashboard) window.dashboard.showNotification(err.message, 'danger');
    } finally {
        if (window.dashboard) window.dashboard.hideLoading();
        window.updatePushSettingsUI();
    }
};

window.sendTestPushNotification = async function() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) return;
        const idToken = await user.getIdToken();
        const serverUrl = getPushServerUrl();

        const res = await fetch(`${serverUrl}/api/push/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
                notification: {
                    title: '🔔 Test Notification',
                    body: 'Your Web Push notification system is working perfectly!',
                    tag: 'custom-notification',
                    icon: '/android-icons/android-launchericon-192-192.png',
                    badge: '/android-icons/android-launchericon-72-72.png',
                    data: { url: '/#settings' }
                }
            })
        });

        const data = await res.json();
        if (data.success) {
            if (window.dashboard) window.dashboard.showNotification('Test notification triggered!', 'success');
        } else {
            if (window.dashboard) window.dashboard.showNotification('Failed: ' + (data.message || 'Error'), 'danger');
        }
        loadNotificationHistory();
    } catch (err) {
        if (window.dashboard) window.dashboard.showNotification('Push server offline: ' + err.message, 'danger');
    }
};

window.loadNotificationHistory = async function() {
    const container = document.getElementById('push-history-container');
    if (!container) return;

    try {
        const user = firebase.auth().currentUser;
        if (!user) return;
        const idToken = await user.getIdToken();
        const serverUrl = getPushServerUrl();

        const res = await fetch(`${serverUrl}/api/push/history`, {
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        });
        
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();

        if (data.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-3">No notifications sent yet.</div>';
            return;
        }

        container.innerHTML = data.map(log => {
            const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const date = new Date(log.timestamp).toLocaleDateString();
            const badgeClass = log.status === 'success' ? 'bg-success' : 'bg-danger';
            return `
                <div class="border-bottom py-2 px-1">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="fw-semibold">${log.title}</span>
                        <span class="badge ${badgeClass}" style="font-size: 0.65rem;">${log.status}</span>
                    </div>
                    <p class="mb-0 text-muted small">${log.body}</p>
                    <div class="d-flex justify-content-between mt-1" style="font-size: 0.7rem;">
                        <span class="text-primary">${log.category}</span>
                        <span class="text-muted">${date} ${time}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        container.innerHTML = `<div class="text-center text-danger py-3">Could not load logs. Is the push server running?</div>`;
    }
};

// Run once inside dashboard tab click trigger if it binds window.updatePushSettingsUI
const originalLoadSettings = window.loadSettingsSection;
window.loadSettingsSection = async function() {
    await originalLoadSettings.apply(this, arguments);
    setTimeout(() => {
        window.updatePushSettingsUI();
    }, 100);
};

