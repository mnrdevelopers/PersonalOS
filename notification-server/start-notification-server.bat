@echo off
:: PersonalOS Notification Server — Windows Startup Script
:: This script starts the notification server via PM2 on boot.
:: Place a shortcut to this file in Windows Startup folder:
:: %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

echo [PersonalOS] Starting Notification Server...
cd /d "D:\PROJECTS\PersonalOS\notification-server"
pm2 start server.js --name "personalos-notifications" --restart-delay=5000 --max-restarts=10 2>nul || pm2 restart personalos-notifications
pm2 save --force
echo [PersonalOS] Notification Server started. Check http://localhost:3001/api/push/vapid-public-key
