window.loadProfileSection = async function() {
    const user = auth.currentUser;
    if (!user) return;

    const container = document.getElementById('profile-section');
    
    // Fetch user data
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data() || {};
    const currentAvatar = userData.avatar || '👤';

    container.innerHTML = `
        <h2 class="mb-4">My Profile</h2>
        <div class="row">
            <div class="col-md-4 mb-4">
                <div class="card text-center p-4">
                    <div class="avatar mx-auto mb-3 d-flex align-items-center justify-content-center bg-light rounded-circle" style="width: 100px; height: 100px; font-size: 4rem;">
                        ${currentAvatar}
                    </div>
                    <h4>${userData.name || 'User'}</h4>
                    <p class="text-muted">${user.email}</p>
                    <p class="small text-muted">Member since ${new Date(user.metadata.creationTime).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        <h5>Edit Profile</h5>
                    </div>
                    <div class="card-body">
                        <form id="profile-form">
                            <div class="mb-3">
                                <label class="form-label">Choose Avatar</label>
                                <div class="d-flex gap-2 flex-wrap" id="avatar-options"></div>
                                <input type="hidden" id="profile-avatar" value="${currentAvatar}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Full Name</label>
                                <input type="text" class="form-control" id="profile-name" value="${userData.name || ''}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" value="${user.email}" disabled>
                            </div>
                            <hr>
                            <h6 class="mb-3">Preferences</h6>
                            <div class="mb-3">
                                <label class="form-label">Currency</label>
                                <select class="form-select" id="profile-currency">
                                    <option value="INR" ${userData.settings?.currency === 'INR' ? 'selected' : ''}>INR (₹)</option>
                                    <option value="USD" ${userData.settings?.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                                    <option value="EUR" ${userData.settings?.currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Theme</label>
                                <select class="form-select" id="profile-theme">
                                    <option value="auto" ${userData.settings?.theme === 'auto' ? 'selected' : ''}>Auto (System)</option>
                                    <option value="light" ${userData.settings?.theme === 'light' ? 'selected' : ''}>Light</option>
                                    <option value="dark" ${userData.settings?.theme === 'dark' ? 'selected' : ''}>Dark</option>
                                </select>
                            </div>
                            <button type="button" class="btn btn-primary" onclick="saveProfile()">Save Changes</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Inject Emojis
    const emojis = ['👤', '👨‍💻', '👩‍💻', '🚀', '🦁', '🐱', '🐶', '🌟', '⚡', '🔥', '💎', '🧘', '🎨', '🎵', '🎮', '📚', '💼', '🏠'];
    const avatarOptions = document.getElementById('avatar-options');
    if (avatarOptions) {
        avatarOptions.innerHTML = emojis.map(emoji => `
            <button type="button" class="btn ${emoji === currentAvatar ? 'btn-primary' : 'btn-outline-secondary'} avatar-btn" 
                    style="width: 45px; height: 45px; font-size: 1.5rem; padding: 0; display: flex; align-items: center; justify-content: center;"
                    onclick="selectAvatar(this, '${emoji}')">
                ${emoji}
            </button>
        `).join('');
    }
};

window.selectAvatar = function(btn, emoji) {
    document.getElementById('profile-avatar').value = emoji;
    document.querySelectorAll('.avatar-btn').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline-secondary');
    });
    btn.classList.remove('btn-outline-secondary');
    btn.classList.add('btn-primary');
};

window.saveProfile = async function() {
    const user = auth.currentUser;
    const name = document.getElementById('profile-name').value;
    const avatar = document.getElementById('profile-avatar').value;
    const currency = document.getElementById('profile-currency').value;
    const theme = document.getElementById('profile-theme').value;

    try {
        await db.collection('users').doc(user.uid).set({
            name: name,
            avatar: avatar,
            settings: {
                currency: currency,
                theme: theme
            },
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Update local UI
        if(window.dashboard) {
            window.dashboard.showNotification('Profile updated successfully!', 'success');
            window.dashboard.applyTheme(theme);
            document.querySelectorAll('#user-name').forEach(el => el.textContent = name);
            
            // Update sidebar avatar immediately
            document.querySelectorAll('.avatar').forEach(el => {
                if (!el.classList.contains('mx-auto')) { // Skip the big one in profile card as we reload section anyway
                    el.innerHTML = avatar;
                    el.style.cssText = 'display: flex; align-items: center; justify-content: center; font-size: 1.5rem;';
                }
            });
        }
    } catch (error) {
        console.error(error);
        if(window.dashboard) window.dashboard.showNotification('Error updating profile', 'danger');
    }
};