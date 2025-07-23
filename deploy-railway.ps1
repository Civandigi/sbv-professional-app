# SBV Professional App - Railway Deployment Script (PowerShell)
# Automatisches Setup für Cloud-Deployment

Write-Host "Starting SBV Professional App Railway Deployment..." -ForegroundColor Green

# Check if Railway CLI is installed
$railwayInstalled = Get-Command railway -ErrorAction SilentlyContinue
if (-not $railwayInstalled) {
    Write-Host "Installing Railway CLI..." -ForegroundColor Yellow
    npm install -g @railway/cli
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install Railway CLI. Please install manually:" -ForegroundColor Red
        Write-Host "   npm install -g @railway/cli" -ForegroundColor White
        exit 1
    }
}

# Check Railway authentication
Write-Host "Checking Railway authentication..." -ForegroundColor Yellow
railway whoami 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please login to Railway..." -ForegroundColor Yellow
    railway login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Railway login failed. Please try again." -ForegroundColor Red
        exit 1
    }
}

# Initialize Railway project
Write-Host "Initializing Railway project..." -ForegroundColor Yellow
railway init sbv-professional-app --detach 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Project might already exist, continuing..." -ForegroundColor Yellow
}

# Add PostgreSQL database
Write-Host "Adding PostgreSQL database..." -ForegroundColor Yellow
railway add postgresql 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "PostgreSQL might already be added, continuing..." -ForegroundColor Yellow
}

# Set environment variables
Write-Host "Setting environment variables..." -ForegroundColor Yellow

railway variables --set "NODE_ENV=production"
railway variables --set "JWT_SECRET=sbv-railway-production-secret-2025-ultra-secure"
railway variables --set "UPLOAD_PATH=/app/uploads"
railway variables --set "MAX_FILE_SIZE=10485760"
railway variables --set "ADMIN_EMAIL=superadmin@digitale-rakete.ch"
railway variables --set "ADMIN_PASSWORD=admin2025"
railway variables --set "DB_POOL_MIN=2"
railway variables --set "DB_POOL_MAX=10"
railway variables --set "DB_POOL_IDLE_TIMEOUT=30000"

# Create persistent volume for uploads
Write-Host "Creating persistent volume for file uploads..." -ForegroundColor Yellow
railway volume create uploads --mount-path /app/uploads 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Volume might already exist, continuing..." -ForegroundColor Yellow
}

# Deploy the application
Write-Host "Deploying application..." -ForegroundColor Green
railway up

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment completed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your app should be available at:" -ForegroundColor Cyan
    railway status
    Write-Host ""
    Write-Host "To get the exact URL, run: railway status" -ForegroundColor White
    Write-Host "To view logs, run: railway logs" -ForegroundColor White
    Write-Host "To manage environment variables, run: railway variables" -ForegroundColor White
    Write-Host ""
    Write-Host "Test Login Credentials:" -ForegroundColor Cyan
    Write-Host "   Email: superadmin@digitale-rakete.ch" -ForegroundColor White
    Write-Host "   Password: admin2025" -ForegroundColor White
    Write-Host ""
    Write-Host "Deployment successful! Your SBV app is now live in the cloud!" -ForegroundColor Green
} else {
    Write-Host "Deployment failed. Check the logs with: railway logs" -ForegroundColor Red
    exit 1
}
