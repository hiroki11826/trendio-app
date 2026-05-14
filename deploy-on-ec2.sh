#!/bin/bash
set -e

echo "=========================================="
echo "  AWS EC2 Deployment Script"
echo "=========================================="
echo ""

# ec2-userに切り替え（既にec2-userの場合はスキップ）
if [ "$(whoami)" != "ec2-user" ]; then
    echo "Switching to ec2-user..."
    exec sudo -u ec2-user bash "$0" "$@"
fi

echo "Current user: $(whoami)"
echo "Current directory: $(pwd)"
echo ""

# ホームディレクトリに移動
cd ~
echo "Working directory: $(pwd)"
echo ""

# アプリディレクトリの確認
if [ ! -d "app" ]; then
    echo "ERROR: app directory not found!"
    echo "Please clone the repository first:"
    echo "  git clone https://github.com/ito-hikari/Git2.git app"
    exit 1
fi

cd app
echo "Entered app directory"
echo ""

# 現在のブランチとコミットを表示
echo "Current Git status:"
git branch
git log --oneline -3
echo ""

# 最新のコードをpull
echo "=========================================="
echo "Step 1: Pulling latest code from GitHub"
echo "=========================================="
git fetch origin
git pull origin main
echo "✓ Code updated"
echo ""

# フロントエンドビルドの確認
echo "=========================================="
echo "Step 2: Setting up frontend build"
echo "=========================================="
if [ -d "project-6120693/out" ]; then
    echo "Frontend build found in repository"
    rm -rf frontend-build
    cp -r project-6120693/out frontend-build
    echo "✓ Frontend build copied to frontend-build/"
else
    echo "WARNING: Frontend build not found in repository"
    echo "Building frontend on EC2..."
    cd project-6120693
    npm install
    npm run build
    cd ..
    rm -rf frontend-build
    cp -r project-6120693/out frontend-build
    echo "✓ Frontend built and copied"
fi
echo ""

# サーバーの依存関係をインストール
echo "=========================================="
echo "Step 3: Installing server dependencies"
echo "=========================================="
cd server
npm install --production
echo "✓ Server dependencies installed"
echo ""

# Prisma設定
echo "=========================================="
echo "Step 4: Setting up Prisma"
echo "=========================================="
npx prisma generate
npx prisma migrate deploy
echo "✓ Prisma configured"
echo ""

# Dockerコンテナを再起動
echo "=========================================="
echo "Step 5: Restarting Docker containers"
echo "=========================================="
cd ..

# 古いコンテナを停止
echo "Stopping old containers..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true
echo "✓ Old containers stopped"
echo ""

# 新しいコンテナを起動
echo "Starting new containers..."
docker compose -f docker-compose.prod.yml up -d --build
echo "✓ New containers started"
echo ""

# 起動待機
echo "Waiting for services to start..."
sleep 10
echo ""

# サービスの状態確認
echo "=========================================="
echo "Step 6: Verifying deployment"
echo "=========================================="
docker compose -f docker-compose.prod.yml ps
echo ""

# ログの確認
echo "Recent logs:"
docker compose -f docker-compose.prod.yml logs --tail=20
echo ""

# ヘルスチェック
echo "=========================================="
echo "Health Check"
echo "=========================================="
echo "Checking frontend..."
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:3000/ || echo "Frontend: Not responding"

echo "Checking backend..."
curl -s -o /dev/null -w "Backend: %{http_code}\n" http://localhost:3001/api/health || echo "Backend: Not responding"
echo ""

echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "Application URL: https://app.trendio.jp"
echo "Instagram Connect: https://app.trendio.jp/instagram-connect"
echo ""
echo "To view logs:"
echo "  docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "To check status:"
echo "  docker compose -f docker-compose.prod.yml ps"
echo ""
