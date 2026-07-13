@echo off
:: PersonalOS WA Reminder — Windows Startup Script
:: This script starts the WA server via PM2 on boot.
:: Place a shortcut to this file in Windows Startup folder:
:: %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

echo [PersonalOS] Starting WhatsApp Reminder Server...
cd /d "D:\PROJECTS\PersonalOS\wa-server"
pm2 start server.js --name "personalos-wa-reminder" --restart-delay=5000 --max-restarts=10 2>nul || pm2 restart personalos-wa-reminder
pm2 save --force
echo [PersonalOS] WA Reminder Server started. Check http://localhost:3001/status
