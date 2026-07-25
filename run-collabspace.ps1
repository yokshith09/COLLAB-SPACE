# PowerShell script to run CollabSpace
# Run with: powershell -ExecutionPolicy Bypass -File run-collabspace.ps1

$ErrorActionPreference = "Stop"

Write-Host "Starting CollabSpace..." -ForegroundColor Green

# Change to project directory
Set-Location -LiteralPath "E:\New folder\COLLAB-SPACE"

# Run the app
npm run dev --webpack

Write-Host "App stopped." -ForegroundColor Yellow