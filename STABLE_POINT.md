# 安定ポイント (Stable Point)

## 概要

このドキュメントは、アプリケーションが正常に動作している安定した状態を記録したものです。
破壊的変更が発生した場合、このポイントに戻すことで復旧できます。

## 安定ポイント情報

| 項目 | 値 |
|------|-----|
| **日時** | 2026年5月18日 |
| **コミットハッシュ** | `86768466` |
| **Git タグ** | `v1.0-stable` |
| **ブランチ** | `main` |
| **リポジトリ** | `https://github.com/hiroki11826/trendio-app.git` |

## 動作確認済み機能

- ✅ ログイン (`test@test.com` / `Test1234!`)
- ✅ Discover Trends（トレンド分析）
- ✅ AI Content（コンテンツアイデア生成）
- ✅ Generate Detailed Script（台本生成）
- ✅ Save（アイデア・スクリプト保存）
- ✅ Comments（コメント返信・AI返信案）- 返信済みコメントにも再返信可能
- ✅ 会社情報の編集・保存
- ✅ サイドバーに社名表示（Trendioの下に小さく表示）
- ✅ Instagram / TikTok 接続

## 環境情報

### EC2 サーバー
- **IP**: 52.195.175.239
- **SSH キー**: `C:\Users\user\trendio-key-20260517-205756.pem`
- **ユーザー**: ec2-user
- **アプリディレクトリ**: ~/app

### Docker コンテナ
- `snsinsight-frontend` - Nginx + React SPA (ポート 80)
- `snsinsight-server` - Node.js API (ポート 3001, Docker内部)
- `snsinsight-postgres` - PostgreSQL 16

### 主要設定
- **XAI_MODEL**: `grok-4.20-0309-non-reasoning`
- **nginx proxy_read_timeout**: 120s
- **JWT有効期限**: 2時間

## 復旧手順

### ローカルで戻す場合
```bash
git checkout v1.0-stable
# または
git reset --hard 86768466
```

### EC2で戻す場合
```bash
ssh -i C:\Users\user\trendio-key-20260517-205756.pem ec2-user@52.195.175.239

cd ~/app
git fetch origin
git checkout v1.0-stable

# サーバー再ビルド
cd server && docker build --no-cache -t app-server .
docker stop snsinsight-server && docker rm snsinsight-server
cd ~/app && docker run -d --name snsinsight-server --restart always --network app_app-network --env-file .env.production -e 'DATABASE_URL=postgresql://appuser:apppass@snsinsight-postgres:5432/appdb' -e PORT=3001 -e NODE_ENV=production -e JWT_EXPIRES_IN=2h -e JWT_REMEMBER_EXPIRES_IN=30d -e META_GRAPH_API_VERSION=v21.0 app-server

# フロントエンド再ビルド
cd project-6120693 && docker build --no-cache -t app-frontend .
docker stop snsinsight-frontend && docker rm snsinsight-frontend
docker run -d --name snsinsight-frontend --restart always --network app_app-network -p 80:80 app-frontend
```

## 注意事項

- `docker-compose` は EC2 上の buildx バージョンが古いため使用不可。`docker build` + `docker run` で個別に操作する。
- `.env.production` は gitignore されていないため、リポジトリに含まれている（秘密情報あり、注意）。
- DB マイグレーションは Prisma で管理。スキーマ変更時は `npx prisma migrate deploy` が必要。
