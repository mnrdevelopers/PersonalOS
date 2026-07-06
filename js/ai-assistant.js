/* ═══════════════════════════════════════════════════════════════
   AI ASSISTANT MODULE  –  PersonalOS
   Integrates a free developer Gemini API client-side chatbot.
   Automatically feeds system summary context of active ledger accounts,
   credit cards, recent transactions, habits, tasks, and groceries.
   ═══════════════════════════════════════════════════════════════ */

// Local chat history session
let _aiChatHistory = [];
let _aiContext = "";
let _isSpeechListening = false;
let _speechRecognition = null;
window.activeAIModel = '';

// Dynamically inject styles once
function injectAIAssistantStyles() {
    if (document.getElementById('ai-assistant-styles')) return;
    const style = document.createElement('style');
    style.id = 'ai-assistant-styles';
    style.textContent = `
        .ai-shell {
            display: flex;
            height: calc(100vh - 180px);
            min-height: 520px;
            animation: fadeIn 0.4s ease;
            width: 100%;
        }
        .ai-context-selector {
            background: rgba(255, 255, 255, 0.6);
            border-bottom: 1px solid rgba(0, 0, 0, 0.06);
            flex-shrink: 0;
        }
        [data-bs-theme="dark"] .ai-context-selector {
            background: rgba(30, 41, 59, 0.4);
            border-color: rgba(255, 255, 255, 0.06) !important;
        }
        .btn-context-pill {
            font-size: 0.75rem !important;
            padding: 0.25rem 0.65rem !important;
            border: 1px solid rgba(0, 0, 0, 0.06);
            background: var(--bs-body-bg);
            color: var(--bs-body-color);
            border-radius: 50px;
            transition: all 0.2s ease;
        }
        .btn-context-pill.active {
            background: #6366f1 !important;
            color: #ffffff !important;
            border-color: #6366f1 !important;
        }
        [data-bs-theme="dark"] .btn-context-pill {
            border-color: rgba(255, 255, 255, 0.08);
        }
        .ai-prompts-toggle-bar {
            background: rgba(0, 0, 0, 0.015);
            border-top: 1px solid rgba(0, 0, 0, 0.06);
            transition: background 0.2s ease;
        }
        .ai-prompts-toggle-bar:hover {
            background: rgba(0, 0, 0, 0.035) !important;
        }
        [data-bs-theme="dark"] .ai-prompts-toggle-bar {
            background: rgba(255, 255, 255, 0.015);
            border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        [data-bs-theme="dark"] .ai-prompts-toggle-bar:hover {
            background: rgba(255, 255, 255, 0.035) !important;
        }
        .ai-prompts-bar {
            background: rgba(255, 255, 255, 0.45);
            border-top: 1px solid rgba(0, 0, 0, 0.06);
            padding: 0.75rem 1.25rem !important;
        }
        .ai-prompts-bar.collapsed {
            display: none !important;
        }
        [data-bs-theme="dark"] .ai-prompts-bar {
            background: rgba(15, 23, 42, 0.3);
            border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .ai-chat-card {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: rgba(255, 255, 255, 0.75);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 0, 0, 0.08);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.04);
        }
        [data-bs-theme="dark"] .ai-chat-card {
            background: rgba(30, 41, 59, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .ai-chat-header {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(0, 0, 0, 0.08);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        [data-bs-theme="dark"] .ai-chat-header {
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .ai-status-indicator {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.85rem;
        }
        .ai-status-pulse {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
            animation: ai-pulse 1.5s infinite;
        }
        .ai-status-pulse.offline {
            background: #ef4444;
            animation: none;
        }
        .ai-chat-messages {
            flex: 1;
            padding: 1.5rem;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
        }
        .ai-msg {
            display: flex;
            gap: 0.75rem;
            max-width: 85%;
            align-self: flex-start;
            animation: messageSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
        }
        .ai-msg.user {
            align-self: flex-end;
            flex-direction: row-reverse;
        }
        .ai-msg-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.95rem;
            flex-shrink: 0;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
            background: linear-gradient(135deg, #6366f1, #a855f7);
            color: #ffffff;
        }
        .ai-msg.user .ai-msg-avatar {
            background: #64748b;
            color: #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .ai-header-badge {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: linear-gradient(135deg, #6366f1, #a855f7);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.88rem;
            box-shadow: 0 3px 8px rgba(99, 102, 241, 0.2);
        }
        .ai-msg-bubble {
            padding: 0.75rem 1.15rem;
            border-radius: 16px;
            font-size: 0.95rem;
            line-height: 1.5;
            position: relative;
            box-shadow: 0 2px 8px rgba(0,0,0,0.02);
            word-break: break-word;
        }
        .ai-msg.user .ai-msg-bubble {
            background: linear-gradient(135deg, #4f46e5, #6366f1);
            color: #ffffff;
            border-top-right-radius: 4px;
        }
        .ai-msg.assistant .ai-msg-bubble {
            background: #ffffff;
            color: #1f2937;
            border-top-left-radius: 4px;
            border: 1px solid rgba(0, 0, 0, 0.05);
        }
        [data-bs-theme="dark"] .ai-msg.assistant .ai-msg-bubble {
            background: #1e293b;
            color: #f1f5f9;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .ai-msg-bubble h1, .ai-msg-bubble h2, .ai-msg-bubble h3, .ai-msg-bubble h4 {
            margin-top: 1rem;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: inherit;
        }
        .ai-msg-bubble h1 { font-size: 1.35rem; }
        .ai-msg-bubble h2 { font-size: 1.2rem; }
        .ai-msg-bubble h3 { font-size: 1.05rem; }
        .ai-msg-bubble h4 { font-size: 0.95rem; }
        .ai-msg-bubble p {
            margin-bottom: 0.75rem;
            line-height: 1.6;
        }
        .ai-msg-bubble p:last-child {
            margin-bottom: 0;
        }
        .ai-msg-bubble ul, .ai-msg-bubble ol {
            margin-bottom: 0.75rem;
            padding-left: 1.5rem;
        }
        .ai-msg-bubble li {
            margin-bottom: 0.25rem;
            line-height: 1.5;
        }
        .ai-msg-bubble code {
            font-family: var(--bs-font-monospace);
            font-size: 0.85em;
            background: rgba(0, 0, 0, 0.05);
            padding: 0.15rem 0.35rem;
            border-radius: 4px;
            color: #d63384;
        }
        [data-bs-theme="dark"] .ai-msg-bubble code {
            background: rgba(255, 255, 255, 0.1);
            color: #f472b6;
        }
        .ai-msg-bubble pre {
            background: #1e1e2e;
            color: #cdd6f4;
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
            margin-top: 0.75rem;
            margin-bottom: 0.75rem;
            border: 1px solid rgba(255,255,255,0.05);
        }
        .ai-msg-bubble pre code {
            background: transparent !important;
            padding: 0 !important;
            border-radius: 0 !important;
            color: inherit !important;
            font-size: 0.88rem;
        }
        .table-responsive {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            margin-top: 1rem;
            margin-bottom: 1rem;
            border-radius: 8px;
            border: 1px solid rgba(0, 0, 0, 0.05);
        }
        [data-bs-theme="dark"] .table-responsive {
            border-color: rgba(255, 255, 255, 0.06);
        }
        .ai-msg-bubble table {
            width: 100%;
            border-collapse: collapse;
            margin: 0;
            font-size: 0.88rem;
            background: rgba(255, 255, 255, 0.4);
        }
        [data-bs-theme="dark"] .ai-msg-bubble table {
            background: rgba(15, 23, 42, 0.2);
        }
        .ai-msg-bubble th {
            padding: 0.75rem 1rem;
            font-weight: 600;
            font-size: 0.82rem;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            color: #475569;
            background: rgba(0, 0, 0, 0.03);
            border-bottom: 2px solid rgba(0, 0, 0, 0.08);
            text-align: left;
        }
        [data-bs-theme="dark"] .ai-msg-bubble th {
            color: #94a3b8;
            background: rgba(255, 255, 255, 0.03);
            border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }
        .ai-msg-bubble td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            font-size: 0.88rem;
            color: inherit;
            text-align: left;
        }
        [data-bs-theme="dark"] .ai-msg-bubble td {
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .ai-msg-bubble tr:hover {
            background-color: rgba(0, 0, 0, 0.015);
        }
        [data-bs-theme="dark"] .ai-msg-bubble tr:hover {
            background-color: rgba(255, 255, 255, 0.015);
        }
        .ai-msg-bubble blockquote {
            border-left: 4px solid #4f46e5;
            padding-left: 1rem;
            color: #6b7280;
            margin-left: 0;
            margin-right: 0;
            font-style: italic;
        }
        [data-bs-theme="dark"] .ai-msg-bubble blockquote {
            color: #9ca3af;
        }
        .ai-chat-input-area {
            padding: 1.25rem 1.5rem;
            border-top: 1px solid rgba(0, 0, 0, 0.08);
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        [data-bs-theme="dark"] .ai-chat-input-area {
            border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .ai-input-wrap {
            display: flex;
            gap: 0.75rem;
            align-items: center;
        }
        .ai-input-box {
            flex: 1;
            border-radius: 24px;
            resize: none;
            padding: 0.75rem 1.25rem;
            border: 1px solid rgba(0, 0, 0, 0.15);
            max-height: 120px;
            line-height: 1.4;
            transition: all 0.2s ease;
        }
        [data-bs-theme="dark"] .ai-input-box {
            background: #334155;
            border-color: rgba(255, 255, 255, 0.15);
            color: #ffffff;
        }
        .ai-input-box:focus {
            outline: none;
            border-color: #4f46e5;
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
        }
        .ai-action-btn {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .ai-send-btn {
            background: #4f46e5;
            color: #ffffff;
        }
        .ai-send-btn:hover {
            background: #4338ca;
            transform: scale(1.05);
        }
        .ai-mic-btn {
            background: #f1f5f9;
            color: #4f46e5;
        }
        [data-bs-theme="dark"] .ai-mic-btn {
            background: #334155;
            color: #818cf8;
        }
        .ai-mic-btn.listening {
            background: #ef4444;
            color: #ffffff;
            animation: ai-pulse-red 1.2s infinite;
        }
        .ai-mic-btn:hover {
            transform: scale(1.05);
        }
        .ai-prompt-card {
            background: #ffffff;
            border: 1px solid rgba(0, 0, 0, 0.08);
            border-radius: 12px;
            padding: 1rem;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: left;
            box-shadow: 0 2px 4px rgba(0,0,0,0.01);
            width: 100%;
        }
        [data-bs-theme="dark"] .ai-prompt-card {
            background: #1e293b;
            border-color: rgba(255, 255, 255, 0.08);
        }
        .ai-prompt-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            border-color: #4f46e5;
        }
        @keyframes ai-pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        @keyframes ai-pulse-red {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
            70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes messageSlideIn {
            from {
                opacity: 0;
                transform: translateY(12px) scale(0.98);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        .ai-typing-loader {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 6px 12px;
        }
        .ai-typing-dot {
            width: 6px;
            height: 6px;
            background: #6366f1;
            border-radius: 50%;
            animation: ai-typing 0.6s infinite alternate;
        }
        .ai-typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .ai-typing-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes ai-typing {
            from { transform: translateY(0); opacity: 0.3; }
            to { transform: translateY(-6px); opacity: 1; }
        }
        @media (max-width: 768px) {
            body.is-ai-assistant {
                position: fixed !important;
                width: 100% !important;
                height: 100% !important;
                overflow: hidden !important;
                padding-bottom: 0 !important;
            }
            body.is-ai-assistant .fab-container {
                display: none !important;
            }
            body.is-ai-assistant .main-content {
                position: fixed !important;
                top: calc(76px + env(safe-area-inset-top)) !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                height: auto !important;
                overflow: hidden !important;
            }
            body.is-ai-assistant #ai-assistant-section {
                height: 100% !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            body.is-ai-assistant #ai-assistant-section > div.d-flex.justify-content-between {
                display: none !important;
            }
            .ai-shell {
                height: 100% !important;
                min-height: unset !important;
            }
            .ai-chat-card {
                height: 100% !important;
                border-radius: 0 !important;
                border: none !important;
            }
            /* Make prompts bar a horizontal scroll list */
            .ai-prompts-bar {
                overflow-x: auto !important;
                white-space: nowrap !important;
                display: flex !important;
                gap: 0.5rem !important;
                padding: 0.5rem 1rem !important;
                background: rgba(255, 255, 255, 0.95);
            }
            [data-bs-theme="dark"] .ai-prompts-bar {
                background: rgba(30, 41, 59, 0.95);
            }
            .ai-prompts-bar .row {
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: nowrap !important;
                margin: 0 !important;
                width: auto !important;
                gap: 0.5rem;
            }
            .ai-prompts-bar .col-6 {
                flex: 0 0 auto !important;
                width: 170px !important;
                padding: 0 !important;
            }
            .ai-prompt-card {
                padding: 0.5rem 0.75rem !important;
                font-size: 0.8rem;
                white-space: normal;
                line-height: 1.3;
            }
            .ai-prompt-card .text-muted {
                display: none !important;
            }
            .ai-chat-messages {
                padding: 1rem 1rem 0.5rem 1rem !important;
            }
            .ai-chat-input-area {
                padding: 0.5rem 1rem 0.75rem 1rem !important;
                position: sticky;
                bottom: 0;
            }
            .ai-msg {
                max-width: 90%;
            }
            /* Stack tables into cards on mobile */
            .ai-msg-bubble table, 
            .ai-msg-bubble thead, 
            .ai-msg-bubble tbody, 
            .ai-msg-bubble th, 
            .ai-msg-bubble td, 
            .ai-msg-bubble tr {
                display: block !important;
            }
            .ai-msg-bubble thead {
                display: none !important;
            }
            .ai-msg-bubble tr {
                margin-bottom: 0.75rem;
                padding: 0.5rem;
                border-radius: 8px;
                border: 1px solid rgba(0, 0, 0, 0.05);
                background: rgba(255, 255, 255, 0.3) !important;
            }
            [data-bs-theme="dark"] .ai-msg-bubble tr {
                border: 1px solid rgba(255, 255, 255, 0.05);
                background: rgba(15, 23, 42, 0.2) !important;
            }
            .ai-msg-bubble td {
                text-align: right !important;
                padding: 0.4rem 0.5rem !important;
                position: relative;
                border-bottom: 1px solid rgba(0, 0, 0, 0.04) !important;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            [data-bs-theme="dark"] .ai-msg-bubble td {
                border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
            }
            .ai-msg-bubble td:last-child {
                border-bottom: none !important;
            }
            .ai-msg-bubble td::before {
                content: attr(data-label);
                font-weight: 600;
                font-size: 0.78rem;
                text-transform: uppercase;
                color: #64748b;
                float: left;
                margin-right: 1rem;
            }
            [data-bs-theme="dark"] .ai-msg-bubble td::before {
                color: #94a3b8;
            }
            .table-responsive {
                border: none !important;
                margin: 0.5rem 0 !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// Format markdown subset for code & bold text in messages
// Format markdown using marked.js, rendering tables, lists, and checklists beautifully
function formatMarkdown(text) {
    if (!text) return "";
    try {
        if (window.marked && typeof window.marked.parse === 'function') {
            window.marked.setOptions({
                gfm: true,
                breaks: true,
                mangle: false,
                headerIds: false
            });
            let html = window.marked.parse(text);
            
            // Wrap tables in responsive wrapper
            html = html.replace(/<table>/g, '<div class="table-responsive"><table>')
                       .replace(/<\/table>/g, '</table></div>');

            // Parse tables and inject data-label properties to tds for mobile card translation
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const tables = doc.querySelectorAll('table');
                tables.forEach(table => {
                    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
                    const trs = table.querySelectorAll('tr');
                    trs.forEach(tr => {
                        const tds = tr.querySelectorAll('td');
                        tds.forEach((td, index) => {
                            if (headers[index]) {
                                td.setAttribute('data-label', headers[index]);
                            }
                        });
                    });
                });
                html = doc.body.innerHTML;
            } catch (err) {
                console.error('Failed to inject responsive data labels:', err);
            }

            // Replace markdown task checklists with FontAwesome icons
            html = html.replace(/\[ \]/g, '<i class="far fa-square me-2 text-muted"></i>')
                       .replace(/\[x\]/gi, '<i class="far fa-check-square me-2 text-success"></i>');
            return html;
        }
    } catch (e) {
        console.error('Error parsing markdown with marked:', e);
    }
    
    // Fallback simple parsing
    return text.replace(/\n/g, '<br>')
               .replace(/\[ \]/g, '<i class="far fa-square me-2 text-muted"></i>')
               .replace(/\[x\]/gi, '<i class="far fa-check-square me-2 text-success"></i>');
}

// Compile real-time OS database summary context for Gemini
async function getAppOverviewContext() {
    const user = auth.currentUser;
    if (!user) return "";
    
    let context = `You are the PersonalOS AI Companion, a friendly, intelligent assistant integrated into the user's dashboard.
Here is the user's current live data summary from their PersonalOS database:
`;

    try {
        const scope = window.activeAIContextScope || 'all';
        const promises = [];
        
        // Push conditional queries based on chosen scope
        if (scope === 'all' || scope === 'finance') {
            promises.push(db.collection('bank_accounts').where('userId', '==', user.uid).get());
            promises.push(db.collection('credit_cards').where('userId', '==', user.uid).get());
            promises.push(db.collection('wallets').where('userId', '==', user.uid).get());
            promises.push(db.collection('transactions').where('userId', '==', user.uid).orderBy('date', 'desc').limit(10).get());
        } else {
            promises.push(Promise.resolve(null), Promise.resolve(null), Promise.resolve(null), Promise.resolve(null));
        }

        if (scope === 'all' || scope === 'tasks') {
            promises.push(db.collection('reminders').where('userId', '==', user.uid).where('completed', '==', false).limit(10).get());
        } else {
            promises.push(Promise.resolve(null));
        }

        if (scope === 'all' || scope === 'groceries') {
            promises.push(db.collection('grocery_items').where('userId', '==', user.uid).where('status', '==', 'to_buy').get());
        } else {
            promises.push(Promise.resolve(null));
        }

        // Fetch snapshots in parallel to minimize latency
        const [accountsSnap, ccSnap, walletSnap, txSnap, tasksSnap, grocerySnap] = await Promise.all(promises);

        if (accountsSnap && !accountsSnap.empty) {
            context += `- Bank Accounts:\n`;
            accountsSnap.forEach(doc => {
                const d = doc.data();
                context += `  * ID: "${doc.id}", Name: "${d.name}", Balance: ₹${d.balance || 0}\n`;
            });
        }
        
        if (ccSnap && !ccSnap.empty) {
            context += `- Credit Cards:\n`;
            ccSnap.forEach(doc => {
                const d = doc.data();
                context += `  * ID: "${doc.id}", Name: "${d.name}", Limit: ₹${d.creditLimit}, Outstanding: ₹${d.currentOutstanding || 0}\n`;
            });
        }

        if (walletSnap && !walletSnap.empty) {
            context += `- Digital Wallets:\n`;
            walletSnap.forEach(doc => {
                const d = doc.data();
                context += `  * ID: "${doc.id}", Name: "${d.name}", Balance: ₹${d.balance || 0}\n`;
            });
        }

        if (txSnap && !txSnap.empty) {
            context += `- Last 10 Ledger Transactions:\n`;
            txSnap.forEach(doc => {
                const d = doc.data();
                context += `  * [${d.date}] ${d.type.toUpperCase()}: ₹${d.amount} for ${d.category} - "${d.description || ''}" (Mode: ${d.paymentMode})\n`;
            });
        }

        if (tasksSnap && !tasksSnap.empty) {
            context += `- Uncompleted Tasks / Reminders:\n`;
            tasksSnap.forEach(doc => {
                const d = doc.data();
                context += `  * "${d.title}" (Due: ${d.dueDate || 'No Date'}, Priority: ${d.priority || 'medium'})\n`;
            });
        }

        if (grocerySnap && !grocerySnap.empty) {
            context += `- Items to buy in Grocery List: ${grocerySnap.docs.map(d => d.data().name).join(', ')}\n`;
        }

    } catch (e) {
        console.error('Error compiling AI context:', e);
    }
    
    context += `
Instructions:
1. Provide extremely professional, clear, and actionable advice to the user.
2. Structure your replies using clean markdown tables, neat sections, and professional language suitable for a personal CFO.
3. If the user asks you to write, add, record, create, complete, or save any database items (e.g. transaction, income, expense, task, grocery list item), you MUST output a JSON block matching one of the following schemas. Wrap the JSON block in a markdown code block with language "json". Make sure the JSON is valid and complete.

Action Schemas:

A. Adding a Transaction (Income or Expense):
{
  "action": "add_transaction",
  "data": {
    "type": "income" | "expense",
    "amount": number,
    "category": string (e.g. "Salary", "Food", "Entertainment", "Credit Card Bill", "Rent", "Others"),
    "date": "YYYY-MM-DD",
    "paymentMode": "upi" | "cash" | "bank" | "credit-card" | "wallet",
    "description": string,
    "bankAccountId": "matching_bank_id_from_above" | null,
    "creditCardId": "matching_card_id_from_above" | null,
    "walletId": "matching_wallet_id_from_above" | null
  }
}

B. Adding a Task / Reminder:
{
  "action": "add_task",
  "data": {
    "title": string,
    "dueDate": "YYYY-MM-DD" | "",
    "priority": "low" | "medium" | "high",
    "category": string (e.g. "General", "Bills", "Work", "Personal")
  }
}

C. Adding a Grocery Item:
{
  "action": "add_grocery",
  "data": {
    "name": string,
    "quantity": number,
    "category": string (e.g. "Vegetables", "Dairy", "Fruits", "Snacks")
  }
}

4. Keep descriptions concise. Always use the Indian Rupee symbol (₹) for monetary values. Explain the action you are performing in the text reply.
`;
    return context;
}

// Retrieve Gemini API key from Firebase settings or localStorage
async function getGeminiApiKey() {
    const user = auth.currentUser;
    if (user) {
        const userDoc = await db.collection('users').doc(user.uid).get();
        const settings = userDoc.data()?.settings || {};
        if (settings.gemini_api_key) return settings.gemini_api_key;
    }
    return localStorage.getItem('temp_gemini_api_key') || "";
}

// Core Chat rendering and loading handler
window.loadAIAssistantSection = async function() {
    injectAIAssistantStyles();
    
    const container = document.getElementById('ai-assistant-section');
    if (!container) return;

    const apiKey = await getGeminiApiKey();
    const hasKey = !!apiKey;
    const isMobile = window.innerWidth < 768;

    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold gradient-text mb-0">AI Assistant</h2>
            <div class="ai-status-indicator">
                <div class="ai-status-pulse ${hasKey ? '' : 'offline'}"></div>
                <span class="fw-medium">${hasKey ? 'Gemini Connected' : 'Missing API Key'}</span>
            </div>
        </div>

        <div class="ai-shell">
            <!-- Full Width Chat Card -->
            <div class="ai-chat-card w-100 h-100">
                <div class="ai-chat-header bg-light">
                    <div class="d-flex align-items-center gap-2">
                        <div class="ai-header-badge">
                            <i class="fa-solid fa-wand-magic-sparkles text-white"></i>
                        </div>
                        <div>
                            <div class="fw-bold" style="font-size: 0.95rem;">PersonalOS Companion</div>
                            <div class="text-muted" id="ai-model-subtext" style="font-size: 0.75rem;">Powered by Gemini AI ${window.activeAIModel ? `(${window.activeAIModel})` : ''}</div>
                        </div>
                    </div>
                    <button class="btn btn-outline-secondary btn-sm" onclick="clearAIChatHistory()">
                        <i class="fas fa-trash-alt me-1"></i> Clear Chat
                    </button>
                </div>

                <!-- Scope / Context focus selector -->
                ${hasKey ? `
                <div class="ai-context-selector d-flex align-items-center gap-2 px-3 py-2 border-bottom">
                    <span class="text-muted small fw-semibold me-1"><i class="fas fa-filter me-1"></i> Focus:</span>
                    <div class="d-flex gap-1 overflow-x-auto pb-1 w-100" style="white-space: nowrap;">
                        <button class="btn btn-context-pill active" data-scope="all" onclick="window.setAIContextScope('all', this)">🌐 All Info</button>
                        <button class="btn btn-context-pill" data-scope="finance" onclick="window.setAIContextScope('finance', this)">💳 Finances</button>
                        <button class="btn btn-context-pill" data-scope="tasks" onclick="window.setAIContextScope('tasks', this)">📋 Tasks</button>
                        <button class="btn btn-context-pill" data-scope="groceries" onclick="window.setAIContextScope('groceries', this)">🛒 Groceries</button>
                    </div>
                </div>
                ` : ''}

                <!-- Message stream / API Setup Fallback -->
                <div class="ai-chat-messages" id="ai-chat-stream">
                    ${!hasKey ? `
                    <div class="d-flex flex-column align-items-center justify-content-center h-100 text-center py-5">
                        <div class="fs-1 mb-3">🔑</div>
                        <h4 class="fw-bold">Connect your Gemini API Key</h4>
                        <p class="text-muted mb-4 small px-3" style="max-width: 450px;">
                            PersonalOS utilizes the free, developer-tier Gemini API. Get a key in 30 seconds from Google AI Studio and connect below to begin using your assistant.
                        </p>
                        <div class="card p-3 border-0 bg-light shadow-sm w-100" style="max-width: 400px;">
                            <input type="password" class="form-control mb-2" id="ai-temp-key" placeholder="Paste your API key here...">
                            <button class="btn btn-primary w-100 fw-bold" onclick="saveTempGeminiKey()">Connect Assistant</button>
                            <div class="form-text mt-2" style="font-size: 0.75rem;">
                                Get your free key at <a href="https://aistudio.google.com/" target="_blank">Google AI Studio <i class="fas fa-external-link-alt"></i></a>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>

                <!-- Prompts bar directly above the text box (hidden by default on mobile, expandable via chevron header) -->
                ${hasKey ? `
                <div class="ai-prompts-toggle-bar d-flex justify-content-between align-items-center px-3 py-2 border-top" onclick="window.toggleAIPromptsCollapse()" style="cursor: pointer; user-select: none;">
                    <span class="text-muted small fw-semibold uppercase" style="font-size: 0.72rem; letter-spacing: 0.03em;"><i class="fa-solid fa-lightbulb text-warning me-1.5"></i> Suggested Prompts</span>
                    <i class="fas ${isMobile ? 'fa-chevron-up' : 'fa-chevron-down'} text-muted" id="ai-prompts-toggle-icon" style="font-size: 0.75rem;"></i>
                </div>
                <div class="ai-prompts-bar ${isMobile ? 'collapsed' : ''}" id="ai-prompts-wrapper">
                    <div class="row g-2">
                        <div class="col-6 col-md-3">
                            <button class="ai-prompt-card h-100 w-100" onclick="triggerAISmartPrompt('Analyze my financial ledger transactions and suggest a budget.')">
                                <div class="fw-bold small mb-1">📊 Analyze Finance</div>
                                <div class="text-muted text-truncate" style="font-size: 0.75rem;">Evaluate spending.</div>
                            </button>
                        </div>
                        <div class="col-6 col-md-3">
                            <button class="ai-prompt-card h-100 w-100" onclick="triggerAISmartPrompt('Create a structured task list to plan my week.')">
                                <div class="fw-bold small mb-1">📝 Weekly Planner</div>
                                <div class="text-muted text-truncate" style="font-size: 0.75rem;">Checklists & goals.</div>
                            </button>
                        </div>
                        <div class="col-6 col-md-3">
                            <button class="ai-prompt-card h-100 w-100" onclick="triggerAISmartPrompt('Generate a grocery shopping list for a healthy dinner recipe.')">
                                <div class="fw-bold small mb-1">🛒 Meal Groceries</div>
                                <div class="text-muted text-truncate" style="font-size: 0.75rem;">Recipes to buy list.</div>
                            </button>
                        </div>
                        <div class="col-6 col-md-3">
                            <button class="ai-prompt-card h-100 w-100" onclick="triggerAISmartPrompt('What are the recommended maintenance checklist items for my vehicle?')">
                                <div class="fw-bold small mb-1">🚗 Car Maintenance</div>
                                <div class="text-muted text-truncate" style="font-size: 0.75rem;">Service checklists.</div>
                            </button>
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- Chat inputs -->
                <div class="ai-chat-input-area bg-light">
                    <div class="ai-input-wrap">
                        <button class="ai-action-btn ai-mic-btn" id="ai-mic-trigger" onclick="toggleAISpeechInput()" title="Voice Dictation">
                            <i class="fas fa-microphone"></i>
                        </button>
                        <textarea class="ai-input-box" id="ai-message-input" rows="1" placeholder="Ask anything about your tasks, finances, or menus..." onkeydown="handleAIChatKeydown(event)" ${!hasKey ? 'disabled' : ''}></textarea>
                        <button class="ai-action-btn ai-send-btn" onclick="sendAIChatMessage()" title="Send message" ${!hasKey ? 'disabled' : ''}>
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    renderAIChatMessages();
};

// Temp session key saver
window.saveTempGeminiKey = function() {
    const key = document.getElementById('ai-temp-key').value.trim();
    if (!key) {
        if(window.dashboard) window.dashboard.showNotification('Please enter a valid key', 'warning');
        return;
    }
    localStorage.setItem('temp_gemini_api_key', key);
    window.loadAIAssistantSection();
    if(window.dashboard) window.dashboard.showNotification('Connected successfully! ✓', 'success');
};

// Clear chat screen
window.clearAIChatHistory = function() {
    _aiChatHistory = [];
    renderAIChatMessages();
};

// Set AI context focusing scope
window.setAIContextScope = function(scope, btnElement) {
    window.activeAIContextScope = scope;
    
    // Deactivate all sibling pills
    const container = btnElement.closest('.ai-context-selector');
    if (container) {
        container.querySelectorAll('.btn-context-pill').forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    // Activate clicked pill
    btnElement.classList.add('active');
    
    // Notify focus shift
    if (window.dashboard) {
        const scopeLabels = {
            all: 'Entire Ledger & Checklists',
            finance: 'Finances & Transactions Only',
            tasks: 'Tasks & Week Planner Only',
            groceries: 'Grocery Checklist Only'
        };
        window.dashboard.showNotification(`Focused AI context to: ${scopeLabels[scope] || scope}`, 'info');
    }
};

// Toggle collapse/expand of Suggested Prompts bar
window.toggleAIPromptsCollapse = function() {
    const wrapper = document.getElementById('ai-prompts-wrapper');
    const icon = document.getElementById('ai-prompts-toggle-icon');
    if (!wrapper || !icon) return;
    
    const isCollapsed = wrapper.classList.toggle('collapsed');
    
    if (isCollapsed) {
        icon.className = 'fas fa-chevron-up text-muted';
    } else {
        icon.className = 'fas fa-chevron-down text-muted';
    }
};

// Auto render history
function renderAIChatMessages() {
    const stream = document.getElementById('ai-chat-stream');
    if (!stream) return;

    if (_aiChatHistory.length === 0) {
        stream.innerHTML = `
            <div class="text-center py-5 text-muted">
                <div class="fs-1 mb-2">👋</div>
                <h5 class="fw-bold">Hello! I am your PersonalOS AI Assistant.</h5>
                <p class="small px-4">I can query your active tasks, verify your grocery checklist, analyze your ledger balance transactions, or plan your next schedule! Click any smart prompt below to start.</p>
            </div>
        `;
        return;
    }

    stream.innerHTML = _aiChatHistory.map((msg, index) => {
        const isUser = msg.role === 'user';
        const avatar = isUser ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-sparkles"></i>';
        const cssClass = isUser ? 'user' : 'assistant';
        const content = formatMarkdown(msg.parts[0].text);
        
        const copyButton = !isUser ? `
            <div class="text-end mt-2 pt-1 border-top" style="border-color: rgba(0,0,0,0.05) !important;">
                <button class="btn btn-sm btn-link text-decoration-none text-muted p-0" style="font-size: 0.8rem;" onclick="copyAIChatMessage(${index})">
                    <i class="far fa-copy me-1"></i>Copy
                </button>
            </div>
        ` : '';

        return `
            <div class="ai-msg ${cssClass}">
                <div class="ai-msg-avatar">${avatar}</div>
                <div class="ai-msg-bubble">
                    ${content}
                    ${copyButton}
                </div>
            </div>
        `;
    }).join('');

    stream.scrollTop = stream.scrollHeight;
}

window.copyAIChatMessage = function(index) {
    const msg = _aiChatHistory[index];
    if (!msg) return;
    const text = msg.parts[0].text;
    navigator.clipboard.writeText(text).then(() => {
        if (window.dashboard) window.dashboard.showNotification('Summary copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
};

// Run smart templates
window.triggerAISmartPrompt = function(promptText) {
    const input = document.getElementById('ai-message-input');
    if (input) {
        input.value = promptText;
        sendAIChatMessage();
    }
};

// Keydown enter to send
window.handleAIChatKeydown = function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendAIChatMessage();
    }
};

// Send chatbot prompt to Gemini v1beta model
window.sendAIChatMessage = async function() {
    const input = document.getElementById('ai-message-input');
    if (!input) return;

    const query = input.value.trim();
    if (!query) return;

    const apiKey = await getGeminiApiKey();
    if (!apiKey) {
        if(window.dashboard) window.dashboard.showNotification('Gemini API key is required. Paste in sidebar or Settings.', 'warning');
        return;
    }

    // Append user query to UI and history
    _aiChatHistory.push({ role: 'user', parts: [{ text: query }] });
    renderAIChatMessages();
    input.value = '';

    // Append loading spinner
    const stream = document.getElementById('ai-chat-stream');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'ai-msg assistant';
    loadingDiv.innerHTML = `
        <div class="ai-msg-avatar"><i class="fa-solid fa-sparkles"></i></div>
        <div class="ai-msg-bubble">
            <div class="ai-typing-loader">
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
            </div>
        </div>
    `;
    stream.appendChild(loadingDiv);
    stream.scrollTop = stream.scrollHeight;

    try {
        const systemContext = await getAppOverviewContext();
        
        // Assemble conversation history for multi-turn chat
        const contents = [
            { role: 'user', parts: [{ text: systemContext + "\n\nInitial prompt: Hello! I am ready to answer queries." }] },
            { role: 'model', parts: [{ text: "Hello! I am your PersonalOS AI Companion. I can see your configurations and transactions data. Let's work together!" }] },
            ..._aiChatHistory
        ];

        const MODELS_TO_TRY = [
            'gemini-3.5-flash',
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-1.5-flash-latest',
            'gemini-1.5-pro-latest',
            'gemini-1.0-pro'
        ];

        let response = null;
        let resData = null;
        let lastError = null;

        for (const model of MODELS_TO_TRY) {
            try {
                response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents })
                });

                if (response.ok) {
                    resData = await response.json();
                    window.activeAIModel = model;
                    const subtext = document.getElementById('ai-model-subtext');
                    if (subtext) {
                        subtext.textContent = `Powered by Gemini AI (${model})`;
                    }
                    break;
                } else {
                    let errMsg = `HTTP Error ${response.status} (${response.statusText || 'Error'})`;
                    try {
                        const errData = await response.json();
                        if (errData.error?.message) {
                            errMsg += ` - ${errData.error.message}`;
                        }
                    } catch (err) {}

                    // If it is a 503 (Overloaded) or 429 (Rate Limit/Quota), try fallback models
                    if (response.status === 503 || response.status === 429) {
                        console.warn(`Model ${model} returned temporary status ${response.status}. Trying fallback model...`);
                        lastError = errMsg;
                        continue;
                    }

                    // If it is a model not found / not supported error, try fallback models
                    const isModel404 = response.status === 404 && (errMsg.includes('not found') || errMsg.includes('not supported') || errMsg.includes('Model') || errMsg.includes('is not found'));
                    if (isModel404) {
                        console.warn(`Model ${model} not available (404), trying fallback...`);
                        lastError = errMsg;
                        continue;
                    }
                    
                    // Otherwise (invalid key, bad request, etc.), fail immediately
                    if (response.status === 404 || response.status === 400 || response.status === 403) {
                        const hasValidPrefix = apiKey.startsWith('AIza') || apiKey.startsWith('AQ.');
                        if (!hasValidPrefix) {
                            errMsg += `\n\n**Tip:** The API key you configured (\`${apiKey.substring(0, 5)}...\`) does not start with a recognized Gemini prefix (\`AIzaSy\` or \`AQ.\`). Google Gemini API keys from Google AI Studio always start with one of these. Please check that you copied the correct key.`;
                        } else {
                            errMsg += `\n\n**Tip:** Your API key has the correct prefix (\`${apiKey.startsWith('AIza') ? 'AIza' : 'AQ.'}\`), but Google's server returned a ${response.status} error. This indicates that the key is inactive, has been deleted, has restricted permissions, or was copied incorrectly (truncated). Please verify it in your [Google AI Studio Console](https://aistudio.google.com/).`;
                        }
                    }
                    throw new Error(errMsg);
                }
            } catch (err) {
                lastError = err.message || err;
                const isTransientOrModelErr = lastError.includes('not found') || 
                                              lastError.includes('not supported') || 
                                              lastError.includes('Model') || 
                                              lastError.includes('is not found') || 
                                              lastError.includes('503') || 
                                              lastError.includes('429') || 
                                              lastError.includes('fetch') || 
                                              lastError.includes('NetworkError');
                if (isTransientOrModelErr) {
                    continue;
                }
                throw err;
            }
        }

        if (!resData) {
            throw new Error(`Failed to contact any Gemini models. Last error: ${lastError}`);
        }

        loadingDiv.remove();

        if (resData.candidates && resData.candidates[0]?.content?.parts[0]?.text) {
            const replyText = resData.candidates[0].content.parts[0].text;
            
            // Extract and run JSON Action payload
            const jsonMatch = replyText.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                try {
                    const actionData = JSON.parse(jsonMatch[1].trim());
                    if (actionData.action && actionData.data) {
                        await executeAIAction(actionData.action, actionData.data);
                    }
                } catch (jsonErr) {
                    console.error('Failed to parse tool action:', jsonErr);
                }
            }

            _aiChatHistory.push({ role: 'model', parts: [{ text: replyText }] });
        } else {
            console.error('Gemini error response:', resData);
            const errDetail = resData.error?.message || 'Empty response received from Gemini API.';
            _aiChatHistory.push({ role: 'model', parts: [{ text: `⚠️ Error calling AI model: ${errDetail}` }] });
        }
    } catch (e) {
        console.error(e);
        if (document.body.contains(loadingDiv)) loadingDiv.remove();
        _aiChatHistory.push({ role: 'model', parts: [{ text: `⚠️ API Error: ${e.message || e}` }] });
    }

    renderAIChatMessages();
};

// Speech-to-text dictation helper
window.toggleAISpeechInput = function() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        if(window.dashboard) window.dashboard.showNotification('Speech Recognition not supported in this browser.', 'warning');
        return;
    }

    const btn = document.getElementById('ai-mic-trigger');
    const input = document.getElementById('ai-message-input');

    if (_isSpeechListening) {
        _speechRecognition?.stop();
        return;
    }

    _speechRecognition = new SpeechRecognition();
    _speechRecognition.continuous = false;
    _speechRecognition.interimResults = false;
    _speechRecognition.lang = 'en-US';

    _speechRecognition.onstart = function() {
        _isSpeechListening = true;
        btn.classList.add('listening');
        if(window.dashboard) window.dashboard.showNotification('Listening... speak now', 'info');
    };

    _speechRecognition.onerror = function(e) {
        console.error('Speech error:', e);
        _speechRecognition.stop();
    };

    _speechRecognition.onend = function() {
        _isSpeechListening = false;
        btn.classList.remove('listening');
    };

    _speechRecognition.onresult = function(event) {
        const resultText = event.results[0][0].transcript;
        if (input && resultText) {
            input.value = (input.value ? input.value + " " : "") + resultText;
            input.focus();
        }
    };

    _speechRecognition.start();
};

// Tool actions processor
async function executeAIAction(action, data) {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
        if (action === 'add_transaction') {
            const tx = {
                userId: user.uid,
                type: data.type || 'expense',
                amount: parseFloat(data.amount) || 0,
                category: data.category || 'Others',
                date: data.date || new Date().toISOString().split('T')[0],
                paymentMode: data.paymentMode || 'cash',
                description: data.description || 'Added via AI Assistant',
                bankAccountId: data.bankAccountId || null,
                creditCardId: data.creditCardId || null,
                walletId: data.walletId || null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            tx.relatedId = (tx.paymentMode === 'credit-card' && tx.creditCardId) ? tx.creditCardId : 
                           (tx.category === 'Credit Card Bill' && tx.creditCardId ? tx.creditCardId : 
                           ((tx.paymentMode === 'wallet' && tx.walletId) ? tx.walletId : null));

            await db.collection('transactions').add(tx);
            
            if (window.adjustBalancesForTxChange) {
                await window.adjustBalancesForTxChange(null, tx);
            }
            
            if (window.dashboard) {
                window.dashboard.showNotification('Transaction added via AI! ✓', 'success');
                window.dashboard.updateStats();
            }
        } 
        else if (action === 'add_task') {
            const task = {
                userId: user.uid,
                title: data.title,
                dueDate: data.dueDate || '',
                priority: data.priority || 'medium',
                category: data.category || 'General',
                completed: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('reminders').add(task);
            
            if (window.dashboard) {
                window.dashboard.showNotification('Task created via AI! ✓', 'success');
            }
        }
        else if (action === 'add_grocery') {
            const item = {
                userId: user.uid,
                name: data.name,
                quantity: parseFloat(data.quantity) || 1,
                category: data.category || 'Others',
                status: 'to_buy',
                addedAt: new Date().toISOString()
            };
            
            await db.collection('grocery_items').add(item);
            
            if (window.dashboard) {
                window.dashboard.showNotification('Grocery item added via AI! ✓', 'success');
            }
        }
    } catch (e) {
        console.error('Failed to execute AI tool action:', e);
        if (window.dashboard) {
            window.dashboard.showNotification('AI failed to execute action.', 'danger');
        }
    }
}
