/**
 * PersonalOS WhatsApp Auto-Reminder Server
 * =========================================
 * Runs locally to send automatic WhatsApp reminders
 * for lent loans. Synced directly from PWA browser client.
 *
 * Setup:
 *  1. npm install
 *  2. node server.js  → scan the QR code once with WhatsApp
 *  3. Scheduler runs every 30 minutes automatically
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, '.wwebjs_auth');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
const LOG_FILE = path.join(DATA_DIR, 'reminder-log.json');
const LOANS_FILE = path.join(DATA_DIR, 'local-loans.json');


// ─── WhatsApp Client ──────────────────────────────────────────────────────────
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '.wwebjs_auth') }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

let waStatus = 'initializing'; // 'initializing' | 'qr_required' | 'connected' | 'disconnected'
let qrCodeBase64 = null;
let qrRaw = null;

client.on('qr', async (qr) => {
    waStatus = 'qr_required';
    qrRaw = qr;
    qrCodeBase64 = await qrcode.toDataURL(qr);
    qrcodeTerminal.generate(qr, { small: true });
    console.log('\n🔲 QR Code ready — scan with WhatsApp to authenticate');
    console.log('   Or visit http://localhost:' + PORT + '/status to see QR in browser\n');
});

client.on('ready', () => {
    waStatus = 'connected';
    qrCodeBase64 = null;
    qrRaw = null;
    console.log('✅ WhatsApp connected and ready!');
});

client.on('authenticated', () => {
    console.log('🔐 WhatsApp authenticated — session saved');
});

client.on('auth_failure', () => {
    waStatus = 'disconnected';
    console.error('❌ WhatsApp authentication failed');
});

client.on('disconnected', (reason) => {
    waStatus = 'disconnected';
    console.warn('⚠️  WhatsApp disconnected:', reason);
});

client.initialize();

// ─── Reminder Log Helpers ─────────────────────────────────────────────────────
function loadLog() {
    try {
        if (fs.existsSync(LOG_FILE)) return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    } catch { /* ignore */ }
    return {};
}

function saveLog(log) {
    fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

function getSentTodayCount(loanId) {
    const log = loadLog();
    const today = new Date().toISOString().split('T')[0];
    return log[loanId]?.[today] || 0;
}

function recordSent(loanId) {
    const log = loadLog();
    const today = new Date().toISOString().split('T')[0];
    if (!log[loanId]) log[loanId] = {};
    log[loanId][today] = (log[loanId][today] || 0) + 1;
    saveLog(log);
}

// ─── Local Loans Storage Helpers ──────────────────────────────────────────────
function loadLocalLoans() {
    try {
        if (fs.existsSync(LOANS_FILE)) return JSON.parse(fs.readFileSync(LOANS_FILE, 'utf8'));
    } catch { /* ignore */ }
    return [];
}

function saveLocalLoans(loans) {
    fs.writeFileSync(LOANS_FILE, JSON.stringify(loans, null, 2));
}

// ─── Message Builder ──────────────────────────────────────────────────────────
function buildMessage(data) {
    const name = data.name || 'Friend';
    const amount = (data.totalAmount - (data.paidAmount || 0)).toLocaleString('en-IN', {
        minimumFractionDigits: 0, maximumFractionDigits: 0
    });
    const context = data.messageContext || '';
    const dueDate = data.dueDate
        ? new Date(data.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'soon';

    if (data.reminderTemplate && data.reminderTemplate.trim()) {
        let msg = data.reminderTemplate;
        msg = msg.replace(/{name}/g, name);
        msg = msg.replace(/{amount}/g, amount);
        msg = msg.replace(/{dueDate}/g, dueDate);
        msg = msg.replace(/{context}/g, context);
        return msg;
    }

    const contextLine = context ? `📋 *Ref:* ${context}\n` : '';
    return (
        `Hi *${name}* 👋\n\n` +
        `This is a friendly reminder about your outstanding loan repayment.\n\n` +
        `💰 *Outstanding:* ₹${amount}\n` +
        `📅 *Due Date:* ${dueDate}\n` +
        `${contextLine}\n` +
        `Please arrange the payment at your earliest convenience. Thank you! 🙏\n\n` +
        `_— PersonalOS Auto-Reminder_`
    );
}

// ─── Core Scheduler ──────────────────────────────────────────────────────────
async function runReminderJob() {
    if (waStatus !== 'connected') {
        console.log(`[Scheduler] Skipped — WA status: ${waStatus}`);
        return;
    }

    console.log('[Scheduler] Running reminder check...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const eligibleDocs = loadLocalLoans();

        if (eligibleDocs.length === 0) {
            console.log('[Scheduler] No synced lent loans found in local database.');
            return;
        }

        let sent = 0, skipped = 0;

        for (const data of eligibleDocs) {
            const loanId = data.id;

            // Must have a mobile number
            if (!data.mobile) { skipped++; continue; }

            // Must have a due date
            if (!data.dueDate) { skipped++; continue; }

            const dueDate = new Date(data.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            const daysBefore = data.reminderDaysBefore || 3;
            const timesPerDay = data.reminderTimesPerDay || 1;

            // Calculate the first reminder date
            const reminderStart = new Date(dueDate);
            reminderStart.setDate(dueDate.getDate() - daysBefore);

            // Only send if today is within the reminder window (reminderStart ≤ today ≤ dueDate)
            if (today < reminderStart || today > dueDate) {
                skipped++;
                continue;
            }

            // Check daily limit
            const sentToday = getSentTodayCount(loanId);
            if (sentToday >= timesPerDay) { skipped++; continue; }

            // Build phone number in WhatsApp format (countrycode + number + @c.us)
            const phone = data.mobile.replace(/\D/g, '');
            if (phone.length < 8) { skipped++; continue; }
            const chatId = `${phone}@c.us`;

            // Send message
            try {
                const message = buildMessage(data);
                await client.sendMessage(chatId, message);
                recordSent(loanId);
                sent++;
                console.log(`[Scheduler] ✅ Sent reminder to ${data.name} (${phone})`);
            } catch (err) {
                console.error(`[Scheduler] ❌ Failed to send to ${data.name}:`, err.message);
            }

            // Small delay between messages to avoid rate-limiting
            await new Promise(r => setTimeout(r, 2000));
        }

        console.log(`[Scheduler] Done. Sent: ${sent}, Skipped: ${skipped}`);
    } catch (err) {
        console.error('[Scheduler] Error:', err.message);
    }
}

// Run every 30 minutes
cron.schedule('*/30 * * * *', runReminderJob);
console.log('⏰ Reminder scheduler active — checks every 30 minutes');

// ─── Express API ──────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

/** GET /status — connection status + QR code if needed */
app.get('/status', (req, res) => {
    res.json({
        status: waStatus,
        qrCode: qrCodeBase64 || null,
        message: {
            initializing: 'WhatsApp client is starting up...',
            qr_required: 'Scan the QR code with WhatsApp to connect.',
            connected: 'WhatsApp is connected and sending reminders.',
            disconnected: 'WhatsApp is disconnected. Restart the server.'
        }[waStatus]
    });
});

/** POST /sync-loans — sync active lent loans with reminders enabled from PWA */
app.post('/sync-loans', (req, res) => {
    const loans = req.body;
    if (!Array.isArray(loans)) {
        return res.status(400).json({ error: 'Body must be an array of loans' });
    }
    saveLocalLoans(loans);
    console.log(`📥 Synced ${loans.length} active lent loans from client.`);
    res.json({ success: true, count: loans.length });
});

/** POST /test-message — send a test WhatsApp message */
app.post('/test-message', async (req, res) => {
    const { phone, message } = req.body;
    if (!phone) return res.status(400).json({ error: 'phone is required' });
    if (waStatus !== 'connected') return res.status(503).json({ error: 'WhatsApp not connected', status: waStatus });

    try {
        const cleanPhone = String(phone).replace(/\D/g, '');
        const chatId = `${cleanPhone}@c.us`;
        const text = message || '👋 Test message from PersonalOS WA Reminder Server!';
        await client.sendMessage(chatId, text);
        res.json({ success: true, to: cleanPhone });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/** POST /run-now — manually trigger the reminder job */
app.post('/run-now', async (req, res) => {
    res.json({ started: true });
    runReminderJob();
});

/** GET /log — view the reminder send log */
app.get('/log', (req, res) => {
    res.json(loadLog());
});

app.listen(PORT, () => {
    console.log(`\n🚀 PersonalOS WA Reminder Server running at http://localhost:${PORT}`);
    console.log('   Endpoints:');
    console.log(`   GET  /status       — connection status & QR code`);
    console.log(`   POST /sync-loans   — sync active reminders from PWA`);
    console.log(`   POST /test-message — send a test message`);
    console.log(`   POST /run-now      — trigger reminders immediately`);
    console.log(`   GET  /log          — view sent reminder log\n`);
});
