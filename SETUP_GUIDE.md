# SNS Management Tool - セットアップガイド

このガイドでは、開発環境のセットアップから動作確認までの手順を説明します。

## 前提条件

以下のソフトウェアがインストールされている必要があります:

- [Node.js](https://nodejs.org/) (v18以上推奨)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd Git2
```

### 2. Docker Desktopの起動

1. Docker Desktopアプリケーションを起動
2. Dockerが正常に起動していることを確認

### 3. PostgreSQLデータベースの起動

```bash
# プロジェクトルートディレクトリで実行
docker-compose up -d
```

データベースが起動したことを確認:
```bash
docker ps
# myapp-postgres コンテナが実行中であることを確認
```

### 4. サーバーのセットアップ

```bash
cd server

# 依存関係のインストール
npm install

# Prismaクライアントの生成
npx prisma generate

# データベースマイグレーションの実行
npx prisma migrate dev

# シードデータの投入（デモユーザー作成）
npm run seed
```

### 5. 環境変数の確認

`server/.env`ファイルが存在することを確認してください。
存在しない場合は作成してください:

```env
DATABASE_URL=postgresql://appuser:apppass@localhost:5432/appdb
PORT=3001
NODE_ENV=development
JWT_SECRET=change-me-to-a-long-random-secret-for-production-use-only
JWT_EXPIRES_IN=2h
JWT_REMEMBER_EXPIRES_IN=30d
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
META_REDIRECT_URI=http://localhost:3000/auth/meta/callback
META_CONFIG_ID=your-meta-config-id
META_GRAPH_API_VERSION=v21.0
```

**注意**: Meta App設定については`META_APP_SETUP.md`を参照してください。

### 6. サーバーの起動

```bash
# serverディレクトリで実行
npm run dev
```

サーバーが起動したことを確認:
```
Server listening on http://localhost:3001
```

### 7. フロントエンドのセットアップ

新しいターミナルを開いて:

```bash
cd project-6120693

# 依存関係のインストール
npm install
```

### 8. フロントエンドの起動

```bash
# project-6120693ディレクトリで実行
npm run dev
```

ブラウザで自動的に開かない場合は、以下のURLにアクセス:
```
http://localhost:3000
```

## 動作確認

### 1. ログイン機能の確認

1. ブラウザで `http://localhost:3000/login` にアクセス
2. 以下のデモアカウントでログイン:

**オーナーアカウント**
- Email: `owner@nekocafe.com`
- Password: `NekoCafe123!`

**営業アカウント**
- Email: `sales@nekocafe.com`
- Password: `SalesStrong#1`

**運用アカウント**
- Email: `ops@nekocafe.com`
- Password: `OpsSecure!2`

### 2. ダッシュボードの確認

ログイン後、ダッシュボードが表示されることを確認:
- モックデータが表示されます
- Instagram接続前は「モックデータ表示中」のバッジが表示されます

### 3. Instagram接続（オプション）

Instagram接続を行う場合:

1. Meta App設定を完了（`META_APP_SETUP.md`参照）
2. `server/.env`にMeta App情報を設定
3. サーバーを再起動
4. 設定ページ (`/settings`) に移動
5. 「Instagram」の「接続する」ボタンをクリック
6. Meta認証フローを完了

### 4. 各機能の確認

以下のページが正常に表示されることを確認:

- **ダッシュボード** (`/dashboard`): Instagram/TikTok分析
- **コメント管理** (`/comments`): コメント一覧とDM送信
- **AIコンテンツ企画** (`/ai-content`): コンテンツアイデア生成
- **トレンド発見** (`/trends`): 人気動画の発見
- **設定** (`/settings`): SNSアカウント連携

## トラブルシューティング

### Docker起動エラー

**エラー**: `unable to get image 'postgres:16'`

**解決方法**:
1. Docker Desktopが起動していることを確認
2. インターネット接続を確認
3. Docker Desktopを再起動

### データベース接続エラー

**エラー**: `DATABASE_URL environment variable is required`

**解決方法**:
1. `server/.env`ファイルが存在することを確認
2. `DATABASE_URL`が正しく設定されていることを確認
3. PostgreSQLコンテナが起動していることを確認: `docker ps`

### Prismaマイグレーションエラー

**エラー**: `Can't reach database server`

**解決方法**:
1. PostgreSQLコンテナが起動していることを確認
2. ポート5432が他のプロセスで使用されていないか確認
3. `docker-compose down`してから`docker-compose up -d`で再起動

### サーバー起動エラー

**エラー**: `JWT_SECRET environment variable is required`

**解決方法**:
1. `server/.env`ファイルに`JWT_SECRET`が設定されていることを確認
2. 本番環境では強力なランダム文字列を使用してください

### フロントエンド起動エラー

**エラー**: `Cannot find module`

**解決方法**:
1. `npm install`を再実行
2. `node_modules`を削除して再インストール:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Instagram接続エラー

**エラー**: `meta_connection_not_found`

**解決方法**:
1. 設定ページでInstagram接続を完了してください
2. Meta App設定が正しいか確認（`META_APP_SETUP.md`参照）

**エラー**: `no_ig_linked_to_pages`

**解決方法**:
1. InstagramビジネスアカウントがFacebookページにリンクされているか確認
2. Instagram設定でFacebookページとの連携を確認

## 開発時の注意事項

### ポート番号

- フロントエンド: `3000`
- バックエンド: `3001`
- PostgreSQL: `5432`

これらのポートが他のアプリケーションで使用されていないことを確認してください。

### ホットリロード

- フロントエンド: ファイル変更時に自動リロード
- バックエンド: ファイル変更時に手動再起動が必要

### データベースリセット

データベースをリセットする場合:

```bash
# コンテナを停止・削除
docker-compose down -v

# 再起動
docker-compose up -d

# マイグレーション再実行
cd server
npx prisma migrate dev
npm run seed
```

## 次のステップ

1. Meta App設定を完了（`META_APP_SETUP.md`参照）
2. Instagram接続をテスト
3. 実際のInstagramデータでダッシュボードを確認
4. 各機能の動作確認

## サポート

問題が解決しない場合は、以下を確認してください:

1. すべての前提条件が満たされているか
2. エラーメッセージの内容
3. ブラウザのコンソールログ
4. サーバーのログ出力

詳細なログを確認:
```bash
# サーバーログ
cd server
npm run dev

# Dockerログ
docker-compose logs -f
```
