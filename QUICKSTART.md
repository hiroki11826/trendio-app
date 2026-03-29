# クイックスタートガイド

このガイドでは、最短でシステムを起動する手順を説明します。

## 前提条件

- ✅ Node.js (v18以上)
- ✅ Docker Desktop
- ✅ Git

## 🚀 自動セットアップ（推奨）

### Windows (PowerShell)

```powershell
# PowerShellを管理者権限で開く
.\setup.ps1
```

### Mac/Linux (Bash)

```bash
# 実行権限を付与
chmod +x setup.sh

# セットアップ実行
./setup.sh
```

## 📝 手動セットアップ

自動セットアップが失敗した場合、以下の手順を実行してください。

### 1. Docker Desktop起動

Docker Desktopアプリケーションを起動してください。

### 2. データベース起動

```bash
docker-compose up -d
```

### 3. サーバーセットアップ

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
```

### 4. フロントエンドセットアップ

```bash
cd project-6120693
npm install
```

## 🎯 起動方法

### ターミナル1: サーバー起動

```bash
cd server
npm run dev
```

**期待される出力:**
```
Server listening on http://localhost:3001
```

### ターミナル2: フロントエンド起動

```bash
cd project-6120693
npm run dev
```

**期待される出力:**
```
Local: http://localhost:3000/
```

## 🔐 ログイン

ブラウザで `http://localhost:3000/login` にアクセス

**デモアカウント:**
- Email: `owner@nekocafe.com`
- Password: `NekoCafe123!`

## 📱 Instagram接続

### 1. 設定ページに移動

ログイン後、設定ページ (`/settings`) に移動

### 2. Instagram接続

「Instagram」セクションの「接続する」ボタンをクリック

### 3. Meta認証

1. ポップアップウィンドウでFacebookにログイン
2. Instagramビジネスアカウントを選択
3. 権限を承認
4. 接続完了

### 4. データ確認

ダッシュボード (`/dashboard`) で実際のInstagramデータが表示されることを確認

## 🎨 利用可能な機能

### ダッシュボード (`/dashboard`)
- Instagram/TikTok分析
- フォロワー推移
- エンゲージメント率
- 性別・年齢・地域分布

### コメント管理 (`/comments`)
- コメント一覧表示
- 未対応/対応済みフィルター
- DM一括送信

### AIコンテンツ企画 (`/ai-content`)
- 業界別コンテンツアイデア生成
- マーケティング目標別提案
- 台本自動生成

### トレンド発見 (`/trends`)
- 人気動画の発見
- カテゴリー別フィルター
- プラットフォーム別表示

### 設定 (`/settings`)
- SNSアカウント連携
- Instagram/TikTok接続管理

## ⚙️ Meta App設定

Instagram接続には、Meta Appの設定が必要です。

### 既に設定済みの情報

```
App ID: 1210634484091027
App Secret: a5d9a1623bdc301a851b01e8401b9e2a
表示名: BuzzInsight
```

### 必要な確認事項

1. **OAuthリダイレクトURI**
   - `http://localhost:3000/auth/meta/callback` が登録されているか確認
   - [Meta for Developers](https://developers.facebook.com/apps/1210634484091027/settings/basic/)で設定

2. **Instagram製品**
   - Instagram製品が追加されているか確認
   - 必要な権限が有効化されているか確認

3. **Facebookページ連携**
   - InstagramビジネスアカウントがFacebookページにリンクされているか確認

詳細は `META_APP_CHECKLIST.md` を参照してください。

## 🐛 トラブルシューティング

### Docker起動エラー

```
❌ Docker Desktopが起動していません
```

**解決方法:** Docker Desktopアプリケーションを起動してください

### データベース接続エラー

```
❌ Can't reach database server
```

**解決方法:**
```bash
docker-compose down
docker-compose up -d
```

### ポート使用中エラー

```
❌ Port 3000 is already in use
```

**解決方法:** 他のアプリケーションを終了するか、ポート番号を変更してください

### Instagram接続エラー

```
❌ meta_connection_not_found
```

**解決方法:** 設定ページでInstagram接続を完了してください

```
❌ no_ig_linked_to_pages
```

**解決方法:** InstagramアカウントをFacebookページにリンクしてください

## 📚 詳細ドキュメント

- `SETUP_GUIDE.md` - 詳細なセットアップ手順
- `META_APP_CHECKLIST.md` - Meta App設定チェックリスト
- `META_APP_SETUP.md` - Meta App設定の詳細ガイド
- `server/README.md` - サーバーAPI仕様

## 🆘 サポート

問題が解決しない場合:

1. エラーメッセージを確認
2. ブラウザのコンソールログを確認
3. サーバーのログ出力を確認
4. ドキュメントを参照

```bash
# サーバーログ確認
cd server
npm run dev

# Dockerログ確認
docker-compose logs -f
```

## 🎉 次のステップ

1. ✅ システム起動完了
2. ✅ ログイン成功
3. ✅ Instagram接続完了
4. 📊 各機能を試す
5. 🚀 本番環境への移行を検討

Happy coding! 🎨✨
