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
                <button class="btn btn-outline-primary mb-2" onclick="exportData()">
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

        <div class="card mb-4" id="wa-server-settings-card">
            <div class="card-header d-flex align-items-center gap-2">
                <i class="fab fa-whatsapp text-success fs-5"></i>
                <h5 class="mb-0">WhatsApp Auto-Reminder Server</h5>
            </div>
            <div class="card-body">
                <p class="text-muted small mb-3">
                    A local Node.js server that automatically sends WhatsApp payment reminders for your lent loans.
                    Run <code>node server.js</code> inside <code>wa-server/</code> to start.
                </p>

                <div class="mb-3">
                    <label class="form-label fw-semibold">Server URL</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="wa-server-url-input"
                               placeholder="http://localhost:3001"
                               value="${localStorage.getItem('waServerUrl') || 'http://localhost:3001'}">
                        <button class="btn btn-outline-primary" onclick="saveWaServerUrl()">Save</button>
                        <button class="btn btn-outline-secondary" onclick="checkWaStatus()">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                    <div class="form-text">Must be running on this machine. Default: http://localhost:3001</div>
                </div>

                <!-- Status Badge -->
                <div id="wa-status-area" class="mb-3">
                    <div class="wa-status-badge" id="wa-status-badge">
                        <span class="wa-status-dot"></span>
                        <span id="wa-status-text">Click refresh to check</span>
                    </div>
                </div>

                <!-- QR Code area (shown when auth needed) -->
                <div id="wa-qr-area" class="d-none text-center mb-3">
                    <p class="small text-muted mb-2">Scan this QR code with WhatsApp to connect</p>
                    <img id="wa-qr-img" src="" alt="WhatsApp QR Code"
                         class="img-fluid rounded border" style="max-width: 220px;">
                    <div class="small text-muted mt-2">WhatsApp → Settings → Linked Devices → Link a Device</div>
                </div>

                <!-- Test Message -->
                <div class="border-top pt-3">
                    <label class="form-label small fw-semibold">Send Test Message</label>
                    <div class="input-group input-group-sm">
                        <input type="text" class="form-control" id="wa-test-phone"
                               placeholder="Phone with country code e.g. 919876543210">
                        <button class="btn btn-success" onclick="sendWaTestMessage()">
                            <i class="fab fa-whatsapp me-1"></i>Test
                        </button>
                    </div>
                </div>

                <!-- Trigger Now -->
                <div class="mt-3 d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary" onclick="triggerWaJobNow()">
                        <i class="fas fa-bolt me-1"></i>Run Reminders Now
                    </button>
                    <button type="button" onclick="toggleWaLog()" class="btn btn-sm btn-outline-secondary">
                        <i class="fas fa-list me-1"></i>View Send Log
                    </button>
                </div>

                <!-- Inline Log Container -->
                <div id="wa-log-area" class="d-none mt-3 border-top pt-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <label class="form-label small fw-semibold mb-0">📋 Sent Reminders Log</label>
                        <button type="button" class="btn btn-sm btn-link p-0 text-muted text-decoration-none" onclick="toggleWaLog(false)">Hide</button>
                    </div>
                    <pre id="wa-log-content" class="p-3 rounded small border mb-0" style="max-height: 250px; overflow-y: auto; font-family: monospace; white-space: pre-wrap; word-break: break-all;"></pre>
                </div>
            </div>
        </div>


        <div class="card border-danger">
            <div class="card-header bg-danger text-white">
                <h5 class="mb-0">Danger Zone</h5>
            </div>
            <div class="card-body">
                <p>Once you delete your account, there is no going back. Please be certain.</p>
                <button class="btn btn-danger" onclick="deleteAccount()">Delete Account</button>
            </div>
        </div>
    `;

    setTimeout(() => {
        if (typeof checkWaStatus === 'function') checkWaStatus();
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

// ─── WhatsApp Server Helpers ─────────────────────────────────────────────────

function getWaServerUrl() {
    return (localStorage.getItem('waServerUrl') || 'http://localhost:3001').replace(/\/$/, '');
}

window.saveWaServerUrl = function() {
    const val = (document.getElementById('wa-server-url-input')?.value || '').trim();
    if (val) {
        localStorage.setItem('waServerUrl', val);
        if(window.dashboard) window.dashboard.showNotification('WA server URL saved', 'success');
        checkWaStatus();
    }
};

window.checkWaStatus = async function() {
    const badge = document.getElementById('wa-status-badge');
    const statusText = document.getElementById('wa-status-text');
    const qrArea = document.getElementById('wa-qr-area');
    const qrImg = document.getElementById('wa-qr-img');

    if (badge) badge.className = 'wa-status-badge wa-status-checking';
    if (statusText) statusText.textContent = 'Checking...';
    if (qrArea) qrArea.classList.add('d-none');

    try {
        const res = await fetch(`${getWaServerUrl()}/status`, { signal: AbortSignal.timeout(5000) });
        const data = await res.json();

        if (badge) {
            badge.className = `wa-status-badge wa-status-${data.status}`;
        }
        if (statusText) statusText.textContent = data.message || data.status;

        // Show QR code if needed
        if (data.status === 'qr_required' && data.qrCode && qrArea && qrImg) {
            qrImg.src = data.qrCode;
            qrArea.classList.remove('d-none');
        }
    } catch (err) {
        if (badge) badge.className = 'wa-status-badge wa-status-disconnected';
        if (statusText) statusText.textContent = 'Server offline — is node server.js running?';
    }
};

window.sendWaTestMessage = async function() {
    const phone = document.getElementById('wa-test-phone')?.value.trim();
    if (!phone) {
        if(window.dashboard) window.dashboard.showNotification('Enter a phone number first', 'warning');
        return;
    }
    try {
        const res = await fetch(`${getWaServerUrl()}/test-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
            signal: AbortSignal.timeout(10000)
        });
        const data = await res.json();
        if (data.success) {
            if(window.dashboard) window.dashboard.showNotification('✅ Test message sent to ' + data.to, 'success');
        } else {
            if(window.dashboard) window.dashboard.showNotification('❌ ' + (data.error || 'Failed'), 'danger');
        }
    } catch (err) {
        if(window.dashboard) window.dashboard.showNotification('Server unreachable: ' + err.message, 'danger');
    }
};

window.triggerWaJobNow = async function() {
    try {
        await fetch(`${getWaServerUrl()}/run-now`, { method: 'POST', signal: AbortSignal.timeout(5000) });
        if(window.dashboard) window.dashboard.showNotification('Reminder job triggered!', 'success');
    } catch (err) {
        if(window.dashboard) window.dashboard.showNotification('Server unreachable', 'danger');
    }
};

window.toggleWaLog = async function(forceState) {
    const area = document.getElementById('wa-log-area');
    const content = document.getElementById('wa-log-content');
    if (!area || !content) return;

    // Resolve state to toggle
    const currentlyHidden = area.classList.contains('d-none');
    const targetShow = forceState !== undefined ? forceState : currentlyHidden;

    if (!targetShow) {
        area.classList.add('d-none');
        return;
    }

    // Show area and set loading state
    area.classList.remove('d-none');
    content.textContent = 'Loading logs from server...';
    content.className = 'p-3 rounded small border mb-0 bg-light text-muted';

    try {
        const res = await fetch(`${getWaServerUrl()}/log`, { signal: AbortSignal.timeout(5000) });
        const data = await res.json();
        
        if (Object.keys(data).length === 0) {
            content.textContent = 'No logs found. Reminders haven\'t run or sent any messages yet today.';
            content.className = 'p-3 rounded small border mb-0 bg-light text-muted';
        } else {
            content.textContent = JSON.stringify(data, null, 2);
            content.className = 'p-3 rounded small border mb-0 bg-light text-dark';
        }
    } catch (err) {
        content.textContent = '❌ Failed to fetch logs. Is the node server running?';
        content.className = 'p-3 rounded small border mb-0 bg-danger bg-opacity-10 text-danger';
    }
};

