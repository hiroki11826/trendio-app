# SNS Management Tool

Instagram と TikTok のアカウント管理、分析、AI コンテンツ生成を統合したプラットフォーム。

## 📚 ドキュメント

- **[開発ガイドライン](DEVELOPMENT_GUIDELINES.md)** - 破壊的変更を防ぐためのベストプラクティス
- **[トラブルシューティング](TROUBLESHOOTING.md)** - よくある問題と解決方法
- **[デプロイ手順](DEPLOY_INSTRUCTIONS.md)** - EC2 へのデプロイ方法
- **[セットアップガイド](SETUP_GUIDE.md)** - 初期セットアップ手順

## 🚀 クイックスタート

### 前提条件

- Node.js 18 以上
- PostgreSQL 14 以上
- Meta Developer アカウント
- TikTok Developer アカウント
- xAI API キー (Grok)

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd project-6120693
```

### 2. 環境変数の設定

```bash
# ルートディレクトリに .env.production を作成
cp .env.production.example .env.production

# 必要な値を設定
nano .env.production
```

**必須の環境変数:**
- `DB_USER`, `DB_PASSWORD`, `DB_NAME` - PostgreSQL 接続情報
- `JWT_SECRET` - JWT トークンの秘密鍵
- `XAI_API_KEY` - xAI Grok API キー
- `META_APP_ID`, `META_APP_SECRET` - Meta アプリの認証情報
- `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET` - TikTok アプリの認証情報

### 3. 依存パッケージのインストール

```bash
# フロントエンド
cd project-6120693
npm install

# バックエンド
cd ../server
npm install
```

### 4. データベースのセットアップ

```bash
cd server

# Prisma マイグレーション
npx prisma migrate deploy

# 初期データの投入（オプション）
npm run seed
```

### 5. アプリケーションの起動

#### 開発環境

```bash
# バックエンド（ターミナル1）
cd server
npm run dev

# フロントエンド（ターミナル2）
cd project-6120693
npm run dev
```

#### 本番環境

```bash
# フロントエンドのビルド
cd project-6120693
npm run build

# バックエンドのビルド
cd ../server
npm run build

# サーバーの起動
NODE_ENV=production npm start
```

## 🏗️ プロジェクト構成

```
.
├── project-6120693/          # フロントエンド (React + Vite)
│   ├── src/
│   │   ├── pages/           # ページコンポーネント
│   │   ├── services/        # API クライアント
│   │   └── i18n/            # 多言語対応
│   └── out/                 # ビルド出力
│
├── server/                   # バックエンド (Express + Prisma)
│   ├── src/
│   │   ├── services/        # ビジネスロジック
│   │   ├── config/          # 設定ファイル
│   │   └── server.ts        # メインサーバー
│   ├── prisma/              # データベーススキーマ
│   └── dist/                # ビルド出力
│
├── DEVELOPMENT_GUIDELINES.md # 開発ガイドライン
├── TROUBLESHOOTING.md        # トラブルシューティング
└── .env.production           # 本番環境変数（Git 管理外）
```

## 🎯 主な機能

### 1. ダッシュボード
- Instagram と TikTok のアカウント統合管理
- リアルタイムの分析データ表示
- フォロワー推移、エンゲージメント率の可視化

### 2. AI コンテンツ生成
- 業界とマーケティング目標に基づいたコンテンツアイデア生成
- 詳細な動画台本の自動生成
- 保存・管理機能

### 3. コメント管理
- Instagram コメントの一覧表示
- AI による返信案の生成
- DM 送信機能

### 4. トレンド分析
- 業界別のトレンドトピック分析
- 人気ハッシュタグの提案
- 効果的なコンテンツ形式の推奨

## 🔧 開発

### コードの品質チェック

```bash
# TypeScript の型チェック
npm run type-check

# リント
npm run lint

# フォーマット
npm run format
```

### データベース操作

```bash
# マイグレーションの作成
npx prisma migrate dev --name migration_name

# Prisma Studio の起動（GUI でデータベースを操作）
npx prisma studio

# データベースのリセット
npx prisma migrate reset
```

### デバッグ

#### サーバーログの確認
```bash
cd server
npm run dev  # コンソールにログが表示される
```

#### ブラウザのデバッグ
1. F12 で開発者ツールを開く
2. Console タブでエラーを確認
3. Network タブで API リクエストを確認

## 🚢 デプロイ

### EC2 へのデプロイ

詳細は [DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md) を参照してください。

```bash
# デプロイスクリプトの実行
./deploy-to-ec2.ps1
```

### Docker を使用したデプロイ

```bash
# Docker Compose で起動
docker-compose -f docker-compose.prod.yml up -d

# ログの確認
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔒 セキュリティ

### 環境変数の管理
- `.env` と `.env.production` は **絶対に Git にコミットしない**
- `.gitignore` に追加されていることを確認
- 本番環境では強力なパスワードと秘密鍵を使用

### API キーの保護
- API キーは環境変数で管理
- クライアント側のコードに API キーを含めない
- 定期的にキーをローテーション

## 📊 監視とメンテナンス

### ヘルスチェック
```bash
# サーバーの稼働確認
curl http://localhost:3001/health
```

### ログの確認
```bash
# サーバーログ
tail -f server/logs/app.log

# Docker ログ
docker-compose logs -f server
```

### バックアップ
```bash
# データベースのバックアップ
pg_dump -U appuser -d appdb > backup_$(date +%Y%m%d).sql

# バックアップからの復元
psql -U appuser -d appdb < backup_20240101.sql
```

## 🐛 トラブルシューティング

問題が発生した場合は、[TROUBLESHOOTING.md](TROUBLESHOOTING.md) を参照してください。

よくある問題：
- [AI コンテンツが生成できない](TROUBLESHOOTING.md#ai-コンテンツ生成の問題)
- [環境変数が読み込まれない](TROUBLESHOOTING.md#環境変数の問題)
- [データベースに接続できない](TROUBLESHOOTING.md#データベース接続の問題)
- [Instagram/TikTok 連携ができない](TROUBLESHOOTING.md#認証の問題)

## 🤝 コントリビューション

1. フィーチャーブランチを作成: `git checkout -b feature/amazing-feature`
2. 変更をコミット: `git commit -m 'Add amazing feature'`
3. ブランチをプッシュ: `git push origin feature/amazing-feature`
4. プルリクエストを作成

コミットメッセージの形式は [DEVELOPMENT_GUIDELINES.md](DEVELOPMENT_GUIDELINES.md#4-バージョン管理のベストプラクティス) を参照してください。

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 📞 サポート

問題が発生した場合や質問がある場合は、以下の情報を含めて Issue を作成してください：

1. エラーメッセージ
2. 環境情報（OS、Node.js バージョン）
3. 再現手順
4. 試した解決方法

---

**重要なリンク:**
- [開発ガイドライン](DEVELOPMENT_GUIDELINES.md) - 破壊的変更を防ぐ
- [トラブルシューティング](TROUBLESHOOTING.md) - 問題解決
- [デプロイ手順](DEPLOY_INSTRUCTIONS.md) - 本番環境へのデプロイ
