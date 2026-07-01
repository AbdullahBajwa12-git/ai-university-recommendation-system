<#
  test-smoke.ps1 — quick smoke test for the AI University Recommendation System.

  Verifies the core demo flows against the local Docker stack. Safe and read-only
  except for creating one throwaway student account and writing one test value to
  that account's profile.

  Usage:
    powershell -ExecutionPolicy Bypass -File scripts\test-smoke.ps1

  Optional environment variables:
    RUN_AI_TESTS=1                      also exercise the OpenAI-backed endpoints (costs tokens)
    ADMIN_EMAIL / ADMIN_PASSWORD        also test the protected admin endpoints

  Exit code 0 = all required checks passed, 1 = at least one required check failed.
#>

param(
    [string]$ApiBase = "http://localhost:8000/api/v1",
    [string]$FrontendUrl = "http://localhost:5173"
)

$script:pass = 0
$script:fail = 0
$script:failed = @()
$script:token = $null
$script:authHeader = @{}

function Step([string]$name, [scriptblock]$action) {
    try {
        & $action
        Write-Host ("[PASS] " + $name) -ForegroundColor Green
        $script:pass++
    } catch {
        Write-Host ("[FAIL] " + $name + "  ->  " + $_.Exception.Message) -ForegroundColor Red
        $script:fail++
        $script:failed += $name
    }
}

function Skip([string]$name, [string]$why) {
    Write-Host ("[SKIP] " + $name + "  (" + $why + ")") -ForegroundColor Yellow
}

Write-Host "==== Smoke test: AI University Recommendation System ====" -ForegroundColor Cyan
Write-Host ("API base: " + $ApiBase)
Write-Host ""

# 1. Docker containers running
Step "Docker containers running (backend, frontend, mongodb)" {
    $names = docker ps --format "{{.Names}}"
    foreach ($c in @("backend_fyp", "frontend_fyp", "mongodb_fyp")) {
        if ($names -notcontains $c) { throw "$c is not running" }
    }
}

# 2. Backend responds
Step "Backend /openapi.json responds (200)" {
    $r = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:8000/openapi.json" -TimeoutSec 15
    if ($r.StatusCode -ne 200) { throw "status $($r.StatusCode)" }
}

# 3. Frontend responds
Step "Frontend root responds (200)" {
    $r = Invoke-WebRequest -UseBasicParsing -Uri $FrontendUrl -TimeoutSec 15
    if ($r.StatusCode -ne 200) { throw "status $($r.StatusCode)" }
}

# 4. Register a throwaway student
$stamp = (Get-Date).ToString("yyyyMMddHHmmss")
$email = "smoke_$stamp@example.com"
Step "Register throwaway student ($email)" {
    $body = @{ email = $email; full_name = "Smoke Test"; password = "Passw0rd!123" } | ConvertTo-Json
    $resp = Invoke-RestMethod -Uri "$ApiBase/auth/register" -Method Post -ContentType "application/json" -Body $body
    if (-not $resp.access_token) { throw "no access_token returned" }
    $script:token = $resp.access_token
    $script:authHeader = @{ Authorization = "Bearer $($script:token)" }
    Write-Host ("       token acquired (length " + $script:token.Length + ")") -ForegroundColor DarkGray
}

# 5. GET /auth/me
Step "GET /auth/me returns the student" {
    $me = Invoke-RestMethod -Uri "$ApiBase/auth/me" -Headers $script:authHeader
    if ($me.role -ne "student") { throw "expected role student, got $($me.role)" }
}

# 6. GET /student/profile
Step "GET /student/profile" {
    Invoke-RestMethod -Uri "$ApiBase/student/profile" -Headers $script:authHeader | Out-Null
}

# 7. PUT /student/profile with a small test value
Step "PUT /student/profile (cgpa=3.5) persists" {
    $body = @{ cgpa = 3.5 } | ConvertTo-Json
    Invoke-RestMethod -Uri "$ApiBase/student/profile" -Method Put -Headers $script:authHeader -ContentType "application/json" -Body $body | Out-Null
    $check = Invoke-RestMethod -Uri "$ApiBase/student/profile" -Headers $script:authHeader
    if ([double]$check.cgpa -ne 3.5) { throw "cgpa did not persist (got $($check.cgpa))" }
}

# 8. GET /universities
Step "GET /universities returns a list" {
    $unis = Invoke-RestMethod -Uri "$ApiBase/universities"
    if ($null -eq $unis) { throw "no response" }
}

# 8b. GET /scholarships (public, active only)
Step "GET /scholarships returns a list" {
    $sch = Invoke-RestMethod -Uri "$ApiBase/scholarships"
    if ($null -eq $sch) { throw "no response" }
}

# 11. GET /recommendations/history
Step "GET /recommendations/history" {
    Invoke-RestMethod -Uri "$ApiBase/recommendations/history" -Headers $script:authHeader | Out-Null
}

# 12. GET /universities/saved
Step "GET /universities/saved" {
    Invoke-RestMethod -Uri "$ApiBase/universities/saved" -Headers $script:authHeader | Out-Null
}

# 9 & 10. Optional OpenAI-backed tests
if ($env:RUN_AI_TESTS -eq "1") {
    Step "POST /ai/chat (OpenAI)" {
        $body = @{ message = "Reply with the single word OK" } | ConvertTo-Json
        $r = Invoke-RestMethod -Uri "$ApiBase/ai/chat" -Method Post -Headers $script:authHeader -ContentType "application/json" -Body $body
        if (-not $r.reply) { throw "no reply" }
    }
    Step "POST /ai/recommend (OpenAI)" {
        $body = @{ cgpa = 3.5; intended_major = "Computer Science"; degree_applying_for = "MS" } | ConvertTo-Json
        $r = Invoke-RestMethod -Uri "$ApiBase/ai/recommend" -Method Post -Headers $script:authHeader -ContentType "application/json" -Body $body
        if (-not $r.session_id) { throw "no session_id" }
    }
} else {
    Skip "AI chat / recommend" "set RUN_AI_TESTS=1 to run (uses OpenAI credits)"
}

# 13. Admin endpoints (only if credentials supplied)
if ($env:ADMIN_EMAIL -and $env:ADMIN_PASSWORD) {
    $adminToken = $null
    Step "Admin login" {
        $body = @{ email = $env:ADMIN_EMAIL; password = $env:ADMIN_PASSWORD } | ConvertTo-Json
        $resp = Invoke-RestMethod -Uri "$ApiBase/auth/login" -Method Post -ContentType "application/json" -Body $body
        if (-not $resp.access_token) { throw "no admin token" }
        if ($resp.user.role -ne "admin") { throw "account is not an admin (role=$($resp.user.role))" }
        $script:adminToken = $resp.access_token
    }
    Step "Admin GET /admin/stats returns real counts" {
        $h = @{ Authorization = "Bearer $($script:adminToken)" }
        $s = Invoke-RestMethod -Uri "$ApiBase/admin/stats" -Headers $h
        if ($null -eq $s.total_users) { throw "missing total_users" }
        Write-Host ("       users=" + $s.total_users + " students=" + $s.total_students + " universities=" + $s.total_universities) -ForegroundColor DarkGray
    }
    Step "Admin GET /admin/users hides password_hash" {
        $h = @{ Authorization = "Bearer $($script:adminToken)" }
        $u = Invoke-RestMethod -Uri "$ApiBase/admin/users" -Headers $h
        $first = @($u)[0]
        if ($first -and ($first.PSObject.Properties.Name -contains "password_hash")) { throw "password_hash leaked" }
    }
    Step "Student is blocked from /admin/stats (expect 403)" {
        $blocked = $false
        try {
            Invoke-RestMethod -Uri "$ApiBase/admin/stats" -Headers $script:authHeader | Out-Null
        } catch {
            $code = $_.Exception.Response.StatusCode.value__
            if ($code -eq 403) { $blocked = $true } else { throw "expected 403, got $code" }
        }
        if (-not $blocked) { throw "student was NOT blocked" }
    }
    Step "Admin GET /admin/scholarships returns a list" {
        $h = @{ Authorization = "Bearer $($script:adminToken)" }
        $s = Invoke-RestMethod -Uri "$ApiBase/admin/scholarships" -Headers $h
        if ($null -eq $s) { throw "no response" }
    }
    Step "Student is blocked from /admin/scholarships (expect 403)" {
        $blocked = $false
        try {
            Invoke-RestMethod -Uri "$ApiBase/admin/scholarships" -Headers $script:authHeader | Out-Null
        } catch {
            $code = $_.Exception.Response.StatusCode.value__
            if ($code -eq 403) { $blocked = $true } else { throw "expected 403, got $code" }
        }
        if (-not $blocked) { throw "student was NOT blocked" }
    }
} else {
    Skip "Admin endpoints" "set ADMIN_EMAIL and ADMIN_PASSWORD to test"
}

# Summary
Write-Host ""
Write-Host "==== SUMMARY ====" -ForegroundColor Cyan
Write-Host ("PASS: " + $script:pass + "   FAIL: " + $script:fail)
if ($script:fail -gt 0) {
    Write-Host ("Failed checks: " + ($script:failed -join ", ")) -ForegroundColor Red
    Write-Host "If backend/frontend is not running, start it with:  docker compose up -d --build" -ForegroundColor Yellow
    exit 1
}
Write-Host "All required checks passed." -ForegroundColor Green
exit 0
