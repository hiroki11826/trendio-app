# Meta App設定ガイド

このドキュメントでは、Instagram Business APIを使用するためのMeta Appの設定方法を説明します。

## 前提条件

- Facebookアカウント
- Facebookページ（ビジネスページ）
- Instagramビジネスアカウント（Facebookページにリンク済み）

## 手順

### 1. Meta for Developersにアクセス

1. [Meta for Developers](https://developers.facebook.com/)にアクセス
2. Facebookアカウントでログイン
3. 右上の「マイアプリ」をクリック

### 2. 新しいアプリを作成

1. 「アプリを作成」ボタンをクリック
2. アプリタイプを選択:
   - 「ビジネス」を選択
3. アプリ情報を入力:
   - アプリ表示名: `SNS Management Tool`（任意の名前）
   - アプリの連絡先メールアドレス: あなたのメールアドレス
   - ビジネスアカウント: 既存のものを選択または新規作成
4. 「アプリを作成」をクリック

### 3. Instagram Basic Display APIを追加

1. ダッシュボードで「製品を追加」セクションを探す
2. 「Instagram」を見つけて「設定」をクリック
3. 以下の権限を有効化:
   - `instagram_business_basic`
   - `instagram_manage_insights`
   - `instagram_business_manage_messages`
   - `instagram_manage_comments`

### 4. アプリIDとシークレットを取得

1. 左サイドバーの「設定」→「ベーシック」をクリック
2. 以下の情報をコピー:
   - **アプリID**: `META_APP_ID`として使用
   - **app secret**: `META_APP_SECRET`として使用（「表示」をクリックして表示）

### 5. OAuth設定

1. 左サイドバーの「製品」→「Instagram」→「基本表示」をクリック
2. 「有効なOAuthリダイレクトURI」に以下を追加:
   ```
   http://localhost:3000/auth/meta/callback
   https://localhost:3000/auth/meta/callback
   ```
3. 「変更を保存」をクリック

### 6. ビジネス統合を設定

1. 左サイドバーの「アプリの設定」→「ビジネス統合」をクリック
2. 「ビジネス統合を作成」をクリック
3. 設定を完了すると`config_id`が生成されます
4. この`config_id`を`META_CONFIG_ID`として使用

### 7. アプリモードを開発モードに設定

1. 左サイドバーの「設定」→「ベーシック」
2. 「アプリモード」が「開発モード」になっていることを確認
3. テスト用のInstagramアカウントを「役割」セクションで追加

### 8. 環境変数を設定

`server/.env`ファイルに以下を設定:

```env
META_APP_ID=あなたのアプリID
META_APP_SECRET=あなたのアプリシークレット
META_CONFIG_ID=あなたのconfig_id
META_REDIRECT_URI=http://localhost:3000/auth/meta/callback
META_GRAPH_API_VERSION=v21.0
```

## テスト手順

### 1. データベースとサーバーを起動

```bash
# Docker Desktopを起動してから
docker-compose up -d

# サーバーディレクトリに移動
cd server

# Prismaマイグレーション実行
npx prisma migrate dev

# シードデータ投入
npm run seed

# サーバー起動
npm run dev
```

### 2. フロントエンドを起動

```bash
# プロジェクトディレクトリに移動
cd project-6120693

# 依存関係インストール（初回のみ）
npm install

# 開発サーバー起動
npm run dev
```

### 3. Instagram接続テスト

1. ブラウザで `http://localhost:3000/login` にアクセス
2. デモアカウントでログイン:
   - Email: `owner@nekocafe.com`
   - Password: `NekoCafe123!`
3. 設定ページ (`/settings`) に移動
4. 「Instagram」の「接続する」ボタンをクリック
5. Facebookログインを完了
6. Instagramビジネスアカウントを選択
7. 権限を承認
8. ダッシュボードに戻り、Instagramインサイトが表示されることを確認

## トラブルシューティング

### エラー: "meta_connection_not_found"
- Instagram接続が完了していません
- 設定ページで接続を完了してください

### エラー: "page_token_missing"
- ページアクセストークンが取得できていません
- Facebookページが正しく設定されているか確認
- 再接続を試してください

### エラー: "no_ig_linked_to_pages"
- InstagramアカウントがFacebookページにリンクされていません
- Instagram設定でFacebookページとのリンクを確認

### データが表示されない
- Instagramビジネスアカウントに十分なデータがあるか確認
- アカウントが最近作成された場合、データが蓄積されるまで待つ必要があります
- Meta Graph APIのレート制限に達していないか確認

## 本番環境への移行

1. アプリモードを「ライブモード」に変更
2. アプリレビューを申請して必要な権限を承認してもらう
3. 本番環境のリダイレクトURIを追加
4. 環境変数を本番環境用に更新
5. HTTPS証明書を設定

## 参考リンク

- [Meta for Developers](https://developers.facebook.com/)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Meta Business Login](https://developers.facebook.com/docs/facebook-login/overview)
