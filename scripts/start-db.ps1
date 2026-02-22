# Demarre Postgres et Redis pour GE Auto Import (Docker).
# Usage: .\scripts\start-db.ps1   ou   pwsh -File scripts\start-db.ps1

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path $PSScriptRoot -Parent
Set-Location $projectRoot

Write-Host "Projet: $projectRoot" -ForegroundColor Cyan
Write-Host ""

# Verifier Docker
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Docker non disponible" }
} catch {
    Write-Host "ERREUR: Le moteur Docker n'est pas demarre." -ForegroundColor Red
    Write-Host ""
    Write-Host "1. Ouvrez Docker Desktop et attendez qu'il soit pret (icone verte)." -ForegroundColor Yellow
    Write-Host "2. Relancez ce script: .\scripts\start-db.ps1" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative sans Docker: installez PostgreSQL pour Windows," -ForegroundColor Yellow
    Write-Host "  creez une base 'ge_auto_import', et dans .env mettez:" -ForegroundColor Yellow
    Write-Host "  DATABASE_URL=postgresql://postgres:VOTRE_MDP@localhost:5432/ge_auto_import?schema=public" -ForegroundColor Gray
    Write-Host "  Puis: npx prisma migrate deploy" -ForegroundColor Gray
    exit 1
}

Write-Host "Demarrage des conteneurs postgres et redis..." -ForegroundColor Green
docker-compose up -d postgres redis
if ($LASTEXITCODE -ne 0) {
    Write-Host "Echec docker-compose. Verifiez que Docker Desktop est bien demarre." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Conteneurs demarres. Attente du healthcheck Postgres (quelques secondes)..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
$ps = docker-compose ps postgres redis 2>&1
Write-Host $ps
Write-Host ""
Write-Host "Si les deux conteneurs sont 'Up', vous pouvez lancer: npm run dev" -ForegroundColor Green
