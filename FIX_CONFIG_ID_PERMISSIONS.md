# Config ID権限設定ガイド

## 現在の問題

Config ID（824461726720947）を使用していますが、必要な権限が設定されていないため、ページ情報を取得できません。

---

## 解決方法: Meta Appでビジネス統合の権限を設定

### ステップ1: Meta for Developersにアクセス

1. **[Meta for Developers](https://developers.facebook.com/apps/1606160517196384)を開く**

2. **左サイドバーで「製品」→「Instagram」をクリック**

3. **「ビジネス統合」または「Business Integration」をクリック**

### ステップ2: Config IDの設定を確認

1. **Config ID: 824461726720947 を探す**

2. **「編集」または「設定」をクリック**

3. **「権限」または「Permissions」セクションを確認**

4. **以下の権限が有効になっているか確認**:
   - ✅ `pages_show_list`
   - ✅ `pages_read_engagement`
   - ✅ `instagram_basic`
   - ✅ `instagram_manage_insights`
   - ✅ `instagram_manage_comments`

### ステップ3: 権限を追加

もし権限が不足している場合:

1. **「権限を追加」または「Add Permissions」をクリック**
2. **上記の権限を検索して追加**
3. **「保存」をクリック**

---

## 代替案: Config IDを使わない方法

Config IDの設定が複雑な場合、Config IDを使わずに直接OAuth認証を使用できます。

### 手順:

1. **`server/.env`を編集**:
   ```env
   # META_CONFIG_ID=824461726720947  # コメントアウト
   ```

2. **`server/routes/metaAuth.ts`を編集**:
   - `ensureMetaRedirectConfig`関数で`META_CONFIG_ID`を必須から任意に変更

3. **スコープを手動で指定**:
   ```typescript
   const params = new URLSearchParams({
     client_id: META_APP_ID!,
     redirect_uri: redirectUri,
     response_type: "code",
     scope: "email,public_profile",  // 最小限のスコープ
   });
   ```

---

## 次のステップ

まず、Meta for Developersでビジネス統合の設定を確認してください:

1. 左サイドバーで「製品」→「Instagram」→「ビジネス統合」
2. Config ID: 824461726720947 の設定を開く
3. 権限セクションを確認
4. スクリーンショットを送ってください

設定画面が見つからない場合は、Config IDを使わない方法に切り替えます。
