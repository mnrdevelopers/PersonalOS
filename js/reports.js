window.loadReportsSection = async function() {
    const container = document.getElementById('reports-section');
    container.innerHTML = `
        <h2 class="mb-4">Analytics & Reports</h2>
        
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
            <div class="col-md-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-header bg-transparent">
                        <h5 class="mb-0">Goal Progress</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="goalProgressChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Lifestyle Section -->
        <h4 class="mb-3 text-info"><i class="fas fa-camera me-2"></i>Lifestyle</h4>
        <div class="row g-4">
            <div class="col-md-6">
                <div class="card h-100 shadow-sm">
                    <div class="card-header bg-transparent">
                        <h5 class="mb-0">Entertainment Spending</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="entertainmentCostChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card h-100 shadow-sm">
                    <div class="card-header bg-transparent">
                        <h5 class="mb-0">Memories Timeline</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="memoriesTimelineChart"></canvas>
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
    const [transactionsSnap, habitsSnap, tasksSnap, goalsSnap, entertainmentSnap, memoriesSnap] = await Promise.all([
        db.collection('transactions').where('userId', '==', user.uid).get(),
        db.collection('habits').where('userId', '==', user.uid).where('active', '==', true).get(),
        db.collection('reminders').where('userId', '==', user.uid).get(),
        db.collection('goals').where('userId', '==', user.uid).get(),
        db.collection('entertainment').where('userId', '==', user.uid).get(),
        db.collection('memories').where('userId', '==', user.uid).get()
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
        } else {
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

    // --- Process Goals ---
    const goalLabels = [];
    const goalData = [];
    goalsSnap.forEach(doc => {
        const g = doc.data();
        goalLabels.push(g.title);
        const progress = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
        goalData.push(progress);
    });

    // --- Process Entertainment ---
    const entCosts = { movie: 0, tour: 0, other: 0 };
    entertainmentSnap.forEach(doc => {
        const e = doc.data();
        const type = e.type === 'movie' || e.type === 'tour' ? e.type : 'other';
        entCosts[type] += (e.cost || 0);
    });

    // --- Process Memories ---
    const memoriesByMonth = {};
    memoriesSnap.forEach(doc => {
        const d = new Date(doc.data().date);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        memoriesByMonth[key] = (memoriesByMonth[key] || 0) + 1;
    });
    const sortedKeys = Object.keys(memoriesByMonth).sort((a, b) => new Date(a) - new Date(b));
    const memoryLabels = sortedKeys.map(k => {
        const [y, m] = k.split('-');
        return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    });
    const memoryData = sortedKeys.map(k => memoriesByMonth[k]);

    // --- Render Charts ---
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
        options: { responsive: true }
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
        options: { responsive: true }
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
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
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
        options: { responsive: true }
    });

    // Goals: Progress
    new Chart(document.getElementById('goalProgressChart'), {
        type: 'bar',
        indexAxis: 'y',
        data: {
            labels: goalLabels,
            datasets: [{
                label: 'Progress (%)',
                data: goalData,
                backgroundColor: 'rgba(67, 97, 238, 0.7)'
            }]
        },
        options: { responsive: true, scales: { x: { min: 0, max: 100 } } }
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
        options: { responsive: true }
    });

    // Memories: Timeline
    new Chart(document.getElementById('memoriesTimelineChart'), {
        type: 'line',
        data: {
            labels: memoryLabels,
            datasets: [{
                label: 'Memories Captured',
                data: memoryData,
                borderColor: '#f72585',
                tension: 0.3,
                fill: true,
                backgroundColor: 'rgba(247, 37, 133, 0.1)'
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });
}