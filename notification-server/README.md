# PersonalOS Notification Server

A lightweight Node.js service that manages Web Push (VAPID) notifications and background scheduling (reminders, credit card bills, daily briefings, weekly summaries) for PersonalOS.

## Setup & Installation

1. **Service Account Key**:
   - Go to your Firebase Console → Project Settings → Service accounts.
   - Click "Generate new private key".
   - Save the JSON file inside this directory as `serviceAccountKey.json`.

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Server**:
   ```bash
   npm start
   ```
   On first boot, the server will automatically generate VAPID public and private keys and save them to `.env`.

## Endpoints

- `GET  /api/push/vapid-public-key` - Get the VAPID Public Key for client subscription.
- `POST /api/push/subscribe`        - Subscribe a device (passes Firebase ID Token).
- `POST /api/push/unsubscribe`      - Unsubscribe a device (passes Firebase ID Token).
- `POST /api/push/send`             - Send notification to specific user or subscription.
- `POST /api/push/send-all`         - Broadcast notification to all active devices.
- `GET  /api/push/subscriptions`    - List all subscriptions for the authenticated user.
- `DELETE /api/push/:id`            - Delete subscription by Firestore ID.
- `GET  /api/push/history`          - Get delivery log of notifications.
