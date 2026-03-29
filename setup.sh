#!/bin/bash

# SNS Management Tool - セットアップスクリプト
# このスクリプトは開発環境のセットアップを自動化します

set -e

echo "=========================================="
echo "SNS Management Tool - セットアップ開始"
echo "=========================================="
echo ""

# カラー定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Docker確認
echo "📦 Docker Desktopの確認..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker Desktopが起動していません${NC}"
    echo "Docker Desktopを起動してから再度実行してください"
    exit 1
fi
echo -e "${GREEN}✅ Docker Desktop起動確認${NC}"
echo ""

# 2. PostgreSQL起動
echo "🐘 PostgreSQLデータベースの起動..."
docker-compose up -d
echo -e "${GREEN}✅ PostgreSQL起動完了${NC}"
echo ""

# 3. データベース起動待機
echo "⏳ データベースの準備を待機中..."
sleep 5
echo -e "${GREEN}✅ データベース準備完了${NC}"
echo ""

# 4. サーバーセットアップ
echo "🔧 サーバーのセットアップ..."
cd server

echo "  📦 依存関係のインストール..."
npm install

echo "  🔨 Prismaクライアントの生成..."
npx prisma generate

echo "  🗄️  データベースマイグレーション..."
npx prisma migrate dev --name init

echo "  🌱 シードデータの投入..."
npm run seed

cd ..
echo -e "${GREEN}✅ サーバーセットアップ完了${NC}"
echo ""

# 5. フロントエンドセットアップ
echo "🎨 フロントエンドのセットアップ..."
cd project-6120693

echo "  📦 依存関係のインストール..."
npm install

cd ..
echo -e "${GREEN}✅ フロントエンドセットアップ完了${NC}"
echo ""

# 6. 環境変数確認
echo "🔍 環境変数の確認..."
if [ -f "server/.env" ]; then
    echo -e "${GREEN}✅ server/.env ファイル存在${NC}"
else
    echo -e "${RED}❌ server/.env ファイルが見つかりません${NC}"
fi

if [ -f "project-6120693/.env" ]; then
    echo -e "${GREEN}✅ project-6120693/.env ファイル存在${NC}"
else
    echo -e "${RED}❌ project-6120693/.env ファイルが見つかりません${NC}"
fi
echo ""

# 7. セットアップ完了
echo "=========================================="
echo -e "${GREEN}✅ セットアップ完了！${NC}"
echo "=========================================="
echo ""
echo "次のステップ:"
echo ""
echo "1. サーバーを起動:"
echo "   cd server"
echo "   npm run dev"
echo ""
echo "2. 新しいターミナルでフロントエンドを起動:"
echo "   cd project-6120693"
echo "   npm run dev"
echo ""
echo "3. ブラウザでアクセス:"
echo "   http://localhost:3000/login"
echo ""
echo "4. デモアカウントでログイン:"
echo "   Email: owner@nekocafe.com"
echo "   Password: NekoCafe123!"
echo ""
echo "5. Instagram接続:"
echo "   設定ページ (/settings) で「接続する」をクリック"
echo ""
echo -e "${YELLOW}📖 詳細は SETUP_GUIDE.md と META_APP_CHECKLIST.md を参照${NC}"
echo ""
