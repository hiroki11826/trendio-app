# Meta App設定チェックリスト

## 提供された情報

✅ **Meta App (BuzzInsight)**
- App ID: `1210634484091027`
- App Secret: `a5d9a1623bdc301a851b01e8401b9e2a`
- 表示名: BuzzInsight

✅ **Instagram App (BuzzInsight-IG)**
- Instagram App ID: `1223722222749775`
- Instagram App Secret: `028ed99e36e260473b229b6d7e9c7b3c`

## 必須設定の確認

以下の設定がMeta for Developersで完了しているか確認してください:

### 1. OAuth リダイレクトURI設定

**場所**: Meta for Developers → アプリ → 設定 → ベーシック

**必要な設定**:
- [ ] 「有効なOAuthリダイレクトURI」に以下が追加されているか確認:
  ```
  http://localhost:3000/auth/meta/callback
  https://localhost:3000/auth/meta/callback
  ```

**設定方法**:
1. [Meta for Developers](https://developers.facebook.com/apps/1210634484091027/settings/basic/)にアクセス
2. 「有効なOAuthリダイレクトURI」セクションを探す
3. 上記のURIを追加
4. 「変更を保存」をクリック

### 2. Instagram製品の追加

**場所**: Meta for Developers → アプリ → 製品

**必要な設定**:
- [ ] Instagram製品が追加されているか確認
- [ ] 以下の権限が有効化されているか確認:
  - `instagram_business_basic`
  - `instagram_manage_insights`
  - `instagram_business_manage_messages`
  - `instagram_manage_comments`

**設定方法**:
1. ダッシュボードで「製品を追加」をクリック
2. 「Instagram」を見つけて「設定」をクリック
3. 必要な権限を有効化

### 3. ビジネス統合（Config ID）

**場所**: Meta for Developers → アプリ → アプリの設定 → ビジネス統合

**必要な設定**:
- [ ] ビジネス統合が作成されているか確認
- [ ] Config IDが取得できているか確認

**現在の設定**:
- Config ID: `824461726720947` (既存の値を使用)

**確認方法**:
1. 「ビジネス統合」セクションにアクセス
2. 既存の統合があるか確認
3. ない場合は「ビジネス統合を作成」をクリック

### 4. アプリモード

**場所**: Meta for Developers → アプリ → 設定 → ベーシック

**開発環境**:
- [ ] アプリモードが「開発モード」になっているか確認
- [ ] テストユーザーが追加されているか確認（必要に応じて）

**本番環境への移行時**:
- [ ] アプリレビューを申請
- [ ] 必要な権限の承認を取得
- [ ] アプリモードを「ライブモード」に変更

### 5. Facebookページとの連携

**前提条件**:
- [ ] Facebookビジネスページが作成されている
- [ ] InstagramビジネスアカウントがFacebookページにリンクされている

**確認方法**:
1. Facebookページの設定にアクセス
2. 「Instagram」セクションを確認
3. Instagramアカウントがリンクされていることを確認

### 6. テストアカウントの追加（開発モード時）

**場所**: Meta for Developers → アプリ → 役割

**必要な設定**:
- [ ] 開発者として自分のFacebookアカウントが追加されている
- [ ] テストユーザーが追加されている（必要に応じて）

## 環境変数の確認

`server/.env`ファイルが以下の内容で更新されていることを確認:

```env
META_APP_ID=1210634484091027
META_APP_SECRET=a5d9a1623bdc301a851b01e8401b9e2a
META_REDIRECT_URI=http://localhost:3000/auth/meta/callback
META_CONFIG_ID=824461726720947
META_GRAPH_API_VERSION=v21.0
```

## 動作確認手順

### 1. サーバー起動前の確認

```bash
# Docker Desktopが起動していることを確認
docker ps

# PostgreSQLコンテナが起動していない場合
docker-compose up -d

# データベースマイグレーション
cd server
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
```

### 2. サーバー起動

```bash
cd server
npm run dev
```

**期待される出力**:
```
Server listening on http://localhost:3001
```

### 3. フロントエンド起動

```bash
cd project-6120693
npm install
npm run dev
```

**期待される出力**:
```
Local: http://localhost:3000/
```

### 4. ログインテスト

1. ブラウザで `http://localhost:3000/login` にアクセス
2. デモアカウントでログイン:
   - Email: `owner@nekocafe.com`
   - Password: `NekoCafe123!`
3. ダッシュボードが表示されることを確認

### 5. Instagram接続テスト

1. 設定ページ (`http://localhost:3000/settings`) に移動
2. 「Instagram」セクションの「接続する」ボタンをクリック
3. ポップアップウィンドウが開くことを確認
4. Facebookログインを完了
5. Instagramビジネスアカウントを選択
6. 権限を承認
7. 接続完了メッセージが表示されることを確認

### 6. データ取得テスト

1. ダッシュボード (`http://localhost:3000/dashboard`) に移動
2. 「モックデータ表示中」バッジが消えていることを確認
3. 実際のInstagramデータが表示されることを確認:
   - フォロワー数
   - インプレッション数
   - エンゲージメント率
   - 性別・年齢分布
   - 地域分布

## トラブルシューティング

### エラー: "Invalid OAuth redirect URI"

**原因**: リダイレクトURIが正しく設定されていない

**解決方法**:
1. Meta for Developersで「有効なOAuthリダイレクトURI」を確認
2. `http://localhost:3000/auth/meta/callback`が追加されているか確認
3. 変更を保存してサーバーを再起動

### エラー: "Invalid App ID"

**原因**: App IDが間違っている

**解決方法**:
1. `server/.env`の`META_APP_ID`を確認
2. Meta for Developersのアプリ設定で正しいApp IDを確認
3. サーバーを再起動

### エラー: "no_ig_linked_to_pages"

**原因**: InstagramアカウントがFacebookページにリンクされていない

**解決方法**:
1. Facebookページの設定を開く
2. 「Instagram」セクションでアカウントをリンク
3. 再度接続を試行

### エラー: "meta_connection_not_found"

**原因**: Instagram接続が完了していない

**解決方法**:
1. 設定ページで「接続する」ボタンをクリック
2. Meta認証フローを完了
3. ダッシュボードに戻る

### データが表示されない

**原因**: Instagramアカウントにデータが不足している

**確認事項**:
- Instagramビジネスアカウントであることを確認
- 過去14日間に投稿があることを確認
- フォロワーが一定数いることを確認（最低100人推奨）

## 次のステップ

✅ すべての設定が完了したら:

1. Instagram接続を完了
2. ダッシュボードで実データを確認
3. 各機能（コメント管理、AIコンテンツ企画、トレンド発見）をテスト
4. 本番環境への移行を検討（必要に応じて）

## 参考リンク

- [Meta for Developers - BuzzInsight](https://developers.facebook.com/apps/1210634484091027/)
- [Instagram Graph API ドキュメント](https://developers.facebook.com/docs/instagram-api)
- [Meta Business Login](https://developers.facebook.com/docs/facebook-login/overview)
