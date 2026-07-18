const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const admin = require('firebase-admin');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
const LOG_FILE = path.join(DATA_DIR, 'notification-log.json');
const LOCAL_SUBS_FILE = path.join(DATA_DIR, 'local-subscriptions.json');

// ─── VAPID KEY SETUP ─────────────────────────────────────────────────────────
let vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
};

if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
    console.log('VAPID keys not found in .env. Generating new VAPID keys...');
    const keys = webpush.generateVAPIDKeys();
    vapidKeys = {
        publicKey: keys.publicKey,
        privateKey: keys.privateKey
    };

    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }
    // Strip existing VAPID keys if any
    envContent = envContent
        .split('\n')
        .filter(line => !line.startsWith('VAPID_PUBLIC_KEY=') && !line.startsWith('VAPID_PRIVATE_KEY='))
        .join('\n');

    envContent += `\nVAPID_PUBLIC_KEY=${keys.publicKey}\nVAPID_PRIVATE_KEY=${keys.privateKey}\n`;
    fs.writeFileSync(envPath, envContent.trim() + '\n');
    console.log('Generated and saved VAPID keys to .env!');
}

webpush.setVapidDetails(
    'mailto:admin@personalos.local',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

// ─── FIREBASE ADMIN SETUP ───────────────────────────────────────────────────
let db = null;
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(__dirname, 'serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
    try {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
        console.log('✅ Firebase Admin SDK initialized using serviceAccountKey.json');
    } catch (err) {
        console.error('❌ Failed to initialize Firebase Admin using file:', err.message);
    }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
        console.log('✅ Firebase Admin SDK initialized using FIREBASE_SERVICE_ACCOUNT_JSON env var');
    } catch (err) {
        console.error('❌ Failed to parse/initialize FIREBASE_SERVICE_ACCOUNT_JSON:', err.message);
    }
} else {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
        db = admin.firestore();
        console.log('✅ Firebase Admin SDK initialized using Application Default Credentials');
    } catch (err) {
        console.warn('⚠️  Firebase Admin SDK could not be initialized. Running in Mock/Offline mode.');
        console.warn('   Place serviceAccountKey.json in this directory to connect to cloud Firestore.');
    }
}

// ─── SUBSCRIPTION STORAGE HELPERS ─────────────────────────────────────────────
function loadLocalSubscriptions() {
    try {
        if (fs.existsSync(LOCAL_SUBS_FILE)) {
            return JSON.parse(fs.readFileSync(LOCAL_SUBS_FILE, 'utf8'));
        }
    } catch (e) { /* ignore */ }
    return [];
}

function saveLocalSubscriptions(subs) {
    fs.writeFileSync(LOCAL_SUBS_FILE, JSON.stringify(subs, null, 2));
}

// ─── LOG HELPERS ─────────────────────────────────────────────────────────────
function loadLogs() {
    try {
        if (fs.existsSync(LOG_FILE)) {
            return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
        }
    } catch (e) { /* ignore */ }
    return [];
}

function logNotification(userId, title, body, status, category, details = '') {
    const logs = loadLogs();
    const newEntry = {
        id: Math.random().toString(36).substring(2, 9),
        userId,
        title,
        body,
        category,
        status,
        timestamp: new Date().toISOString(),
        details
    };
    logs.unshift(newEntry); // Newest first
    
    // Cap log file size at 1000 items
    if (logs.length > 1000) {
        logs.pop();
    }
    
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
}

// ─── WEB PUSH SENDER ─────────────────────────────────────────────────────────
async function sendNotificationToSubscription(subDoc, payload) {
    const subObj = {
        endpoint: subDoc.endpoint,
        keys: {
            p256dh: subDoc.publicKey,
            auth: subDoc.authSecret
        }
    };

    try {
        await webpush.sendNotification(subObj, JSON.stringify(payload));
        return { success: true };
    } catch (err) {
        console.error(`[WebPush] Error sending to endpoint: ${subDoc.endpoint}. Status: ${err.statusCode}`);
        if (err.statusCode === 410 || err.statusCode === 404) {
            // Subscription has expired or is no longer valid. Remove it.
            await removeSubscription(subDoc.id, subDoc.endpoint);
            return { success: false, expired: true, error: err.message };
        }
        return { success: false, expired: false, error: err.message };
    }
}

async function removeSubscription(id, endpoint) {
    console.log(`[Subscription] Removing invalid/expired subscription: ${endpoint}`);
    if (db) {
        try {
            await db.collection('push_subscriptions').doc(id).delete();
        } catch (e) {
            console.error('[Subscription] Failed to delete from Firestore:', e.message);
        }
    } else {
        const subs = loadLocalSubscriptions();
        const filtered = subs.filter(s => s.endpoint !== endpoint);
        saveLocalSubscriptions(filtered);
    }
}

async function getSubscriptionsForUser(userId) {
    if (db) {
        const snap = await db.collection('push_subscriptions')
            .where('userId', '==', userId)
            .where('active', '==', true)
            .get();
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
        return loadLocalSubscriptions().filter(s => s.userId === userId && s.active);
    }
}

async function getAllActiveSubscriptions() {
    if (db) {
        const snap = await db.collection('push_subscriptions')
            .where('active', '==', true)
            .get();
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
        return loadLocalSubscriptions().filter(s => s.active);
    }
}

// ─── AUTHENTICATION MIDDLEWARE ───────────────────────────────────────────────
async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    
    // If running in development/mock mode without Firebase Admin, bypass auth token check
    if (!db) {
        req.userId = req.headers['x-user-id'] || 'dev-user-id';
        return next();
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.userId = decodedToken.uid;
        next();
    } catch (err) {
        console.error('[Auth] Token verification failed:', err.message);
        res.status(401).json({ error: 'Unauthorized: Token verification failed' });
    }
}

// ─── EXPRESS SERVER SETUP ────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// GET /api/push/vapid-public-key
app.get('/api/push/vapid-public-key', (req, res) => {
    res.json({ publicKey: vapidKeys.publicKey });
});

// POST /api/push/subscribe
app.post('/api/push/subscribe', authMiddleware, async (req, res) => {
    const { subscription, metadata } = req.body;
    if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ error: 'subscription with endpoint is required' });
    }

    const { endpoint, keys } = subscription;
    const publicKey = keys ? keys.p256dh : '';
    const authSecret = keys ? keys.auth : '';
    
    const deviceName = metadata?.deviceName || 'Unknown Device';
    const browser = metadata?.browser || 'Unknown Browser';
    const platform = metadata?.platform || 'Unknown Platform';

    const subData = {
        userId: req.userId,
        endpoint,
        publicKey,
        authSecret,
        deviceName,
        browser,
        platform,
        active: true,
        updatedAt: new Date().toISOString()
    };

    try {
        if (db) {
            // Check if endpoint exists to prevent duplicates
            const existing = await db.collection('push_subscriptions')
                .where('endpoint', '==', endpoint)
                .get();

            if (!existing.empty) {
                const docId = existing.docs[0].id;
                await db.collection('push_subscriptions').doc(docId).update(subData);
                subData.id = docId;
                console.log(`[Subscription] Updated existing Firestore subscription for user: ${req.userId} (${deviceName})`);
            } else {
                subData.createdAt = new Date().toISOString();
                const docRef = await db.collection('push_subscriptions').add(subData);
                subData.id = docRef.id;
                console.log(`[Subscription] Created new Firestore subscription for user: ${req.userId} (${deviceName})`);
            }
        } else {
            // Local storage fallback
            const subs = loadLocalSubscriptions();
            const existingIndex = subs.findIndex(s => s.endpoint === endpoint);
            if (existingIndex > -1) {
                subs[existingIndex] = { ...subs[existingIndex], ...subData };
                subData.id = subs[existingIndex].id;
                console.log(`[Subscription] Updated existing local subscription for user: ${req.userId}`);
            } else {
                subData.id = Math.random().toString(36).substring(2, 9);
                subData.createdAt = new Date().toISOString();
                subs.push(subData);
                console.log(`[Subscription] Created new local subscription for user: ${req.userId}`);
            }
            saveLocalSubscriptions(subs);
        }

        res.json({ success: true, subscription: subData });
    } catch (err) {
        console.error('[Subscription] Error saving subscription:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/push/unsubscribe
app.post('/api/push/unsubscribe', authMiddleware, async (req, res) => {
    const { endpoint } = req.body;
    if (!endpoint) {
        return res.status(400).json({ error: 'endpoint is required' });
    }

    try {
        if (db) {
            const snap = await db.collection('push_subscriptions')
                .where('endpoint', '==', endpoint)
                .get();
            
            const batch = db.batch();
            snap.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        } else {
            const subs = loadLocalSubscriptions();
            const filtered = subs.filter(s => s.endpoint !== endpoint);
            saveLocalSubscriptions(filtered);
        }

        console.log(`[Subscription] Unsubscribed endpoint: ${endpoint}`);
        res.json({ success: true });
    } catch (err) {
        console.error('[Subscription] Unsubscribe error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/push/subscriptions
app.get('/api/push/subscriptions', authMiddleware, async (req, res) => {
    try {
        const subs = await getSubscriptionsForUser(req.userId);
        res.json(subs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/push/:id
app.delete('/api/push/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        if (db) {
            await db.collection('push_subscriptions').doc(id).delete();
        } else {
            const subs = loadLocalSubscriptions();
            const filtered = subs.filter(s => s.id !== id);
            saveLocalSubscriptions(filtered);
        }
        console.log(`[Subscription] Deleted subscription ID: ${id}`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/push/send
app.post('/api/push/send', authMiddleware, async (req, res) => {
    const { userId, subscriptionId, notification } = req.body;
    const targetUserId = userId || req.userId;

    if (!notification || !notification.title || !notification.body) {
        return res.status(400).json({ error: 'notification title and body are required' });
    }

    try {
        let subs = [];
        if (subscriptionId) {
            if (db) {
                const doc = await db.collection('push_subscriptions').doc(subscriptionId).get();
                if (doc.exists) subs.push({ id: doc.id, ...doc.data() });
            } else {
                const sub = loadLocalSubscriptions().find(s => s.id === subscriptionId);
                if (sub) subs.push(sub);
            }
        } else {
            subs = await getSubscriptionsForUser(targetUserId);
        }

        if (subs.length === 0) {
            return res.json({ success: false, sentCount: 0, message: 'No active subscriptions found for user' });
        }

        let successCount = 0;
        const results = [];
        for (const sub of subs) {
            const result = await sendNotificationToSubscription(sub, { notification });
            results.push(result);
            if (result.success) successCount++;
        }

        const overallStatus = successCount > 0 ? 'success' : 'failed';
        logNotification(targetUserId, notification.title, notification.body, overallStatus, notification.tag || 'Custom', JSON.stringify(results));

        res.json({ success: true, sentCount: successCount, totalCount: subs.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/push/send-all
app.post('/api/push/send-all', authMiddleware, async (req, res) => {
    const { notification } = req.body;
    if (!notification || !notification.title || !notification.body) {
        return res.status(400).json({ error: 'notification title and body are required' });
    }

    try {
        const subs = await getAllActiveSubscriptions();
        if (subs.length === 0) {
            return res.json({ success: false, sentCount: 0, message: 'No active subscriptions found' });
        }

        let successCount = 0;
        const results = [];
        for (const sub of subs) {
            const result = await sendNotificationToSubscription(sub, { notification });
            results.push(result);
            if (result.success) successCount++;
        }

        logNotification('system', notification.title, notification.body, successCount > 0 ? 'success' : 'failed', notification.tag || 'Broadcast', JSON.stringify(results));

        res.json({ success: true, sentCount: successCount, totalCount: subs.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/push/history
app.get('/api/push/history', authMiddleware, (req, res) => {
    const logs = loadLogs();
    const userLogs = logs.filter(l => l.userId === req.userId || l.userId === 'system');
    res.json(userLogs);
});

// ─── SCHEDULER LOGIC ─────────────────────────────────────────────────────────

async function checkRemindersAndBills() {
    if (!db) {
        console.log('[Scheduler] Skipped checking reminders/bills: Firestore not connected.');
        return;
    }

    console.log('[Scheduler] Running checks for reminders and bills...');
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    try {
        // Group subscriptions by userId to process them
        const allSubs = await getAllActiveSubscriptions();
        const userIds = [...new Set(allSubs.map(s => s.userId))];

        for (const uid of userIds) {
            const userSubs = allSubs.filter(s => s.userId === uid);
            if (userSubs.length === 0) continue;

            // A. Check Tasks / Reminders
            const remindersSnap = await db.collection('reminders')
                .where('userId', '==', uid)
                .where('completed', '==', false)
                .get();

            for (const doc of remindersSnap.docs) {
                const reminder = doc.data();
                if (!reminder.sendNotification || reminder.pushNotified === true) continue;

                const dueDateStr = reminder.dueDate; // YYYY-MM-DD
                const isDueOrOverdue = dueDateStr <= todayStr;
                
                if (isDueOrOverdue) {
                    const isBirthday = reminder.title.toLowerCase().includes('birthday');
                    const category = isBirthday ? 'Birthday' : 'Task Reminder';
                    const icon = isBirthday ? '🎂' : '✅';
                    
                    const notification = {
                        title: `${icon} ${category}`,
                        body: `Task: ${reminder.title} is due!`,
                        tag: isBirthday ? 'birthday-alert' : 'task-reminder',
                        icon: '/android-icons/android-launchericon-192-192.png',
                        badge: '/android-icons/android-launchericon-72-72.png',
                        data: { url: '/#reminders' }
                    };

                    console.log(`[Scheduler] Sending task alert for: ${reminder.title}`);
                    let sent = false;
                    for (const sub of userSubs) {
                        const res = await sendNotificationToSubscription(sub, { notification });
                        if (res.success) sent = true;
                    }

                    if (sent) {
                        await doc.ref.update({ pushNotified: true });
                        logNotification(uid, notification.title, notification.body, 'success', notification.tag);
                    }
                }
            }

            // B. Check Credit Card Bills
            const ccSnap = await db.collection('credit_cards')
                .where('userId', '==', uid)
                .get();

            for (const doc of ccSnap.docs) {
                const card = doc.data();
                const outstanding = card.currentOutstanding || 0;
                const billingDay = parseInt(card.billingDay);
                
                if (outstanding > 0 && billingDay) {
                    // Check if today is near the billing day (within 3 days)
                    const currentDay = now.getDate();
                    const diff = billingDay - currentDay;
                    
                    // Trigger alert if within 3 days before billing day or on billing day itself
                    const isNearBillDay = diff >= 0 && diff <= 3;
                    
                    // Simple log check to prevent daily spam during the billing window
                    const logs = loadLogs();
                    const logKey = `cc-${doc.id}-${now.getFullYear()}-${now.getMonth()}`;
                    const alreadySentThisMonth = logs.some(l => l.userId === uid && l.details === logKey);

                    if (isNearBillDay && !alreadySentThisMonth) {
                        const notification = {
                            title: '💳 Bill Reminder',
                            body: `Your credit card "${card.name}" has an outstanding balance of ₹${outstanding.toLocaleString('en-IN')}. Billing day is on the ${billingDay}th!`,
                            tag: 'bill-reminder',
                            icon: '/android-icons/android-launchericon-192-192.png',
                            badge: '/android-icons/android-launchericon-72-72.png',
                            data: { url: '/#loans' }
                        };

                        console.log(`[Scheduler] Sending credit card bill alert for: ${card.name}`);
                        let sent = false;
                        for (const sub of userSubs) {
                            const res = await sendNotificationToSubscription(sub, { notification });
                            if (res.success) sent = true;
                        }

                        if (sent) {
                            logNotification(uid, notification.title, notification.body, 'success', notification.tag, logKey);
                        }
                    }
                }
            }

            // C. Check Loans & Assets
            const loansSnap = await db.collection('loans')
                .where('userId', '==', uid)
                .where('status', '==', 'active')
                .where('reminderEnabled', '==', true)
                .get();

            for (const doc of loansSnap.docs) {
                const loan = doc.data();
                if (!loan.dueDate) continue;

                const dueDate = new Date(loan.dueDate);
                dueDate.setHours(0,0,0,0);
                const today = new Date();
                today.setHours(0,0,0,0);

                const daysBefore = loan.reminderDaysBefore || 3;
                const reminderStart = new Date(dueDate);
                reminderStart.setDate(dueDate.getDate() - daysBefore);

                // Notify if within the notification window
                const isWithinWindow = today >= reminderStart && today <= dueDate;
                
                if (isWithinWindow) {
                    const logs = loadLogs();
                    const todayStr = today.toISOString().split('T')[0];
                    // At most once or twice a day depending on settings
                    const dailySentCount = logs.filter(l => l.userId === uid && l.details === `loan-${doc.id}-${todayStr}`).length;
                    const maxTimes = loan.reminderTimesPerDay || 1;

                    if (dailySentCount < maxTimes) {
                        const remaining = loan.totalAmount - (loan.paidAmount || 0);
                        const context = loan.messageContext ? ` (${loan.messageContext})` : '';
                        const formattedDueDate = dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                        
                        const notification = {
                            title: '🤝 Loan Repayment Alert',
                            body: `Friendly alert: Loan from ${loan.name}${context} of ₹${remaining.toLocaleString('en-IN')} is due on ${formattedDueDate}!`,
                            tag: 'bill-reminder',
                            icon: '/android-icons/android-launchericon-192-192.png',
                            badge: '/android-icons/android-launchericon-72-72.png',
                            data: { url: '/#loans' }
                        };

                        console.log(`[Scheduler] Sending loan reminder alert for borrower: ${loan.name}`);
                        let sent = false;
                        for (const sub of userSubs) {
                            const res = await sendNotificationToSubscription(sub, { notification });
                            if (res.success) sent = true;
                        }

                        if (sent) {
                            logNotification(uid, notification.title, notification.body, 'success', notification.tag, `loan-${doc.id}-${todayStr}`);
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.error('[Scheduler] Error running reminders and bills check:', err.message);
    }
}

async function sendDailyBriefings() {
    if (!db) {
        console.log('[Scheduler] Skipped daily briefing: Firestore not connected.');
        return;
    }

    console.log('[Scheduler] Running Daily Briefings check...');
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    try {
        const allSubs = await getAllActiveSubscriptions();
        const userIds = [...new Set(allSubs.map(s => s.userId))];

        for (const uid of userIds) {
            const userSubs = allSubs.filter(s => s.userId === uid);
            if (userSubs.length === 0) continue;

            // Gather dashboard statistics
            // 1. Pending reminders due today
            const taskSnap = await db.collection('reminders')
                .where('userId', '==', uid)
                .where('completed', '==', false)
                .where('dueDate', '==', todayStr)
                .get();
            const dueTodayCount = taskSnap.size;

            // 2. Active habits
            const habitsSnap = await db.collection('habits')
                .where('userId', '==', uid)
                .where('active', '==', true)
                .get();
            const activeHabitsCount = habitsSnap.size;

            // 3. Active loans
            const loansSnap = await db.collection('loans')
                .where('userId', '==', uid)
                .where('status', '==', 'active')
                .get();
            const activeLoansCount = loansSnap.size;

            const bodyParts = ['Good morning! Here is your Personal OS briefing for today:'];
            if (dueTodayCount > 0) {
                bodyParts.push(`- 📋 You have ${dueTodayCount} task(s) due today.`);
            } else {
                bodyParts.push('- 📋 No tasks due today. Keep it up!');
            }

            if (activeHabitsCount > 0) {
                bodyParts.push(`- 🔁 You have ${activeHabitsCount} active habit(s) to check off.`);
            }

            if (activeLoansCount > 0) {
                bodyParts.push(`- 🤝 You have ${activeLoansCount} active lent loans outstanding.`);
            }

            const bodyText = bodyParts.join('\n');
            const notification = {
                title: '🌅 Daily Summary Briefing',
                body: bodyText,
                tag: 'daily-briefing',
                icon: '/android-icons/android-launchericon-192-192.png',
                badge: '/android-icons/android-launchericon-72-72.png',
                data: { url: '/#dashboard' }
            };

            console.log(`[Scheduler] Sending daily briefing notification to user: ${uid}`);
            let sent = false;
            for (const sub of userSubs) {
                const res = await sendNotificationToSubscription(sub, { notification });
                if (res.success) sent = true;
            }

            if (sent) {
                logNotification(uid, notification.title, notification.body, 'success', notification.tag);
            }
        }
    } catch (err) {
        console.error('[Scheduler] Error sending daily briefings:', err.message);
    }
}

async function sendWeeklySummaries() {
    if (!db) {
        console.log('[Scheduler] Skipped weekly summary: Firestore not connected.');
        return;
    }

    console.log('[Scheduler] Running Weekly Summaries check...');
    const now = new Date();
    
    // Calculate last week's date limit
    const lastWeek = new Date();
    lastWeek.setDate(now.getDate() - 7);
    const lastWeekStr = lastWeek.toISOString().split('T')[0];

    try {
        const allSubs = await getAllActiveSubscriptions();
        const userIds = [...new Set(allSubs.map(s => s.userId))];

        for (const uid of userIds) {
            const userSubs = allSubs.filter(s => s.userId === uid);
            if (userSubs.length === 0) continue;

            // Fetch transactions logged in the last 7 days
            const txSnap = await db.collection('transactions')
                .where('userId', '==', uid)
                .where('date', '>=', lastWeekStr)
                .get();

            let totalIncome = 0;
            let totalExpense = 0;

            txSnap.forEach(doc => {
                const tx = doc.data();
                const amt = parseFloat(tx.amount) || 0;
                if (tx.type === 'income') {
                    totalIncome += amt;
                } else if (tx.type === 'expense') {
                    totalExpense += amt;
                }
            });

            // Fetch completed tasks in the last 7 days
            const completedTasksSnap = await db.collection('reminders')
                .where('userId', '==', uid)
                .where('completed', '==', true)
                .get();
            
            // Filter manually since Firestore compound query is limited and we do client-side dates sorting
            let tasksThisWeek = 0;
            completedTasksSnap.forEach(doc => {
                const t = doc.data();
                if (t.updatedAt && t.updatedAt >= lastWeekStr) {
                    tasksThisWeek++;
                }
            });

            const bodyParts = [
                'Here is your Personal OS Weekly Summary:',
                `💰 Weekly Income: ₹${totalIncome.toLocaleString('en-IN')}`,
                `💸 Weekly Expenses: ₹${totalExpense.toLocaleString('en-IN')}`,
                `✅ Tasks Completed: ${tasksThisWeek}`
            ];

            const bodyText = bodyParts.join('\n');
            const notification = {
                title: '📊 Weekly Summary Report',
                body: bodyText,
                tag: 'weekly-briefing',
                icon: '/android-icons/android-launchericon-192-192.png',
                badge: '/android-icons/android-launchericon-72-72.png',
                data: { url: '/#reports' }
            };

            console.log(`[Scheduler] Sending weekly summary notification to user: ${uid}`);
            let sent = false;
            for (const sub of userSubs) {
                const res = await sendNotificationToSubscription(sub, { notification });
                if (res.success) sent = true;
            }

            if (sent) {
                logNotification(uid, notification.title, notification.body, 'success', notification.tag);
            }
        }
    } catch (err) {
        console.error('[Scheduler] Error sending weekly summaries:', err.message);
    }
}

// ─── CRON SCHEDULER TRIGGERS ──────────────────────────────────────────────────
// Check reminders and bills every 30 minutes
cron.schedule('*/30 * * * *', () => {
    checkRemindersAndBills();
});

// Daily Briefing at 8:00 AM daily
cron.schedule('0 8 * * *', () => {
    sendDailyBriefings();
});

// Weekly Summary at 8:00 PM every Sunday
cron.schedule('0 20 * * 0', () => {
    sendWeeklySummaries();
});

// Express startup log details
app.listen(PORT, () => {
    console.log(`\n🚀 PersonalOS Notification Server running at http://localhost:${PORT}`);
    console.log(`   VAPID Public Key: ${vapidKeys.publicKey}`);
    console.log('   Endpoints:');
    console.log(`   GET    /api/push/vapid-public-key — Get VAPID public key`);
    console.log(`   POST   /api/push/subscribe        — Save active subscription`);
    console.log(`   POST   /api/push/unsubscribe      — Disable active subscription`);
    console.log(`   POST   /api/push/send             — Send targeted push alert`);
    console.log(`   POST   /api/push/send-all         — Broadcast push to all`);
    console.log(`   GET    /api/push/subscriptions    — List user devices`);
    console.log(`   DELETE /api/push/:id              — Remove device subscription`);
    console.log(`   GET    /api/push/history          — View notification logs`);
    console.log('\n⏰ Notification schedulers active:');
    console.log('   - Reminders & Bills: every 30 minutes');
    console.log('   - Daily Briefing: every day at 8:00 AM');
    console.log('   - Weekly Summary: Sundays at 8:00 PM\n');
});
