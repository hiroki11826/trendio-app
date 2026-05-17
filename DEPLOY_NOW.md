# デプロイ手順

## 修正内容

Instagram OAuth フローを動作していたバージョン（コミット `9f04e581`）に復元しました。

### 主な変更点：
1. **`display=popup` パラメータを削除** - これが `/me/accounts` が空の配列を返す原因でした
2. **`getInstagramPageFromUserToken()` の使用を復元** - 直接 `/me/accounts` を呼び出す代わりに
3. **動的ロケールサポートを復元** - `en_US` に固定せず、ユーザーの言語設定に従う
4. **追加スコープを復元** - `pages_read_user_content`, `business_management`

## デプロイ方法

以下のコマンドをPowerShellで実行してください：

```powershell
# EC2にSSH接続してデプロイ
ssh -i $env:USERPROFILE\snsinsight-key3.pem ec2-user@54.168.247.161

# EC2上で以下のコマンドを実行
cd /home/ec2-user
rm -rf app
mkdir -p app
cd app
wget -q https://github.com/hiroki11826/trendio-app/archive/refs/heads/main.zip
unzip -q main.zip
mv trendio-app-main/* .
mv trendio-app-main/.* . 2>/dev/null || true
rm -rf trendio-app-main main.zip

# Dockerコンテナを再起動
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# 起動確認（15秒待機）
sleep 15
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs server --tail 30
```

## または、1行コマンド（EC2上で実行）

```bash
cd /home/ec2-user && rm -rf app && mkdir -p app && cd app && wget -q https://github.com/hiroki11826/trendio-app/archive/refs/heads/main.zip && unzip -q main.zip && mv trendio-app-main/* . && mv trendio-app-main/.* . 2>/dev/null || true && rm -rf trendio-app-main main.zip && docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d --build && sleep 15 && docker-compose -f docker-compose.prod.yml ps && docker-compose -f docker-compose.prod.yml logs server --tail 30
```

## 確認

デプロイ後、以下のURLで動作確認してください：

- **Instagram接続**: https://app.trendio.jp/instagram-connect
- **ダッシュボード**: https://app.trendio.jp/dashboard

## 期待される動作

1. Instagram接続ボタンをクリック
2. Facebookログイン画面が表示される
3. Meta権限画面で全ての必要なスコープが表示される
4. Facebookページが正常に取得される（`/me/accounts` が空にならない）
5. Instagram Business Accountが紐づいているページが表示される
6. 接続完了

## トラブルシューティング

もし問題が発生した場合：

```bash
# ログを確認
docker-compose -f docker-compose.prod.yml logs server --tail 100

# コンテナの状態を確認
docker-compose -f docker-compose.prod.yml ps

# コンテナを再起動
docker-compose -f docker-compose.prod.yml restart server
```
