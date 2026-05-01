#Requires -Version 5.1
<#
  جلب أسعار STB (ACHAT) وتسجيلها عبر RPC capture_exchange_rate_attempt.
  الاستخدام:
    .\Run-StbRateAttempt.ps1 -Attempt 1
  جدولة Task Scheduler (مثال):
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "D:\Projects\aaea_2026_cursor\scripts\windows\Run-StbRateAttempt.ps1" -Attempt 1
#>
param(
  [Parameter(Mandatory = $true)]
  [ValidateRange(1, 3)]
  [int]$Attempt
)

$ErrorActionPreference = "Stop"

$windowsDir = $PSScriptRoot
$projectRoot = (Resolve-Path (Join-Path $windowsDir "..\..")).Path
$secretsPath = Join-Path $windowsDir "stb-rates-secrets.ps1"

if (Test-Path -LiteralPath $secretsPath) {
  . $secretsPath
}

if (-not $env:SUPABASE_URL -or -not $env:SUPABASE_SERVICE_ROLE_KEY) {
  Write-Error @"
لم يُضبط SUPABASE_URL أو SUPABASE_SERVICE_ROLE_KEY.
- إمّا ضبطهما كمتغيرات نظام/مستخدم في Windows
- أو انسخ stb-rates-secrets.example.ps1 إلى stb-rates-secrets.ps1 واملأ القيم.
"@
}

$scriptPath = Join-Path $projectRoot "scripts\fetch_stb_achat_rates.py"
if (-not (Test-Path -LiteralPath $scriptPath)) {
  Write-Error "لم يُعثر على: $scriptPath"
}

$python = $null
foreach ($cmd in @("python", "py")) {
  try {
    $c = Get-Command $cmd -ErrorAction Stop
    $python = $c.Source
    break
  } catch {
    continue
  }
}

if (-not $python) {
  Write-Error "لم يُعثر على Python. ثبّت Python أو أضفه إلى PATH."
}

& $python $scriptPath --attempt $Attempt
exit $LASTEXITCODE
