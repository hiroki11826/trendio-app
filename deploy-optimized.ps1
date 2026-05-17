# Optimized Deploy to EC2 Script - Build locally, upload only built files
$ErrorActionPreference = "Stop"

$EC2_IP = "54.168.247.161"
$KEY_PATH = "$env:USERPROFILE\snsinsight-key2.pem"
$EC2_USER = "ec2-user"
$REMOTE_DIR = "/home/ec2-user/app"

Write-Host "=== Optimized SNS Insight EC2 Deployment ===" -ForegroundColor Cyan
Write-Host "Building locally, then uploading only necessary files" -ForegroundColor Yellow

# Check if key exists
if (-not (Test-Path $KEY_PATH)) {
    Write-Host "Error: SSH key not found at $KEY_PATH" -ForegroundColor Red
    exit 1
}

# Step 1: Build frontend locally
Write-Host "`n[1/6] Building frontend locally..." -ForegroundColor Yellow
Push-Location project-6120693
try {
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
        npm install
    }
    Write-Host "Building frontend..." -ForegroundColor Cyan
    npm run build
    if (-not (Test-Path "out")) {
        Write-Host "Error: Build failed - 'out' directory not found" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Frontend built successfully" -ForegroundColor Green
} finally {
    Pop-Location
}

# Step 2: Prepare server files (without node_modules)
Write-Host "`n[2/6] Preparing server files..." -ForegroundColor Yellow
$DEPLOY_DIR = "deploy-optimized"
if (Test-Path $DEPLOY_DIR) { Remove-Item -Recurse -Force $DEPLOY_DIR }
New-Item -ItemType Directory -Path $DEPLOY_DIR | Out-Null

# Copy server files (excluding node_modules)
Write-Host "Copying server source files..." -ForegroundColor Cyan
Copy-Item -Path "server" -Destination "$DEPLOY_DIR/server" -Recurse -Exclude "node_modules"

# Copy frontend build output
Write-Host "Copying frontend build..." -ForegroundColor Cyan
Copy-Item -Path "project-6120693/out" -Destination "$DEPLOY_DIR/frontend-build" -Recurse

# Copy Docker and config files
Write-Host "Copying configuration files..." -ForegroundColor Cyan
Copy-Item -Path "docker-compose.prod.yml" -Destination "$DEPLOY_DIR/"
Copy-Item -Path ".env.production" -Destination "$DEPLOY_DIR/"
Copy-Item -Path "server/Dockerfile" -Destination "$DEPLOY_DIR/server/"
Copy-Item -Path "server/package.json" -Destination "$DEPLOY_DIR/server/"
Copy-Item -Path "server/package-lock.json" -Destination "$DEPLOY_DIR/server/" -ErrorAction SilentlyContinue

# Create deployment script for EC2
$EC2_DEPLOY_SCRIPT = @'
#!/bin/bash
set -e
echo "=== Installing dependencies on EC2 ==="
cd /home/ec2-user/app/server
npm install --production

echo "=== Running Prisma migrations ==="
npx prisma generate
npx prisma migrate deploy

echo "=== Stopping old containers ==="
cd /home/ec2-user/app
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

echo "=== Starting new containers ==="
docker compose -f docker-compose.prod.yml up -d --build

echo "=== Waiting for services to start ==="
sleep 10

echo "=== Deployment complete ==="
docker compose -f docker-compose.prod.yml ps
'@

Set-Content -Path "$DEPLOY_DIR/deploy-on-ec2.sh" -Value $EC2_DEPLOY_SCRIPT

Write-Host "✅ Deployment package prepared" -ForegroundColor Green

# Step 3: Create archive
Write-Host "`n[3/6] Creating deployment archive..." -ForegroundColor Yellow
if (Test-Path "deploy-optimized.tar.gz") { Remove-Item -Force "deploy-optimized.tar.gz" }
tar -czf deploy-optimized.tar.gz -C $DEPLOY_DIR .
$archiveSize = (Get-Item "deploy-optimized.tar.gz").Length / 1MB
Write-Host "✅ Archive created: $([math]::Round($archiveSize, 2)) MB" -ForegroundColor Green

# Step 4: Upload to EC2
Write-Host "`n[4/6] Uploading to EC2..." -ForegroundColor Yellow
scp -i $KEY_PATH -o StrictHostKeyChecking=no deploy-optimized.tar.gz "${EC2_USER}@${EC2_IP}:~/"
Write-Host "✅ Upload complete" -ForegroundColor Green

# Step 5: Extract and deploy on EC2
Write-Host "`n[5/6] Deploying on EC2..." -ForegroundColor Yellow
$REMOTE_COMMANDS = @"
set -e
echo '=== Extracting deployment package ==='
mkdir -p $REMOTE_DIR
cd $REMOTE_DIR
tar -xzf ~/deploy-optimized.tar.gz
rm ~/deploy-optimized.tar.gz
chmod +x deploy-on-ec2.sh

echo '=== Running deployment script ==='
./deploy-on-ec2.sh

echo '=== Checking service status ==='
docker compose -f docker-compose.prod.yml ps
"@

ssh -i $KEY_PATH -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_IP}" $REMOTE_COMMANDS

# Step 6: Cleanup
Write-Host "`n[6/6] Cleaning up local files..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $DEPLOY_DIR
Remove-Item -Force deploy-optimized.tar.gz
Write-Host "✅ Cleanup complete" -ForegroundColor Green

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Application URL: https://app.trendio.jp" -ForegroundColor Cyan
Write-Host "Instagram Connect: https://app.trendio.jp/instagram-connect" -ForegroundColor Cyan

Write-Host "`nVerifying deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
try {
    $response = Invoke-WebRequest -Uri "https://app.trendio.jp/" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Application is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Could not verify application: $_" -ForegroundColor Yellow
}
