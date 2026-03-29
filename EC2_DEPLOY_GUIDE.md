# EC2 デプロイガイド

## 前提条件

- EC2インスタンス (Amazon Linux 2023 または Ubuntu 22.04 推奨)
- Docker と Docker Compose がインストール済み
- セキュリティグループで 80, 443 ポートが開放済み

## 1. EC2 セットアップ

```bash
# Amazon Linux 2023 の場合
sudo yum update -y
sudo yum install -y docker git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Docker Compose インストール
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 再ログインして docker グループを反映
exit
```

## 2. プロジェクトをEC2に転送

### 方法A: Git経由
```bash
git clone https://your-repo-url.git
cd your-project
```

### 方法B: SCP経由
```bash
# ローカルから実行
scp -i your-key.pem -r ./* ec2-user@your-ec2-ip:~/app/
```

## 3. 環境変数設定

```bash
cd ~/app
cp .env.production.example .env.production
nano .env.production  # 本番用の値を設定
```

## 4. デプロイ実行

```bash
chmod +x deploy.sh
./deploy.sh
```

## 5. HTTPS設定 (Cloudflare Tunnel 使用時)

既に `app.snsinsight.jp` で Cloudflare Tunnel を使用している場合:

1. Cloudflare Dashboard で Tunnel 設定を確認
2. EC2のプライベートIPまたはパブリックIPにトンネルを向ける
3. SSL/TLS を Full (strict) に設定

## 6. 動作確認

```bash
# コンテナ状態確認
docker compose -f docker-compose.prod.yml ps

# ログ確認
docker compose -f docker-compose.prod.yml logs -f

# ヘルスチェック
curl http://localhost/api/health
```

## トラブルシューティング

### データベース接続エラー
```bash
docker compose -f docker-compose.prod.yml logs db
docker compose -f docker-compose.prod.yml exec db psql -U appuser -d appdb
```

### フロントエンドが表示されない
```bash
docker compose -f docker-compose.prod.yml logs frontend
docker compose -f docker-compose.prod.yml exec frontend cat /etc/nginx/conf.d/default.conf
```

### サーバーエラー
```bash
docker compose -f docker-compose.prod.yml logs server
docker compose -f docker-compose.prod.yml exec server npx prisma migrate status
```
