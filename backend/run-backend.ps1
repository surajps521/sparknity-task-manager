$ErrorActionPreference = 'Stop'

Set-Location $PSScriptRoot

$env:SERVER_PORT = '8080'

$portOwner = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
if ($portOwner) {
    $originHeaders = @{ Origin = 'http://localhost:5174' }
    try {
        $corsCheck = Invoke-WebRequest -Uri 'http://localhost:8080/api/auth/register' -Method Options -Headers $originHeaders -UseBasicParsing -TimeoutSec 2
        if ($corsCheck.Headers['Access-Control-Allow-Origin'] -eq 'http://localhost:5174') {
            Write-Host 'The backend is already running at http://localhost:8080.'
            exit 0
        }
    } catch {
        if ($_.Exception.Response -and $_.Exception.Response.Headers['Access-Control-Allow-Origin'] -eq 'http://localhost:5174') {
            Write-Host 'The backend is already running at http://localhost:8080.'
            exit 0
        }
    }
    throw "Port 8080 is occupied by process $($portOwner[0].OwningProcess) with incompatible CORS settings. Stop that process, then run this script again."
}

if (-not $env:DB_PASSWORD) {
    $password = Read-Host 'PostgreSQL password'
    if ([string]::IsNullOrWhiteSpace($password)) {
        throw 'DB_PASSWORD is required to connect to PostgreSQL.'
    }
    $env:DB_PASSWORD = $password
}

if (-not $env:JWT_SECRET) {
    $bytes = New-Object byte[] 32
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $env:JWT_SECRET = [Convert]::ToBase64String($bytes)
}

if (-not $env:DB_URL) {
    $env:DB_URL = 'jdbc:postgresql://localhost:5432/task_manager'
}

if (-not $env:DB_USERNAME) {
    $env:DB_USERNAME = 'postgres'
}

if (-not $env:JPA_DDL_AUTO) {
    $env:JPA_DDL_AUTO = 'update'
}

if (-not $env:CORS_ALLOWED_ORIGINS) {
    $env:CORS_ALLOWED_ORIGINS = 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174'
}

Write-Host 'Starting Task Manager backend...'
& mvn spring-boot:run
