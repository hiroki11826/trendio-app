# Meta App権限修正ガイド

## 現在の状況

- ✅ Facebookで「BuzzInsight」ページが表示される
- ❌ Meta APIが`me/accounts`で空の配列を返す
- **原因**: Meta Appに`pages_show_list`権限が不足

---

## 解決方法: Graph API Explorerで権限を追加

### ステップ1: Graph API Explorerにアクセス

1. **[Graph API Explorer](https://developers.facebook.com/tools/explorer/)を開く**

2. **右上の「Meta App」ドロップダウンをクリック**

3. **あなたのアプリを選択**:
   - アプリ名: BuzzInsight
   - App ID: 1606160517196384

### ステップ2: アクセストークンを生成

1. **「アクセストークンを取得」ボタンをクリック**

2. **「権限を追加」または「Add a Permission」をクリック**

3. **以下の権限を検索してチェック**:
   - ✅ `pages_show_list` ← 最重要
   - ✅ `pages_read_engagement`
   - ✅ `pages_manage_metadata`
   - ✅ `instagram_basic`
   - ✅ `instagram_manage_insights`
   - ✅ `instagram_manage_comments`
   - ✅ `instagram_manage_messages`

4. **「アクセストークンを生成」ボタンをクリック**

5. **ポップアップが開いたら、山田紘丘アカウントでログイン**

6. **権限を承認**

### ステップ3: テストクエリを実行

1. **クエリフィールドに以下を入力**:
   ```
   me/accounts?fields=id,name,instagram_business_account
   ```

2. **「送信」ボタンをクリック**

3. **レスポンスを確認**:

**成功の場合**:
```json
{
  "data": [
    {
      "id": "ページID",
      "name": "BuzzInsight",
      "instagram_business_account": {
        "id": "InstagramビジネスアカウントID"
      }
    }
  ]
}
```

**失敗の場合**:
```json
{
  "data": []
}
```
または
```json
{
  "error": {
    "message": "権限エラー",
    "type": "OAuthException"
  }
}
```

---

## ステップ4: Meta Appダッシュボードで権限を確認

Graph API Explorerで成功したら、Meta Appダッシュボードで権限を永続的に追加します。

### 方法1: Facebookログイン製品を追加

1. **[Meta for Developers](https://developers.facebook.com/apps/1606160517196384)にアクセス**

2. **ダッシュボードのメインエリアで「製品を追加」セクションを探す**

3. **「Facebookログイン」を見つける**

4. **「設定」ボタンをクリック**

5. **プラットフォームを選択**: ウェブ

6. **サイトURLを入力**: `http://localhost:3000`

7. **「保存して続行」をクリック**

8. **左サイドバーで「Facebookログイン」→「設定」をクリック**

9. **「有効なOAuthリダイレクトURI」に追加**:
   ```
   http://localhost:3000/auth/meta/callback
   ```

10. **「変更を保存」をクリック**

### 方法2: アプリレビューで権限をリクエスト

1. **左サイドバーで「アプリレビュー」をクリック**

2. **「権限とフィーチャー」タブをクリック**

3. **検索ボックスで`pages_show_list`を検索**

4. **「開発モードで追加」または「Add」をクリック**

5. **同様に以下も追加**:
   - `pages_read_engagement`
   - `instagram_basic`
   - `instagram_manage_insights`

---

## ステップ5: 接続テストを再実行

### 1. サーバーを再起動

```powershell
# サーバーのPowerShellでCtrl+Cを押して停止
npm run dev
```

### 2. ブラウザのキャッシュとCookieをクリア

- Ctrl+Shift+Delete
- 「Cookieと他のサイトデータ」と「キャッシュされた画像とファイル」をチェック
- 「データを削除」をクリック

### 3. 接続テスト

1. `http://localhost:3000/settings`にアクセス
2. 「Instagram」の「接続する」をクリック
3. 山田紘丘アカウントでログイン
4. **今度は追加の権限を求められるはず**:
   - ページへのアクセス
   - Instagramアカウントへのアクセス
5. すべて承認

### 4. サーバーログを確認

```
=== Debug: Fetching user info ===
User info: { id: '122097920955261133', name: '山田紘丘' }
=== Debug: Fetching accounts ===
=== Meta API Response ===
Total pages found: 1  ← これが1になればOK
Raw accounts data: [
  {
    "id": "ページID",
    "name": "BuzzInsight",
    "access_token": "...",
    "instagram_business_account": {
      "id": "InstagramID"
    }
  }
]
Page 1: {
  id: 'ページID',
  name: 'BuzzInsight',
  has_instagram: true,
  instagram_id: 'InstagramID'
}
========================
```

---

## トラブルシューティング

### Graph API Explorerで権限が見つからない

**解決方法**:

1. 「アクセストークンを取得」をクリック
2. ポップアップの下部に「権限を追加」リンクがあるはず
3. または、検索ボックスで直接権限名を入力

### Graph API Explorerでもdata: []が返る

**原因**: ページの管理者権限がない可能性

**確認方法**:

1. Facebookで「BuzzInsight」ページを開く
2. 左サイドバーの「設定」をクリック
3. 「ページの役割」をクリック
4. 山田紘丘が「管理者」になっているか確認

**もし管理者でない場合**:

1. 現在の管理者に連絡して、あなたを管理者に追加してもらう
2. または、新しいページを作成する

### 接続テスト後もTotal pages found: 0

**原因**: 古いアクセストークンがキャッシュされている

**解決方法**:

1. データベースをリセット:
   ```powershell
   cd server
   npx prisma migrate reset
   ```
2. サーバーを再起動
3. ブラウザのキャッシュをクリア
4. 再度接続テスト

---

## 重要: 開発モードの制限

現在、Meta Appは「開発モード」です。

**開発モードの制限**:
- あなた（山田紘丘）のアカウントのみが使用可能
- 他のユーザーは接続できない
- 一部の権限は自動的に付与される

**本番環境に移行する場合**:
1. アプリレビューを申請
2. 必要な権限の承認を取得
3. アプリモードを「ライブモード」に変更

---

## 次のステップ

1. **Graph API Explorerで権限を追加**
2. **テストクエリを実行して、ページが取得できることを確認**
3. **Meta Appダッシュボードで「Facebookログイン」製品を追加**
4. **接続テストを再実行**
5. **サーバーログで`Total pages found: 1`を確認**

---

## 確認してほしいこと

Graph API Explorerで以下を試してください:

1. アプリ（1606160517196384）を選択
2. `pages_show_list`権限を追加
3. アクセストークンを生成
4. `me/accounts?fields=id,name,instagram_business_account`を実行
5. レスポンスを教えてください

このレスポンスで、次の対応が決まります。
