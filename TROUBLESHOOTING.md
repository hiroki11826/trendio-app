# トラブルシューティングガイド

このドキュメントは、よくある問題とその解決方法をまとめたものです。

## 目次
1. [AI コンテンツ生成の問題](#ai-コンテンツ生成の問題)
2. [環境変数の問題](#環境変数の問題)
3. [データベース接続の問題](#データベース接続の問題)
4. [認証の問題](#認証の問題)
5. [デプロイの問題](#デプロイの問題)

---

## AI コンテンツ生成の問題

### 症状: "コンテンツが生成できない"

**エラーメッセージ例:**
```
Error generating content: Failed to generate content ideas
code: 'ai-fail'
```

**原因:**
1. `XAI_API_KEY` が設定されていない
2. Grok API のレート制限に達した
3. Grok API がダウンしている

**解決方法:**

#### 1. 環境変数を確認
```bash
# .env または .env.production ファイルを確認
cat .env.production | grep XAI_API_KEY
```

`XAI_API_KEY` が設定されていない場合：
```bash
# .env.production に追加
echo "XAI_API_KEY=your-api-key-here" >> .env.production
```

#### 2. サーバーを再起動
```bash
# 開発環境
cd server
npm run dev

# 本番環境
npm start
```

#### 3. サーバーログを確認
サーバー起動時に以下のログが表示されるはずです：
```
✅ Required variables set:
   ✓ XAI_API_KEY: xai-...
```

表示されない場合は、環境変数が正しく読み込まれていません。

#### 4. ブラウザのコンソールを確認
F12 → Console タブで以下を確認：
```javascript
// エラーの詳細を確認
Error response: { error: "...", message: "..." }
```

---

## 環境変数の問題

### 症状: "環境変数が読み込まれない"

**原因:**
- 間違った `.env` ファイルを読み込んでいる
- ファイルのパスが間違っている
- 環境変数の形式が間違っている

**解決方法:**

#### 1. 正しいファイルを使用しているか確認
```bash
# 開発環境
ls -la .env

# 本番環境
ls -la .env.production
```

#### 2. ファイルの形式を確認
```bash
# 正しい形式
KEY=value

# 間違った形式（スペースあり）
KEY = value  # ❌

# 間違った形式（引用符が不要）
KEY="value"  # 通常は不要
```

#### 3. サーバーの NODE_ENV を確認
```bash
# 本番環境で起動する場合
export NODE_ENV=production
npm start

# または
NODE_ENV=production npm start
```

---

## データベース接続の問題

### 症状: "データベースに接続できない"

**エラーメッセージ例:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解決方法:**

#### 1. PostgreSQL が起動しているか確認
```bash
# Docker を使用している場合
docker ps | grep postgres

# ローカルの PostgreSQL
sudo systemctl status postgresql
```

#### 2. データベース接続情報を確認
```bash
# .env.production を確認
cat .env.production | grep DB_
```

#### 3. データベースが存在するか確認
```bash
# PostgreSQL に接続
psql -U appuser -d appdb

# データベース一覧を表示
\l
```

#### 4. マイグレーションを実行
```bash
cd server
npx prisma migrate deploy
```

---

## 認証の問題

### 症状: "Instagram/TikTok 連携ができない"

**原因:**
1. Meta/TikTok アプリの設定が間違っている
2. リダイレクト URI が一致していない
3. アクセストークンの有効期限が切れている

**解決方法:**

#### 1. アプリの設定を確認
- Meta: https://developers.facebook.com/apps/
- TikTok: https://developers.tiktok.com/

#### 2. リダイレクト URI を確認
```bash
# .env.production を確認
cat .env.production | grep REDIRECT_URI
```

Meta/TikTok アプリの設定と一致しているか確認してください。

#### 3. アクセストークンを再取得
1. ログアウト
2. 再度ログイン
3. Instagram/TikTok 連携を再実行

---

## デプロイの問題

### 症状: "EC2 にデプロイできない"

**エラーメッセージ例:**
```
ssh: connect to host 54.168.247.161 port 22: Connection refused
```

**解決方法:**

#### 1. EC2 インスタンスが起動しているか確認
AWS コンソールで確認：
- インスタンスの状態が "running" か
- パブリック IP アドレスが割り当てられているか

#### 2. セキュリティグループを確認
- SSH (ポート 22) が許可されているか
- HTTP (ポート 80) が許可されているか
- HTTPS (ポート 443) が許可されているか

#### 3. SSH キーのパーミッションを確認
```powershell
# Windows
icacls "C:\Users\user\snsinsight-key2.pem" /inheritance:r
icacls "C:\Users\user\snsinsight-key2.pem" /grant:r "${env:USERNAME}:(R)"
```

#### 4. SSH 接続をテスト
```powershell
ssh -i "C:\Users\user\snsinsight-key2.pem" ec2-user@54.168.247.161 "echo 'Connection successful'"
```

---

## 一般的なデバッグ手順

### 1. ログを確認
```bash
# サーバーログ
cd server
npm run dev  # コンソールにログが表示される

# ブラウザのコンソール
F12 → Console タブ

# ネットワークリクエスト
F12 → Network タブ
```

### 2. 環境をリセット
```bash
# node_modules を削除して再インストール
rm -rf node_modules package-lock.json
npm install

# ビルドをクリーン
rm -rf dist out
npm run build
```

### 3. データベースをリセット
```bash
cd server
npx prisma migrate reset
npx prisma migrate deploy
npm run seed
```

### 4. ブラウザのキャッシュをクリア
- Ctrl+Shift+Delete (Windows)
- Cmd+Shift+Delete (Mac)
- 「キャッシュされた画像とファイル」を選択
- 「データを削除」

---

## サポートが必要な場合

上記の手順で解決しない場合は、以下の情報を含めて問い合わせてください：

1. **エラーメッセージ**: 完全なエラーメッセージとスタックトレース
2. **環境情報**: OS、Node.js バージョン、npm バージョン
3. **再現手順**: エラーが発生するまでの手順
4. **ログ**: サーバーログとブラウザのコンソールログ
5. **試したこと**: すでに試した解決方法

```bash
# 環境情報を取得
node --version
npm --version
git log -1 --oneline
```
