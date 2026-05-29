$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Url = "http://127.0.0.1:5173/"
$IsRunning = $false

try {
  $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 1
  $IsRunning = $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
} catch {
  $IsRunning = $false
}

if (-not $IsRunning) {
  Start-Process -FilePath "npm.cmd" `
    -ArgumentList @("run", "dev", "--", "--host", "127.0.0.1", "--port", "5173") `
    -WorkingDirectory $ProjectDir `
    -WindowStyle Minimized

  Start-Sleep -Seconds 2
}

Start-Process $Url
