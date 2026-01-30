window.loadProfileSection = async function() {
    const user = auth.currentUser;
    if (!user) return;

    const container = document.getElementById('profile-section');
    
    // Fetch user data
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data() || {};
    const currentAvatar = userData.avatar || '👤';
    
    // Determine if current avatar is an image path or emoji
    const isImage = currentAvatar.includes('/') || currentAvatar.includes('.png');
    const avatarDisplay = isImage 
        ? `<img src="${currentAvatar}" class="rounded-circle bg-white shadow-sm" style="width: 100px; height: 100px; object-fit: cover; border: 3px solid #fff;">`
        : `<div class="avatar mx-auto mb-3 d-flex align-items-center justify-content-center bg-light rounded-circle" style="width: 100px; height: 100px; font-size: 4rem;">${currentAvatar}</div>`;

    container.innerHTML = `
        <h2 class="mb-4">My Profile</h2>
        <div class="row">
            <div class="col-md-4 mb-4">
                <div class="card text-center p-4">
                    <div class="mx-auto mb-3" id="profile-display-avatar">
                        ${avatarDisplay}
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

    // Inject Cartoon Images (18-60 years, Men & Women)
    const avatars = [
        'img/profile_images/man_18.png', 'img/profile_images/woman_18.png',
        'img/profile_images/man_25.png', 'img/profile_images/woman_25.png',
        'img/profile_images/man_35.png', 'img/profile_images/woman_35.png',
        'img/profile_images/man_45.png', 'img/profile_images/woman_45.png',
        'img/profile_images/man_55.png', 'img/profile_images/woman_55.png',
        'img/profile_images/man_60.png', 'img/profile_images/woman_60.png'
    ];
    
    const avatarOptions = document.getElementById('avatar-options');
    if (avatarOptions) {
        avatarOptions.innerHTML = avatars.map(src => `
            <button type="button" class="btn ${src === currentAvatar ? 'btn-primary' : 'btn-outline-light border'} avatar-btn p-0 rounded-circle overflow-hidden position-relative" 
                    style="width: 60px; height: 60px; transition: transform 0.2s;"
                    onclick="selectAvatar(this, '${src}')">
                <img src="${src}" style="width: 100%; height: 100%; object-fit: cover;" alt="Avatar" onerror="this.src='https://cdn-icons-png.flaticon.com/512/847/847969.png'">
                ${src === currentAvatar ? '<div class="position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-25"></div>' : ''}
            </button>
        `).join('');
    }
};

window.selectAvatar = function(btn, src) {
    document.getElementById('profile-avatar').value = src;
    document.querySelectorAll('.avatar-btn').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline-light', 'border');
        // Remove overlay if exists
        const overlay = b.querySelector('.bg-primary');
        if(overlay) overlay.remove();
    });
    btn.classList.remove('btn-outline-light', 'border');
    btn.classList.add('btn-primary');
    
    // Add overlay to selected
    if (!btn.querySelector('.bg-primary')) {
        const overlay = document.createElement('div');
        overlay.className = 'position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-25';
        btn.appendChild(overlay);
    }

    // Update display instantly
    const displayContainer = document.getElementById('profile-display-avatar');
    if (displayContainer) {
        if (src.includes('/') || src.includes('.png')) {
            displayContainer.innerHTML = `<img src="${src}" class="rounded-circle bg-white shadow-sm" style="width: 100px; height: 100px; object-fit: cover; border: 3px solid #fff;">`;
        } else {
            displayContainer.innerHTML = `<div class="avatar mx-auto mb-3 d-flex align-items-center justify-content-center bg-light rounded-circle" style="width: 100px; height: 100px; font-size: 4rem;">${src}</div>`;
        }
    }

    // Update Sidebar Avatar Instantly
    const sidebarAvatars = document.querySelectorAll('.sidebar .avatar');
    sidebarAvatars.forEach(el => {
        if (src.includes('/') || src.includes('.png')) {
            el.innerHTML = `<img src="${src}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            el.style.backgroundColor = 'transparent';
            el.style.display = 'block';
            el.style.width = '40px';
            el.style.height = '40px';
        } else {
            el.innerHTML = src;
            el.style.cssText = 'display: flex; align-items: center; justify-content: center; font-size: 1.5rem; width: 40px; height: 40px; background-color: rgba(255,255,255,0.2); border-radius: 50%;';
        }
    });
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
                    if (avatar.includes('/') || avatar.includes('.png')) {
                        el.innerHTML = `<img src="${avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                        el.style.backgroundColor = 'transparent';
                        el.style.display = 'block';
                    } else {
                        el.innerHTML = avatar;
                        el.style.cssText = 'display: flex; align-items: center; justify-content: center; font-size: 1.5rem;';
                    }
                }
            });
        }
    } catch (error) {
        console.error(error);
        if(window.dashboard) window.dashboard.showNotification('Error updating profile', 'danger');
    }
};
