# PowerShell script to check and start the app
# Run this script with: powershell -File check-and-run.ps1

$ErrorActionPreference = "Stop"

# Check if node process is running for this project
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
$appRunning = $false

foreach ($proc in $nodeProcesses) {
    try {
        $path = $proc.Path
        if ($path -and $path.Contains("COLLAB-SPACE")) {
            $appRunning = $true
            Write-Host "App is already running (PID: $($proc.Id))"
            break
        }
    } catch {
        # Ignore errors
    }
}

if (-not $appRunning) {
    Write-Host "Starting CollabSpace..."
    # Start the app in a new window
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "cd /d E:\New folder\COLLAB-SPACE && npm run dev --webpack" -WindowStyle Normal
    Write-Host "App started in a new window"
} else {
    Write-Host "App is already running"
}