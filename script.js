// App state
let currentUser = null;
let documents = [];
let unsubscribeDocuments = null;
let documentToDelete = null;
let isLoginMode = true;

// DOM Elements
const authPages = document.getElementById('auth-pages');
const mainContent = document.getElementById('main-content');
const header = document.getElementById('header');
const userEmail = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');

// Auth elements
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authSubmit = document.getElementById('auth-submit');
const authSwitchLink = document.getElementById('auth-switch-link');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const nameField = document.getElementById('name-field');
const confirmPasswordField = document.getElementById('confirm-password-field');
const authError = document.getElementById('auth-error');
const authSuccess = document.getElementById('auth-success');

// Initialize the app
function initApp() {
    // Check if user is already logged in
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            currentUser = user;
            showMainApp();
            setupDocumentsListener();
        } else {
            // User is signed out
            currentUser = null;
            showAuthPages();
            if (unsubscribeDocuments) {
                unsubscribeDocuments();
            }
        }
    });

    // Set up event listeners
    setupEventListeners();
}

// Set up all event listeners
function setupEventListeners() {
    // Auth form submission
    authForm.addEventListener('submit', handleAuthSubmit);
    
    // Auth mode switch
    authSwitchLink.addEventListener('click', toggleAuthMode);
    
    // Forgot password
    forgotPasswordLink.addEventListener('click', handleForgotPassword);
}

// Toggle between login and signup modes
function toggleAuthMode(e) {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        authTitle.textContent = 'Login to Your Account';
        authSubmit.textContent = 'Login';
        authSwitchLink.textContent = "Don't have an account? Sign up";
        nameField.style.display = 'none';
        confirmPasswordField.style.display = 'none';
    } else {
        authTitle.textContent = 'Create Your Account';
        authSubmit.textContent = 'Sign Up';
        authSwitchLink.textContent = 'Already have an account? Login';
        nameField.style.display = 'block';
        confirmPasswordField.style.display = 'block';
    }
    
    // Clear form and messages
    authForm.reset();
    authError.textContent = '';
    authSuccess.textContent = '';
}

// Handle authentication form submission
function handleAuthSubmit(e) {
    e.preventDefault();
    showLoading();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (isLoginMode) {
        // Login
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                hideLoading();
                // Success handled by auth state change
            })
            .catch((error) => {
                hideLoading();
                authError.textContent = error.message;
            });
    } else {
        // Sign up
        const name = document.getElementById('name').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (password !== confirmPassword) {
            hideLoading();
            authError.textContent = 'Passwords do not match';
            return;
        }
        
        if (password.length < 6) {
            hideLoading();
            authError.textContent = 'Password should be at least 6 characters';
            return;
        }
        
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Save user profile
                return userCredential.user.updateProfile({
                    displayName: name
                });
            })
            .then(() => {
                hideLoading();
                authSuccess.textContent = 'Account created successfully!';
            })
            .catch((error) => {
                hideLoading();
                authError.textContent = error.message;
            });
    }
}

// Handle forgot password
function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    
    if (!email) {
        authError.textContent = 'Please enter your email address';
        return;
    }
    
    auth.sendPasswordResetEmail(email)
        .then(() => {
            authSuccess.textContent = 'Password reset email sent. Check your inbox.';
        })
        .catch((error) => {
            authError.textContent = error.message;
        });
}

// Show authentication pages
function showAuthPages() {
    authPages.classList.remove('hidden');
    mainContent.classList.add('hidden');
    if (header) header.classList.add('hidden');
}

// Show main application
function showMainApp() {
    authPages.classList.add('hidden');
    mainContent.classList.remove('hidden');
    if (header) header.classList.remove('hidden');
    
    // Update user info
    if (userEmail) {
        userEmail.textContent = currentUser.email;
    }
}

// Set up real-time listener for user's documents
function setupDocumentsListener() {
    if (!currentUser) return;
    
    unsubscribeDocuments = db.collection('documents')
        .where('userId', '==', currentUser.uid)
        .orderBy('expiryDate', 'asc')
        .onSnapshot((snapshot) => {
            documents = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                documents.push({
                    id: doc.id,
                    ...data,
                    // Convert Firestore timestamps to Date objects
                    expiryDate: data.expiryDate?.toDate ? data.expiryDate.toDate() : new Date(data.expiryDate),
                    issueDate: data.issueDate?.toDate ? data.issueDate.toDate() : new Date(data.issueDate),
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
                });
            });
            
            updateDashboard();
            checkReminders();
        }, (error) => {
            console.error('Error getting documents: ', error);
        });
}

// Update dashboard with document statistics
function updateDashboard() {
    if (!document.getElementById('total-docs')) return;
    
    const total = documents.length;
    const active = documents.filter(doc => getDocumentStatus(doc.expiryDate) === 'active').length;
    const expiring = documents.filter(doc => getDocumentStatus(doc.expiryDate) === 'expiring').length;
    const expired = documents.filter(doc => getDocumentStatus(doc.expiryDate) === 'expired').length;
    
    document.getElementById('total-docs').textContent = total;
    document.getElementById('active-docs').textContent = active;
    document.getElementById('expiring-docs').textContent = expiring;
    document.getElementById('expired-docs').textContent = expired;
    
    // Update alerts
    updateAlerts();
}

// Update alerts list
function updateAlerts() {
    const alertsList = document.getElementById('alerts-list');
    if (!alertsList) return;
    
    alertsList.innerHTML = '';
    
    const today = new Date();
    const alerts = [];
    
    documents.forEach(doc => {
        const daysRemaining = getDaysRemaining(doc.expiryDate);
        
        if (daysRemaining <= 30 && daysRemaining > 0) {
            alerts.push({
                type: 'expiring',
                title: `${doc.name} is expiring soon`,
                date: `Expires in ${daysRemaining} days`,
                docId: doc.id
            });
        } else if (daysRemaining <= 0) {
            alerts.push({
                type: 'expired',
                title: `${doc.name} has expired`,
                date: `Expired ${Math.abs(daysRemaining)} days ago`,
                docId: doc.id
            });
        }
    });
    
    if (alerts.length === 0) {
        alertsList.innerHTML = `
            <div class="empty-state">
                <p>No upcoming alerts. All documents are up to date.</p>
            </div>
        `;
        return;
    }
    
    alerts.forEach(alert => {
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item';
        alertItem.innerHTML = `
            <span class="alert-icon ${alert.type}"></span>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-date">${alert.date}</div>
            </div>
        `;
        alertsList.appendChild(alertItem);
    });
}

// Utility function to get document status
function getDocumentStatus(expiryDate) {
    const daysRemaining = getDaysRemaining(expiryDate);
    
    if (daysRemaining <= 0) {
        return 'expired';
    } else if (daysRemaining <= 30) {
        return 'expiring';
    } else {
        return 'active';
    }
}

// Utility function to calculate days remaining until expiry
function getDaysRemaining(expiryDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Utility function to format date
function formatDate(date) {
    if (!date) return 'N/A';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return dateObj.toLocaleDateString(undefined, options);
}

// Check for reminders and show alerts
function checkReminders() {
    const today = new Date().toDateString();
    const preferences = JSON.parse(localStorage.getItem('notificationPreferences') || '{}');
    
    // Set default preferences if not set
    if (Object.keys(preferences).length === 0) {
        preferences.notify30Days = true;
        preferences.notify7Days = true;
        preferences.notify1Day = true;
        preferences.notifyExpired = true;
        localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    }
    
    documents.forEach(doc => {
        const daysRemaining = getDaysRemaining(doc.expiryDate);
        
        // Check if we should show a reminder based on user preferences
        if (preferences.notify30Days && daysRemaining === 30) {
            showReminderAlert(doc, 30);
        } else if (preferences.notify7Days && daysRemaining === 7) {
            showReminderAlert(doc, 7);
        } else if (preferences.notify1Day && daysRemaining === 1) {
            showReminderAlert(doc, 1);
        } else if (preferences.notifyExpired && daysRemaining === 0) {
            showReminderAlert(doc, 0);
        }
    });
}

// Show reminder alert
function showReminderAlert(doc, days) {
    const message = days > 0 
        ? `🔔 Reminder: Your ${doc.name} (${doc.type}) expires in ${days} days`
        : `⚠️ Alert: Your ${doc.name} (${doc.type}) has expired`;
        
    // Check if we've already shown this alert today
    const alertKey = `alert_${doc.id}_${days}`;
    const lastAlertDate = localStorage.getItem(alertKey);
    const today = new Date().toDateString();
    
    if (lastAlertDate !== today) {
        // Use browser notification if available
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Expiry Tracker', {
                body: message,
                icon: '/favicon.ico'
            });
        } else {
            // Fallback to alert
            alert(message);
        }
        localStorage.setItem(alertKey, today);
    }
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Show loading indicator
function showLoading() {
    // Create loading element if it doesn't exist
    let loading = document.getElementById('loading');
    if (!loading) {
        loading = document.createElement('div');
        loading.id = 'loading';
        loading.className = 'loading';
        loading.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(loading);
    }
    loading.classList.remove('hidden');
}

// Hide loading indicator
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    requestNotificationPermission();
});

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getDocumentStatus,
        getDaysRemaining,
        formatDate
    };
}
