# Mirai AI API Test Script
# This script tests core endpoints automatically.

$baseUrl = "http://localhost:8000"
$allPassed = $true
$testEmail = "apitest.$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())@example.com"
$testPassword = "TestPass123!"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Mirai AI API Test Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if API is running
Write-Host "1. Testing API Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "API is healthy" -ForegroundColor Green
    Write-Host "   App: $($health.app)" -ForegroundColor Gray
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "API is not running. Start the server first." -ForegroundColor Red
    exit 1
}

# Test 2: Register a new user
Write-Host "2. Registering new user..." -ForegroundColor Yellow
$registerData = @{
    name = "Test User"
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $user = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "User registered successfully" -ForegroundColor Green
    Write-Host "   ID: $($user.id)" -ForegroundColor Gray
    Write-Host "   Name: $($user.name)" -ForegroundColor Gray
    Write-Host "   Email: $($user.email)" -ForegroundColor Gray
    Write-Host ""
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "User already exists, continuing..." -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host "Registration failed: $_" -ForegroundColor Red
        exit 1
    }
}

# Test 3: Login and get token
Write-Host "3. Logging in..." -ForegroundColor Yellow
$loginData = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-Host "Login successful" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Login failed: $_" -ForegroundColor Red
    exit 1
}

# Test 4: Get current user info
Write-Host "4. Getting current user info..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $currentUser = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method GET -Headers $headers
    Write-Host "Got user info" -ForegroundColor Green
    Write-Host "   ID: $($currentUser.id)" -ForegroundColor Gray
    Write-Host "   Name: $($currentUser.name)" -ForegroundColor Gray
    Write-Host "   Email: $($currentUser.email)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Failed to get user info: $_" -ForegroundColor Red
    exit 1
}

# Test 5: Create a job
Write-Host "5. Creating a job..." -ForegroundColor Yellow
$jobData = @{
    company_name = "Google"
    position = "Software Engineer"
    job_description = "Full stack developer position with React and Python"
    location = "Remote"
    salary_range = '$120k - $180k'
    status = "saved"
    notes = "Very interested in this role!"
} | ConvertTo-Json

$headers["Content-Type"] = "application/json"

try {
    $job = Invoke-RestMethod -Uri "$baseUrl/api/jobs" -Method POST -Body $jobData -Headers $headers
    Write-Host "Job created successfully" -ForegroundColor Green
    Write-Host "   ID: $($job.id)" -ForegroundColor Gray
    Write-Host "   Company: $($job.company_name)" -ForegroundColor Gray
    Write-Host "   Position: $($job.position)" -ForegroundColor Gray
    Write-Host "   Status: $($job.status)" -ForegroundColor Gray
    Write-Host ""
    $jobId = $job.id
} catch {
    Write-Host "Failed to create job: $_" -ForegroundColor Red
    exit 1
}

# Test 6: Get all jobs
Write-Host "6. Getting all jobs..." -ForegroundColor Yellow
try {
    $jobs = Invoke-RestMethod -Uri "$baseUrl/api/jobs" -Method GET -Headers $headers
    Write-Host "Retrieved $($jobs.Count) job(s)" -ForegroundColor Green
    foreach ($j in $jobs) {
        Write-Host "   - $($j.company_name) - $($j.position)" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "Failed to get jobs: $_" -ForegroundColor Red
    exit 1
}

# Test 7: Get specific job
Write-Host "7. Getting specific job (ID: $jobId)..." -ForegroundColor Yellow
try {
    $specificJob = Invoke-RestMethod -Uri "$baseUrl/api/jobs/$jobId" -Method GET -Headers $headers
    Write-Host "Got job details" -ForegroundColor Green
    Write-Host "   Company: $($specificJob.company_name)" -ForegroundColor Gray
    Write-Host "   Position: $($specificJob.position)" -ForegroundColor Gray
    Write-Host "   Location: $($specificJob.location)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Failed to get job: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test 8: Update job
Write-Host "8. Updating job status..." -ForegroundColor Yellow
$updateData = @{
    status = "applied"
    notes = "Application submitted successfully!"
} | ConvertTo-Json

try {
    $updatedJob = Invoke-RestMethod -Uri "$baseUrl/api/jobs/$jobId" -Method PUT -Body $updateData -Headers $headers
    Write-Host "Job updated successfully" -ForegroundColor Green
    Write-Host "   New Status: $($updatedJob.status)" -ForegroundColor Gray
    Write-Host "   Notes: $($updatedJob.notes)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Failed to update job: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test 9: Update privacy settings
Write-Host "9. Updating privacy settings..." -ForegroundColor Yellow
try {
    $privacy = Invoke-RestMethod -Uri "$baseUrl/api/users/privacy-settings?data_sharing=true" -Method PUT -Headers $headers
    Write-Host "Privacy settings updated" -ForegroundColor Green
    Write-Host "   Data Sharing: $($privacy.data_sharing_consent)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Failed to update privacy: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test 9b: Heartbeat
Write-Host "9b. Sending heartbeat..." -ForegroundColor Yellow
try {
    $heartbeat = Invoke-RestMethod -Uri "$baseUrl/api/users/heartbeat" -Method POST -Headers $headers
    Write-Host "Heartbeat OK" -ForegroundColor Green
    Write-Host "   Last Seen: $($heartbeat.last_seen_at)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Failed heartbeat: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test 10: Admin summary
Write-Host "10. Fetching admin summary..." -ForegroundColor Yellow
$adminUsername = $env:ADMIN_TEST_USERNAME
$adminPassword = $env:ADMIN_TEST_PASSWORD
if (-not $adminUsername) { $adminUsername = "admin" }
if (-not $adminPassword) { $adminPassword = "ChangeThisAdminPassword123!" }

try {
    $adminLoginBody = @{
        username = $adminUsername
        password = $adminPassword
    } | ConvertTo-Json
    $adminLogin = Invoke-RestMethod -Uri "$baseUrl/api/admin/auth/login" -Method POST -Body $adminLoginBody -ContentType "application/json"
    $adminHeaders = @{
        "Authorization" = "Bearer $($adminLogin.access_token)"
    }

    $adminSummary = Invoke-RestMethod -Uri "$baseUrl/api/admin/summary" -Method GET -Headers $adminHeaders
    Write-Host "Admin summary OK" -ForegroundColor Green
    Write-Host "   Users: $($adminSummary.users_count)" -ForegroundColor Gray
    Write-Host "   Jobs: $($adminSummary.jobs_count)" -ForegroundColor Gray
    Write-Host "   Sessions (24h): $($adminSummary.sessions_last_24h)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Failed to fetch admin summary: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test 11: Admin users list
Write-Host "11. Fetching admin users list..." -ForegroundColor Yellow
try {
    $adminUsers = Invoke-RestMethod -Uri "$baseUrl/api/admin/users?limit=5" -Method GET -Headers $adminHeaders
    $returned = if ($adminUsers.users -is [array]) { $adminUsers.users.Count } else { 0 }
    Write-Host "Admin users list OK" -ForegroundColor Green
    Write-Host "   Total Users: $($adminUsers.total_users)" -ForegroundColor Gray
    Write-Host "   Active Users: $($adminUsers.active_users)" -ForegroundColor Gray
    Write-Host "   Returned: $returned" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Failed to fetch admin users list: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test 11b: Force logout current test user
Write-Host "11b. Forcing logout for current test user..." -ForegroundColor Yellow
try {
    $force = Invoke-RestMethod -Uri "$baseUrl/api/admin/users/$($currentUser.id)/force-logout" -Method POST -Headers $adminHeaders
    Write-Host "Force logout OK" -ForegroundColor Green
    Write-Host "   User ID: $($force.user_id)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Failed to force logout user: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test 11c: Force logout all users
Write-Host "11c. Forcing logout for all users..." -ForegroundColor Yellow
try {
    $forceAll = Invoke-RestMethod -Uri "$baseUrl/api/admin/users/force-logout-all" -Method POST -Headers $adminHeaders
    Write-Host "Force logout all users OK" -ForegroundColor Green
    Write-Host "   Affected Users: $($forceAll.affected_users)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Failed to force logout all users: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test 12: Admin audit logs
Write-Host "12. Fetching admin audit logs..." -ForegroundColor Yellow
try {
    $audit = Invoke-RestMethod -Uri "$baseUrl/api/admin/audit-logs?limit=5" -Method GET -Headers $adminHeaders
    $auditCount = if ($audit.logs -is [array]) { $audit.logs.Count } else { 0 }
    Write-Host "Admin audit logs OK" -ForegroundColor Green
    Write-Host "   Total Logs: $($audit.total_logs)" -ForegroundColor Gray
    Write-Host "   Returned: $auditCount" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Failed to fetch admin audit logs: $_" -ForegroundColor Red
    $allPassed = $false
}

# Summary
Write-Host "=====================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "  All Tests Complete!" -ForegroundColor Green
} else {
    Write-Host "  Tests Completed with Failures" -ForegroundColor Red
}
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
if ($allPassed) {
    Write-Host "Your API is working perfectly!" -ForegroundColor Green
} else {
    Write-Host "Some tests failed. Review the errors above." -ForegroundColor Red
}
Write-Host ""
Write-Host "Token for manual testing:" -ForegroundColor Yellow
Write-Host $token -ForegroundColor White
Write-Host ""
Write-Host "To use in Swagger UI or other tools:" -ForegroundColor Yellow
Write-Host "Authorization: Bearer $token" -ForegroundColor White
Write-Host ""
