window.loadReportsSection = async function() {
    const container = document.getElementById('reports-section');
    container.innerHTML = `
        <h2 class="mb-4">Analytics & Reports</h2>
        
        <!-- Quick Guide -->
        <details class="section-guide-card mb-4 animate-fade-in">
            <summary class="section-guide-header">
                <span class="section-guide-title"><i class="fas fa-compass"></i> Reports Guide</span>
            </summary>
            <div class="section-guide-content">
                <ul class="section-guide-steps">
                    <li><strong>Financial Trends</strong>: View interactive charts showcasing month-on-month credit vs debit comparisons, as well as a doughnut breakdown of expense categories.</li>
                    <li><strong>Productivity Insights</strong>: Track streaks for your top positive habits and inspect the current priority breakdown of pending tasks.</li>
                    <li><strong>Interactivity</strong>: Hover over any chart segment to see the exact numerical values and labels.</li>
                </ul>
            </div>
        </details>
        
        <!-- Finance Section -->
        <h4 class="mb-3 text-primary"><i class="fas fa-wallet me-2"></i>Finance</h4>
        <div class="row g-4 mb-5">
            <div class="col-md-6">
                <div class="card h-100 shadow-sm">
                    <div class="card-header bg-transparent">
                        <h5 class="mb-0">Income vs Expense (This Year)</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="incomeExpenseChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card h-100 shadow-sm">
                    <div class="card-header bg-transparent">
                        <h5 class="mb-0">Expense Breakdown</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="expenseBreakdownChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Productivity Section -->
        <h4 class="mb-3 text-success"><i class="fas fa-check-circle me-2"></i>Productivity</h4>
        <div class="row g-4 mb-5">
            <div class="col-md-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-header bg-transparent">
                        <h5 class="mb-0">Top Habit Streaks</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="habitStreaksChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-header bg-transparent">
                        <h5 class="mb-0">Task Priorities</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="taskPriorityChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        </div>
    `;

    await loadReportCharts();
};

async function loadReportCharts() {
    const user = auth.currentUser;
    if (!user) return;

    // Fetch Data from all collections
    const [transactionsSnap, habitsSnap, tasksSnap, entertainmentSnap] = await Promise.all([
        window.getTransactions(user.uid),
        db.collection('habits').where('userId', '==', user.uid).where('active', '==', true).get(),
        db.collection('reminders').where('userId', '==', user.uid).get(),
        db.collection('entertainment').where('userId', '==', user.uid).get()
    ]);

    // --- Process Finance ---
    const incomeByMonth = new Array(12).fill(0);
    const expenseByMonth = new Array(12).fill(0);
    const expenseByCategory = {};

    transactionsSnap.forEach(doc => {
        const data = doc.data();
        const date = new Date(data.date);
        const month = date.getMonth();
        
        if (data.type === 'income') {
            incomeByMonth[month] += data.amount;
        } else if (data.type === 'expense') {
            expenseByMonth[month] += data.amount;
            
            if (!expenseByCategory[data.category]) expenseByCategory[data.category] = 0;
            expenseByCategory[data.category] += data.amount;
        }
    });

    // --- Process Habits ---
    const habits = [];
    habitsSnap.forEach(doc => habits.push(doc.data()));
    habits.sort((a, b) => b.streak - a.streak);
    const topHabits = habits.slice(0, 5);

    // --- Process Tasks ---
    let low = 0, medium = 0, high = 0;
    tasksSnap.forEach(doc => {
        const p = doc.data().priority;
        if (p === 'low') low++;
        else if (p === 'high') high++;
        else medium++;
    });

    // --- Process Entertainment ---
    const entCosts = { movie: 0, tour: 0, other: 0 };
    entertainmentSnap.forEach(doc => {
        const e = doc.data();
        const type = e.type === 'movie' || e.type === 'tour' ? e.type : 'other';
        entCosts[type] += (e.cost || 0);
    });

    // --- Render Charts ---
    const isMobile = window.innerWidth < 768;
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    boxWidth: isMobile ? 12 : 40,
                    font: { size: isMobile ? 10 : 12 }
                }
            }
        }
    };

    // Finance: Income vs Expense
    const ctx1 = document.getElementById('incomeExpenseChart').getContext('2d');
    new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                { label: 'Income', data: incomeByMonth, backgroundColor: 'rgba(76, 201, 240, 0.7)' },
                { label: 'Expense', data: expenseByMonth, backgroundColor: 'rgba(247, 37, 133, 0.7)' }
            ]
        },
        options: { 
            ...commonOptions,
            scales: {
                x: {
                    ticks: {
                        font: { size: isMobile ? 9 : 12 }
                    }
                },
                y: {
                    ticks: {
                        font: { size: isMobile ? 9 : 12 },
                        callback: function(value) {
                            if (isMobile && value >= 1000) return (value/1000).toFixed(0) + 'k';
                            return value;
                        }
                    }
                }
            }
        }
    });

    // Finance: Expense Breakdown
    const ctx2 = document.getElementById('expenseBreakdownChart').getContext('2d');
    new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: Object.keys(expenseByCategory),
            datasets: [{
                data: Object.values(expenseByCategory),
                backgroundColor: [
                    '#4361ee', '#3a0ca3', '#4cc9f0', '#f72585', '#7209b7', '#ff9e00'
                ]
            }]
        },
        options: commonOptions
    });

    // Habits: Streaks
    new Chart(document.getElementById('habitStreaksChart'), {
        type: 'bar',
        data: {
            labels: topHabits.map(h => h.name),
            datasets: [{
                label: 'Current Streak (Days)',
                data: topHabits.map(h => h.streak),
                backgroundColor: 'rgba(76, 201, 240, 0.7)',
                borderColor: 'rgba(76, 201, 240, 1)',
                borderWidth: 1
            }]
        },
        options: { 
            ...commonOptions,
            scales: { 
                y: { beginAtZero: true },
                x: {
                    ticks: {
                        font: { size: isMobile ? 9 : 12 }
                    }
                }
            } 
        }
    });

    // Tasks: Priority
    new Chart(document.getElementById('taskPriorityChart'), {
        type: 'doughnut',
        data: {
            labels: ['Low', 'Medium', 'High'],
            datasets: [{
                data: [low, medium, high],
                backgroundColor: ['#4cc9f0', '#ff9e00', '#ef476f']
            }]
        },
        options: commonOptions
    });

    // Entertainment: Cost
    new Chart(document.getElementById('entertainmentCostChart'), {
        type: 'pie',
        data: {
            labels: ['Movies', 'Tours', 'Other'],
            datasets: [{
                data: [entCosts.movie, entCosts.tour, entCosts.other],
                backgroundColor: ['#7209b7', '#3a0ca3', '#b5179e']
            }]
        },
        options: commonOptions
    });
}
