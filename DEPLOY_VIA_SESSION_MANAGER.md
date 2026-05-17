# Session Manager経由でデプロイする方法

SSH接続が不要な方法でデプロイします。

## 方法1: Gitリポジトリ経由（最も簡単）

### ステップ1: ローカルでGitにプッシュ

```powershell
# 現在のディレクトリで実行
git status

# まだコミットしていない変更があればコミット
git add .
git commit -m "feat: Add Instagram OAuth flow for production"

# リモートリポジトリにプッシュ
git push origin main
```

### ステップ2: Session ManagerでEC2に接続

AWS Console → EC2 → インスタンス選択 → **接続** → **Session Manager** → **接続**

### ステップ3: EC2でデプロイ実行

```bash
# ec2-userに切り替え
sudo su - ec2-user
cd ~

# アプリディレクトリに移動（存在しない場合は作成）
cd app || mkdir -p app && cd app

# 最新のコードをpull
git pull origin main

# フロントエンドのビルドファイルを配置
rm -rf frontend-build
cp -r project-6120693/out frontend-build

# サーバーの依存関係をインストール
cd server
npm install --production

# Prisma設定
npx prisma generate
npx prisma migrate deploy

# Dockerコンテナを再起動
cd ..
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build

# 起動確認
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f --tail=50
```

---

## 方法2: ビルド済みファイルをアップロード

### ステップ1: ローカルでS3にアップロード（AWS CLIが必要）

```powershell
# デプロイパッケージが既に作成されている場合
aws s3 cp deploy-optimized.tar.gz s3://your-bucket-name/deploy-optimized.tar.gz

# または新しく作成
tar -czf deploy-package.tar.gz -C project-6120693/out . server/ docker-compose.prod.yml .env.production
aws s3 cp deploy-package.tar.gz s3://your-bucket-name/deploy-package.tar.gz
```

### ステップ2: Session ManagerでEC2からダウンロード

```bash
# ec2-userに切り替え
sudo su - ec2-user
cd ~

# S3からダウンロード
aws s3 cp s3://your-bucket-name/deploy-package.tar.gz .

# 展開
mkdir -p app-new
cd app-new
tar -xzf ../deploy-package.tar.gz

# 古いアプリをバックアップ
cd ~
mv app app-backup-$(date +%Y%m%d-%H%M%S)
mv app-new app

# デプロイ実行（方法1のステップ3と同じ）
cd app
# ... 以下同じ
```

---

## 方法3: Session Manager内で直接ビルド（非推奨）

EC2のリソースが十分にある場合のみ。

```bash
# ec2-userに切り替え
sudo su - ec2-user
cd ~/app

# フロントエンドをビルド
cd project-6120693
npm install
npm run build

# ビルドファイルを配置
cd ..
rm -rf frontend-build
cp -r project-6120693/out frontend-build

# 以下、方法1のステップ3と同じ
```

---

## 推奨: 方法1（Gitリポジトリ経由）

最も簡単で確実です。以下の手順で進めてください：

### 1. ローカルでGitの状態を確認

```powershell
git status
git log --oneline -5
```

### 2. リモートリポジトリのURLを確認

```powershell
git remote -v
```

### 3. プッシュ

```powershell
git push origin main
```

### 4. Session ManagerでEC2に接続

### 5. EC2でpullしてデプロイ

```bash
sudo su - ec2-user
cd ~/app
git pull origin main

# フロントエンドビルドが含まれているか確認
ls -la project-6120693/out/

# ビルドファイルがない場合は、ローカルでビルドしてGitにコミット
# または、EC2でビルド実行
cd project-6120693
npm install
npm run build
cd ..

# デプロイ実行
rm -rf frontend-build
cp -r project-6120693/out frontend-build

cd server
npm install --production
npx prisma generate
npx prisma migrate deploy

cd ..
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build

# 確認
docker compose -f docker-compose.prod.yml ps
```

---

## トラブルシューティング

### Gitリポジトリが設定されていない場合

```bash
# EC2で実行
cd ~/app
git remote -v

# リモートが設定されていない場合
git remote add origin <your-repo-url>
git fetch origin
git branch --set-upstream-to=origin/main main
```

### Node.jsのバージョンが古い場合

```bash
# Node.jsのバージョン確認
node -v

# 必要に応じてアップデート
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### Dockerが起動していない場合

```bash
# Dockerの状態確認
sudo systemctl status docker

# 起動
sudo systemctl start docker

# 自動起動設定
sudo systemctl enable docker
```

---

## 次のステップ

1. **ローカルでGitにプッシュ**
2. **Session ManagerでEC2に接続**
3. **上記のコマンドを実行**
4. **動作確認**

```bash
# アプリケーションの確認
curl http://localhost:3000/
curl http://localhost:3001/api/health

# 外部からの確認（ローカルで実行）
curl https://app.trendio.jp/
curl https://app.trendio.jp/instagram-connect
```

どの方法で進めますか？
