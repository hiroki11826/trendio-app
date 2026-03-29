# PowerShell実行ポリシーの修正

## 問題

PowerShellでnpmコマンドが実行できない：
```
このシステムではスクリプトの実行が無効になっているため...
```

## 解決方法

### ステップ1: PowerShellを管理者権限で開く

1. スタートメニューで「PowerShell」を検索
2. 「Windows PowerShell」を**右クリック**
3. **「管理者として実行」**を選択

### ステップ2: 実行ポリシーを変更

管理者PowerShellで以下を実行:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

確認メッセージが表示されたら `Y` を入力してEnter

### ステップ3: プロジェクトディレクトリに移動

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

### ステップ4: Docker Desktop起動確認

```powershell
docker info
```

**エラーが出る場合:**
- Docker Desktopアプリケーションを起動
- タスクバーのDockerアイコンが緑色になるまで待つ（2-3分）
- 再度 `docker info` を実行

### ステップ5: セットアップ開始

```powershell
# PostgreSQL起動
docker-compose up -d

# サーバーセットアップ
cd server
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
cd ..

# フロントエンドセットアップ
cd project-6120693
npm install
cd ..
```

### ステップ6: 起動

**このPowerShellウィンドウで（サーバー）:**
```powershell
cd server
npm run dev
```

**新しいPowerShellウィンドウで（フロントエンド）:**
```powershell
cd "C:\Users\user\OneDrive\Desktop\SNS_Management_Tool\Git2\project-6120693"
npm run dev
```

---

## 完全なコマンド一覧

**管理者PowerShellで実行:**

```powershell
# 1. 実行ポリシー変更
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 2. プロジェクトディレクトリに移動
cd "C:\Users\user\OneDrive\Desktop\SNS_Management_Tool\Git2"

# 3. Docker確認
docker info

# 4. PostgreSQL起動
docker-compose up -d

# 5. サーバーセットアップ
cd server
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
cd ..

# 6. フロントエンドセットアップ
cd project-6120693
npm install
cd ..

# 7. サーバー起動（このウィンドウは開いたまま）
cd server
npm run dev
```

**新しいPowerShellウィンドウで:**
```powershell
cd "C:\Users\user\OneDrive\Desktop\SNS_Management_Tool\Git2\project-6120693"
npm run dev
```

---

## トラブルシューティング

### "Docker Desktop is not running"

**解決方法:**
1. Docker Desktopアプリケーションを起動
2. タスクバーのDockerアイコンが緑色になるまで待つ
3. 数分待ってから `docker info` を再実行

### "no configuration file provided: not found"

**原因:** プロジェクトディレクトリにいない

**解決方法:**
```powershell
cd "C:\Users\user\OneDrive\Desktop\SNS_Management_Tool\Git2"
pwd  # 現在のディレクトリを確認
```

### "パスが存在しないため検出できません"

**原因:** 正しいディレクトリにいない

**解決方法:**
```powershell
# まずプロジェクトルートに移動
cd "C:\Users\user\OneDrive\Desktop\SNS_Management_Tool\Git2"

# その後、サブディレクトリに移動
cd server
```

---

## 確認事項チェックリスト

- [ ] PowerShellを**管理者権限**で開いている
- [ ] 実行ポリシーを変更した（`Set-ExecutionPolicy`）
- [ ] プロジェクトディレクトリに移動した（`Git2`フォルダ）
- [ ] Docker Desktopが起動している（緑色のアイコン）
- [ ] `docker info` がエラーなく実行できる

すべてチェックできたら、セットアップコマンドを実行してください。
