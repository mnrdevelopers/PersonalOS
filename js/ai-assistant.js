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
            gap: 1.5rem;
            height: calc(100vh - 180px);
            min-height: 520px;
            animation: fadeIn 0.4s ease;
        }
        .ai-sidebar {
            width: 280px;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            flex-shrink: 0;
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
            font-size: 1.2rem;
            flex-shrink: 0;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            background: #f1f5f9;
        }
        [data-bs-theme="dark"] .ai-msg-avatar {
            background: #334155;
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
        .ai-msg-bubble pre {
            background: #f8fafc;
            padding: 0.75rem;
            border-radius: 8px;
            overflow-x: auto;
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
            border: 1px solid rgba(0,0,0,0.05);
        }
        [data-bs-theme="dark"] .ai-msg-bubble pre {
            background: #0f172a;
            border: 1px solid rgba(255,255,255,0.05);
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
        .ai-typing-loader {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 6px 12px;
        }
        .ai-typing-dot {
            width: 6px;
            height: 6px;
            background: #94a3b8;
            border-radius: 50%;
            animation: ai-typing 1s infinite alternate;
        }
        .ai-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .ai-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes ai-typing {
            from { transform: translateY(0); }
            to { transform: translateY(-6px); }
        }
    `;
    document.head.appendChild(style);
}

// Format markdown subset for code & bold text in messages
function formatMarkdown(text) {
    if (!text) return "";
    let formatted = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    
    // Code blocks
    formatted = formatted.replace(/```([\s\S]*?)```/g, function(match, p1) {
        return `<pre><code>${p1.trim()}</code></pre>`;
    });
    
    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Bold
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Bullet points
    formatted = formatted.split('\n').map(line => {
        if (line.trim().startsWith('* ')) {
            return `<li>${line.trim().substring(2)}</li>`;
        }
        if (line.trim().startsWith('- ')) {
            return `<li>${line.trim().substring(2)}</li>`;
        }
        return line;
    }).join('\n');

    // Wrap grouped list items
    formatted = formatted.replace(/(<li>.*<\/li>)/gs, '<ul>$1<\/ul>');
    
    // Paragraph double spacing
    formatted = formatted.replace(/\n\n/g, '<br><br>');
    return formatted;
}

// Compile real-time OS database summary context for Gemini
async function getAppOverviewContext() {
    const user = auth.currentUser;
    if (!user) return "";
    
    let context = `You are the PersonalOS AI Companion, a friendly, intelligent assistant integrated into the user's dashboard.
Here is the user's current live data summary from their PersonalOS database:
`;

    try {
        // Fetch bank account balances
        const accountsSnap = await db.collection('bank_accounts').where('userId', '==', user.uid).get();
        context += `- Bank Accounts Configured: ${accountsSnap.size}. Account Names: ${accountsSnap.docs.map(d => d.data().name).join(', ') || 'None'}\n`;
        
        // Fetch credit cards
        const ccSnap = await db.collection('credit_cards').where('userId', '==', user.uid).get();
        if (!ccSnap.empty) {
            context += `- Credit Cards outstanding balance:\n`;
            ccSnap.forEach(doc => {
                const d = doc.data();
                context += `  * ${d.name} (Limit: ₹${d.creditLimit}, Outstanding: ₹${d.currentOutstanding || 0})\n`;
            });
        }

        // Fetch recent ledger transactions
        const txSnap = await db.collection('transactions')
            .where('userId', '==', user.uid)
            .orderBy('date', 'desc')
            .limit(10)
            .get();
        if (!txSnap.empty) {
            context += `- Last 10 Ledger Transactions:\n`;
            txSnap.forEach(doc => {
                const d = doc.data();
                context += `  * [${d.date}] ${d.type.toUpperCase()}: ₹${d.amount} for ${d.category} - "${d.description || ''}" (Mode: ${d.paymentMode})\n`;
            });
        }

        // Fetch tasks
        const tasksSnap = await db.collection('reminders')
            .where('userId', '==', user.uid)
            .where('completed', '==', false)
            .limit(10)
            .get();
        if (!tasksSnap.empty) {
            context += `- Uncompleted Tasks / Reminders:\n`;
            tasksSnap.forEach(doc => {
                const d = doc.data();
                context += `  * "${d.title}" (Due: ${d.dueDate || 'No Date'}, Priority: ${d.priority || 'medium'})\n`;
            });
        }

        // Fetch active shopping list items
        const grocerySnap = await db.collection('grocery_items')
            .where('userId', '==', user.uid)
            .where('status', '==', 'to_buy')
            .get();
        if (!grocerySnap.empty) {
            context += `- Items to buy in Grocery List: ${grocerySnap.docs.map(d => d.data().name).join(', ')}\n`;
        }

    } catch (e) {
        console.error('Error compiling AI context:', e);
    }
    
    context += `
Answer queries contextually using this data. Be helpful, draft clean checklists, and explain finances. Format responses using clean, readable markdown. Always use the Indian Rupee symbol (₹) for values. Keep answers concise.
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

    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold gradient-text mb-0">AI Assistant</h2>
            <div class="ai-status-indicator">
                <div class="ai-status-pulse ${hasKey ? '' : 'offline'}"></div>
                <span class="fw-medium">${hasKey ? 'Gemini Connected' : 'Missing API Key'}</span>
            </div>
        </div>

        <div class="ai-shell">
            <!-- Sidebar Panel: Prompts and Keys -->
            <div class="ai-sidebar">
                <div class="card border-0 shadow-sm">
                    <div class="card-body p-3">
                        <h6 class="fw-bold mb-3"><i class="fas fa-magic text-primary me-2"></i>Smart Prompts</h6>
                        <div class="d-flex flex-column gap-2">
                            <button class="ai-prompt-card" onclick="triggerAISmartPrompt('Analyze my financial ledger transactions and suggest a budget.')">
                                <div class="fw-bold small mb-1">📊 Analyze Finance</div>
                                <div class="text-muted" style="font-size: 0.8rem;">Evaluate income vs spending.</div>
                            </button>
                            <button class="ai-prompt-card" onclick="triggerAISmartPrompt('Create a structured task list to plan my week.')">
                                <div class="fw-bold small mb-1">📝 Weekly Task Planner</div>
                                <div class="text-muted" style="font-size: 0.8rem;">Draft checklists & goals.</div>
                            </button>
                            <button class="ai-prompt-card" onclick="triggerAISmartPrompt('Generate a grocery shopping list for a healthy dinner recipe.')">
                                <div class="fw-bold small mb-1">🛒 Recipe to Groceries</div>
                                <div class="text-muted" style="font-size: 0.8rem;">Convert meals to grocery list.</div>
                            </button>
                            <button class="ai-prompt-card" onclick="triggerAISmartPrompt('What are the recommended maintenance checklist items for my vehicle?')">
                                <div class="fw-bold small mb-1">🚗 Maintenance Alert</div>
                                <div class="text-muted" style="font-size: 0.8rem;">Calculate service intervals.</div>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- API Key fallback field -->
                ${!hasKey ? `
                <div class="card border-warning shadow-sm">
                    <div class="card-body p-3">
                        <h6 class="fw-bold mb-2 text-warning"><i class="fas fa-key me-2"></i>Setup Gemini Key</h6>
                        <p class="small text-muted mb-2">Paste key below for this session, or configure it permanently in Settings.</p>
                        <input type="password" class="form-control form-control-sm mb-2" id="ai-temp-key" placeholder="AI Studio Key...">
                        <button class="btn btn-warning btn-sm w-100 fw-bold" onclick="saveTempGeminiKey()">Connect Assistant</button>
                    </div>
                </div>
                ` : ''}
            </div>

            <!-- Main Chat Area -->
            <div class="ai-chat-card">
                <div class="ai-chat-header bg-light">
                    <div class="d-flex align-items-center gap-2">
                        <span class="fs-4">🤖</span>
                        <div>
                            <div class="fw-bold" style="font-size: 0.95rem;">PersonalOS Companion</div>
                            <div class="text-muted" id="ai-model-subtext" style="font-size: 0.75rem;">Powered by Gemini AI ${window.activeAIModel ? `(${window.activeAIModel})` : ''}</div>
                        </div>
                    </div>
                    <button class="btn btn-outline-secondary btn-sm" onclick="clearAIChatHistory()">
                        <i class="fas fa-trash-alt me-1"></i> Clear Chat
                    </button>
                </div>

                <!-- Message stream -->
                <div class="ai-chat-messages" id="ai-chat-stream">
                    <!-- Loaded dynamically -->
                </div>

                <!-- Chat inputs -->
                <div class="ai-chat-input-area bg-light">
                    <div class="ai-input-wrap">
                        <button class="ai-action-btn ai-mic-btn" id="ai-mic-trigger" onclick="toggleAISpeechInput()" title="Voice Dictation">
                            <i class="fas fa-microphone"></i>
                        </button>
                        <textarea class="ai-input-box" id="ai-message-input" rows="1" placeholder="Ask anything about your tasks, finances, or menus..." onkeydown="handleAIChatKeydown(event)"></textarea>
                        <button class="ai-action-btn ai-send-btn" onclick="sendAIChatMessage()" title="Send message">
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

// Auto render history
function renderAIChatMessages() {
    const stream = document.getElementById('ai-chat-stream');
    if (!stream) return;

    if (_aiChatHistory.length === 0) {
        stream.innerHTML = `
            <div class="text-center py-5 text-muted">
                <div class="fs-1 mb-2">👋</div>
                <h5 class="fw-bold">Hello! I am your PersonalOS AI Assistant.</h5>
                <p class="small px-4">I can query your active tasks, verify your grocery checklist, analyze your ledger balance transactions, or plan your next schedule! Click any smart prompt in the left sidebar to start.</p>
            </div>
        `;
        return;
    }

    stream.innerHTML = _aiChatHistory.map(msg => {
        const isUser = msg.role === 'user';
        const avatar = isUser ? '👤' : '🤖';
        const cssClass = isUser ? 'user' : 'assistant';
        const content = formatMarkdown(msg.parts[0].text);
        return `
            <div class="ai-msg ${cssClass}">
                <div class="ai-msg-avatar">${avatar}</div>
                <div class="ai-msg-bubble">${content}</div>
            </div>
        `;
    }).join('');

    stream.scrollTop = stream.scrollHeight;
}

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
        <div class="ai-msg-avatar">🤖</div>
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

                    // If it is a model not found / not supported error, we try fallback models
                    if (response.status === 404 && (errMsg.includes('not found') || errMsg.includes('not supported') || errMsg.includes('Model') || errMsg.includes('is not found'))) {
                        console.warn(`Model ${model} not available, trying fallback...`);
                        lastError = errMsg;
                        continue;
                    }
                    
                    // Otherwise (invalid key, bad request, quota, etc.), fail immediately
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
                // If it is a model not found / version mismatch, continue loop
                if (lastError.includes('not found') || lastError.includes('not supported') || lastError.includes('Model') || lastError.includes('is not found')) {
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
