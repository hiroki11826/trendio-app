# EC2 デプロイ手順

## 前提条件
- EC2インスタンス: `54.168.247.161` (snsinsight-server)
- SSHキー: `C:\Users\user\snsinsight-key2.pem`

## 方法1: PowerShellスクリプトでデプロイ

```powershell
# プロジェクトディレクトリで実行
.\deploy-to-ec2.ps1
```

## 方法2: 手動デプロイ

### Step 1: EC2にSSH接続
```bash
ssh -i ~/snsinsight-key2.pem ec2-user@54.168.247.161
```

### Step 2: EC2でDockerをインストール（未インストールの場合）
```bash
# Amazon Linux 2023の場合
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Docker Composeインストール
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# 再ログインしてdockerグループを反映
exit
ssh -i ~/snsinsight-key2.pem ec2-user@54.168.247.161
```

### Step 3: ローカルからファイルをアップロード
```powershell
# PowerShellで実行（ローカル）
$KEY = "$env:USERPROFILE\snsinsight-key2.pem"
$EC2 = "ec2-user@54.168.247.161"

# 必要なファイルをアップロード
scp -i $KEY -r server $EC2:~/app/
scp -i $KEY -r project-6120693 $EC2:~/app/
scp -i $KEY docker-compose.prod.yml $EC2:~/app/
scp -i $KEY .env.production $EC2:~/app/
scp -i $KEY deploy.sh $EC2:~/app/
```

### Step 4: EC2でデプロイ実行
```bash
cd ~/app
chmod +x deploy.sh
./deploy.sh
```

## 方法3: Docker不使用（PM2でデプロイ）

### Step 1: EC2でNode.js環境セットアップ
```bash
# Node.jsインストール（nvm使用）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# PM2インストール
npm install -g pm2

# PostgreSQLインストール
sudo yum install -y postgresql15-server
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 2: アプリケーションセットアップ
```bash
cd ~/app

# サーバー依存関係インストール
cd server
npm install
npx prisma generate
npx prisma migrate deploy

# フロントエンドビルド
cd ../project-6120693
npm install
npm run build

# PM2でサーバー起動
cd ../server
pm2 start "node --loader ts-node/esm src/server.ts" --name snsinsight-server

# Nginxでフロントエンド配信
sudo yum install -y nginx
sudo cp -r ../project-6120693/out/* /usr/share/nginx/html/
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 確認
```bash
# コンテナ状態確認（Docker使用時）
docker compose -f docker-compose.prod.yml ps

# PM2状態確認（PM2使用時）
pm2 status

# ログ確認
docker compose -f docker-compose.prod.yml logs -f
# または
pm2 logs snsinsight-server
```

## Cloudflare Tunnel設定
`app.snsinsight.jp` が既にCloudflare Tunnelで設定されている場合、
EC2のポート80にトンネルを向ければHTTPSでアクセス可能です。
