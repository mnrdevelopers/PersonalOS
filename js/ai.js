/* ═══════════════════════════════════════════════════════════════
   AI CO-PILOT MODULE – PersonalOS
   Runs rule-based local checks, data bug alerts, and provides
   contextual Gemini API integrations across all sections.
   ═══════════════════════════════════════════════════════════════ */

(function () {
    let activeSectionContext = 'dashboard';

    // Initialize AI Co-pilot
    window.openAICopilotPanel = async function () {
        // Detect current section context from body class or navigation
        const bodyClasses = Array.from(document.body.classList);
        const sectionClass = bodyClasses.find(c => c.startsWith('is-'));
        activeSectionContext = sectionClass ? sectionClass.replace('is-', '') : 'dashboard';

        // Update Context Badge UI
        const badge = document.getElementById('ai-copilot-context-badge');
        if (badge) {
            const contextNames = {
                dashboard: '🌐 Dashboard Overview',
                finance: '💳 Finances & Cashflow',
                transactions: '📝 Transaction Logs',
                loans: '🤝 Loans & Assets',
                habits: '🔁 Habit Compliance',
                remceries: '🛒 Checklists & Tasks',
                vehicles: '🚗 Vehicle Maintenance',
                groceries: '🛒 Grocery Tracker',
                expiry: '⏳ Expiry Alerter',
                reports: '📊 Statistics Analysis',
                settings: '⚙️ System Configuration',
                profile: '👤 User Profile'
            };
            badge.textContent = contextNames[activeSectionContext] || activeSectionContext.toUpperCase();
        }

        // Show Offcanvas Panel
        const offcanvasEl = document.getElementById('aiCopilotOffcanvas');
        if (offcanvasEl) {
            const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
            offcanvas.show();
        }

        // Run local analysis and update Offcanvas views
        await runLocalAnalysis();
    };

    // Gather local Firestore data and evaluate heuristics
    window.runLocalAnalysis = async function () {
        const user = auth.currentUser;
        if (!user) return;
        const uid = user.uid;

        const suggestionsContent = document.getElementById('ai-copilot-suggestions-content');
        const bugsContent = document.getElementById('ai-copilot-bugs-content');
        const bugsBadge = document.getElementById('ai-bugs-count-badge');

        if (suggestionsContent) suggestionsContent.innerHTML = '<div class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div> Analyzing data...</div>';
        if (bugsContent) bugsContent.innerHTML = '<div class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div> Auditing logs...</div>';

        try {
            const emptySnap = { docs: [] };
            
            // Parallel fetches of cache documents
            const [
                txsSnap, walletsSnap, bankAccounts, ccSnap, loansSnap, habitsSnap, habitLogsSnap, vehicleLogsSnap, vehiclesSnap, grocerySnap
            ] = await Promise.all([
                Promise.resolve(window.getTransactions ? window.getTransactions(uid) : []).catch(() => []),
                db.collection('wallets').where('userId', '==', uid).get().catch(() => emptySnap),
                Promise.resolve(window.getUserBankAccounts ? window.getUserBankAccounts(true) : []).catch(() => []),
                db.collection('credit_cards').where('userId', '==', uid).get().catch(() => emptySnap),
                db.collection('loans').where('userId', '==', uid).where('status', '==', 'active').get().catch(() => emptySnap),
                db.collection('habits').where('userId', '==', uid).where('active', '==', true).get().catch(() => emptySnap),
                db.collection('habit_logs').where('userId', '==', uid).get().catch(() => emptySnap),
                db.collection('vehicle_logs').where('userId', '==', uid).get().catch(() => emptySnap),
                db.collection('vehicles').where('userId', '==', uid).get().catch(() => emptySnap),
                db.collection('grocery_items').where('userId', '==', uid).where('checked', '==', false).get().catch(() => emptySnap)
            ]);

            const tips = [];
            const bugs = [];

            // ═══════════════════════════════════════════════════════════
            // HEURISTIC A: FINANCES & WALLETS (Context: dashboard, finance, transactions)
            // ═══════════════════════════════════════════════════════════
            
            // Check negative wallet balances
            walletsSnap.forEach(doc => {
                const data = doc.data();
                const bal = data.balance || 0;
                if (bal < 0) {
                    bugs.push({
                        title: 'Negative Wallet Balance',
                        message: `Your digital wallet <strong>${data.name}</strong> is in negative balance (₹${bal.toLocaleString('en-IN')}). Did you miss logging an income or transfer?`,
                        priority: 'high',
                        section: 'finance'
                    });
                }
            });

            // Evaluate cash and expenses
            if (txsSnap && txsSnap.length > 0) {
                const today = new Date();
                const thisMonthStr = today.toISOString().substring(0, 7); // YYYY-MM
                let monthlyIncome = 0;
                let monthlyExpense = 0;

                txsSnap.forEach(doc => {
                    const data = doc.data();
                    if (data.date && data.date.startsWith(thisMonthStr) && data.type !== 'transfer') {
                        const amt = Number(data.amount) || 0;
                        if (data.type === 'income') monthlyIncome += amt;
                        else if (data.type === 'expense') monthlyExpense += amt;
                    }
                });

                if (monthlyExpense > monthlyIncome && monthlyIncome > 0) {
                    tips.push({
                        title: 'Outflow Exceeds Inflow',
                        message: `You spent <strong>₹${monthlyExpense.toLocaleString('en-IN')}</strong> this month, exceeding your income of <strong>₹${monthlyIncome.toLocaleString('en-IN')}</strong>. Consider holding back on optional expenses.`,
                        type: 'finance'
                    });
                }
            }

            // High utilization CC checks
            ccSnap.forEach(doc => {
                const data = doc.data();
                const limit = Number(data.creditLimit) || 0;
                const outstanding = Number(data.currentOutstanding) || 0;
                if (limit > 0 && (outstanding / limit) > 0.7) {
                    bugs.push({
                        title: 'High Credit Utilization',
                        message: `Credit card <strong>${data.name}</strong> has utilized over 70% of its limit (₹${outstanding.toLocaleString('en-IN')} / ₹${limit.toLocaleString('en-IN')}). This may impact credit scores.`,
                        priority: 'medium',
                        section: 'finance'
                    });
                }
            });

            // ═══════════════════════════════════════════════════════════
            // HEURISTIC B: HABITS (Context: dashboard, habits)
            // ═══════════════════════════════════════════════════════════
            
            // Find streaks close to breaking
            const todayStr = new Date().toISOString().split('T')[0];
            const completedHabitIds = new Set();
            habitLogsSnap.forEach(doc => {
                const data = doc.data();
                if (data.date === todayStr && data.status === 'done') {
                    completedHabitIds.add(data.habitId);
                }
            });

            habitsSnap.forEach(doc => {
                const data = doc.data();
                const streak = data.streak || 0;
                const completedToday = completedHabitIds.has(doc.id);
                
                if (streak > 0 && !completedToday) {
                    tips.push({
                        title: 'Keep Habit Streak Alive',
                        message: `Your habit <strong>"${data.name}"</strong> is on a <strong>${streak}-day streak</strong>! Complete it today to keep it active.`,
                        type: 'habits'
                    });
                } else if (streak === 0 && !completedToday) {
                    tips.push({
                        title: 'Start a New Streak',
                        message: `Kick off <strong>"${data.name}"</strong> today to start building a new consistent streak!`,
                        type: 'habits'
                    });
                }
            });

            // ═══════════════════════════════════════════════════════════
            // HEURISTIC C: LOANS (Context: dashboard, loans)
            // ═══════════════════════════════════════════════════════════
            
            // Check overdue lent loans
            loansSnap.forEach(doc => {
                const data = doc.data();
                const remaining = (data.totalAmount || 0) - (data.paidAmount || 0);
                if (data.type === 'lent' && remaining > 0) {
                    tips.push({
                        title: 'Outstanding Lent Asset',
                        message: `You have <strong>₹${remaining.toLocaleString('en-IN')}</strong> outstanding from <strong>${data.borrower}</strong>. Make sure to check in on expected repayment.`,
                        type: 'loans'
                    });
                }
            });

            // ═══════════════════════════════════════════════════════════
            // HEURISTIC D: VEHICLES (Context: dashboard, vehicles)
            // ═══════════════════════════════════════════════════════════
            
            // Odometer audit checks
            const latestOdometerMap = {};
            vehicleLogsSnap.forEach(doc => {
                const data = doc.data();
                const vid = data.vehicleId;
                const odo = Number(data.odometer) || 0;
                if (vid && odo > (latestOdometerMap[vid] || 0)) {
                    latestOdometerMap[vid] = odo;
                }
            });

            vehiclesSnap.forEach(doc => {
                const data = doc.data();
                const logOdo = latestOdometerMap[doc.id] || 0;
                const currentOdo = Number(data.odometer) || 0;
                
                if (logOdo > currentOdo) {
                    bugs.push({
                        title: 'Odometer Sync Discrepancy',
                        message: `Vehicle <strong>${data.name}</strong> lists odometer as <strong>${currentOdo} km</strong>, but a recent log recorded <strong>${logOdo} km</strong>. Please synchronize your odometer reading.`,
                        priority: 'high',
                        section: 'vehicles'
                    });
                }
            });

            // ═══════════════════════════════════════════════════════════
            // HEURISTIC E: GROCERIES (Context: dashboard, groceries)
            // ═══════════════════════════════════════════════════════════
            
            if (!grocerySnap.empty) {
                tips.push({
                    title: 'Grocery List Checklist',
                    message: `You have <strong>${grocerySnap.size} items</strong> unchecked in your grocery list. Ready for a shopping trip?`,
                    type: 'groceries'
                });
            }

            // Filter suggestions and bugs by active section context
            let filteredTips = tips;
            let filteredBugs = bugs;

            if (activeSectionContext !== 'dashboard') {
                filteredTips = tips.filter(t => t.type === activeSectionContext);
                filteredBugs = bugs.filter(b => b.section === activeSectionContext);
            }

            // Render Suggestions
            if (filteredTips.length === 0) {
                suggestionsContent.innerHTML = `
                    <div class="text-center py-5 text-muted">
                        <div class="fs-2 mb-2">✨</div>
                        <p class="mb-0">All clear! No pending tips for this section.</p>
                    </div>
                `;
            } else {
                suggestionsContent.innerHTML = filteredTips.map(t => `
                    <div class="card border-0 bg-light p-3 rounded-4 mb-3">
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <span class="fs-5">💡</span>
                            <h6 class="fw-bold mb-0 text-dark">${t.title}</h6>
                        </div>
                        <p class="text-sm mb-0 text-muted" style="font-size: 0.88rem; line-height: 1.4;">${t.message}</p>
                    </div>
                `).join('');
            }

            // Render Bugs / Sanity Alerts
            if (filteredBugs.length === 0) {
                bugsContent.innerHTML = `
                    <div class="text-center py-5 text-muted">
                        <div class="fs-2 mb-2">✅</div>
                        <p class="mb-0">No data anomalies or bugs detected. Your database is fully synchronized!</p>
                    </div>
                `;
                bugsBadge.classList.add('d-none');
            } else {
                bugsContent.innerHTML = filteredBugs.map(b => `
                    <div class="card border-0 bg-danger bg-opacity-10 p-3 rounded-4 mb-3 border-start border-danger border-4">
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <span class="fs-5">🐛</span>
                            <h6 class="fw-bold mb-0 text-danger">${b.title}</h6>
                        </div>
                        <p class="text-sm mb-0 text-danger text-opacity-75" style="font-size: 0.88rem; line-height: 1.4;">${b.message}</p>
                    </div>
                `).join('');
                bugsBadge.textContent = filteredBugs.length;
                bugsBadge.classList.remove('d-none');
            }

        } catch (e) {
            console.error("Error executing local AI heuristics:", e);
            suggestionsContent.innerHTML = '<div class="text-danger small">Error running analysis.</div>';
            bugsContent.innerHTML = '<div class="text-danger small">Error running checks.</div>';
        }
    };

    // Ask AI assistant chat section pre-filled with context prompt
    window.askCopilotAboutThisSection = function () {
        // Close Offcanvas
        const offcanvasEl = document.getElementById('aiCopilotOffcanvas');
        if (offcanvasEl) {
            const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
            if (offcanvas) offcanvas.hide();
        }

        // Prompts based on section context
        const sectionPrompts = {
            dashboard: 'Evaluate my overall financial situation, net worth, and habit compliance, and suggest a dashboard summary improvement.',
            finance: 'Audit my income vs expenses this month. Did you find any spending leaks, anomalies, or category-wise budget improvements?',
            transactions: 'Analyze my recent ledger transactions to see if my spending categories match a healthy financial portfolio.',
            loans: 'Examine my active loans, assets, and earmarked locked holdings. Help me build a timeline to clear outstanding items.',
            habits: 'Inspect my active habit streaks and logs. Suggest a daily/weekly schedule to maximize my completion streaks.',
            vehicles: 'Review my fuel logs and odometer history. Highlight any service anomalies or warn me of upcoming maintenance targets.',
            groceries: 'Review my grocery list. Can you suggest any healthy meal recipe items to add to this list?',
            expiry: 'Look at my document expiry logs and warn me of critical renewals.'
        };

        const targetPrompt = sectionPrompts[activeSectionContext] || 'Analyze my current data and suggest improvements.';

        // Switch tab to AI Assistant
        if (window.dashboard) {
            window.dashboard.switchSection('ai-assistant');
        }

        // Fill prompt text and send
        setTimeout(() => {
            const chatInput = document.getElementById('ai-message-input');
            if (chatInput) {
                chatInput.value = targetPrompt;
                if (window.sendAIChatMessage) {
                    window.sendAIChatMessage();
                }
            }
        }, 600);
    };

    // Call Gemini API directly for advanced context report
    window.triggerGeminiCopilotReport = async function () {
        const user = auth.currentUser;
        if (!user) return;

        // Get key using the global ai-assistant key resolver
        const settingsDoc = await db.collection('users').doc(user.uid).get();
        const apiKey = settingsDoc.data()?.settings?.gemini_api_key || localStorage.getItem('temp_gemini_api_key');

        if (!apiKey) {
            if (window.dashboard) {
                window.dashboard.showNotification('Google Gemini API Key is required! Configure it in Settings or AI Chat.', 'warning');
            }
            return;
        }

        // Prepare report container inside Offcanvas body
        const suggestionsPane = document.getElementById('ai-copilot-suggestions-content');
        if (!suggestionsPane) return;

        const originalHtml = suggestionsPane.innerHTML;
        suggestionsPane.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-warning mb-3" style="width: 2.5rem; height: 2.5rem;"></div>
                <h6 class="fw-bold">Generating Advanced AI Report...</h6>
                <p class="text-xs text-muted">Analyzing context and contacting Gemini REST API...</p>
            </div>
        `;

        try {
            // Build custom system overview context matching the selected scope
            let systemContext = `You are the PersonalOS AI Copilot. You are conducting an audit of the section: "${activeSectionContext}".\n`;
            
            // Gather snapshots
            const txsSnap = await db.collection('transactions').where('userId', '==', user.uid).get();
            const habitsSnap = await db.collection('habits').where('userId', '==', user.uid).where('active', '==', true).get();
            const CCsSnap = await db.collection('credit_cards').where('userId', '==', user.uid).get();
            const loansSnap = await db.collection('loans').where('userId', '==', user.uid).get();
            const vehiclesSnap = await db.collection('vehicles').where('userId', '==', user.uid).get();

            systemContext += `\nTransactions list count: ${txsSnap.size}\nActive Habits count: ${habitsSnap.size}\nLoans count: ${loansSnap.size}\nCredit Cards limit count: ${CCsSnap.size}\n`;

            const contents = [{
                role: 'user',
                parts: [{
                    text: systemContext + `\nPrompt: Review the details of the active section context "${activeSectionContext}" and output a smart budget planning summary, warning tips, and look for any data bugs or anomalies. Keep it concise, structured in professional markdown sections.`
                }]
            }];

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents })
            });

            if (!response.ok) {
                throw new Error(`REST Error: ${response.statusText}`);
            }

            const resData = await response.json();
            const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) {
                const parsedMarkdown = window.marked && typeof window.marked.parse === 'function' 
                    ? window.marked.parse(text) 
                    : text.replace(/\n/g, '<br>');

                suggestionsPane.innerHTML = `
                    <div class="bg-white p-3 rounded-4 shadow-sm border mb-3 text-sm animate-fade-in" style="font-size: 0.88rem; line-height: 1.5; max-height: calc(100vh - 320px); overflow-y: auto;">
                        <h6 class="fw-bold mb-3 text-warning border-bottom pb-2 d-flex align-items-center gap-2">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Gemini AI Audit Report
                        </h6>
                        <div class="ai-generated-report-body">
                            ${parsedMarkdown}
                        </div>
                        <button class="btn btn-sm btn-outline-secondary w-100 mt-3 rounded-pill" onclick="restoreLocalSuggestions()">
                            <i class="fas fa-undo me-1"></i>Back to Quick Tips
                        </button>
                    </div>
                `;

                // Bind restore function locally
                window.restoreLocalSuggestions = function() {
                    suggestionsPane.innerHTML = originalHtml;
                };

            } else {
                throw new Error("Empty candidate response");
            }

        } catch (e) {
            console.error("Gemini Copilot Report failed:", e);
            if (window.dashboard) window.dashboard.showNotification('Gemini Report generation failed.', 'danger');
            suggestionsPane.innerHTML = originalHtml;
        }
    };

    // Auto-hook into page transitions to audit data and display red warning dot if bugs exist
    document.addEventListener('DOMContentLoaded', () => {
        // Run audit on startup
        setTimeout(auditDatabaseForBadge, 3000);
        // Run every 30 seconds
        setInterval(auditDatabaseForBadge, 30000);

        // Observer body class shifts (section changes)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && mutation.target === document.body) {
                    auditDatabaseForBadge();
                }
            });
        });
        observer.observe(document.body, { attributes: true });
    });

    async function auditDatabaseForBadge() {
        const user = auth.currentUser;
        if (!user) return;
        
        try {
            const uid = user.uid;
            
            // Gather essential data snapshots
            const [walletsSnap, ccSnap, vehiclesSnap, vehicleLogsSnap] = await Promise.all([
                db.collection('wallets').where('userId', '==', uid).get().catch(() => ({ docs: [] })),
                db.collection('credit_cards').where('userId', '==', uid).get().catch(() => ({ docs: [] })),
                db.collection('vehicles').where('userId', '==', uid).get().catch(() => ({ docs: [] })),
                db.collection('vehicle_logs').where('userId', '==', uid).get().catch(() => ({ docs: [] }))
            ]);

            let totalBugs = 0;

            // 1. Check negative wallet balances
            walletsSnap.docs.forEach(doc => {
                if ((doc.data().balance || 0) < 0) totalBugs++;
            });

            // 2. Check high credit utilization (>70%)
            ccSnap.docs.forEach(doc => {
                const data = doc.data();
                const limit = Number(data.creditLimit) || 0;
                const outstanding = Number(data.currentOutstanding) || 0;
                if (limit > 0 && (outstanding / limit) > 0.7) totalBugs++;
            });

            // 3. Check odometer mismatches
            const latestOdometerMap = {};
            vehicleLogsSnap.docs.forEach(doc => {
                const data = doc.data();
                const vid = data.vehicleId;
                const odo = Number(data.odometer) || 0;
                if (vid && odo > (latestOdometerMap[vid] || 0)) {
                    latestOdometerMap[vid] = odo;
                }
            });
            vehiclesSnap.docs.forEach(doc => {
                const data = doc.data();
                if ((latestOdometerMap[doc.id] || 0) > (Number(data.odometer) || 0)) totalBugs++;
            });

            // Show or hide red dot badge on floating trigger
            const trigger = document.getElementById('global-ai-copilot-trigger');
            if (trigger) {
                let badge = trigger.querySelector('.ai-badge-dot');
                if (totalBugs > 0) {
                    if (!badge) {
                        badge = document.createElement('span');
                        badge.className = 'ai-badge-dot';
                        badge.style.cssText = 'position: absolute; top: 2px; right: 2px; width: 12px; height: 12px; border-radius: 50%; background-color: #ef4444; border: 2px solid #ffffff; box-shadow: 0 0 4px rgba(239, 68, 68, 0.4);';
                        trigger.appendChild(badge);
                    }
                } else if (badge) {
                    badge.remove();
                }
            }

        } catch (e) {
            console.error("Error in background AI badge audit:", e);
        }
    }
})();
