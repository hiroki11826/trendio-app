# Meta App権限確認ガイド

## 現在の状況

サーバーログ: `Total pages found: 0`

これは、Meta APIが`me/accounts`エンドポイントでFacebookページを取得できていないことを示しています。

---

## 必要な権限

以下の権限が必要です:

1. **pages_show_list** - Facebookページ一覧を取得
2. **pages_read_engagement** - ページのエンゲージメントデータ
3. **instagram_basic** - Instagram基本情報
4. **instagram_manage_insights** - Instagramインサイト
5. **instagram_manage_comments** - Instagramコメント管理
6. **instagram_manage_messages** - InstagramDM管理

---

## 権限追加方法

### 方法1: アプリレビューから追加

1. [Meta for Developers](https://developers.facebook.com/apps/1606160517196384)にアクセス
2. 左サイドバーで「アプリレビュー」をクリック
3. 「権限とフィーチャー」タブをクリック
4. 上記の権限を検索して「リクエスト」または「追加」をクリック

### 方法2: Facebookログイン製品を追加

1. ダッシュボードに戻る
2. 「製品を追加」セクションを探す
3. 「Facebookログイン」を見つけて「設定」をクリック
4. 設定を完了

### 方法3: Instagram製品の設定を確認

1. 左サイドバーで「製品」→「Instagram」をクリック
2. 「設定」または「権限」セクションを確認
3. 必要な権限が有効になっているか確認

---

## 確認手順

### ステップ1: 現在の製品を確認

1. Meta for Developersダッシュボードを開く
2. 左サイドバーの「製品」セクションを確認
3. 以下が追加されているか確認:
   - ✅ Instagram
   - ✅ Facebookログイン

### ステップ2: 各製品の設定を確認

#### Instagram製品

1. 「製品」→「Instagram」をクリック
2. 「設定」または「権限」を確認
3. 以下が有効か確認:
   - instagram_basic
   - instagram_manage_insights
   - instagram_manage_comments
   - instagram_manage_messages

#### Facebookログイン製品

1. 「製品」→「Facebookログイン」をクリック
2. 「設定」を確認
3. 「有効なOAuthリダイレクトURI」に以下が追加されているか:
   ```
   http://localhost:3000/auth/meta/callback
   ```

### ステップ3: アプリモードを確認

1. 「設定」→「ベーシック」をクリック
2. ページ上部の「アプリモード」を確認
3. **開発モード**になっているか確認
4. 開発モードでは、あなたのアカウントのみが使用可能

---

## トラブルシューティング

### 「権限とフィーチャー」タブが見つからない

**原因**: アプリレビューセクションの表示が異なる場合があります

**解決方法**:
1. 左サイドバーで「アプリレビュー」をクリック
2. 「リクエスト」または「権限」タブを探す
3. または、「製品」→「Instagram」→「権限」を確認

### 権限をリクエストできない

**原因**: 開発モードでは一部の権限は自動的に利用可能

**解決方法**:
1. 「設定」→「ベーシック」でアプリモードを確認
2. 開発モードの場合、権限は自動的に付与されている可能性
3. 実際に接続テストを実行して確認

### Facebookログイン製品が見つからない

**原因**: すでに追加されている可能性

**解決方法**:
1. 左サイドバーの「製品」セクションを確認
2. 「Facebookログイン」が表示されているか確認
3. 表示されている場合は、すでに追加済み

---

## 次のステップ

権限を追加した後:

1. **サーバーを再起動**
   ```powershell
   # サーバーのPowerShellでCtrl+Cを押して停止
   npm run dev
   ```

2. **ブラウザのキャッシュをクリア**
   - Ctrl+Shift+Delete
   - キャッシュとCookieを削除

3. **再度接続テスト**
   - `http://localhost:3000/settings`にアクセス
   - 「接続する」をクリック
   - Facebookにログイン
   - 権限を承認

4. **サーバーログを確認**
   ```
   === Meta API Response ===
   Total pages found: 1  ← これが1以上になればOK
   Page 1: {
     id: '...',
     name: 'BuzzInsight',
     has_instagram: true,
     instagram_id: '...'
   }
   ========================
   ```

---

## 代替案: Graph API Explorerで確認

権限が正しく設定されているか確認するには:

1. [Graph API Explorer](https://developers.facebook.com/tools/explorer/)にアクセス
2. 右上で「Meta App」を選択（あなたのアプリ）
3. 「アクセストークンを取得」をクリック
4. 必要な権限を選択:
   - pages_show_list
   - pages_read_engagement
   - instagram_basic
   - instagram_manage_insights
5. 「アクセストークンを生成」をクリック
6. クエリフィールドに`me/accounts?fields=id,name,instagram_business_account`を入力
7. 「送信」をクリック
8. レスポンスにFacebookページが表示されるか確認

---

## 現在のMeta App情報

```
App ID: 1606160517196384
App Secret: b85b5beeb9d37aa3e1025a6e8a051e8d
Redirect URI: http://localhost:3000/auth/meta/callback
```

---

## 質問

以下を確認してください:

1. Meta for Developersダッシュボードの左サイドバーに「製品」セクションが表示されていますか？
2. 「製品」セクションに「Instagram」と「Facebookログイン」が表示されていますか？
3. 「アプリレビュー」セクションは表示されていますか？
4. 「設定」→「ベーシック」でアプリモードは「開発モード」ですか？

これらの情報を教えていただければ、次の手順を案内できます。
