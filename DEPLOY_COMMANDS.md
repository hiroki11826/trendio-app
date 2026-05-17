# EC2デプロイコマンド

Session Managerで以下のコマンドを順番に実行してください：

## 1. 最新コードをダウンロード

```bash
cd /home/ec2-user
rm -rf app
wget https://github.com/hiroki11826/trendio-app/archive/refs/heads/main.zip
unzip -q main.zip
mv trendio-app-main app
rm main.zip
```

## 2. .env.productionファイルを確認

```bash
cd ~/app
ls -la .env.production
cat .env.production
```

## 3. 古いDockerコンテナを停止

```bash
cd ~/app
docker-compose -f docker-compose.prod.yml down
```

## 4. 新しいDockerコンテナをビルド＆起動

```bash
cd ~/app
docker-compose -f docker-compose.prod.yml up -d --build
```

## 5. ログを確認

```bash
docker-compose -f docker-compose.prod.yml logs -f server
```

Ctrl+Cでログ表示を終了できます。

## 6. 動作確認

ブラウザで以下のURLにアクセス：
- https://app.trendio.jp
- https://app.trendio.jp/instagram-connect

---

## 修正内容

✅ Prisma 7.4.0 → 5.22.0にダウングレード
✅ @prisma/adapter-pgを削除（Prisma 5では不要）
✅ docker-compose.prod.ymlにenv_file設定済み

これでビルドエラーが解消され、環境変数も正しく読み込まれるはずです。
