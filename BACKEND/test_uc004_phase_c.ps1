$ErrorActionPreference = "Stop"

# Load assembly
Add-Type -AssemblyName System.Net.Http

# Helpers to run SQL
function Run-Sql {
    param([string]$query)
    $output = sqlcmd -I -S "(localdb)\mssqllocaldb" -d "SmartLogAI" -Q $query -W 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "SQL execution failed with code $LASTEXITCODE. Output: $output"
    }
    return $output
}

# Create temporary customer user
Run-Sql @'
BEGIN TRANSACTION;
BEGIN TRY
    IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'temp_cust_user')
    BEGIN
        INSERT INTO Users (Username, PasswordHash, FullName, Email, RoleID, IsActive, CreatedAt)
        VALUES ('temp_cust_user', '$2a$11$gfBZcYlj4IxjDggD3KuNzufM6zaC3F90CbnI3o5fcGxlf372woNq2', 'Temp Customer', 'temp_cust@example.com', 4, 1, GETDATE());
        
        DECLARE @NewUserId INT = SCOPE_IDENTITY();
        
        INSERT INTO Customers (CustomerCode, CompanyName, ContactName, Email, UserID, IsActive, CreatedAt)
        VALUES ('TEMP_CUST', 'Temp Customer Co.', 'Temp Contact', 'temp_cust@example.com', @NewUserId, 1, GETDATE());
    END
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH
'@ | Out-Null

# 1. Login to get Admin & Customer JWT Tokens
$loginUrl = "http://localhost:5200/api/auth/login"

# Admin Login
$loginBody = @{
    username = "admin"
    password = "Admin@123"
} | ConvertTo-Json

Write-Host "Logging in as admin to get JWT token..."
try {
    $loginResponse = Invoke-WebRequest -Uri $loginUrl -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
    $jsonResp = $loginResponse.Content | ConvertFrom-Json
    $adminToken = $jsonResp.token
    if (-not $adminToken) {
        $adminToken = $jsonResp.Token
    }
} catch {
    Write-Host "Admin login failed: $_"
    exit 1
}
Write-Host "Admin logged in successfully."

$adminHeaders = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

# Customer Login
$custLoginBody = @{
    username = "temp_cust_user"
    password = "Admin@123"
} | ConvertTo-Json

Write-Host "Logging in as customer to get JWT token..."
try {
    $custResponse = Invoke-WebRequest -Uri $loginUrl -Method POST -Body $custLoginBody -ContentType "application/json" -UseBasicParsing
    $jsonCustResp = $custResponse.Content | ConvertFrom-Json
    $custToken = $jsonCustResp.token
    if (-not $custToken) {
        $custToken = $jsonCustResp.Token
    }
} catch {
    Write-Host "Customer login failed: $_"
    exit 1
}
Write-Host "Customer logged in successfully."

$custHeaders = @{
    "Authorization" = "Bearer $custToken"
    "Content-Type" = "application/json"
}


# 2. Reset database state helper
function Reset-Database {
    Run-Sql-Wrapper @"
SET NOCOUNT ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;

BEGIN TRANSACTION;
BEGIN TRY
    -- Delete from tables in correct dependency order without dropping constraints
    DELETE FROM Waybills WHERE OutboundId >= 50 OR OutboundId IS NULL OR WaybillID = 999;
    DELETE FROM OutboundLines WHERE OutboundID >= 50;
    DELETE FROM OutboundOrders WHERE OutboundID >= 50;
    DELETE FROM SlotBookings WHERE OrderID >= 5;
    DELETE FROM Invoices WHERE OrderID >= 5;
    DELETE FROM ServiceCharges WHERE OrderID >= 5;
    DELETE FROM Complaints WHERE OrderID >= 5;
    DELETE FROM ServiceFeedback WHERE OrderID >= 5;
    DELETE FROM OrderLines WHERE OrderID >= 5;
    DELETE FROM ServiceOrders WHERE OrderID >= 5;

    -- Reset Inventory quantities
    UPDATE Inventory SET Quantity = 120 WHERE InventoryID = 1;
    UPDATE Inventory SET Quantity = 200 WHERE InventoryID = 2;

    -- Insert ServiceOrder 5 and 6
    SET IDENTITY_INSERT ServiceOrders ON;
    INSERT INTO ServiceOrders (OrderID, OrderCode, CustomerID, WarehouseID, Status, ServiceType, TotalWeightKg, TotalCBM, TotalPallets, CreatedBy, CreatedAt)
    VALUES (5, 'ORD-20250601-001', 1, 1, 'CONFIRMED', 'OUTBOUND', 10.5, 2.5, 1, 1, GETDATE());
    INSERT INTO ServiceOrders (OrderID, OrderCode, CustomerID, WarehouseID, Status, ServiceType, TotalWeightKg, TotalCBM, TotalPallets, CreatedBy, CreatedAt)
    VALUES (6, 'ORD-20250601-002', 1, 1, 'CONFIRMED', 'OUTBOUND', 8.2, 1.8, 1, 1, GETDATE());
    SET IDENTITY_INSERT ServiceOrders OFF;

    -- Insert OutboundOrders 50 (PACKED) and 60 (PENDING)
    SET IDENTITY_INSERT OutboundOrders ON;
    INSERT INTO OutboundOrders (OutboundID, OutboundCode, OrderID, WarehouseID, Status, LabelPrinted, CreatedBy, CreatedAt)
    VALUES (50, 'OB-005', 5, 1, 'PACKED', 0, 1, GETDATE());
    INSERT INTO OutboundOrders (OutboundID, OutboundCode, OrderID, WarehouseID, Status, LabelPrinted, CreatedBy, CreatedAt)
    VALUES (60, 'OB-006', 6, 1, 'PENDING', 0, 1, GETDATE());
    SET IDENTITY_INSERT OutboundOrders OFF;

    -- Insert OutboundLines
    SET IDENTITY_INSERT OutboundLines ON;
    INSERT INTO OutboundLines (LineID, OutboundID, SKUID, RequiredQty, PickedQty)
    VALUES (501, 50, 1, 20, 20);
    INSERT INTO OutboundLines (LineID, OutboundID, SKUID, RequiredQty, PickedQty)
    VALUES (601, 60, 2, 10, 0);
    SET IDENTITY_INSERT OutboundLines OFF;

    -- Insert a legacy Waybill (OutboundId is NULL, OrderId is 5)
    SET IDENTITY_INSERT Waybills ON;
    INSERT INTO Waybills (WaybillID, OrderID, OutboundId, WaybillCode, QrCodeBase64, Status, CreatedAt)
    VALUES (999, 5, NULL, 'WB-LEGACY-999', 'LEGACY_QR', 'CREATED', GETDATE());
    SET IDENTITY_INSERT Waybills OFF;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH
"@ | Out-Null
}

function Run-Sql-Wrapper {
    param([string]$query)
    return Run-Sql $query
}

function Get-Sql-Value {
    param([string]$query)
    $output = sqlcmd -I -S "(localdb)\mssqllocaldb" -d "SmartLogAI" -Q "SET NOCOUNT ON; $query" -h -1 -W 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "SQL execution failed with code $LASTEXITCODE. Output: $output"
    }
    return $output.Trim()
}

# Helper to get the count of waybill records matching a query
function Get-Waybill-Count {
    param([string]$filter = "")
    $q = "SELECT COUNT(*) FROM Waybills"
    if ($filter) {
        $q += " WHERE $filter"
    }
    $out = Run-Sql $q
    $lines = $out -split "`r`n"
    foreach ($l in $lines) {
        if ($l -match "^\s*(\d+)\s*$") {
            return [int]$matches[1]
        }
    }
    return 0
}

# Helper to get total inventory quantity
function Get-Total-Inventory {
    $out = Run-Sql "SELECT SUM(Quantity) as Total FROM Inventory;"
    $lines = $out -split "`r`n"
    foreach ($l in $lines) {
        if ($l -match "^\s*(\d+)\s*$") {
            return [int]$matches[1]
        }
    }
    return 0
}


# ==============================================================================
# START RUNNING THE 12 PHASE C TEST CASES
# ==============================================================================
Reset-Database

# ------------------------------------------------------------------------------
# PC-T01: PUT creates one label for PACKED outbound.
# ------------------------------------------------------------------------------
Write-Host "`n=== PC-T01: Testing PUT creates one label for PACKED outbound ==="
$putUrl = "http://localhost:5200/api/outbound/50/shipping-label"
try {
    $response = Invoke-WebRequest -Uri $putUrl -Method PUT -Headers $adminHeaders -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    
    if ($response.StatusCode -eq 200) {
        Write-Host "Success! Created WaybillId: $($json.waybillId), Code: $($json.waybillCode)"
        Write-Host "Destination: $($json.destinationAddress), Recipient: $($json.recipientName)"
        
        $dbCount = Get-Waybill-Count "OutboundId = 50"
        if ($dbCount -eq 1) {
            Write-Host "PASS: Exactly 1 Waybill record created in DB."
        } else {
            Write-Host "FAIL: DB count for OutboundId 50 is $dbCount"
        }
    } else {
        Write-Host "FAIL: Response status code was $($response.StatusCode)"
    }
} catch {
    Write-Host "FAIL: PC-T01 threw exception: $_"
}

# ------------------------------------------------------------------------------
# PC-T02: GET returns the existing label.
# ------------------------------------------------------------------------------
Write-Host "`n=== PC-T02: Testing GET returns the existing label ==="
$getUrl = "http://localhost:5200/api/outbound/50/shipping-label"
try {
    $response = Invoke-WebRequest -Uri $getUrl -Method GET -Headers $adminHeaders -UseBasicParsing
    $jsonGet = $response.Content | ConvertFrom-Json
    
    if ($jsonGet.waybillId -eq $json.waybillId -and $jsonGet.waybillCode -eq $json.waybillCode) {
        Write-Host "PASS: GET returns identical WaybillId ($($jsonGet.waybillId)) and Code ($($jsonGet.waybillCode))."
    } else {
        Write-Host "FAIL: GET returned mismatched data. Id: $($jsonGet.waybillId) vs $($json.waybillId)"
    }
} catch {
    Write-Host "FAIL: PC-T02 threw exception: $_"
}

# ------------------------------------------------------------------------------
# PC-T03: GET before creation returns 404 and creates no row.
# ------------------------------------------------------------------------------
Write-Host "`n=== PC-T03: Testing GET before creation returns 404 ==="
$getPendingUrl = "http://localhost:5200/api/outbound/60/shipping-label"
try {
    $response = Invoke-WebRequest -Uri $getPendingUrl -Method GET -Headers $adminHeaders -UseBasicParsing
    Write-Host "FAIL: GET before creation returned 200 OK."
} catch {
    $errCode = $_.Exception.Response.StatusCode
    $dbCount = Get-Waybill-Count "OutboundId = 60"
    if ($errCode -eq "NotFound" -and $dbCount -eq 0) {
        Write-Host "PASS: Returned 404 and created 0 database rows."
    } else {
        Write-Host "FAIL: Expected 404 and 0 rows, got status: $errCode, rows: $dbCount"
    }
}

# ------------------------------------------------------------------------------
# PC-T04: PENDING/PICKING PUT returns 409.
# ------------------------------------------------------------------------------
Write-Host "`n=== PC-T04: Testing PENDING/PICKING PUT returns 409 ==="
$putPendingUrl = "http://localhost:5200/api/outbound/60/shipping-label"
try {
    $response = Invoke-WebRequest -Uri $putPendingUrl -Method PUT -Headers $adminHeaders -UseBasicParsing
    Write-Host "FAIL: PUT on PENDING outbound succeeded."
} catch {
    $errCode = $_.Exception.Response.StatusCode
    $dbCount = Get-Waybill-Count "OutboundId = 60"
    if ($errCode -eq "Conflict" -and $dbCount -eq 0) {
        Write-Host "PASS: Returned 409 Conflict and created 0 database rows."
    } else {
        Write-Host "FAIL: Expected 409 and 0 rows, got status: $errCode, rows: $dbCount"
    }
}

# ------------------------------------------------------------------------------
# PC-T05: Repeated PUT returns the same WaybillId and WaybillCode.
# ------------------------------------------------------------------------------
Write-Host "`n=== PC-T05: Testing Repeated PUT returns the same Waybill ==="
try {
    $response = Invoke-WebRequest -Uri $putUrl -Method PUT -Headers $adminHeaders -UseBasicParsing
    $jsonRepeat = $response.Content | ConvertFrom-Json
    
    if ($jsonRepeat.waybillId -eq $json.waybillId -and $jsonRepeat.waybillCode -eq $json.waybillCode) {
        Write-Host "PASS: Repeated PUT returns identical WaybillId ($($jsonRepeat.waybillId)) and Code."
    } else {
        Write-Host "FAIL: Repeated PUT returned different Waybill. Id: $($jsonRepeat.waybillId) vs $($json.waybillId)"
    }
} catch {
    Write-Host "FAIL: PC-T05 threw exception: $_"
}

# ------------------------------------------------------------------------------
# PC-T06: Five concurrent PUT requests create exactly one database record.
# ------------------------------------------------------------------------------
Write-Host "`n=== PC-T06: Testing Five concurrent PUT requests ==="
# Reset database so we start with a clean state (0 waybills for OutboundId 50)
Reset-Database

# Create HttpClient
$client = New-Object System.Net.Http.HttpClient
$client.DefaultRequestHeaders.Authorization = New-Object System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", $adminToken)

$tasks = @()
for ($i = 0; $i -lt 5; $i++) {
    $content = New-Object System.Net.Http.StringContent("", [System.Text.Encoding]::UTF8, "application/json")
    $task = $client.PutAsync($putUrl, $content)
    $tasks += $task
}

try {
    [System.Threading.Tasks.Task]::WaitAll($tasks)
} catch {
    Write-Host "WaitAll completed with some task exceptions."
}

$successCount = 0
$statusCodes = @()
foreach ($t in $tasks) {
    $resp = $t.Result
    $statusCodes += [int]$resp.StatusCode
    if ($resp.IsSuccessStatusCode) {
        $successCount++
    }
}

$dbCount = Get-Waybill-Count "OutboundId = 50"
Write-Host "Concurrent Requests Status Codes: $($statusCodes -join ', ')"
Write-Host "Successful Requests: $successCount / 5"
Write-Host "Database Row Count for OutboundId 50: $dbCount"

if ($successCount -eq 5 -and $dbCount -eq 1) {
    Write-Host "PASS: All 5 concurrent PUT requests returned 200 OK, and exactly 1 database row was created."
} else {
    Write-Host "FAIL: Concurrent creation count check failed."
}
$client.Dispose()

# ------------------------------------------------------------------------------
# PC-T07: Different outbounds receive unique WaybillCodes.
# ------------------------------------------------------------------------------
Write-Host "`n=== PC-T07: Testing Different outbounds receive unique WaybillCodes ==="
# We will create another packed outbound order in DB first
Run-Sql @"
SET IDENTITY_INSERT OutboundOrders ON;
INSERT INTO OutboundOrders (OutboundID, OutboundCode, OrderID, WarehouseID, Status, LabelPrinted, CreatedBy, CreatedAt)
VALUES (70, 'OB-007', 6, 1, 'PACKED', 0, 1, GETDATE());
SET IDENTITY_INSERT OutboundOrders OFF;
"@ | Out-Null

$putUrl70 = "http://localhost:5200/api/outbound/70/shipping-label"
try {
    $response50 = Invoke-WebRequest -Uri $putUrl -Method PUT -Headers $adminHeaders -UseBasicParsing
    $json50 = $response50.Content | ConvertFrom-Json
    
    $response70 = Invoke-WebRequest -Uri $putUrl70 -Method PUT -Headers $adminHeaders -UseBasicParsing
    $json70 = $response70.Content | ConvertFrom-Json
    
    if ($json50.waybillCode -ne $json70.waybillCode -and $json50.waybillId -ne $json70.waybillId) {
        Write-Host "PASS: Outbound 50 and 70 received unique WaybillCodes: $($json50.waybillCode) vs $($json70.waybillCode)"
    } else {
        Write-Host "FAIL: Waybills were not unique. Code 50: $($json50.waybillCode), Code 70: $($json70.waybillCode)"
    }
} catch {
    Write-Host "FAIL: PC-T07 failed: $_"
}

# ------------------------------------------------------------------------------
# PC-T08: QR payload is only WaybillCode.
# ------------------------------------------------------------------------------
Write-Host "`n=== PC-T08: Testing QR payload is only WaybillCode ==="
try {
    $response = Invoke-WebRequest -Uri $getUrl -Method GET -Headers $adminHeaders -UseBasicParsing
    $jsonQR = $response.Content | ConvertFrom-Json
    
    if ($jsonQR.qrPayload -eq $jsonQR.waybillCode) {
        Write-Host "PASS: qrPayload is exactly identical to waybillCode: $($jsonQR.qrPayload)"
    } else {
        Write-Host "FAIL: qrPayload ($($jsonQR.qrPayload)) did not match waybillCode ($($jsonQR.waybillCode))"
    }
    
    # Try decoding the base64 string
    $bytes = [System.Convert]::FromBase64String($jsonQR.qrCodeBase64)
    if ($bytes.Length -gt 0) {
        Write-Host "PASS: qrCodeBase64 is a valid non-empty Base64 string."
    } else {
        Write-Host "FAIL: qrCodeBase64 is empty."
    }
} catch {
    Write-Host "FAIL: PC-T08 failed: $_"
}

# ------------------------------------------------------------------------------
# PC-T09: Unauthorized and disallowed roles return 401/403.
# ------------------------------------------------------------------------------
Write-Host "`n=== PC-T09: Testing Unauthorized and disallowed roles ==="
# 1. No token (expect 401)
try {
    $response = Invoke-WebRequest -Uri $putUrl -Method PUT -UseBasicParsing
    Write-Host "FAIL: PUT without token returned 200 OK."
} catch {
    $errCode = $_.Exception.Response.StatusCode
    if ($errCode -eq "Unauthorized") {
        Write-Host "PASS: Anonymous request returned 401 Unauthorized."
    } else {
        Write-Host "FAIL: Anonymous request returned $errCode"
    }
}

# 2. Customer token (expect 403)
try {
    $response = Invoke-WebRequest -Uri $putUrl -Method PUT -Headers $custHeaders -UseBasicParsing
    Write-Host "FAIL: Customer token returned 200 OK."
} catch {
    $errCode = $_.Exception.Response.StatusCode
    if ($errCode -eq "Forbidden") {
        Write-Host "PASS: Customer request returned 403 Forbidden."
    } else {
        Write-Host "FAIL: Customer request returned $errCode"
    }
}

# ------------------------------------------------------------------------------
# PC-T10: Inventory, PickedQty, and Outbound status remain unchanged.
# ------------------------------------------------------------------------------
Write-Host "`n=== PC-T10: Testing Inventory, PickedQty, and Status invariants ==="
$invBefore = Get-Total-Inventory

# Read initial DB state
$statusBefore = Get-Sql-Value "SELECT Status FROM OutboundOrders WHERE OutboundID = 50;"
$pickedBefore = Get-Sql-Value "SELECT PickedQty FROM OutboundLines WHERE OutboundID = 50;"

# Call PUT
try {
    $response = Invoke-WebRequest -Uri $putUrl -Method PUT -Headers $adminHeaders -UseBasicParsing
} catch {}

# Read final DB state
$invAfter = Get-Total-Inventory
$statusAfter = Get-Sql-Value "SELECT Status FROM OutboundOrders WHERE OutboundID = 50;"
$pickedAfter = Get-Sql-Value "SELECT PickedQty FROM OutboundLines WHERE OutboundID = 50;"

if ($invBefore -eq $invAfter -and $statusBefore -eq $statusAfter -and $pickedBefore -eq $pickedAfter) {
    Write-Host "PASS: Inventory, Outbound status, and PickedQty remained completely invariant."
} else {
    Write-Host "FAIL: Invariant check failed. Inv: $invBefore -> $invAfter, Status: $statusBefore -> $statusAfter"
}

# ------------------------------------------------------------------------------
# PC-T11: Legacy Waybill rows with OutboundId null are not incorrectly reused.
# ------------------------------------------------------------------------------
Write-Host "`n=== PC-T11: Testing Legacy Waybill rows with OutboundId null are not incorrectly reused ==="
Reset-Database
# A legacy waybill with OutboundId = null exists with WaybillID = 999.
# Let's perform a PUT on OutboundID 50.
try {
    $response = Invoke-WebRequest -Uri $putUrl -Method PUT -Headers $adminHeaders -UseBasicParsing
    $jsonLegacy = $response.Content | ConvertFrom-Json
    
    if ($jsonLegacy.waybillId -ne 999 -and $jsonLegacy.waybillCode -ne "WB-LEGACY-999") {
        Write-Host "PASS: PUT created a new Waybill ID ($($jsonLegacy.waybillId)) and did not reuse legacy row 999."
        
        # Verify the database: row 999 must still have OutboundId as NULL
        $outIdInDb = Get-Sql-Value "SELECT COALESCE(CAST(OutboundId AS VARCHAR), 'NULL') FROM Waybills WHERE WaybillID = 999;"
        if ($outIdInDb -eq "NULL") {
            Write-Host "PASS: Legacy Waybill 999 still has OutboundId = NULL in database."
        } else {
            Write-Host "FAIL: Legacy Waybill 999 was updated with OutboundId = $outIdInDb"
        }
    } else {
        Write-Host "FAIL: Reused legacy waybill. Id: $($jsonLegacy.waybillId), Code: $($jsonLegacy.waybillCode)"
    }
} catch {
    Write-Host "FAIL: PC-T11 failed: $_"
}

# ------------------------------------------------------------------------------
# PC-T12: GET/reprint performs no database write.
# ------------------------------------------------------------------------------
Write-Host "`n=== PC-T12: Testing GET/reprint performs no database write ==="
# Get current waybill count
$countBefore = Get-Waybill-Count

# Call GET 3 times
try {
    for ($i = 0; $i -lt 3; $i++) {
        $response = Invoke-WebRequest -Uri $getUrl -Method GET -Headers $adminHeaders -UseBasicParsing
    }
    
    $countAfter = Get-Waybill-Count
    if ($countBefore -eq $countAfter) {
        Write-Host "PASS: Database count remained exactly the same at $countBefore after multiple GET requests."
    } else {
        Write-Host "FAIL: Database count changed from $countBefore to $countAfter"
    }
} catch {
    Write-Host "FAIL: PC-T12 failed: $_"
}

# Cleanup temporary customer user and records
Write-Host "`n=== CLEANUP: Deleting temporary test customer user ==="
Run-Sql @"
BEGIN TRANSACTION;
BEGIN TRY
    -- 1. Remove customer references
    DECLARE @TempUserId INT = (SELECT UserID FROM Users WHERE Username = 'temp_cust_user');
    IF @TempUserId IS NOT NULL
    BEGIN
        DELETE FROM Customers WHERE UserID = @TempUserId;
        DELETE FROM Users WHERE UserID = @TempUserId;
        PRINT 'Temporary customer user deleted successfully.';
    END
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH
"@ | Out-Null

Write-Host "`n=== ALL UC004 PHASE C RUNTIME TESTS COMPLETED ==="
