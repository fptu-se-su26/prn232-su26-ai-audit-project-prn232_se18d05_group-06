$ErrorActionPreference = "Stop"

# Load assembly
Add-Type -AssemblyName System.Net.Http

# Helpers to run SQL
function Run-Sql {
    param([string]$query)
    $output = sqlcmd -S "(localdb)\mssqllocaldb" -d "SmartLogAI" -Q $query -W 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "SQL execution failed with code $LASTEXITCODE. Output: $output"
    }
    return $output
}

# 1. Login to get JWT Token
$loginUrl = "http://localhost:5200/api/auth/login"
$loginBody = @{
    username = "admin"
    password = "Admin@123"
} | ConvertTo-Json

Write-Host "Logging in to get JWT token..."
try {
    $loginResponse = Invoke-WebRequest -Uri $loginUrl -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
    $jsonResp = $loginResponse.Content | ConvertFrom-Json
    $token = $jsonResp.token
    if (-not $token) {
        $token = $jsonResp.Token
    }
} catch {
    Write-Host "Login failed: $_"
    exit 1
}
Write-Host "Logged in successfully. Token length: $($token.Length)"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. Reset database state helper
function Reset-Database {
    Run-Run-Sql-Wrapper @"
SET NOCOUNT ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;

DELETE FROM SlotBookings WHERE OrderID >= 5;
DELETE FROM Invoices WHERE OrderID >= 5;
DELETE FROM ServiceCharges WHERE OrderID >= 5;
DELETE FROM Waybills WHERE OrderID >= 5;
DELETE FROM OutboundLines;
DELETE FROM OutboundOrders;
DELETE FROM Complaints WHERE OrderID >= 5;
DELETE FROM ServiceFeedback WHERE OrderID >= 5;
DELETE FROM OrderLines WHERE OrderID >= 5;
DELETE FROM ServiceOrders WHERE OrderID >= 5;

-- Reset Inventory quantities to known baseline
UPDATE Inventory SET Quantity = 120 WHERE InventoryID = 1;
UPDATE Inventory SET Quantity = 200 WHERE InventoryID = 2;

-- Insert a ServiceOrder in CONFIRMED status using IDENTITY_INSERT
SET IDENTITY_INSERT ServiceOrders ON;
INSERT INTO ServiceOrders (OrderID, OrderCode, CustomerID, WarehouseID, Status, ServiceType, TotalWeightKg, TotalCBM, TotalPallets, CreatedBy, CreatedAt)
VALUES (5, 'ORD-20250601-001', 1, 1, 'CONFIRMED', 'OUTBOUND', 10.5, 2.5, 1, 1, GETDATE());
SET IDENTITY_INSERT ServiceOrders OFF;

-- Insert OrderLines
INSERT INTO OrderLines (OrderID, SKUID, Quantity, UnitPrice, LineTotal)
VALUES (5, 1, 20, 10.0, 200.0);
INSERT INTO OrderLines (OrderID, SKUID, Quantity, UnitPrice, LineTotal)
VALUES (5, 2, 18, 15.0, 270.0);
"@ | Out-Null
}

# Wrapper for database reset
function Run-Run-Sql-Wrapper {
    param([string]$query)
    return Run-Sql $query
}

# Get total inventory quantity
function Get-Total-Inventory {
    $out = Run-Sql "SELECT SUM(Quantity) as Total FROM Inventory;"
    $lines = $out -split "`r`n"
    # Find the line containing the number
    foreach ($l in $lines) {
        if ($l -match "^\s*(\d+)\s*$") {
            return [int]$matches[1]
        }
    }
    return 0
}

# Helper to create an Outbound Order
function Create-OutboundOrder {
    $createUrl = "http://localhost:5200/api/outbound/create"
    $body = @{ orderId = 5 } | ConvertTo-Json
    try {
        $response = Invoke-WebRequest -Uri $createUrl -Method POST -Body $body -Headers $headers -UseBasicParsing
        $json = $response.Content | ConvertFrom-Json
    } catch {
        Write-Host "Create-OutboundOrder failed: $_"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errBody = $reader.ReadToEnd()
            Write-Host "Server error response: $errBody"
        }
        throw
    }
    
    return [PSCustomObject]@{
        OutboundID = (Run-Sql "SELECT TOP 1 OutboundID FROM OutboundOrders WHERE OrderID = 5;" | Select-String -Pattern "\d+" | ForEach-Object { $_.Matches.Value } | Select-Object -First 1)
        Lines = (Run-Sql "SELECT LineID, SKUID, RequiredQty, PickedQty FROM OutboundLines;" | Select-String -Pattern "\d+\s+\d+" | ForEach-Object {
            $parts = -split $_.Line
            [PSCustomObject]@{
                LineID = [int]$parts[0]
                SKUID = [int]$parts[1]
                RequiredQty = [int]$parts[2]
                PickedQty = [int]$parts[3]
            }
        })
    }
}

# --- Record Initial Inventory ---
Reset-Database
# Create baseline Outbound Order
$ob = Create-OutboundOrder
$outboundId = $ob.OutboundID
$line1 = $ob.Lines[0]
$line2 = $ob.Lines[1]
Write-Host "Created OutboundID = $outboundId. Line1 (SKU 1, RequiredQty=$($line1.RequiredQty)), Line2 (SKU 2, RequiredQty=$($line2.RequiredQty))"

$invBefore = Get-Total-Inventory
Write-Host "Total Inventory baseline before Phase B (after order creation): $invBefore"

# ==========================================
# PB-T01: Pick valid line
# ==========================================
Write-Host "`n=== PB-T01: Testing Pick valid line ==="
$pickUrl = "http://localhost:5200/api/outbound/$outboundId/lines/$($line1.LineID)/pick"
$body = @{ pickedQty = 5 } | ConvertTo-Json
try {
    $res = Invoke-WebRequest -Uri $pickUrl -Method POST -Body $body -Headers $headers -UseBasicParsing
    $json = $res.Content | ConvertFrom-Json
    Write-Host "Success! Picked: $($json.pickedQty), Remaining: $($json.remainingQty), PickingStatus: $($json.pickingStatus)"
    
    # Check inventory
    $invAfter = Get-Total-Inventory
    if ($invBefore -eq $invAfter) {
        Write-Host "PASS: Inventory unchanged."
    } else {
        Write-Host "FAIL: Inventory changed from $invBefore to $invAfter"
    }
} catch {
    Write-Host "FAIL: PB-T01 failed: $_"
}

# ==========================================
# PB-T02: Pick with quantity 0 or negative
# ==========================================
Write-Host "`n=== PB-T02: Testing Pick with quantity 0 or negative ==="
$bodyZero = @{ pickedQty = 0 } | ConvertTo-Json
$bodyNeg = @{ pickedQty = -2 } | ConvertTo-Json
try {
    $res = Invoke-WebRequest -Uri $pickUrl -Method POST -Body $bodyZero -Headers $headers -UseBasicParsing
    Write-Host "FAIL: Expected rejection for 0"
} catch {
    Write-Host "PASS: Rejected quantity 0: $($_.Exception.Message)"
}
try {
    $res = Invoke-WebRequest -Uri $pickUrl -Method POST -Body $bodyNeg -Headers $headers -UseBasicParsing
    Write-Host "FAIL: Expected rejection for negative"
} catch {
    Write-Host "PASS: Rejected quantity negative: $($_.Exception.Message)"
}

# ==========================================
# PB-T03: Over-pick
# ==========================================
Write-Host "`n=== PB-T03: Testing Over-pick ==="
# Line 1 required 20, picked 5, remaining is 15. Pick 16.
$bodyOver = @{ pickedQty = 16 } | ConvertTo-Json
try {
    $res = Invoke-WebRequest -Uri $pickUrl -Method POST -Body $bodyOver -Headers $headers -UseBasicParsing
    Write-Host "FAIL: Expected rejection for over-pick"
} catch {
    Write-Host "PASS: Rejected over-pick: $($_.Exception.Message)"
}

# ==========================================
# PB-T04: Repeated pick (exceeding limit after full pick)
# ==========================================
Write-Host "`n=== PB-T04: Testing Repeated pick ==="
# Pick the remaining 15 to make it fully picked (20/20)
$bodyRem = @{ pickedQty = 15 } | ConvertTo-Json
try {
    $res = Invoke-WebRequest -Uri $pickUrl -Method POST -Body $bodyRem -Headers $headers -UseBasicParsing
    Write-Host "Picked remaining 15 successfully."
    
    # Try to pick 1 more
    $bodyOne = @{ pickedQty = 1 } | ConvertTo-Json
    $res = Invoke-WebRequest -Uri $pickUrl -Method POST -Body $bodyOne -Headers $headers -UseBasicParsing
    Write-Host "FAIL: Expected rejection when already fully picked"
} catch {
    Write-Host "PASS: Rejected additional pick on completed line: $($_.Exception.Message)"
}

# ==========================================
# PB-T05: Wrong outbound/line relationship
# ==========================================
Write-Host "`n=== PB-T05: Testing Wrong outbound/line relationship ==="
# Try to pick line 1 but passing a non-existent outbound ID or another outbound
$wrongPickUrl = "http://localhost:5200/api/outbound/9999/lines/$($line1.LineID)/pick"
try {
    $res = Invoke-WebRequest -Uri $wrongPickUrl -Method POST -Body $body -Headers $headers -UseBasicParsing
    Write-Host "FAIL: Expected 404"
} catch {
    Write-Host "PASS: Rejected wrong relationship: $($_.Exception.Message)"
}

# ==========================================
# PB-T07: Confirm picking with incomplete lines
# ==========================================
Write-Host "`n=== PB-T07: Testing Confirm picking with incomplete lines ==="
# Line 1 is 20/20, but Line 2 is 0/18. Confirm picking should fail.
$confirmUrl = "http://localhost:5200/api/outbound/$outboundId/confirm-picking"
try {
    $res = Invoke-WebRequest -Uri $confirmUrl -Method POST -Headers $headers -UseBasicParsing
    Write-Host "FAIL: Expected rejection due to incomplete line 2"
} catch {
    Write-Host "PASS: Rejected confirmation with incomplete lines: $($_.Exception.Message)"
}

# ==========================================
# PB-T08: Confirm picking when all lines are complete
# ==========================================
Write-Host "`n=== PB-T08: Testing Confirm picking when all lines are complete ==="
# Pick the remaining 18 for Line 2
$pickUrl2 = "http://localhost:5200/api/outbound/$outboundId/lines/$($line2.LineID)/pick"
$body2 = @{ pickedQty = 18 } | ConvertTo-Json
try {
    $res2 = Invoke-WebRequest -Uri $pickUrl2 -Method POST -Body $body2 -Headers $headers -UseBasicParsing
    Write-Host "Picked Line 2 fully."
    
    # Now confirm
    $resConfirm = Invoke-WebRequest -Uri $confirmUrl -Method POST -Headers $headers -UseBasicParsing
    $jsonConfirm = $resConfirm.Content | ConvertFrom-Json
    Write-Host "Success! Confirmed Status: $($jsonConfirm.status)"
    if ($jsonConfirm.status -eq "PACKED") {
        Write-Host "PASS: Outbound status is PACKED."
    } else {
        Write-Host "FAIL: Unexpected status: $($jsonConfirm.status)"
    }
} catch {
    Write-Host "FAIL: PB-T08 failed: $_"
}

# ==========================================
# PB-T06: Pick after outbound is already confirmed
# ==========================================
Write-Host "`n=== PB-T06: Testing Pick after outbound is already confirmed ==="
# Try to pick line 1 again (even if we try to pick 0 it should fail due to status block)
try {
    $res = Invoke-WebRequest -Uri $pickUrl -Method POST -Body $body -Headers $headers -UseBasicParsing
    Write-Host "FAIL: Expected rejection after confirmation"
} catch {
    Write-Host "PASS: Rejected pick on confirmed order: $($_.Exception.Message)"
}

# ==========================================
# PB-T09: Repeated confirm
# ==========================================
Write-Host "`n=== PB-T09: Testing Repeated confirm ==="
try {
    $resConfirm = Invoke-WebRequest -Uri $confirmUrl -Method POST -Headers $headers -UseBasicParsing
    $jsonConfirm = $resConfirm.Content | ConvertFrom-Json
    Write-Host "Success! Repetitive confirm returned: $($jsonConfirm.status) (Idempotent)"
    if ($jsonConfirm.status -eq "PACKED") {
        Write-Host "PASS: Idempotent confirmation succeeded."
    } else {
        Write-Host "FAIL: Unexpected status: $($jsonConfirm.status)"
    }
} catch {
    Write-Host "FAIL: Repeated confirmation failed: $_"
}

# ==========================================
# PB-T10: Inventory unchanged throughout Phase B
# ==========================================
Write-Host "`n=== PB-T10: Checking Inventory invariant ==="
$invFinal = Get-Total-Inventory
Write-Host "Total Inventory baseline before Phase B: $invBefore"
Write-Host "Total Inventory after Phase B operations: $invFinal"
if ($invBefore -eq $invFinal) {
    Write-Host "PASS: Inventory remained invariant throughout Phase B!"
} else {
    Write-Host "FAIL: Inventory changed by $($invFinal - $invBefore) units!"
}

# ==========================================
# PB-T11: Concurrent pick on same line
# ==========================================
Write-Host "`n=== PB-T11: Testing Concurrent pick on same line ==="
# Reset database and create fresh outbound order
Reset-Database
$obFresh = Create-OutboundOrder
$freshOutboundId = $obFresh.OutboundID
$freshLine = $obFresh.Lines[0] # RequiredQty = 20

$concurrentPickUrl = "http://localhost:5200/api/outbound/$freshOutboundId/lines/$($freshLine.LineID)/pick"

# Create HttpClient
$client = New-Object System.Net.Http.HttpClient
$client.DefaultRequestHeaders.Authorization = New-Object System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", $token)

$bodyStr = @{ pickedQty = 5 } | ConvertTo-Json

$tasks = @()
for ($i = 0; $i -lt 5; $i++) {
    $content = New-Object System.Net.Http.StringContent($bodyStr, [System.Text.Encoding]::UTF8, "application/json")
    $task = $client.PostAsync($concurrentPickUrl, $content)
    $tasks += $task
}

try {
    [System.Threading.Tasks.Task]::WaitAll($tasks)
} catch {
    Write-Host "WaitAll threw exception: $_"
}

$successCount = 0
$conflictCount = 0
foreach ($t in $tasks) {
    $response = $t.Result
    $statusCode = [int]$response.StatusCode
    if ($statusCode -ge 200 -and $statusCode -lt 300) {
        $successCount++
        Write-Host "Request Success: StatusCode = $statusCode"
    } else {
        if ($statusCode -eq 409) {
            $conflictCount++
        }
        Write-Host "Request Failed: StatusCode = $statusCode"
    }
}

Write-Host "Total Successful Picks: $successCount (Total quantity = $($successCount * 5))"
Write-Host "Total Concurrency Conflicts (409): $conflictCount"

# Verify actual database state
$finalDbPicked = Run-Sql "SELECT PickedQty FROM OutboundLines WHERE LineID = $($freshLine.LineID);" | Select-String -Pattern "\d+" | ForEach-Object { $_.Matches.Value }
Write-Host "Final database PickedQty: $finalDbPicked"

if ($finalDbPicked -le 20) {
    Write-Host "PASS: Final picked quantity ($finalDbPicked) never exceeded required quantity (20)."
} else {
    Write-Host "FAIL: Final picked quantity ($finalDbPicked) exceeded required quantity!"
}

# Verify inventory is still invariant
$invFinalConcurrent = Get-Total-Inventory
if ($invBefore -eq $invFinalConcurrent) {
    Write-Host "PASS: Inventory remained completely unchanged."
} else {
    Write-Host "FAIL: Inventory was changed!"
}

$client.Dispose()
