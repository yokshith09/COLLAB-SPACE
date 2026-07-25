# PowerShell script to run the app
# Run this script with: powershell -File run-app.ps1

$ErrorActionPreference = "Stop"

Write-Host "Starting CollabSpace..."

# Run the app
npm run dev --webpack

Write-Host "App stopped."