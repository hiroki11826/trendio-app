# 🚀 セットアップ開始ガイド

## ⚠️ 重要な注意事項

1. **Docker Desktopを起動してください**
   - タスクバーのDockerアイコンが**緑色**になるまで待つ
   - 完全に起動するまで2-3分かかる場合があります

2. **PowerShellを使用してください**（コマンドプロンプトではありません）
   - スタートメニューで「PowerShell」を検索
   - 右クリック → 「管理者として実行」

3. **プロジェクトディレクトリに移動してください**

---

## 📍 ステップ1: プロジェクトディレクトリに移動

PowerShellで以下を実行:

```powershell
cd "C:\Users\user\OneDrive\Desktop\SNS_Management_Tool\Git2"
```

現在のディレクトリを確認:
```powershell
pwd
```

**期待される出力:**
```
Path
----
C:\Users\user\OneDrive\Desktop\SNS_Management_Tool\Git2
```

---

## 📍 ステップ2: Docker Desktop起動確認

```powershell
docker info
```

**成功の場合:** サーバー情報が表示される（エラーなし）

**失敗の場合（エラーが出る）:**
```
error during connect: ... The system cannot find the file specified
```

**解決方法:**
1. Docker Desktopアプリケーションを起動
2. タスクバーのDockerアイコンを確認
3. 「Docker Desktop is running」と表示されるまで待つ
4. 2-3分待ってから再度 `docker info` を実行

---

## 📍 ステップ3: PostgreSQL起動

Docker Desktopが起動したら:

```powershell
docker-compose up -d
```

**期待される出力:**
```
Creating network "git2_default" with the default driver
Creating volume "git2_pgdata" with default driver
Creating myapp-postgres ... done
```

**確認:**
```powershell
docker ps
```

`myapp-postgres` が表示されればOK

---

## 📍 ステップ4: サーバーセットアップ

```powershell
cd server
npm install
```

**所要時間:** 1-3分

```powershell
npx prisma generate
```

```powershell
npx prisma migrate dev
```

マイグレーション名を聞かれたら `init` と入力（またはEnterでスキップ）

```powershell
npm run seed
```

**期待される出力:**
```
✅ Seed completed: 3 users upserted
```

```powershell
cd ..
```

---

## 📍 ステップ5: フロントエンドセットアップ

```powershell
cd project-6120693
npm install
```

**所要時間:** 1-3分

```powershell
cd ..
```

---

## 📍 ステップ6: 起動

### ターミナル1: サーバー起動

```powershell
cd server
npm run dev
```

**期待される出力:**
```
Server listening on http://localhost:3001
```

**このターミナルは開いたままにしてください**

---

### ターミナル2: フロントエンド起動

**新しいPowerShellウィンドウを開いて:**

```powershell
cd "C:\Users\user\OneDrive\Desktop\SNS_Management_Tool\Git2\project-6120693"
npm run dev
```

**期待される出力:**
```
➜  Local:   http://localhost:3000/
```

---

## 📍 ステップ7: ブラウザでアクセス

```
http://localhost:3000/login
```

**ログイン情報:**
- Email: `owner@nekocafe.com`
- Password: `NekoCafe123!`

---

## ✅ 成功の確認

1. ログインできる
2. ダッシュボードが表示される
3. 「モックデータ表示中」バッジが表示される

---

## 🔧 トラブルシューティング

### Docker Desktopが起動しない

**症状:**
```
error during connect: ... The system cannot find the file specified
```

**解決方法:**
1. Docker Desktopアプリケーションを起動
2. タスクバーのDockerアイコンが緑色になるまで待つ
3. 数分待ってから再試行

---

### "no configuration file provided: not found"

**原因:** プロジェクトディレクトリにいない

**解決方法:**
```powershell
cd "C:\Users\user\OneDrive\Desktop\SNS_Management_Tool\Git2"
pwd  # 現在のディレクトリを確認
```

---

### "Could not read package.json"

**原因:** 正しいディレクトリにいない

**解決方法:**
```powershell
# プロジェクトルートに移動
cd "C:\Users\user\OneDrive\Desktop\SNS_Management_Tool\Git2"

# サーバーディレクトリに移動してから実行
cd server
npm install
```

---

### ポート使用中エラー

**エラー:** `Port 3000 is already in use`

**解決方法:**
1. 他のアプリケーションを終了
2. または別のターミナルで既に起動していないか確認

---

## 📋 コマンド一覧（順番に実行）

```powershell
# 1. プロジェクトディレクトリに移動
cd "C:\Users\user\OneDrive\Desktop\SNS_Management_Tool\Git2"

# 2. Docker確認
docker info

# 3. PostgreSQL起動
docker-compose up -d

# 4. サーバーセットアップ
cd server
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
cd ..

# 5. フロントエンドセットアップ
cd project-6120693
npm install
cd ..

# 6. サーバー起動（このターミナルは開いたまま）
cd server
npm run dev
```

**新しいPowerShellウィンドウで:**
```powershell
# 7. フロントエンド起動
cd "C:\Users\user\OneDrive\Desktop\SNS_Management_Tool\Git2\project-6120693"
npm run dev
```

---

## 🎯 次のステップ

セットアップ完了後:

1. ✅ ログインテスト
2. ✅ ダッシュボード確認
3. 📱 Instagram接続（設定ページ）
4. 📊 実データ確認

---

## 📞 サポート

問題が解決しない場合は、以下を確認:

1. Docker Desktopが完全に起動しているか
2. 正しいディレクトリにいるか（`pwd` で確認）
3. PowerShellを使用しているか（コマンドプロンプトではない）
4. エラーメッセージの内容

詳細は `MANUAL_SETUP.md` を参照してください。
