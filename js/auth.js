class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthState();
    }

    bindEvents() {
        // Form toggles
        document.getElementById('show-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('register');
        });

        document.getElementById('show-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('login');
        });

        document.getElementById('forgot-password')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('forgot');
        });

        document.getElementById('back-to-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('login');
        });

        // Password visibility toggles
        this.setupPasswordToggles();

        // Form submissions
        document.getElementById('login-btn')?.addEventListener('click', () => this.login());
        document.getElementById('register-btn')?.addEventListener('click', () => this.register());
        document.getElementById('reset-btn')?.addEventListener('click', () => this.resetPassword());

        // Enter key support
        this.setupEnterKeySupport();
    }

    setupPasswordToggles() {
        const toggles = [
            { btn: 'toggle-login-password', input: 'login-password' },
            { btn: 'toggle-register-password', input: 'register-password' },
            { btn: 'toggle-confirm-password', input: 'register-confirm-password' }
        ];

        toggles.forEach(({ btn, input }) => {
            const toggleBtn = document.getElementById(btn);
            const inputField = document.getElementById(input);
            
            if (toggleBtn && inputField) {
                toggleBtn.addEventListener('click', () => {
                    const type = inputField.type === 'password' ? 'text' : 'password';
                    inputField.type = type;
                    toggleBtn.innerHTML = type === 'password' ? 
                        '<i class="fas fa-eye"></i>' : 
                        '<i class="fas fa-eye-slash"></i>';
                });
            }
        });
    }

    setupEnterKeySupport() {
        const forms = ['login', 'register', 'forgot'];
        forms.forEach(form => {
            const inputs = document.querySelectorAll(`#${form}-form input`);
            inputs.forEach(input => {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (form === 'login') this.login();
                        else if (form === 'register') this.register();
                        else if (form === 'forgot') this.resetPassword();
                    }
                });
            });
        });
    }

    showForm(formName) {
        ['login', 'register', 'forgot'].forEach(form => {
            const formElement = document.getElementById(`${form}-form`);
            if (formElement) {
                formElement.classList.toggle('d-none', form !== formName);
            }
        });
        this.clearMessages();
    }

    showMessage(message, type = 'success') {
        const messageDiv = document.getElementById('auth-message');
        if (!messageDiv) return;

        messageDiv.textContent = message;
        messageDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
        messageDiv.classList.remove('d-none');
        
        // Add close button
        if (!messageDiv.querySelector('.btn-close')) {
            const closeBtn = document.createElement('button');
            closeBtn.type = 'button';
            closeBtn.className = 'btn-close';
            closeBtn.setAttribute('data-bs-dismiss', 'alert');
            messageDiv.appendChild(closeBtn);
        }
        
        setTimeout(() => {
            if (messageDiv && !messageDiv.classList.contains('d-none')) {
                messageDiv.classList.add('d-none');
            }
        }, 5000);
    }

    clearMessages() {
        const messageDiv = document.getElementById('auth-message');
        if (messageDiv) {
            messageDiv.classList.add('d-none');
        }
    }

    async login() {
        const email = document.getElementById('login-email')?.value;
        const password = document.getElementById('login-password')?.value;

        if (!email || !password) {
            this.showMessage('Please fill in all fields', 'danger');
            return;
        }

        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            
            // Save remember me preference
            const rememberMe = document.getElementById('remember-me')?.checked;
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }
            
            this.showMessage('Login successful!', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } catch (error) {
            let errorMessage = 'Login failed. ';
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage += 'Invalid email address.';
                    break;
                case 'auth/user-disabled':
                    errorMessage += 'This account has been disabled.';
                    break;
                case 'auth/user-not-found':
                    errorMessage += 'No account found with this email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage += 'Incorrect password.';
                    break;
                default:
                    errorMessage += error.message;
            }
            this.showMessage(errorMessage, 'danger');
        }
    }

    async register() {
        const name = document.getElementById('register-name')?.value;
        const email = document.getElementById('register-email')?.value;
        const password = document.getElementById('register-password')?.value;
        const confirmPassword = document.getElementById('register-confirm-password')?.value;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            this.showMessage('Please fill in all fields', 'danger');
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'danger');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters', 'danger');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showMessage('Please enter a valid email address', 'danger');
            return;
        }

        try {
            // Create user
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Create user profile in Firestore
            await db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                settings: {
                    currency: 'INR',
                    theme: 'auto',
                    notifications: true
                }
            });

            // Create default categories
            await this.createDefaultCategories(user.uid);

            this.showMessage('Account created successfully!', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } catch (error) {
            let errorMessage = 'Registration failed. ';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage += 'Email already in use.';
                    break;
                case 'auth/invalid-email':
                    errorMessage += 'Invalid email address.';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage += 'Operation not allowed.';
                    break;
                case 'auth/weak-password':
                    errorMessage += 'Password is too weak.';
                    break;
                default:
                    errorMessage += error.message;
            }
            this.showMessage(errorMessage, 'danger');
        }
    }

    async createDefaultCategories(userId) {
        const defaultCategories = {
            income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
            expense: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Other']
        };

        const batch = db.batch();
        
        // Add income categories
        defaultCategories.income.forEach(category => {
            const docRef = db.collection('categories').doc();
            batch.set(docRef, {
                userId: userId,
                name: category,
                type: 'income',
                color: this.getRandomColor(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        // Add expense categories
        defaultCategories.expense.forEach(category => {
            const docRef = db.collection('categories').doc();
            batch.set(docRef, {
                userId: userId,
                name: category,
                type: 'expense',
                color: this.getRandomColor(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        await batch.commit();
    }

    getRandomColor() {
        const colors = [
            '#4361ee', '#3a0ca3', '#4cc9f0', '#f72585', 
            '#7209b7', '#ff9e00', '#06d6a0', '#ef476f'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    async resetPassword() {
        const email = document.getElementById('reset-email')?.value;

        if (!email) {
            this.showMessage('Please enter your email', 'danger');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showMessage('Please enter a valid email address', 'danger');
            return;
        }

        try {
            await auth.sendPasswordResetEmail(email);
            this.showMessage('Password reset email sent! Check your inbox.', 'success');
            
            // Clear form and show login after 3 seconds
            setTimeout(() => {
                document.getElementById('reset-email').value = '';
                this.showForm('login');
            }, 3000);
            
        } catch (error) {
            let errorMessage = 'Failed to send reset email. ';
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage += 'Invalid email address.';
                    break;
                case 'auth/user-not-found':
                    errorMessage += 'No account found with this email.';
                    break;
                default:
                    errorMessage += error.message;
            }
            this.showMessage(errorMessage, 'danger');
        }
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    checkAuthState() {
        auth.onAuthStateChanged(user => {
            if (user && window.location.pathname.includes('auth.html')) {
                // User is already logged in, redirect to dashboard
                window.location.href = 'dashboard.html';
            }
        });
    }
}

// Initialize AuthManager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});