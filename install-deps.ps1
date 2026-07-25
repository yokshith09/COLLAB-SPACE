# PowerShell script to install dependencies
# Run this script with: powershell -File install-deps.ps1

$ErrorActionPreference = "Stop"

Write-Host "Installing dependencies..."

# Install dependencies
npm install --save-dev @types/node @tailwindcss/postcss postcss tailwindcss
npm install --save @radix-ui/react-card
npm install resend

Write-Host "Dependencies installed successfully!"