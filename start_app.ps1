# Exit on error
$ErrorActionPreference = "Stop"

Write-Host "--- Starting Application Setup and Run ---`n"

# --- Backend Setup ---
Write-Host "--- 1. Installing Backend Dependencies (backend/) ---"
Set-Location -Path "./backend"
npm install
Write-Host "--- Backend Dependencies Installed ---"
Set-Location -Path ".."

# --- Frontend Setup and Build ---
Write-Host "`n--- 2. Installing Frontend Dependencies and Building (frontend/) ---"
Set-Location -Path "./frontend"
npm install
npm install selenium-webdriver@latest
npm install selenium-webdriver chromedriver
npm run build
Write-Host "--- Frontend Built Successfully ---"
Set-Location -Path ".."

# --- Start Backend Server ---
Write-Host "`n--- 3. Starting Backend Server (http://localhost:3000) ---"
Start-Process -FilePath "npm.cmd" -ArgumentList "start" -WorkingDirectory "./backend" -NoNewWindow
Start-Sleep -Seconds 10

# --- Run UI Automation Tests ---
Write-Host "`n--- 4. Running UI & API Automation Tests (features/) ---"
Set-Location -Path "./features"
npm install
npm test
Write-Host "--- UI & API Automation Tests Completed ---"
Set-Location -Path ".."

# --- Final Message ---
Write-Host "`n--- Application Setup and Run Completed ---"
Write-Host "Backend server should be running at http://localhost:3000"
