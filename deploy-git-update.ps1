# Deploy via Git on EC2
$ErrorActionPreference = "Stop"

$EC2_IP = "52.195.175.239"
$KEY_PATH = "$env:USERPROFILE\trendio-key-20260517-205756.pem"
$EC2_USER = "ec2-user"

Write-Host "=== Deploying latest code to EC2 ===" -ForegroundColor Cyan

$DEPLOY_COMMANDS = @'
set -e
cd /home/ec2-user/app

echo "=== Forcing Git update ==="
git reset --hard origin/main

echo "=== Verifying latest commit ==="
git log --oneline -5

echo "=== Stopping containers ==="
docker-compose --env-file .env.production -f docker-compose.prod.yml down

echo "=== Rebuilding and starting containers ==="
docker-compose --env-file .env.production -f docker-compose.prod.yml up -d --build

echo "=== Waiting for services to start ==="
sleep 15

echo "=== Checking service status ==="
docker-compose --env-file .env.production -f docker-compose.prod.yml ps

echo "=== Recent logs ==="
docker logs snsinsight-server --tail 30

echo "=== Disk usage ==="
df -h
'@

Write-Host "Executing deployment on EC2..." -ForegroundColor Yellow
ssh -i $KEY_PATH -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_IP}" $DEPLOY_COMMANDS

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Application URL: https://app.snsinsight.jp" -ForegroundColor Cyan
Write-Host "Instagram Connect: https://app.snsinsight.jp/instagram-connect" -ForegroundColor Cyan
