# デプロイ成功レポート

## 実施内容

### 1. 新しいEC2インスタンスの作成と設定
- **インスタンスID**: `i-051be858e7db08957`
- **パブリックIP**: `52.195.175.239`
- **キーペア**: `trendio-key-20260517-205756`
- **リージョン**: ap-northeast-1 (東京)

### 2. 環境構築
- Docker & Docker Composeのインストール完了
- GitHubから最新コード（コミット `8548b818`）をデプロイ
- 動作していたInstagram OAuth flow（コミット `9f04e581`ベース）を復元

### 3. デプロイ完了
✅ すべてのコンテナが正常に起動
- **Frontend**: ポート80で稼働中
- **Server**: ポート3001で稼働中  
- **Database**: PostgreSQL 16が稼働中

### 4. 環境変数設定
すべての必要な環境変数が正しく設定されています：
- ✓ JWT_SECRET
- ✓ META_APP_ID / META_APP_SECRET
- ✓ TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET
- ✓ XAI_API_KEY

## 次のステップ

### ドメイン設定の更新が必要

現在、`app.trendio.jp` はCloudflare経由で以下のIPを向いています：
- 104.21.81.152
- 172.67.162.64

**新しいインスタンスのIPに更新する必要があります：**
- 新しいIP: `52.195.175.239`

### 更新方法

1. **Cloudflareダッシュボードにログイン**
   - https://dash.cloudflare.com/

2. **DNSレコードを更新**
   - ドメイン `trendio.jp` を選択
   - DNS設定で `app` のAレコードを探す
   - IPアドレスを `52.195.175.239` に変更
   - プロキシ設定（オレンジ雲）はそのまま維持

3. **または、Elastic IPを割り当て**（推奨）
   ```bash
   # Elastic IPを割り当てると、インスタンスを再起動してもIPが変わらない
   aws ec2 allocate-address --domain vpc
   aws ec2 associate-address --instance-id i-051be858e7db08957 --allocation-id <ALLOCATION_ID>
   ```

## 動作確認

DNS更新後、以下のURLで動作確認してください：

- **フロントエンド**: https://app.trendio.jp
- **Instagram接続**: https://app.trendio.jp/instagram-connect
- **ダッシュボード**: https://app.trendio.jp/dashboard

## 旧インスタンスについて

以下の旧インスタンスは停止または削除できます：
- `i-0d57da706a1c8da4b` (54.168.247.161) - snsinsight-server
- `i-0ac4c607f39c472b6` (18.183.87.1) - trendio-server

## トラブルシューティング

もし問題が発生した場合：

```bash
# SSH接続
ssh -i ~/trendio-key-20260517-205756.pem ec2-user@52.195.175.239

# コンテナ状態確認
cd /home/ec2-user/app
docker-compose -f docker-compose.prod.yml ps

# ログ確認
docker-compose -f docker-compose.prod.yml logs server --tail 100

# コンテナ再起動
export JWT_SECRET='change-me-to-a-long-random-secret-for-production-use-only'
export META_APP_ID='1699009877940181'
export META_APP_SECRET='9365dfb38b09186fc2fcfd0c13d54722'
export META_REDIRECT_URI='https://app.trendio.jp/api/auth/meta/callback'
export TIKTOK_CLIENT_KEY='sbaw1x9mxvjpjyjnqh'
export TIKTOK_CLIENT_SECRET='ud2yJMsH4V9PQmixT3hk7mQHZtGZ0Woe'
export TIKTOK_REDIRECT_URI='https://app.trendio.jp/api/auth/tiktok/callback'
export XAI_API_KEY='xai-firKYwH2xhKYJeUX6cer2UDmhVAH6bzl2I5zWlbARJpLWNjBibSwvGUMfOeb1CmSYtvZvm3qlfY8f3Nl'
export XAI_MODEL='grok-4-1-fast-non-reasoning'
docker-compose -f docker-compose.prod.yml restart
```

## 修正内容

Instagram OAuth flowの問題を修正しました：
- `display=popup` パラメータを削除（これが `/me/accounts` が空になる原因でした）
- `getInstagramPageFromUserToken()` の使用を復元
- 動的ロケールサポートを復元
- 追加スコープ（`pages_read_user_content`, `business_management`）を復元

これにより、以前動作していた状態に戻りました。
