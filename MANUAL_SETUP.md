# 手動セットアップ手順

このガイドでは、コマンドを1つずつ実行してセットアップを完了します。

## 前提条件

1. ✅ Docker Desktopを起動してください
   - タスクバーのDockerアイコンが緑色になるまで待つ
   - 「Docker Desktop is running」と表示されることを確認

2. ✅ PowerShellまたはコマンドプロンプトを開く
   - プロジェクトルート (`Git2`) ディレクトリに移動

## セットアップ手順

### ステップ1: Docker確認

```powershell
docker info
```

**期待される結果:** エラーなく情報が表示される

**エラーが出る場合:** Docker Desktopを起動して数分待ってから再実行

---

### ステップ2: PostgreSQL起動

```powershell
docker-compose up -d
```

**期待される結果:**
```
Creating myapp-postgres ... done
```

**確認:**
```powershell
docker ps
```

`myapp-postgres` コンテナが実行中であることを確認

---

### ステップ3: サーバーディレクトリに移動

```powershell
cd server
```

---

### ステップ4: サーバー依存関係インストール

```powershell
npm install
```

**所要時間:** 1-3分

---

### ステップ5: Prismaクライアント生成

```powershell
npx prisma generate
```

**期待される結果:**
```
✔ Generated Prisma Client
```

---

### ステップ6: データベースマイグレーション

```powershell
npx prisma migrate dev
```

**プロンプトが表示されたら:**
- マイグレーション名を入力: `init` (または Enter キーでスキップ)

**期待される結果:**
```
Your database is now in sync with your schema.
```

---

### ステップ7: シードデータ投入

```powershell
npm run seed
```

**期待される結果:**
```
✅ Seed completed: 3 users upserted
```

これでデモユーザーが作成されます:
- `owner@nekocafe.com` / `NekoCafe123!`
- `sales@nekocafe.com` / `SalesStrong#1`
- `ops@nekocafe.com` / `OpsSecure!2`

---

### ステップ8: プロジェクトルートに戻る

```powershell
cd ..
```

---

### ステップ9: フロントエンドディレクトリに移動

```powershell
cd project-6120693
```

---

### ステップ10: フロントエンド依存関係インストール

```powershell
npm install
```

**所要時間:** 1-3分

---

### ステップ11: プロジェクトルートに戻る

```powershell
cd ..
```

---

## セットアップ完了確認

以下のファイルが存在することを確認:

```powershell
# 環境変数ファイル確認
Test-Path server\.env
Test-Path project-6120693\.env
```

両方とも `True` と表示されればOK

---

## 起動方法

### ターミナル1: サーバー起動

```powershell
cd server
npm run dev
```

**期待される出力:**
```
Server listening on http://localhost:3001
```

このターミナルは開いたままにしてください。

---

### ターミナル2: フロントエンド起動

**新しいPowerShellウィンドウを開いて:**

```powershell
cd C:\Users\user\OneDrive\Desktop\SNS_Management_Tool\Git2\project-6120693
npm run dev
```

**期待される出力:**
```
  ➜  Local:   http://localhost:3000/
```

---

## 動作確認

### 1. ブラウザでアクセス

```
http://localhost:3000/login
```

### 2. ログイン

- Email: `owner@nekocafe.com`
- Password: `NekoCafe123!`

### 3. ダッシュボード確認

ログイン後、ダッシュボードが表示されることを確認
- モックデータが表示されます
- 「モックデータ表示中」バッジが表示されます

### 4. Instagram接続（オプション）

1. 設定ページ (`/settings`) に移動
2. 「Instagram」の「接続する」ボタンをクリック
3. Meta認証フローを完了
4. ダッシュボードで実データが表示されることを確認

---

## トラブルシューティング

### エラー: "Docker Desktop is not running"

**解決方法:**
1. Docker Desktopアプリケーションを起動
2. タスクバーのDockerアイコンが緑色になるまで待つ
3. 再度コマンドを実行

---

### エラー: "Port 5432 is already in use"

**解決方法:**
```powershell
# 既存のコンテナを停止
docker-compose down

# 再起動
docker-compose up -d
```

---

### エラー: "Can't reach database server"

**解決方法:**
```powershell
# PostgreSQLコンテナの状態確認
docker ps

# コンテナが起動していない場合
docker-compose up -d

# 数秒待ってから再実行
```

---

### エラー: "Port 3000 is already in use"

**解決方法:**
1. 他のアプリケーションを終了
2. または、`project-6120693/vite.config.ts` でポート番号を変更

---

### エラー: "Module not found"

**解決方法:**
```powershell
# node_modulesを削除して再インストール
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

### Instagram接続エラー

**エラー: "meta_connection_not_found"**

これは正常です。設定ページでInstagram接続を完了してください。

**エラー: "Invalid OAuth redirect URI"**

Meta for Developersで以下を確認:
1. [アプリ設定](https://developers.facebook.com/apps/1210634484091027/settings/basic/)にアクセス
2. 「有効なOAuthリダイレクトURI」に以下を追加:
   ```
   http://localhost:3000/auth/meta/callback
   ```
3. 変更を保存

---

## 次のステップ

✅ セットアップ完了後:

1. 各機能を試す
   - ダッシュボード
   - コメント管理
   - AIコンテンツ企画
   - トレンド発見

2. Instagram接続を完了
   - 設定ページで接続
   - 実データでダッシュボードを確認

3. Meta App設定を確認
   - `META_APP_CHECKLIST.md` を参照

---

## サポート

問題が解決しない場合:

1. エラーメッセージをコピー
2. 以下のログを確認:
   ```powershell
   # Dockerログ
   docker-compose logs -f
   
   # サーバーログ（ターミナル1の出力）
   # フロントエンドログ（ターミナル2の出力）
   ```

3. ドキュメントを参照:
   - `SETUP_GUIDE.md` - 詳細ガイド
   - `META_APP_CHECKLIST.md` - Meta App設定
   - `QUICKSTART.md` - クイックスタート

---

## コマンド一覧（コピー用）

```powershell
# 1. Docker確認
docker info

# 2. PostgreSQL起動
docker-compose up -d

# 3-7. サーバーセットアップ
cd server
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
cd ..

# 8-10. フロントエンドセットアップ
cd project-6120693
npm install
cd ..

# 11. サーバー起動（ターミナル1）
cd server
npm run dev

# 12. フロントエンド起動（ターミナル2 - 新しいウィンドウ）
cd project-6120693
npm run dev
```

Happy coding! 🎉
