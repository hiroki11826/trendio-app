# TikTok App セットアップガイド

このガイドでは、TikTok for Developers でアプリを作成し、BuzzInsight と連携する手順を説明します。

## ステップ 1: TikTok for Developers アカウント作成

1. [TikTok for Developers](https://developers.tiktok.com/) にアクセス
2. 右上の「Register」をクリック
3. TikTokアカウントでログイン（持っていない場合は作成）
4. 開発者登録フォームを記入

## ステップ 2: アプリの作成

1. ダッシュボードで「Manage apps」をクリック
2. 「Create an app」をクリック
3. アプリ情報を入力:
   - **App name**: `BuzzInsight`
   - **App description**: `SNS analytics and management tool`
   - **Category**: `Social Media`

## ステップ 3: Login Kit の設定

1. 作成したアプリをクリック
2. 左メニューから「Add products」を選択
3. 「Login Kit」の「Add」ボタンをクリック
4. Redirect URIs を設定:
   ```
   http://localhost:3000/auth/tiktok/callback
   ```
   （本番環境では https:// の URL に変更）

## ステップ 4: Display API の追加

1. 左メニューから「Add products」を選択
2. 「Display API」の「Add」ボタンをクリック
3. 必要なスコープを選択:
   - `user.info.basic` - ユーザー基本情報
   - `user.info.profile` - プロフィール情報
   - `user.info.stats` - フォロワー数などの統計
   - `video.list` - 動画リスト

## ステップ 5: 認証情報の取得

1. 左メニューから「Basic Information」を選択
2. 以下の情報をコピー:
   - **Client Key** (App ID)
   - **Client Secret**

## ステップ 6: 環境変数の設定

`server/.env` ファイルに以下を追加:

```env
# TikTok API
TIKTOK_CLIENT_KEY=your_client_key_here
TIKTOK_CLIENT_SECRET=your_client_secret_here
TIKTOK_REDIRECT_URI=http://localhost:3000/auth/tiktok/callback
```

## ステップ 7: アプリの公開申請（オプション）

開発中は「Draft」モードで動作しますが、以下の制限があります:
- 自分のアカウントのみテスト可能
- 一部機能が制限される

本番環境で使用する場合は、アプリの審査申請が必要です。

## トラブルシューティング

### Redirect URI エラー
- Redirect URI が完全一致していることを確認
- `http://` と `https://` の違いに注意
- 末尾のスラッシュ `/` の有無を確認

### スコープエラー
- 必要なスコープがアプリに追加されているか確認
- ユーザーが承認画面でスコープを許可したか確認

### アクセストークンエラー
- Client Secret が正しいか確認
- トークンの有効期限を確認（通常24時間）

## 参考リンク

- [TikTok for Developers](https://developers.tiktok.com/)
- [Login Kit Documentation](https://developers.tiktok.com/doc/login-kit-web)
- [Display API Documentation](https://developers.tiktok.com/doc/display-api-get-started)
