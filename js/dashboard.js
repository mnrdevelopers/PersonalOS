class Dashboard {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.financeChart = null;
        this.deferredPrompt = null;
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.bindEvents();
        this.updateTime();
        this.loadUserProfile();
        
        const hashSection = window.location.hash.substring(1);
        if (hashSection && document.getElementById(`${hashSection}-section`)) {
            this.switchSection(hashSection);
        } else {
            this.initializeDashboard();
            this.switchSection('dashboard');
        }
        this.setupServiceWorker();
        this.hideLoading();
    }

    async checkAuth() {
        return new Promise((resolve) => {
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    resolve();
                } else {
                    window.location.href = 'auth.html';
                }
            });
        });
    }

    bindEvents() {
        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const section = window.location.hash.substring(1);
            if (section && document.getElementById(`${section}-section`)) {
                this.switchSection(section);
            } else if (!section) {
                this.switchSection('dashboard');
            }
        });

        // Navigation
        document.querySelectorAll('[data-section]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const section = element.dataset.section;
                this.switchSection(section);
            });
        });

        // Quick Actions
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Refresh dashboard
        document.getElementById('refresh-dashboard')?.addEventListener('click', () => {
            this.refreshDashboard();
        });

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLogoutConfirmation();
        });

        // Mobile Logout
        document.getElementById('mobile-logout-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLogoutConfirmation();
        });

        // Chart period change
        document.getElementById('chart-period')?.addEventListener('change', () => {
            this.updateFinanceChart();
        });

        // Modal form submissions
        this.bindModalEvents();

        // PWA Install Logic
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            const installBtn = document.getElementById('install-app-btn');
            if (installBtn) installBtn.classList.remove('d-none');
        });

        document.getElementById('install-app-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.installPWA();
        });

        window.addEventListener('appinstalled', () => {
            this.deferredPrompt = null;
            document.getElementById('install-app-btn')?.classList.add('d-none');
            this.showNotification('App installed successfully!', 'success');
        });

        // Hamburger Menu Logic
        const hamburger = document.getElementById('hamburger-menu');
        const overlay = document.querySelector('.sidebar-overlay');
        
        const closeSidebar = () => {
            document.body.classList.remove('sidebar-open');
            if(hamburger) hamburger.setAttribute('aria-expanded', 'false');
        };

        if (hamburger && overlay) {
            hamburger.addEventListener('click', () => {
                document.body.classList.toggle('sidebar-open');
                const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
                hamburger.setAttribute('aria-expanded', !isExpanded);
            });

            overlay.addEventListener('click', closeSidebar);
        }

        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.addEventListener('click', closeSidebar);
        });

        // FAB Logic
        const fabBtn = document.getElementById('fab-main-btn');
        const fabContainer = document.querySelector('.fab-container');
        
        if (fabBtn && fabContainer) {
            fabBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                fabContainer.classList.toggle('active');
            });

            // Close FAB when clicking outside
            document.addEventListener('click', (e) => {
                if (!fabContainer.contains(e.target) && fabContainer.classList.contains('active')) {
                    fabContainer.classList.remove('active');
                }
            });
            
            // Handle FAB options
            fabContainer.querySelectorAll('.fab-option').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const action = e.currentTarget.dataset.action;
                    this.handleQuickAction(action);
                    fabContainer.classList.remove('active');
                });
            });
        }

        // Calculator
        document.getElementById('calculator-btn')?.addEventListener('click', () => {
            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('calculatorModal'));
            modal.show();
        });
        this.initCalculator();

        // Notifications
        document.getElementById('notifications-btn')?.addEventListener('click', () => {
            this.showNotificationsModal();
        });
        document.getElementById('mark-all-read')?.addEventListener('click', () => {
            this.markAllNotificationsRead();
        });
    }

    bindModalEvents() {
        // Transaction modal
        document.getElementById('save-transaction')?.addEventListener('click', () => {
            this.saveTransaction();
        });

        // Habit modal
        document.getElementById('save-habit')?.addEventListener('click', () => {
            this.saveHabit();
        });

        // Reminder modal
        document.getElementById('save-reminder')?.addEventListener('click', () => {
            this.saveReminder();
        });

        // Memory modal
        document.getElementById('save-memory')?.addEventListener('click', () => {
            this.saveMemory();
        });

        // Memory image preview
        document.getElementById('memory-image')?.addEventListener('change', (e) => {
            this.previewImage(e);
        });

        // Habit type toggle
        document.querySelectorAll('input[name="habit-type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateHabitModalUI(e.target.value);
            });
        });

        // Logout Confirm
        document.getElementById('confirm-logout-btn')?.addEventListener('click', () => {
            this.logout();
        });
    }

    initCalculator() {
        const display = document.getElementById('calc-display');
        if (!display) return;
        
        let currentInput = '0';
        let previousInput = '';
        let operator = null;
        let shouldResetDisplay = false;

        const updateDisplay = () => {
            display.value = currentInput;
        };

        const calculate = () => {
            let result;
            const prev = parseFloat(previousInput);
            const current = parseFloat(currentInput);
            
            if (isNaN(prev) || isNaN(current)) return;
            
            switch(operator) {
                case '+': result = prev + current; break;
                case '-': result = prev - current; break;
                case '*': result = prev * current; break;
                case '/': result = prev / current; break;
                case '%': result = prev % current; break;
                default: return;
            }
            
            currentInput = parseFloat(result.toFixed(8)).toString();
            shouldResetDisplay = true;
        };

        document.querySelectorAll('.calc-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const value = btn.dataset.value;

                if (action === 'number') {
                    if (currentInput === '0' || shouldResetDisplay) {
                        currentInput = value;
                        shouldResetDisplay = false;
                    } else {
                        currentInput += value;
                    }
                } else if (action === 'decimal') {
                    if (shouldResetDisplay) {
                        currentInput = '0.';
                        shouldResetDisplay = false;
                    } else if (!currentInput.includes('.')) {
                        currentInput += '.';
                    }
                } else if (action === 'operator') {
                    if (operator !== null && !shouldResetDisplay) {
                        calculate();
                    }
                    previousInput = currentInput;
                    operator = value;
                    shouldResetDisplay = true;
                } else if (action === 'calculate') {
                    if (operator !== null) {
                        calculate();
                        operator = null;
                    }
                } else if (action === 'clear') {
                    currentInput = '0';
                    previousInput = '';
                    operator = null;
                    shouldResetDisplay = false;
                } else if (action === 'backspace') {
                    if (currentInput.length > 1) {
                        currentInput = currentInput.slice(0, -1);
                    } else {
                        currentInput = '0';
                    }
                }
                updateDisplay();
            });
        });
    }

    async installPWA() {
        if (!this.deferredPrompt) return;
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        this.deferredPrompt = null;
        const installBtn = document.getElementById('install-app-btn');
        if (installBtn) installBtn.classList.add('d-none');
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
            }, 300);
        }
    }

    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'flex';
            loading.style.opacity = '1';
        }
    }

    updateHabitModalUI(type) {
        const targetLabel = document.getElementById('habit-target-label');
        const targetInput = document.getElementById('habit-target');
        const costContainer = document.getElementById('habit-cost-container');
        
        if (type === 'bad') {
            targetLabel.textContent = 'Daily Limit (Max allowed)';
            if (targetInput.value === '1') targetInput.value = '0';
            costContainer.classList.remove('d-none');
        } else {
            targetLabel.textContent = 'Target (times per period)';
            if (targetInput.value === '0') targetInput.value = '1';
            costContainer.classList.add('d-none');
        }
    }

    updateTime() {
        const updateClock = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const timeElement = document.getElementById('current-time');
            if (timeElement) {
                timeElement.textContent = timeString;
            }
        };

        updateClock();
        setInterval(updateClock, 60000); // Update every minute
    }

    async loadUserProfile() {
        try {
            const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                
                // Update UI with user info
                const userNameElements = document.querySelectorAll('#user-name');
                const userEmailElements = document.querySelectorAll('#user-email');
                
                userNameElements.forEach(el => {
                    el.textContent = userData.name || 'User';
                });
                
                userEmailElements.forEach(el => {
                    el.textContent = this.currentUser.email;
                });

                // Update Avatar
                const avatar = userData.avatar || '👤';
                const avatarElements = document.querySelectorAll('.avatar');
                avatarElements.forEach(el => {
                    // Apply emoji style
                    el.innerHTML = avatar;
                    el.style.cssText = 'display: flex; align-items: center; justify-content: center; font-size: 1.5rem; width: 40px; height: 40px; background-color: rgba(255,255,255,0.2); border-radius: 50%;';
                });
                
                // Apply theme
                const theme = userData.settings?.theme || 'auto';
                this.applyTheme(theme);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    applyTheme(theme) {
        const html = document.documentElement;
        
        if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.setAttribute('data-theme', 'light');
        }
        
        // Save to localStorage for consistency
        localStorage.setItem('theme', theme);
    }

    async initializeDashboard() {
        await Promise.all([
            this.updateStats(),
            this.loadRecentTransactions(),
            this.loadTodaysHabits(),
            this.loadUpcomingTasks(),
            this.updateFinanceChart(),
            this.loadHabitStreaks()
        ]);
        this.setupNotificationListener();
        
        // Update current date
        const now = new Date();
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    setupNotificationListener() {
        if (!this.currentUser) return;
        
        // Listen for unread notifications count
        db.collection('notifications')
            .where('userId', '==', this.currentUser.uid)
            .where('read', '==', false)
            .onSnapshot(snapshot => {
                const count = snapshot.size;
                const badge = document.getElementById('notification-badge');
                if (badge) {
                    badge.textContent = count > 9 ? '9+' : count;
                    if (count > 0) badge.classList.remove('d-none');
                    else badge.classList.add('d-none');
                }
            }, error => console.log("Notification listener error:", error));
    }

    async showNotificationsModal() {
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('notificationsModal'));
        modal.show();
        await this.loadNotifications();
    }

    async loadNotifications() {
        const container = document.getElementById('notifications-list');
        if (!container) return;

        container.innerHTML = '<div class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div></div>';

        try {
            const snapshot = await db.collection('notifications')
                .where('userId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();

            container.innerHTML = '';

            if (snapshot.empty) {
                container.innerHTML = `
                    <div class="text-center py-5 text-muted">
                        <i class="far fa-bell-slash fa-2x mb-2"></i>
                        <p class="mb-0">No notifications</p>
                    </div>`;
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                const item = document.createElement('div');
                item.className = `list-group-item list-group-item-action p-3 ${!data.read ? 'bg-light' : ''}`;
                item.innerHTML = `
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="me-3">
                            <div class="d-flex align-items-center mb-1">
                                ${!data.read ? '<span class="badge bg-primary rounded-circle p-1 me-2" style="width: 8px; height: 8px;"> </span>' : ''}
                                <h6 class="mb-0">${data.title}</h6>
                            </div>
                            <p class="mb-1 small text-muted">${data.message}</p>
                            <small class="text-muted" style="font-size: 0.75rem;">${data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString() : ''}</small>
                        </div>
                        <div class="dropdown">
                            <button class="btn btn-link text-muted p-0" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                ${!data.read ? `<li><a class="dropdown-item" href="#" onclick="window.dashboard.markNotificationRead('${doc.id}')"><i class="fas fa-check me-2"></i>Mark as read</a></li>` : ''}
                                <li><a class="dropdown-item text-danger" href="#" onclick="window.dashboard.deleteNotification('${doc.id}')"><i class="fas fa-trash me-2"></i>Delete</a></li>
                            </ul>
                        </div>
                    </div>
                `;
                container.appendChild(item);
            });
        } catch (error) {
            console.error("Error loading notifications:", error);
            container.innerHTML = '<div class="text-center py-3 text-danger">Error loading notifications</div>';
        }
    }

    async markNotificationRead(id) {
        try {
            await db.collection('notifications').doc(id).update({ read: true });
            this.loadNotifications(); // Refresh list
        } catch (error) {
            console.error("Error marking read:", error);
        }
    }

    async deleteNotification(id) {
        try {
            await db.collection('notifications').doc(id).delete();
            this.loadNotifications(); // Refresh list
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    }

    async markAllNotificationsRead() {
        try {
            const batch = db.batch();
            const snapshot = await db.collection('notifications')
                .where('userId', '==', this.currentUser.uid)
                .where('read', '==', false)
                .get();
            
            if (snapshot.empty) return;

            snapshot.forEach(doc => {
                batch.update(doc.ref, { read: true });
            });

            await batch.commit();
            this.loadNotifications();
            this.showNotification('All notifications marked as read', 'success');
        } catch (error) {
            console.error("Error marking all read:", error);
        }
    }

    async updateStats() {
        try {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            
            // Get today's transactions
            const transactionsSnapshot = await db.collection('transactions')
                .where('userId', '==', this.currentUser.uid)
                .where('date', '==', today)
                .get();
            
            let totalIncome = 0;
            let totalExpense = 0;
            let totalMoneySaved = 0;
            
            transactionsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.type === 'income') {
                    totalIncome += data.amount;
                } else {
                    totalExpense += data.amount;
                }
            });
            
            const balance = totalIncome - totalExpense;
            
            // Update balance stats
            document.getElementById('today-balance').textContent = `₹${balance.toFixed(2)}`;
            document.getElementById('income-today').textContent = `₹${totalIncome.toFixed(2)}`;
            document.getElementById('expense-today').textContent = `₹${totalExpense.toFixed(2)}`;
            
            // Get active habits count
            const habitsSnapshot = await db.collection('habits')
                .where('userId', '==', this.currentUser.uid)
                .where('active', '==', true)
                .get();

            habitsSnapshot.forEach(doc => {
                const habit = doc.data();
                if (habit.type === 'bad' && habit.cost) {
                    // New Logic: Savings = (Days Active - Relapses) * Cost
                    const startDate = habit.createdAt ? habit.createdAt.toDate() : new Date();
                    const todayDate = new Date();
                    const totalDays = Math.floor((todayDate - startDate) / (1000 * 60 * 60 * 24));
                    const relapses = habit.totalCompletions || 0;
                    const cleanDays = Math.max(0, totalDays - relapses);
                    totalMoneySaved += cleanDays * habit.cost;
                }
            });
            
            // Get today's completed habits
            const todayHabitsSnapshot = await db.collection('habit_logs')
                .where('userId', '==', this.currentUser.uid)
                .where('date', '==', today)
                .where('completed', '==', true)
                .get();
            
            document.getElementById('active-habits').textContent = habitsSnapshot.size;
            document.getElementById('completed-today').textContent = todayHabitsSnapshot.size;

            const moneySavedContainer = document.getElementById('money-saved-container');
            if (totalMoneySaved > 0) {
                document.getElementById('total-money-saved').textContent = `₹${totalMoneySaved.toFixed(2)}`;
                moneySavedContainer.classList.remove('d-none');
            } else {
                moneySavedContainer.classList.add('d-none');
            }
            
            // Get pending tasks
            const tasksSnapshot = await db.collection('reminders')
                .where('userId', '==', this.currentUser.uid)
                .where('completed', '==', false)
                .get();
            
            // Get tasks due today
            const todayTasksSnapshot = await db.collection('reminders')
                .where('userId', '==', this.currentUser.uid)
                .where('dueDate', '==', today)
                .where('completed', '==', false)
                .get();
            
            document.getElementById('pending-tasks').textContent = tasksSnapshot.size;
            document.getElementById('due-today').textContent = todayTasksSnapshot.size;
            
            // Get total memories
            const memoriesSnapshot = await db.collection('memories')
                .where('userId', '==', this.currentUser.uid)
                .get();
            
            // Get this month's memories
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const monthMemoriesSnapshot = await db.collection('memories')
                .where('userId', '==', this.currentUser.uid)
                .where('date', '>=', startOfMonth)
                .get();
            
            document.getElementById('total-memories').textContent = memoriesSnapshot.size;
            document.getElementById('memories-this-month').textContent = monthMemoriesSnapshot.size;
            
            // Update Loan Stats
            const loansSnapshot = await db.collection('loans')
                .where('userId', '==', this.currentUser.uid)
                .where('status', '==', 'active')
                .get();
                
            let totalLiability = 0;
            let totalAsset = 0;
            let totalMonthlyEmi = 0;
            
            loansSnapshot.forEach(doc => {
                const data = doc.data();
                const remaining = data.totalAmount - (data.paidAmount || 0);
                if (data.type === 'borrowed' || data.type === 'emi') {
                    totalLiability += remaining;
                    if (data.emiAmount && remaining > 0) totalMonthlyEmi += data.emiAmount;
                }
                else if (data.type === 'lent') totalAsset += remaining;
            });
            
            if(document.getElementById('total-liability')) document.getElementById('total-liability').textContent = `₹${totalLiability.toFixed(0)}`;
            if(document.getElementById('total-asset')) document.getElementById('total-asset').textContent = `₹${totalAsset.toFixed(0)}`;
            if(document.getElementById('total-monthly-emi')) document.getElementById('total-monthly-emi').textContent = `₹${totalMonthlyEmi.toFixed(0)}`;

        } catch (error) {
            console.error('Error updating stats:', error);
            this.showNotification('Error updating dashboard stats', 'danger');
        }
    }

    async loadRecentTransactions() {
        const container = document.getElementById('recent-transactions');
        if (!container) return;

        try {
            const snapshot = await db.collection('transactions')
                .where('userId', '==', this.currentUser.uid)
                .orderBy('date', 'desc')
                .orderBy('createdAt', 'desc')
                .limit(5)
                .get();
            
            container.innerHTML = '';
            
            if (snapshot.empty) {
                container.innerHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-receipt fa-2x text-muted mb-3"></i>
                        <p class="text-muted">No transactions yet</p>
                        <button class="btn btn-sm btn-primary" onclick="window.handleQuickAction('add-income')">
                            Add your first transaction
                        </button>
                    </div>
                `;
                return;
            }
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const element = this.createTransactionElement(data);
                container.appendChild(element);
            });
            
        } catch (error) {
            console.error('Error loading transactions:', error);
            container.innerHTML = '<p class="text-danger">Error loading transactions</p>';
        }
    }

    createTransactionElement(data) {
        const div = document.createElement('div');
        div.className = 'transaction-item';
        
        const isIncome = data.type === 'income';
        const amountClass = isIncome ? 'transaction-income' : 'transaction-expense';
        const amountPrefix = isIncome ? '+' : '-';
        const icon = isIncome ? 'fa-arrow-down' : 'fa-arrow-up';
        
        div.innerHTML = `
            <div class="transaction-info">
                <div class="d-flex align-items-center gap-2">
                    <div class="transaction-icon ${isIncome ? 'text-success' : 'text-danger'}">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div>
                        <h6 class="mb-0">${data.category}</h6>
                        <small class="text-muted">${data.description || 'No description'}</small>
                    </div>
                </div>
            </div>
            <div class="transaction-amount ${amountClass}">
                ${amountPrefix}₹${data.amount.toFixed(2)}
            </div>
        `;
        
        return div;
    }

    async loadTodaysHabits() {
        const container = document.getElementById('todays-habits');
        if (!container) return;

        try {
            const today = new Date().toISOString().split('T')[0];
            
            // Get habits for today
            const habitsSnapshot = await db.collection('habits')
                .where('userId', '==', this.currentUser.uid)
                .where('active', '==', true)
                .limit(5)
                .get();
            
            container.innerHTML = '';
            
            if (habitsSnapshot.empty) {
                container.innerHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-check-circle fa-2x text-muted mb-3"></i>
                        <p class="text-muted">No habits for today</p>
                        <button class="btn btn-sm btn-success" onclick="window.handleQuickAction('add-habit')">
                            Create your first habit
                        </button>
                    </div>
                `;
                return;
            }
            
            // Get today's habit logs
            const logsSnapshot = await db.collection('habit_logs')
                .where('userId', '==', this.currentUser.uid)
                .where('date', '==', today)
                .get();
            
            const completedHabits = new Set();
            logsSnapshot.forEach(doc => {
                if (doc.data().completed) {
                    completedHabits.add(doc.data().habitId);
                }
            });
            
            habitsSnapshot.forEach(doc => {
                const habit = doc.data();
                habit.id = doc.id;
                habit.completed = completedHabits.has(doc.id);
                const element = this.createHabitElement(habit);
                container.appendChild(element);
            });
            
        } catch (error) {
            console.error('Error loading habits:', error);
            container.innerHTML = '<p class="text-danger">Error loading habits</p>';
        }
    }

    createHabitElement(habit) {
        const div = document.createElement('div');
        div.className = 'habit-item';
        div.dataset.habitId = habit.id;
        
        const isBad = habit.type === 'bad';
        const btnClass = isBad 
            ? (habit.completed ? 'btn-danger' : 'btn-outline-danger') 
            : (habit.completed ? 'btn-success' : 'btn-outline-success');
        const iconClass = isBad 
            ? (habit.completed ? 'fa-skull' : 'fa-ban') 
            : 'fa-check';
            
        // Add tooltip title for clarity
        const btnTitle = isBad
            ? (habit.completed ? 'Undo Relapse' : 'Log Relapse (I did it)')
            : (habit.completed ? 'Mark Incomplete' : 'Mark Complete');

        div.innerHTML = `
            <div class="habit-color" style="background-color: ${habit.color || '#4361ee'}"></div>
            <div class="habit-content">
                <div class="d-flex align-items-center">
                    <h6 class="mb-0 me-2">${habit.name}</h6>
                    ${isBad ? '<span class="badge bg-danger" style="font-size: 0.6rem;">Quit</span>' : ''}
                </div>
                <small class="text-muted">${this.getFrequencyText(habit.frequency)}</small>
            </div>
            <div class="habit-actions">
                <button class="btn btn-sm ${btnClass}" 
                        title="${btnTitle}"
                        onclick="window.toggleHabitCompletion('${habit.id}')">
                    <i class="fas ${iconClass}"></i>
                </button>
            </div>
        `;
        
        return div;
    }

    getFrequencyText(frequency) {
        switch (frequency) {
            case 'daily': return 'Daily';
            case 'weekly': return 'Weekly';
            case 'monthly': return 'Monthly';
            default: return 'Custom';
        }
    }

    async loadUpcomingTasks() {
        const container = document.getElementById('upcoming-tasks');
        if (!container) return;

        try {
            // Use local date to match input values
            const now = new Date();
            const offset = now.getTimezoneOffset();
            const todayDate = new Date(now.getTime() - (offset * 60 * 1000));
            const today = todayDate.toISOString().split('T')[0];
            
            const nextWeekDate = new Date(now.getTime() - (offset * 60 * 1000));
            nextWeekDate.setDate(nextWeekDate.getDate() + 7);
            const nextWeekString = nextWeekDate.toISOString().split('T')[0];
            
            const snapshot = await db.collection('reminders')
                .where('userId', '==', this.currentUser.uid)
                .where('completed', '==', false)
                .where('dueDate', '>=', today)
                .where('dueDate', '<=', nextWeekString)
                .orderBy('dueDate')
                .limit(5)
                .get();
            
            container.innerHTML = '';
            
            if (snapshot.empty) {
                container.innerHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-tasks fa-2x text-muted mb-3"></i>
                        <p class="text-muted">No upcoming tasks</p>
                        <button class="btn btn-sm btn-warning" onclick="window.handleQuickAction('add-reminder')">
                            Add your first task
                        </button>
                    </div>
                `;
                return;
            }
            
            snapshot.forEach(doc => {
                const task = doc.data();
                task.id = doc.id;
                const element = this.createTaskElement(task);
                container.appendChild(element);
            });
            
        } catch (error) {
            console.error('Error loading tasks:', error);
            container.innerHTML = '<p class="text-danger">Error loading tasks</p>';
        }
    }

    createTaskElement(task) {
        const div = document.createElement('div');
        div.className = 'task-item';
        div.dataset.taskId = task.id;
        
        const priorityClass = `priority-${task.priority || 'medium'}`;
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const isToday = dueDate.toDateString() === today.toDateString();
        
        div.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" class="form-check-input" 
                       ${task.completed ? 'checked' : ''}
                       onchange="window.toggleTaskCompletion('${task.id}', this.checked)">
            </div>
            <div class="task-content">
                <h6 class="mb-0 ${task.completed ? 'text-decoration-line-through text-muted' : ''}">
                    ${task.title}
                </h6>
                <small class="text-muted">
                    ${isToday ? 'Today' : dueDate.toLocaleDateString()} 
                    ${task.time ? 'at ' + task.time : ''}
                </small>
            </div>
            <div class="task-priority ${priorityClass}">
                ${task.priority || 'medium'}
            </div>
        `;
        
        return div;
    }

    async loadHabitStreaks() {
        const container = document.getElementById('habit-streaks');
        if (!container) return;

        try {
            const snapshot = await db.collection('habits')
                .where('userId', '==', this.currentUser.uid)
                .where('active', '==', true)
                .limit(5)
                .get();
            
            container.innerHTML = '';
            
            if (snapshot.empty) {
                container.innerHTML = '<p class="text-muted text-center">No active habits</p>';
                return;
            }
            
            // Get streak data for each habit
            const habitPromises = snapshot.docs.map(async doc => {
                const habit = doc.data();
                habit.id = doc.id;
                
                let streak = 0;
                
                if (habit.type === 'bad') {
                    // Bad Habit: Days since last log (Relapse)
                    const today = new Date();
                    const startDate = habit.createdAt ? habit.createdAt.toDate() : today;
                    const lastRelapse = habit.lastLogDate ? new Date(habit.lastLogDate) : startDate;
                    
                    // If logged today, streak is 0
                    // We need to check if logged today, but for the widget we can approximate
                    // or fetch today's log. For simplicity, we use the diff.
                    const diffTime = Math.abs(today - lastRelapse);
                    streak = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                } else {
                    // Good Habit: Consecutive days
                    const logsSnapshot = await db.collection('habit_logs')
                        .where('userId', '==', this.currentUser.uid)
                        .where('habitId', '==', doc.id)
                        .where('completed', '==', true)
                        .orderBy('date', 'desc')
                        .limit(30)
                        .get();
                    
                    const today = new Date();
                    let currentDate = new Date(today);
                    
                    for (let i = 0; i < 30; i++) {
                        const dateString = currentDate.toISOString().split('T')[0];
                        const hasLog = logsSnapshot.docs.some(log => log.data().date === dateString);
                        
                        if (hasLog) {
                            streak++;
                            currentDate.setDate(currentDate.getDate() - 1);
                        } else {
                            break;
                        }
                    }
                }
                
                habit.streak = streak;
                return habit;
            });
            
            const habits = await Promise.all(habitPromises);
            
            habits.forEach(habit => {
                const element = this.createStreakElement(habit);
                container.appendChild(element);
            });
            
        } catch (error) {
            console.error('Error loading habit streaks:', error);
            container.innerHTML = '<p class="text-danger">Error loading streaks</p>';
        }
    }

    createStreakElement(habit) {
        const div = document.createElement('div');
        div.className = 'streak-item mb-3';
        const label = habit.type === 'bad' ? 'Days Clean' : 'Current streak';
        
        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-0">${habit.name}</h6>
                    <small class="text-muted">${label}</small>
                </div>
                <div class="text-end">
                    <h4 class="mb-0">${habit.streak} 🔥</h4>
                    <small class="text-muted">days</small>
                </div>
            </div>
            <div class="progress mt-2" style="height: 6px;">
                <div class="progress-bar" role="progressbar" 
                     style="width: ${Math.min(habit.streak * 10, 100)}%; background-color: ${habit.color || '#4361ee'}">
                </div>
            </div>
        `;
        
        return div;
    }

    async updateFinanceChart() {
        try {
            const period = document.getElementById('chart-period')?.value || 'week';
            let startDate, endDate;
            const today = new Date();
            
            switch (period) {
                case 'week':
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 6);
                    break;
                case 'month':
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    break;
                case 'year':
                    startDate = new Date(today.getFullYear(), 0, 1);
                    endDate = new Date(today.getFullYear(), 11, 31);
                    break;
            }
            
            // Format dates for query
            const startDateString = startDate.toISOString().split('T')[0];
            const endDateString = (endDate || today).toISOString().split('T')[0];
            
            // Get transactions for the period
            const snapshot = await db.collection('transactions')
                .where('userId', '==', this.currentUser.uid)
                .where('date', '>=', startDateString)
                .where('date', '<=', endDateString)
                .get();
            
            // Process data for chart
            const incomeData = {};
            const expenseData = {};
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const date = data.date;
                
                if (data.type === 'income') {
                    incomeData[date] = (incomeData[date] || 0) + data.amount;
                } else {
                    expenseData[date] = (expenseData[date] || 0) + data.amount;
                }
            });
            
            // Generate labels based on period
            const labels = [];
            const incomeValues = [];
            const expenseValues = [];
            
            let currentDate = new Date(startDate);
            while (currentDate <= (endDate || today)) {
                const dateString = currentDate.toISOString().split('T')[0];
                labels.push(this.formatChartLabel(dateString, period));
                incomeValues.push(incomeData[dateString] || 0);
                expenseValues.push(expenseData[dateString] || 0);
                
                if (period === 'week') {
                    currentDate.setDate(currentDate.getDate() + 1);
                } else if (period === 'month') {
                    currentDate.setDate(currentDate.getDate() + 1);
                } else {
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }
            }
            
            // Create or update chart
            const ctx = document.getElementById('financeChart')?.getContext('2d');
            if (!ctx) return;
            
            if (this.financeChart) {
                this.financeChart.destroy();
            }
            
            this.financeChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Income',
                            data: incomeValues,
                            backgroundColor: 'rgba(6, 214, 160, 0.7)',
                            borderColor: 'rgba(6, 214, 160, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Expense',
                            data: expenseValues,
                            backgroundColor: 'rgba(239, 71, 111, 0.7)',
                            borderColor: 'rgba(239, 71, 111, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return '₹' + value;
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ₹' + context.parsed.y.toFixed(2);
                                }
                            }
                        }
                    }
                }
            });
            
        } catch (error) {
            console.error('Error updating finance chart:', error);
        }
    }

    formatChartLabel(dateString, period) {
        const date = new Date(dateString);
        
        switch (period) {
            case 'week':
                return date.toLocaleDateString('en-US', { weekday: 'short' });
            case 'month':
                return date.getDate().toString();
            case 'year':
                return date.toLocaleDateString('en-US', { month: 'short' });
            default:
                return dateString;
        }
    }

    switchSection(section) {
        if (window.location.hash.substring(1) !== section) {
            window.location.hash = section;
            return;
        }

        localStorage.setItem('currentSection', section);
        // Update active state
        document.querySelectorAll('[data-section]').forEach(element => {
            element.classList.toggle('active', element.dataset.section === section);
        });
        
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('d-none');
        });
        
        // Show selected section
        const sectionElement = document.getElementById(`${section}-section`);
        if (sectionElement) {
            sectionElement.classList.remove('d-none');
            
            // Load section-specific content
            this.loadSectionContent(section).catch(error => {
                console.error(`Error loading section ${section}:`, error);
            });
        }
        
        this.currentSection = section;
    }

    async loadSectionContent(section) {
        switch (section) {
            case 'dashboard':
                await this.initializeDashboard();
                break;
            case 'finance':
                await window.loadFinanceSection();
                break;
            case 'transactions':
                if (window.loadTransactionsSection) await window.loadTransactionsSection();
                break;
            case 'loans':
                if (window.loadLoansSection) await window.loadLoansSection();
                break;
            case 'habits':
                await window.loadHabitsSection();
                break;
            case 'reminders':
                await window.loadRemindersSection();
                break;
            case 'memories':
                await window.loadMemoriesSection();
                break;
            case 'reports':
                await window.loadReportsSection();
                break;
            case 'profile':
                await window.loadProfileSection();
                break;
            case 'goals':
                if (window.loadGoalsSection) await window.loadGoalsSection();
                break;
            case 'entertainment':
                if (window.loadEntertainmentSection) await window.loadEntertainmentSection();
                break;
            case 'settings':
                if (window.loadSettingsSection) await window.loadSettingsSection();
                break;
            case 'expiry':
                if (window.loadExpirySection) await window.loadExpirySection();
                break;
        }
    }

    handleQuickAction(action) {
        switch (action) {
            case 'add-income':
                this.showTransactionModal('income');
                break;
            case 'add-expense':
                this.showTransactionModal('expense');
                break;
            case 'add-habit':
                this.showHabitModal();
                break;
            case 'add-reminder':
                this.showReminderModal();
                break;
            case 'add-memory':
                this.showMemoryModal();
                break;
            case 'view-report':
                this.switchSection('reports');
                break;
            case 'add-expiry':
                if (window.showAddExpiryModal) window.showAddExpiryModal();
                break;
        }
    }

    showTransactionModal(type = 'income') {
        // Load categories first
        this.loadTransactionCategories().then(() => {
            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addTransactionModal'));
            
            // Set default values
            document.getElementById('type-income').checked = type === 'income';
            document.getElementById('type-expense').checked = type === 'expense';
            document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('transaction-mode').value = 'cash';
            document.getElementById('transaction-id').value = '';
            document.getElementById('transaction-amount').value = '';
            document.getElementById('transaction-description').value = '';
            
            modal.show();
        });
    }

    async loadTransactionCategories() {
        try {
            const incomeSnapshot = await db.collection('categories')
                .where('userId', '==', this.currentUser.uid)
                .where('type', '==', 'income')
                .get();
            
            const expenseSnapshot = await db.collection('categories')
                .where('userId', '==', this.currentUser.uid)
                .where('type', '==', 'expense')
                .get();
            
            const select = document.getElementById('transaction-category');
            if (!select) return;
            
            select.innerHTML = '';
            
            // Add income categories
            if (!incomeSnapshot.empty) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = 'Income Categories';
                incomeSnapshot.forEach(doc => {
                    const option = document.createElement('option');
                    option.value = doc.data().name;
                    option.textContent = doc.data().name;
                    option.style.color = doc.data().color;
                    optgroup.appendChild(option);
                });
                select.appendChild(optgroup);
            }
            
            // Add expense categories
            if (!expenseSnapshot.empty) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = 'Expense Categories';
                expenseSnapshot.forEach(doc => {
                    const option = document.createElement('option');
                    option.value = doc.data().name;
                    option.textContent = doc.data().name;
                    option.style.color = doc.data().color;
                    optgroup.appendChild(option);
                });
                select.appendChild(optgroup);
            }
            
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async saveTransaction() {
        try {
            const id = document.getElementById('transaction-id').value;
            const type = document.querySelector('input[name="transaction-type"]:checked')?.value;
            const amount = parseFloat(document.getElementById('transaction-amount').value);
            const paymentMode = document.getElementById('transaction-mode').value;
            const category = document.getElementById('transaction-category').value;
            const description = document.getElementById('transaction-description').value;
            const date = document.getElementById('transaction-date').value;
            const isRecurring = document.getElementById('recurring-transaction').checked;
            
            if (!type || !amount || !category || !date) {
                this.showNotification('Please fill all required fields', 'danger');
                return;
            }
            
            if (amount <= 0) {
                this.showNotification('Amount must be greater than 0', 'danger');
                return;
            }
            
            const transaction = {
                type: type,
                amount: amount,
                paymentMode: paymentMode,
                category: category,
                description: description,
                date: date,
                userId: this.currentUser.uid,
                recurring: isRecurring
            };
            
            if (id) {
                transaction.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('transactions').doc(id).update(transaction);
            } else {
                transaction.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('transactions').add(transaction);
            }
            
            // Close modal
            bootstrap.Modal.getOrCreateInstance(document.getElementById('addTransactionModal')).hide();
            
            // Reset form
            document.getElementById('transaction-form').reset();
            
            // Update dashboard
            this.updateStats();
            this.loadRecentTransactions();
            this.updateFinanceChart();
            
            // Reload finance table if active
            if (this.currentSection === 'finance' && typeof window.loadFinanceData === 'function') {
                window.loadFinanceData();
            }
            
            this.showNotification(id ? 'Transaction updated successfully!' : 'Transaction added successfully!', 'success');
            
        } catch (error) {
            console.error('Error saving transaction:', error);
            this.showNotification('Error saving transaction: ' + error.message, 'danger');
        }
    }

    showHabitModal() {
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addHabitModal'));
        
        // Setup color picker
        this.setupColorPicker();
        
        // Set default values
        document.getElementById('type-good').checked = true;
        document.getElementById('habit-id').value = '';
        document.getElementById('habit-name').value = '';
        document.getElementById('habit-category').value = 'health';
        document.getElementById('habit-frequency').value = 'daily';
        document.getElementById('habit-target').value = '1';
        document.getElementById('habit-reminder-time').value = '';
        document.getElementById('habit-cost').value = '';
        this.updateHabitModalUI('good');
        
        modal.show();
    }

    setupColorPicker() {
        const colors = [
            '#4361ee', '#3a0ca3', '#4cc9f0', '#f72585',
            '#7209b7', '#ff9e00', '#06d6a0', '#ef476f'
        ];
        
        const container = document.getElementById('color-picker');
        if (!container) return;
        
        container.innerHTML = '';
        
        colors.forEach(color => {
            const colorBtn = document.createElement('button');
            colorBtn.type = 'button';
            colorBtn.className = 'color-option';
            colorBtn.style.cssText = `
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background-color: ${color};
                border: 2px solid transparent;
                cursor: pointer;
            `;
            colorBtn.dataset.color = color;
            
            colorBtn.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(btn => {
                    btn.style.borderColor = 'transparent';
                });
                colorBtn.style.borderColor = '#000';
            });
            
            container.appendChild(colorBtn);
        });
        
        // Select first color by default
        if (container.firstChild) {
            container.firstChild.style.borderColor = '#000';
        }
    }

    async saveHabit() {
        try {
            const type = document.querySelector('input[name="habit-type"]:checked')?.value || 'good';
            const id = document.getElementById('habit-id').value;
            const name = document.getElementById('habit-name').value;
            const category = document.getElementById('habit-category').value;
            const frequency = document.getElementById('habit-frequency').value;
            const target = parseInt(document.getElementById('habit-target').value);
            const reminderTime = document.getElementById('habit-reminder-time').value;
            const cost = parseFloat(document.getElementById('habit-cost').value) || 0;
            const selectedColor = document.querySelector('.color-option[style*="border-color: rgb(0, 0, 0)"]')?.dataset.color || '#4361ee';
            
            if (!name) {
                this.showNotification('Please enter habit name', 'danger');
                return;
            }
            
            if (type === 'good' && target < 1) {
                this.showNotification('Target must be at least 1', 'danger');
                return;
            }

            if (type === 'bad' && target < 0) {
                this.showNotification('Limit cannot be negative', 'danger');
                return;
            }
            
            const habit = {
                type: type,
                name: name,
                category: category,
                frequency: frequency,
                target: target,
                reminderTime: reminderTime || null,
                cost: type === 'bad' ? cost : 0,
                color: selectedColor,
                userId: this.currentUser.uid,
                active: true,
                currentStreak: 0,
                totalCompletions: 0,
                longestStreak: 0
            };
            
            if (id) {
                habit.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('habits').doc(id).update(habit);
            } else {
                habit.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('habits').add(habit);
            }
            
            // Close modal
            bootstrap.Modal.getOrCreateInstance(document.getElementById('addHabitModal')).hide();
            
            // Reset form
            document.getElementById('habit-form').reset();
            
            // Update dashboard
            this.updateStats();
            this.loadTodaysHabits();
            this.loadHabitStreaks();
            
            this.showNotification(id ? 'Habit updated successfully!' : 'Habit created successfully!', 'success');
            
        } catch (error) {
            console.error('Error saving habit:', error);
            this.showNotification('Error saving habit: ' + error.message, 'danger');
        }
    }

    showReminderModal() {
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addReminderModal'));
        
        // Set default values
        document.getElementById('reminder-id').value = '';
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('reminder-title').value = '';
        document.getElementById('reminder-description').value = '';
        document.getElementById('reminder-due-date').value = today;
        document.getElementById('reminder-time').value = '';
        document.getElementById('reminder-priority').value = 'medium';
        document.getElementById('reminder-notification').checked = true;
        
        modal.show();
    }

    async saveReminder() {
        try {
            const id = document.getElementById('reminder-id').value;
            const title = document.getElementById('reminder-title').value;
            const description = document.getElementById('reminder-description').value;
            const dueDate = document.getElementById('reminder-due-date').value;
            const time = document.getElementById('reminder-time').value;
            const priority = document.getElementById('reminder-priority').value;
            const sendNotification = document.getElementById('reminder-notification').checked;
            
            if (!title || !dueDate) {
                this.showNotification('Please fill all required fields', 'danger');
                return;
            }
            
            const reminder = {
                title: title,
                description: description,
                dueDate: dueDate,
                time: time || null,
                priority: priority,
                sendNotification: sendNotification,
                completed: false,
                userId: this.currentUser.uid,
            };
            
            if (id) {
                reminder.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('reminders').doc(id).update(reminder);
                reminder.id = id;
            } else {
                reminder.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                const docRef = await db.collection('reminders').add(reminder);
                reminder.id = docRef.id;
            }
            
            // Close modal
            bootstrap.Modal.getOrCreateInstance(document.getElementById('addReminderModal')).hide();
            
            // Reset form
            document.getElementById('reminder-form').reset();
            
            // Update dashboard
            this.updateStats();
            this.loadUpcomingTasks();
            
            this.showNotification(id ? 'Task updated successfully!' : 'Task added successfully!', 'success');
            
            // Schedule notification if enabled
            if (sendNotification) {
                this.scheduleNotification(reminder);
            }
            
        } catch (error) {
            console.error('Error saving reminder:', error);
            this.showNotification('Error saving task: ' + error.message, 'danger');
        }
    }

    scheduleNotification(reminder) {
        const dueDateTime = new Date(reminder.dueDate);
        if (reminder.time) {
            const [hours, minutes] = reminder.time.split(':');
            dueDateTime.setHours(parseInt(hours), parseInt(minutes));
        }
        
        const now = new Date();
        const timeUntilDue = dueDateTime.getTime() - now.getTime();
        
        if (timeUntilDue > 0) {
            setTimeout(() => {
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Task Reminder', {
                        body: `${reminder.title} is due now!`,
                        icon: '/icons/icon-192.png'
                    });
                }
                
                // Create in-app notification
                db.collection('notifications').add({
                    userId: this.currentUser.uid,
                    title: 'Task Due',
                    message: `${reminder.title} is due now!`,
                    read: false,
                    type: 'reminder',
                    relatedId: reminder.id || null,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }, timeUntilDue);
        }
    }

    showMemoryModal() {
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addMemoryModal'));
        
        // Set default values
        document.getElementById('memory-id').value = '';
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('memory-title').value = '';
        document.getElementById('memory-description').value = '';
        document.getElementById('memory-date').value = today;
        document.getElementById('memory-image').value = '';
        document.getElementById('memory-tags').value = '';
        
        // Clear preview
        const previewContainer = document.querySelector('.preview-container');
        if (previewContainer) {
            previewContainer.classList.add('d-none');
        }
        
        modal.show();
    }

    previewImage(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('image-preview');
        const previewContainer = document.querySelector('.preview-container');
        
        if (file && preview && previewContainer) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                previewContainer.classList.remove('d-none');
            };
            reader.readAsDataURL(file);
        }
    }

    async saveMemory() {
        try {
            const id = document.getElementById('memory-id').value;
            const title = document.getElementById('memory-title').value;
            const description = document.getElementById('memory-description').value;
            const date = document.getElementById('memory-date').value;
            const tags = document.getElementById('memory-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
            const imageFile = document.getElementById('memory-image').files[0];
            
            if (!title) {
                this.showNotification('Please enter a title', 'danger');
                return;
            }
            
            let imageUrl = null;
            
            // Upload image if exists
            if (imageFile) {
                const storageRef = storage.ref();
                const imageRef = storageRef.child(`memories/${this.currentUser.uid}/${Date.now()}_${imageFile.name}`);
                await imageRef.put(imageFile);
                imageUrl = await imageRef.getDownloadURL();
            }
            
            const memory = {
                title: title,
                description: description,
                date: date,
                tags: tags,
                imageUrl: imageUrl,
                userId: this.currentUser.uid,
            };
            
            if (id) {
                memory.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                if (!imageUrl) delete memory.imageUrl; // Don't overwrite image if not changed
                await db.collection('memories').doc(id).update(memory);
            } else {
                memory.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('memories').add(memory);
            }
            
            // Close modal
            bootstrap.Modal.getOrCreateInstance(document.getElementById('addMemoryModal')).hide();
            
            // Reset form
            document.getElementById('memory-form').reset();
            const previewContainer = document.querySelector('.preview-container');
            if (previewContainer) {
                previewContainer.classList.add('d-none');
            }
            
            // Update dashboard
            this.updateStats();
            
            this.showNotification(id ? 'Memory updated successfully!' : 'Memory saved successfully!', 'success');
            
        } catch (error) {
            console.error('Error saving memory:', error);
            this.showNotification('Error saving memory: ' + error.message, 'danger');
        }
    }

    async toggleHabitCompletion(habitId) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const habitDoc = await db.collection('habits').doc(habitId).get();
            const habitData = habitDoc.data();
            
            // Check if already logged today
            const existingLog = await db.collection('habit_logs')
                .where('userId', '==', this.currentUser.uid)
                .where('habitId', '==', habitId)
                .where('date', '==', today)
                .get();
            
            // Confirmation for Bad Habits (Relapse)
            if (habitData.type === 'bad' && existingLog.empty) {
                if (!confirm("Are you sure you want to log a relapse? This will reset your streak.")) {
                    return;
                }
            }

            if (!existingLog.empty) {
                // Update existing log
                const logDoc = existingLog.docs[0];
                const currentStatus = logDoc.data().completed;
                
                await db.collection('habit_logs').doc(logDoc.id).update({
                    completed: !currentStatus,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                const msg = habitData.type === 'bad' 
                    ? (!currentStatus ? 'Relapse logged.' : 'Relapse undone.') 
                    : (!currentStatus ? 'Habit completed!' : 'Habit unchecked.');
                this.showNotification(msg, 'success');
            } else {
                // Update habit total completions
                await db.collection('habits').doc(habitId).update({
                    totalCompletions: firebase.firestore.FieldValue.increment(1),
                    lastLogDate: today // Track last activity date
                });

                // Create new log
                await db.collection('habit_logs').add({
                    habitId: habitId,
                    userId: this.currentUser.uid,
                    date: today,
                    completed: true,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                const msg = habitData.type === 'bad' ? 'Relapse recorded.' : 'Habit completed!';
                this.showNotification(msg, 'success');
            }
            
            // Handle updating totalCompletions for existing log toggle
            if (!existingLog.empty) {
                const logDoc = existingLog.docs[0];
                const currentStatus = logDoc.data().completed;
                await db.collection('habits').doc(habitId).update({
                    totalCompletions: firebase.firestore.FieldValue.increment(currentStatus ? -1 : 1)
                });
            }

            // Update UI
            this.loadTodaysHabits();
            this.updateStats();
            this.loadHabitStreaks();
            
        } catch (error) {
            console.error('Error toggling habit:', error);
            this.showNotification('Error updating habit', 'danger');
        }
    }

    async toggleTaskCompletion(taskId, completed) {
        try {
            await db.collection('reminders').doc(taskId).update({
                completed: completed,
                completedAt: completed ? firebase.firestore.FieldValue.serverTimestamp() : null
            });
            
            this.showNotification(`Task ${completed ? 'completed' : 'reopened'}!`, 'success');
            
            // Update UI
            this.updateStats();
            this.loadUpcomingTasks();
            
        } catch (error) {
            console.error('Error toggling task:', error);
            this.showNotification('Error updating task', 'danger');
        }
    }

    showNotification(message, type = 'info') {
        const toastElement = document.getElementById('notification-toast');
        const toastBody = toastElement.querySelector('.toast-body');
        
        if (!toastElement || !toastBody) return;
        
        // Set message
        toastBody.textContent = message;
        
        // Set icon based on type
        const toastHeader = toastElement.querySelector('.toast-header');
        const icon = toastHeader.querySelector('i');
        
        switch (type) {
            case 'success':
                icon.className = 'fas fa-check-circle text-success me-2';
                break;
            case 'danger':
                icon.className = 'fas fa-exclamation-circle text-danger me-2';
                break;
            case 'warning':
                icon.className = 'fas fa-exclamation-triangle text-warning me-2';
                break;
            default:
                icon.className = 'fas fa-info-circle text-primary me-2';
        }
        
        // Show toast
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    }

    async refreshDashboard() {
        this.showLoading();
        await this.initializeDashboard();
        this.showNotification('Dashboard refreshed!', 'success');
        this.hideLoading();
    }

    showLogoutConfirmation() {
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('logoutConfirmModal'));
        modal.show();
    }

    async logout() {
        try {
            await auth.signOut();
            localStorage.removeItem('currentSection');
            window.location.href = 'auth.html';
        } catch (error) {
            console.error('Error logging out:', error);
            this.showNotification('Error logging out', 'danger');
        }
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('ServiceWorker registration successful');
                        
                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    this.showUpdateNotification();
                                }
                            });
                        });
                    })
                    .catch(error => {
                        console.log('ServiceWorker registration failed:', error);
                    });
                
                // Handle controller change (when new SW takes over via skipWaiting)
                let refreshing;
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    if (refreshing) return;
                    if (navigator.serviceWorker.controller) {
                        this.showUpdateNotification();
                    }
                });
            });
        }
    }

    showUpdateNotification() {
        const toastElement = document.getElementById('update-toast');
        if (toastElement && !toastElement.classList.contains('show')) {
            const toast = new bootstrap.Toast(toastElement);
            toast.show();
            document.getElementById('reload-app-btn')?.addEventListener('click', () => window.location.reload());
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});

// Global functions for inline event handlers
window.switchSection = function(section) {
    if (window.dashboard) {
        window.dashboard.switchSection(section);
    }
};

window.handleQuickAction = function(action) {
    if (window.dashboard) {
        window.dashboard.handleQuickAction(action);
    }
};

window.toggleHabitCompletion = function(habitId) {
    if (window.dashboard) {
        return window.dashboard.toggleHabitCompletion(habitId);
    }
};

window.toggleTaskCompletion = function(taskId, completed) {
    if (window.dashboard) {
        window.dashboard.toggleTaskCompletion(taskId, completed);
    }
};
