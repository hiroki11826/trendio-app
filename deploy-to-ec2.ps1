# Deploy to EC2 Script
$ErrorActionPreference = "Stop"

$EC2_IP = "54.168.247.161"
$KEY_PATH = "$env:USERPROFILE\snsinsight-key2.pem"
$EC2_USER = "ec2-user"
$REMOTE_DIR = "/home/ec2-user/app"

Write-Host "=== SNS Insight EC2 Deployment ===" -ForegroundColor Cyan

# Check if key exists
if (-not (Test-Path $KEY_PATH)) {
    Write-Host "Error: SSH key not found at $KEY_PATH" -ForegroundColor Red
    exit 1
}

# Create deployment package
Write-Host "`n[1/5] Creating deployment package..." -ForegroundColor Yellow

# Create temp directory for deployment
$TEMP_DIR = "deploy-temp"
if (Test-Path $TEMP_DIR) { Remove-Item -Recurse -Force $TEMP_DIR }
New-Item -ItemType Directory -Path $TEMP_DIR | Out-Null

# Copy necessary files
Copy-Item -Path "server" -Destination "$TEMP_DIR/server" -Recurse -Exclude "node_modules"
Copy-Item -Path "project-6120693" -Destination "$TEMP_DIR/project-6120693" -Recurse -Exclude "node_modules","out"
Copy-Item -Path "docker-compose.prod.yml" -Destination "$TEMP_DIR/"
Copy-Item -Path ".env.production" -Destination "$TEMP_DIR/"
Copy-Item -Path "deploy.sh" -Destination "$TEMP_DIR/"

# Remove unnecessary files from server
Remove-Item -Path "$TEMP_DIR/server/node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$TEMP_DIR/project-6120693/node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$TEMP_DIR/project-6120693/out" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "[2/5] Creating archive..." -ForegroundColor Yellow
# Create tar.gz archive
tar -czf deploy-package.tar.gz -C $TEMP_DIR .

Write-Host "[3/5] Uploading to EC2..." -ForegroundColor Yellow
# Upload to EC2
scp -i $KEY_PATH -o StrictHostKeyChecking=no deploy-package.tar.gz "${EC2_USER}@${EC2_IP}:~/"

Write-Host "[4/5] Extracting and deploying on EC2..." -ForegroundColor Yellow
# SSH and deploy - use single quotes to prevent PowerShell variable expansion
$DEPLOY_COMMANDS = @'
set -e
echo '=== Extracting package ==='
mkdir -p /home/ec2-user/app
cd /home/ec2-user/app
rm -rf server project-6120693 docker-compose.prod.yml .env.production deploy.sh 2>/dev/null || true
tar -xzf ~/deploy-package.tar.gz
rm ~/deploy-package.tar.gz

echo '=== Starting services with Docker Compose ==='
cd /home/ec2-user/app
chmod +x deploy.sh

# Stop existing containers
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# Build and start
docker compose -f docker-compose.prod.yml up -d --build

# Wait for services
sleep 15

echo '=== Deployment complete ==='
docker compose -f docker-compose.prod.yml ps
docker logs snsinsight-server --tail 20 2>/dev/null || echo 'Server logs not available yet'
'@

ssh -i $KEY_PATH -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_IP}" $DEPLOY_COMMANDS

Write-Host "`n[5/5] Cleaning up..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $TEMP_DIR
Remove-Item -Force deploy-package.tar.gz

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Application URL: http://$EC2_IP" -ForegroundColor Cyan
Write-Host "Or via domain: https://app.snsinsight.jp" -ForegroundColor Cyan
