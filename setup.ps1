# SNS Management Tool - セットアップスクリプト (PowerShell)
# このスクリプトは開発環境のセットアップを自動化します

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "SNS Management Tool - セットアップ開始" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Docker確認
Write-Host "📦 Docker Desktopの確認..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker Desktop起動確認" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Desktopが起動していません" -ForegroundColor Red
    Write-Host "Docker Desktopを起動してから再度実行してください" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. PostgreSQL起動
Write-Host "🐘 PostgreSQLデータベースの起動..." -ForegroundColor Yellow
docker-compose up -d
Write-Host "✅ PostgreSQL起動完了" -ForegroundColor Green
Write-Host ""

# 3. データベース起動待機
Write-Host "⏳ データベースの準備を待機中..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host "✅ データベース準備完了" -ForegroundColor Green
Write-Host ""

# 4. サーバーセットアップ
Write-Host "🔧 サーバーのセットアップ..." -ForegroundColor Yellow
Set-Location server

Write-Host "  📦 依存関係のインストール..." -ForegroundColor Cyan
npm install

Write-Host "  🔨 Prismaクライアントの生成..." -ForegroundColor Cyan
npx prisma generate

Write-Host "  🗄️  データベースマイグレーション..." -ForegroundColor Cyan
npx prisma migrate dev --name init

Write-Host "  🌱 シードデータの投入..." -ForegroundColor Cyan
npm run seed

Set-Location ..
Write-Host "✅ サーバーセットアップ完了" -ForegroundColor Green
Write-Host ""

# 5. フロントエンドセットアップ
Write-Host "🎨 フロントエンドのセットアップ..." -ForegroundColor Yellow
Set-Location project-6120693

Write-Host "  📦 依存関係のインストール..." -ForegroundColor Cyan
npm install

Set-Location ..
Write-Host "✅ フロントエンドセットアップ完了" -ForegroundColor Green
Write-Host ""

# 6. 環境変数確認
Write-Host "🔍 環境変数の確認..." -ForegroundColor Yellow
if (Test-Path "server\.env") {
    Write-Host "✅ server\.env ファイル存在" -ForegroundColor Green
} else {
    Write-Host "❌ server\.env ファイルが見つかりません" -ForegroundColor Red
}

if (Test-Path "project-6120693\.env") {
    Write-Host "✅ project-6120693\.env ファイル存在" -ForegroundColor Green
} else {
    Write-Host "❌ project-6120693\.env ファイルが見つかりません" -ForegroundColor Red
}
Write-Host ""

# 7. セットアップ完了
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ セットアップ完了！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "次のステップ:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. サーバーを起動:" -ForegroundColor White
Write-Host "   cd server" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. 新しいターミナルでフロントエンドを起動:" -ForegroundColor White
Write-Host "   cd project-6120693" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. ブラウザでアクセス:" -ForegroundColor White
Write-Host "   http://localhost:3000/login" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. デモアカウントでログイン:" -ForegroundColor White
Write-Host "   Email: owner@nekocafe.com" -ForegroundColor Cyan
Write-Host "   Password: NekoCafe123!" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Instagram接続:" -ForegroundColor White
Write-Host "   設定ページ (/settings) で「接続する」をクリック" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 詳細は SETUP_GUIDE.md と META_APP_CHECKLIST.md を参照" -ForegroundColor Yellow
Write-Host ""
