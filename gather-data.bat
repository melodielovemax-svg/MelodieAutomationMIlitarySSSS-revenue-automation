@echo off
cd C:\MelodieCLI\Melodiespark-MVP
echo ============================================
echo MELODIESPARK - Revenue Data Gathering
echo ============================================
echo.

echo [1/5] Fetching Treasury Balance...
powershell -Command "Invoke-WebRequest http://localhost:3001/api/treasury/balance -Method GET | ConvertFrom-Json | Select-Object balance, currency | Out-File treasury-balance.json"
type treasury-balance.json

echo.
echo [2/5] Fetching Transaction History...
powershell -Command "Invoke-WebRequest http://localhost:3001/api/transactions -Method GET | ConvertFrom-Json | Select-Object @{n='Type';e={$_.type}}, @{n='Amount';e={$_.amount/100}}, @{n='Currency';e={$_.currency}}, @{n='Date';e={$_.timestamp}} | Sort-Object Date | Out-File treasury-history.json"
type treasury-history.json

echo.
echo [3/5] Fetching Subscription Status...
powershell -Command "Invoke-WebRequest http://localhost:3001/api/subscriptions -Method GET | ConvertFrom-Json | Select-Object subscription_id, status, plan_type, start_date, current_period_end | Out-File subs-status.json"
type subs-status.json

echo.
echo [4/5] Fetching Karma/Power Points...
powershell -Command "Invoke-WebRequest http://localhost:3001/api/karma/balance -Method GET | ConvertFrom-Json | Select-Object karma_balance, total_earned, total_spent, level | Out-File karma-status.json"
type karma-status.json

echo.
echo [5/5] Fetching MA Token Balance...
powershell -Command "Invoke-WebRequest http://localhost:3001/api/tokens/ma-balance -Method GET | ConvertFrom-Json | Select-Object ma_balance, total_earned, total_spent | Out-File ma-tokens.json"
type ma-tokens.json

echo.
echo ============================================
echo DATA GATHERING COMPLETE
echo ============================================
echo.
echo Treasury Balance: type treasury-balance.json
echo Transaction History: type treasury-history.json
echo Subscription Status: type subs-status.json
echo Karma Status: type karma-status.json
echo MA Token Balance: type ma-tokens.json
echo.
pause