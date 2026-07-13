# PersonalOS WhatsApp Auto-Reminder Server

A local Node.js server that automatically sends WhatsApp reminders for your lent loans using **whatsapp-web.js**.

## Prerequisites

- Node.js 18+
- A Firebase **service account key** (see below)

## Setup

### 1. Get your Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/) → your project
2. **Project Settings** → **Service Accounts** tab
3. Click **Generate new private key** → download JSON
4. **Rename** the file to `serviceAccountKey.json`
5. Place it in this `wa-server/` folder

### 2. Install dependencies

```bash
cd wa-server
npm install
```

> Note: `whatsapp-web.js` installs Chromium (~150MB) via Puppeteer. This is normal.

### 3. Run the server

```bash
node server.js
```

A QR code will appear in the terminal. **Scan it with WhatsApp** (Settings → Linked Devices → Link a Device). The session is saved — you only need to scan once.

### 4. Keep it running

For Windows, you can run it as a background task on startup:

```batch
# Create a scheduled task in Windows Task Scheduler
# Action: Start a Program → node.exe
# Arguments: "D:\PROJECTS\PersonalOS\wa-server\server.js"
# Trigger: At log on
```

Or install [PM2](https://pm2.keymetrics.io/) for process management:
```bash
npm install -g pm2
pm2 start server.js --name personalos-wa
pm2 startup   # auto-start on boot
pm2 save
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/status` | Connection status + QR code (base64 PNG) |
| POST | `/test-message` | Send a test WhatsApp message |
| POST | `/run-now` | Trigger reminder job immediately |
| GET | `/log` | View reminder send history |

## How Reminders Work

1. Every **30 minutes**, the scheduler checks all active `lent` loans with `reminderEnabled = true`
2. For each loan, it checks:
   - Is today within the reminder window? (`dueDate - daysBefore` ≤ today ≤ `dueDate`)
   - Has the daily send limit been reached? (`timesPerDay`)
3. If conditions are met → sends WhatsApp message to the borrower's number

## Message Template

```
Hi *[Name]* 👋

This is a friendly reminder about your outstanding loan repayment.

💰 *Outstanding:* ₹[Amount]
📅 *Due Date:* [Date]
📋 *Ref:* [Context if set]

Please arrange the payment at your earliest convenience. Thank you! 🙏

— PersonalOS Auto-Reminder
```

## Security Notes

- `serviceAccountKey.json` is **gitignored** — never commit it
- The server only reads Firestore; it never writes on its own
- The WhatsApp session is stored locally in `.wwebjs_auth/`
