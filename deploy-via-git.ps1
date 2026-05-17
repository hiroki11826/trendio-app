# Deploy via Git Pull on EC2
$ErrorActionPreference = "Stop"

$EC2_IP = "54.168.247.161"
$KEY_PATH = "$env:USERPROFILE\snsinsight-key2.pem"
$EC2_USER = "ec2-user"

Write-Host "=== Deploying via Git Pull ===" -ForegroundColor Cyan

$DEPLOY_COMMANDS = @'
set -e
cd /home/ec2-user/app

echo '=== Pulling latest changes from GitHub ==='
git pull origin main

echo '=== Rebuilding and restarting services ==='
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build

echo '=== Waiting for services to start ==='
sleep 15

echo '=== Deployment complete ==='
docker compose -f docker-compose.prod.yml ps
docker logs snsinsight-server --tail 30
'@

Write-Host "Executing deployment on EC2..." -ForegroundColor Yellow
ssh -i $KEY_PATH -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_IP}" $DEPLOY_COMMANDS

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Application URL: https://app.snsinsight.jp" -ForegroundColor Cyan
