# Script de demarrage complet - GE Auto Import

Write-Host "Demarrage de GE Auto Import..." -ForegroundColor Cyan

# Verifier si Docker Desktop est lance
Write-Host "Verification de Docker Desktop..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker Desktop n'est pas lance. Demarrage..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
    Write-Host "Attente du demarrage de Docker (30 secondes)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    # Attendre que Docker soit pret
    $maxAttempts = 10
    $attempt = 0
    while ($attempt -lt $maxAttempts) {
        $test = docker ps 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Docker Desktop est pret!" -ForegroundColor Green
            break
        }
        Start-Sleep -Seconds 3
        $attempt++
    }
}

# Arreter les conteneurs existants
Write-Host "Arret des conteneurs existants..." -ForegroundColor Yellow
docker compose down 2>&1 | Out-Null

# Demarrer la stack
Write-Host "Demarrage de la stack Docker..." -ForegroundColor Yellow
docker compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "Stack demarree avec succes!" -ForegroundColor Green
    Write-Host "Informations:" -ForegroundColor Cyan
    Write-Host "   - App: http://localhost:3001" -ForegroundColor White
    Write-Host "   - Admin: admin@geautoimport.fr / password123" -ForegroundColor White
    Write-Host "Etat des conteneurs:" -ForegroundColor Cyan
    docker compose ps
} else {
    Write-Host "Erreur lors du demarrage" -ForegroundColor Red
}
