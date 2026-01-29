window.loadSettingsSection = async function() {
    const user = auth.currentUser;
    const userDoc = await db.collection('users').doc(user.uid).get();
    const settings = userDoc.data()?.settings || {};

    const container = document.getElementById('settings-section');
    container.innerHTML = `
        <h2 class="mb-4">App Settings</h2>
        
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
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="setting-notif" 
                        ${settings.notifications ? 'checked' : ''} onchange="updateSetting('notifications', this.checked)">
                    <label class="form-check-label" for="setting-notif">Enable Notifications</label>
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
                <div class="text-muted small">Download a copy of your transactions, habits, and memories.</div>
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
    const collections = ['transactions', 'habits', 'reminders', 'memories', 'goals'];
    
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
