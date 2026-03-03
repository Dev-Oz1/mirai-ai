# Frontend Integration Test Script
# Validates frontend-facing API flows and optional build.

$ErrorActionPreference = 'Stop'

$envFile = Join-Path $PSScriptRoot '.env'
$viteApiUrl = 'http://localhost:8000'
if (Test-Path $envFile) {
  $line = Get-Content $envFile | Where-Object { $_ -match '^VITE_API_URL=' } | Select-Object -First 1
  if ($line) {
    $viteApiUrl = $line.Split('=', 2)[1].Trim()
  }
}

$base = $viteApiUrl.TrimEnd('/')
if (-not $base.EndsWith('/api')) {
  $apiBase = "$base/api"
} else {
  $apiBase = $base
  $base = $base.Substring(0, $base.Length - 4)
}

$allPassed = $true
$generatedEmail = "frontendtest.$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())@example.com"
$generatedPassword = "TestPass123!"

Write-Host '=====================================' -ForegroundColor Cyan
Write-Host '  Frontend Integration Test Script' -ForegroundColor Cyan
Write-Host '=====================================' -ForegroundColor Cyan
Write-Host "API Base: $apiBase" -ForegroundColor Gray
Write-Host ''

# 1) API health
Write-Host '1. Checking API health...' -ForegroundColor Yellow
try {
  $health = Invoke-RestMethod -Uri "$base/health" -Method GET
  Write-Host "Health OK: $($health.status)" -ForegroundColor Green
} catch {
  Write-Host "Health failed: $_" -ForegroundColor Red
  exit 1
}
Write-Host ''

# 2) Login with test user
Write-Host '2. Logging in (frontend style JSON)...' -ForegroundColor Yellow
$testEmail = $env:FRONTEND_TEST_EMAIL
$testPassword = $env:FRONTEND_TEST_PASSWORD
if (-not $testEmail) { $testEmail = $generatedEmail }
if (-not $testPassword) { $testPassword = $generatedPassword }

if (-not $env:FRONTEND_TEST_EMAIL) {
  $registerBody = @{
    name = 'Frontend Test User'
    email = $testEmail
    password = $testPassword
  } | ConvertTo-Json
  try {
    Invoke-RestMethod -Uri "$apiBase/auth/register" -Method POST -Body $registerBody -ContentType 'application/json' | Out-Null
  } catch {
    # Ignore registration failures here; login step is the source of truth.
  }
}

$loginBody = @{ email = $testEmail; password = $testPassword } | ConvertTo-Json
try {
  $login = Invoke-RestMethod -Uri "$apiBase/auth/login" -Method POST -Body $loginBody -ContentType 'application/json'
  $token = $login.access_token
  Write-Host 'Login OK' -ForegroundColor Green
} catch {
  Write-Host "Login failed: $_" -ForegroundColor Red
  exit 1
}
Write-Host ''

$headers = @{ Authorization = "Bearer $token" }

# 3) Fetch current user
Write-Host '3. Fetching /auth/me...' -ForegroundColor Yellow
try {
  $me = Invoke-RestMethod -Uri "$apiBase/auth/me" -Method GET -Headers $headers
  Write-Host "User OK: $($me.email)" -ForegroundColor Green
} catch {
  Write-Host "auth/me failed: $_" -ForegroundColor Red
  $allPassed = $false
}
Write-Host ''

# 4) Fetch jobs list
Write-Host '4. Fetching /jobs...' -ForegroundColor Yellow
try {
  $jobs = Invoke-RestMethod -Uri "$apiBase/jobs" -Method GET -Headers $headers
  $count = if ($jobs -is [array]) { $jobs.Count } else { 1 }
  Write-Host "Jobs OK: count=$count" -ForegroundColor Green
} catch {
  Write-Host "jobs failed: $_" -ForegroundColor Red
  $allPassed = $false
}
Write-Host ''

# 5) Session info
Write-Host '5. Fetching /users/session-info...' -ForegroundColor Yellow
try {
  $sessionInfo = Invoke-RestMethod -Uri "$apiBase/users/session-info" -Method GET -Headers $headers
  $sessionCount = if ($sessionInfo.recent_sessions -is [array]) { $sessionInfo.recent_sessions.Count } else { 0 }
  Write-Host "Session info OK: scope=$($sessionInfo.current_ip_scope), recent=$sessionCount" -ForegroundColor Green
} catch {
  Write-Host "session-info failed: $_" -ForegroundColor Red
  $allPassed = $false
}
Write-Host ''

# 5b) Heartbeat
Write-Host '5b. Sending /users/heartbeat...' -ForegroundColor Yellow
try {
  $hb = Invoke-RestMethod -Uri "$apiBase/users/heartbeat" -Method POST -Headers $headers
  Write-Host "Heartbeat OK: last_seen=$($hb.last_seen_at)" -ForegroundColor Green
} catch {
  Write-Host "heartbeat failed: $_" -ForegroundColor Red
  $allPassed = $false
}
Write-Host ''

# 6) Admin summary (optional; expects 403 for non-admin)
Write-Host '6. Fetching /admin/summary...' -ForegroundColor Yellow
$adminUsername = $env:ADMIN_TEST_USERNAME
$adminPassword = $env:ADMIN_TEST_PASSWORD
if (-not $adminUsername) { $adminUsername = 'admin' }
if (-not $adminPassword) { $adminPassword = 'ChangeThisAdminPassword123!' }

$adminHeaders = $null
try {
  $adminLoginBody = @{ username = $adminUsername; password = $adminPassword } | ConvertTo-Json
  $adminLogin = Invoke-RestMethod -Uri "$apiBase/admin/auth/login" -Method POST -Body $adminLoginBody -ContentType 'application/json'
  $adminHeaders = @{ Authorization = "Bearer $($adminLogin.access_token)" }
  $admin = Invoke-RestMethod -Uri "$apiBase/admin/summary" -Method GET -Headers $adminHeaders
  Write-Host "Admin summary OK: users=$($admin.users_count)" -ForegroundColor Green
} catch {
  Write-Host "admin summary failed: $_" -ForegroundColor Red
  $allPassed = $false
}
Write-Host ''

# 7) Admin users list
Write-Host '7. Fetching /admin/users...' -ForegroundColor Yellow
try {
  if (-not $adminHeaders) { throw 'Admin token missing' }
  $adminUsers = Invoke-RestMethod -Uri "$apiBase/admin/users?limit=5" -Method GET -Headers $adminHeaders
  $uCount = if ($adminUsers.users -is [array]) { $adminUsers.users.Count } else { 0 }
  Write-Host "Admin users OK: total=$($adminUsers.total_users), returned=$uCount" -ForegroundColor Green
} catch {
  Write-Host "admin users failed: $_" -ForegroundColor Red
  $allPassed = $false
}
Write-Host ''

# 7b) Admin audit logs
Write-Host '7b. Fetching /admin/audit-logs...' -ForegroundColor Yellow
try {
  if (-not $adminHeaders) { throw 'Admin token missing' }
  $audit = Invoke-RestMethod -Uri "$apiBase/admin/audit-logs?limit=5" -Method GET -Headers $adminHeaders
  $count = if ($audit.logs -is [array]) { $audit.logs.Count } else { 0 }
  Write-Host "Admin audit logs OK: total=$($audit.total_logs), returned=$count" -ForegroundColor Green
} catch {
  Write-Host "admin audit logs failed: $_" -ForegroundColor Red
  $allPassed = $false
}
Write-Host ''

# 8) OAuth provider start URL checks
foreach ($provider in @('google', 'github')) {
  Write-Host "8.$provider Checking OAuth start for $provider..." -ForegroundColor Yellow
  try {
    $redirect = [uri]::EscapeDataString('http://localhost:5173/auth/oauth/callback')
    $resp = Invoke-RestMethod -Uri "$apiBase/auth/oauth/$provider/start?redirect_uri=$redirect" -Method GET
    if ($resp.auth_url) {
      Write-Host "$provider OAuth start OK" -ForegroundColor Green
    } else {
      Write-Host "$provider OAuth start returned no auth_url" -ForegroundColor Red
      $allPassed = $false
    }
  } catch {
    $msg = $_.ErrorDetails.Message
    if ($msg -match 'not configured') {
      Write-Host "$provider OAuth not configured (expected until secrets are set)." -ForegroundColor Yellow
    } else {
      Write-Host "$provider OAuth check failed: $_" -ForegroundColor Red
      $allPassed = $false
    }
  }
}
Write-Host ''

# 9) Optional frontend build check
Write-Host '9. Running frontend build...' -ForegroundColor Yellow
try {
  npm run build | Out-Null
  if ($LASTEXITCODE -eq 0) {
    Write-Host 'Frontend build OK' -ForegroundColor Green
  } else {
    Write-Host "Frontend build failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    $allPassed = $false
  }
} catch {
  Write-Host "Frontend build failed: $_" -ForegroundColor Red
  $allPassed = $false
}
Write-Host ''

Write-Host '=====================================' -ForegroundColor Cyan
if ($allPassed) {
  Write-Host '  Frontend Tests Complete (PASS)' -ForegroundColor Green
} else {
  Write-Host '  Frontend Tests Complete (WITH ISSUES)' -ForegroundColor Red
}
Write-Host '=====================================' -ForegroundColor Cyan
