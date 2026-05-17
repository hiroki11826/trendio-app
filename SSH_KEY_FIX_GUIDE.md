# SSH接続問題の解決ガイド

## 現在の状況

❌ **問題**: SSH接続が `Permission denied (publickey)` エラーで失敗
- EC2インスタンス: `54.168.247.161` (snsinsight-server)
- 使用しているキー: `C:\Users\user\snsinsight-key2.pem`
- エラー: サーバーが提供されたキーを拒否

## 重要な注意事項

⚠️ **AWSの制限**: 
- 既存のSSHキーペアの秘密鍵は**再ダウンロードできません**
- これはAWSのセキュリティ機能です
- 一度ダウンロードした秘密鍵ファイルを紛失した場合、新しいキーペアを作成する必要があります

## 解決方法（3つのオプション）

### 🎯 オプション1: AWS Systems Manager Session Manager（推奨）

**メリット**:
- ✅ SSHキー不要
- ✅ 完全無料
- ✅ ブラウザから直接接続
- ✅ 最も簡単で確実

**手順**:

1. **AWS Consoleにログイン**
   - https://console.aws.amazon.com/

2. **Systems Managerを開く**
   - サービス検索で "Systems Manager" を検索
   - または: https://console.aws.amazon.com/systems-manager/

3. **Session Managerに移動**
   - 左メニューから **Session Manager** をクリック
   - **Start session** ボタンをクリック

4. **インスタンスを選択**
   - `snsinsight-server` (54.168.247.161) を選択
   - **Start session** をクリック

5. **ブラウザ内ターミナルで作業**
   ```bash
   # ユーザーをec2-userに切り替え
   sudo su - ec2-user
   
   # 現在のアプリをバックアップ
   cd ~
   mv app app-backup-$(date +%Y%m%d-%H%M%S)
   
   # 新しいディレクトリを作成
   mkdir -p app
   cd app
   ```

6. **デプロイファイルをアップロード**
   - 次のステップで説明

---

### 🔧 オプション2: 新しいSSHキーペアを作成して追加

**手順**:

#### ステップ1: AWS Consoleで新しいキーペアを作成

1. **EC2コンソール** → **キーペア** → **キーペアを作成**
2. 名前: `snsinsight-key3`
3. キータイプ: **RSA**
4. プライベートキーファイル形式: **.pem**
5. **キーペアを作成** をクリック
6. ダウンロードされた `snsinsight-key3.pem` を `C:\Users\user\` に保存

#### ステップ2: Session Managerで新しい公開鍵を追加

1. Session Managerで EC2 に接続（オプション1の手順1-5）
2. 以下のコマンドを実行:

```bash
# ec2-userに切り替え
sudo su - ec2-user
cd ~

# 新しいキーの公開鍵を生成（ローカルで実行）
# PowerShellで実行:
# ssh-keygen -y -f C:\Users\user\snsinsight-key3.pem
```

3. ローカルPowerShellで公開鍵を生成:
```powershell
ssh-keygen -y -f C:\Users\user\snsinsight-key3.pem
```

4. 出力された公開鍵をコピー（`ssh-rsa AAAA...` で始まる行全体）

5. Session Managerのターミナルに戻り、公開鍵を追加:
```bash
# authorized_keysに追加
echo "ここに公開鍵を貼り付け" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

#### ステップ3: 新しいキーでSSH接続をテスト

```powershell
ssh -i C:\Users\user\snsinsight-key3.pem ec2-user@54.168.247.161
```

---

### 🔄 オプション3: GitHubリポジトリ経由でデプロイ

**メリット**:
- ✅ SSH接続不要
- ✅ バージョン管理されている
- ✅ ロールバックが容易

**手順**:

#### ステップ1: ビルドファイルをGitにコミット

```powershell
# 現在のディレクトリで実行
cd project-6120693

# ビルドファイルを強制的に追加
git add -f out/

# サーバーファイルも追加
cd ..
git add server/

# コミット
git commit -m "chore: Add built files for deployment"

# プッシュ
git push origin main
```

#### ステップ2: Session ManagerでEC2に接続してpull

1. Session Managerで EC2 に接続
2. 以下のコマンドを実行:

```bash
# ec2-userに切り替え
sudo su - ec2-user
cd ~/app

# 最新のコードをpull
git pull origin main

# フロントエンドのビルドファイルを配置
rm -rf frontend-build
cp -r project-6120693/out frontend-build

# サーバーの依存関係をインストール
cd server
npm install --production
npx prisma generate
npx prisma migrate deploy

# Dockerコンテナを再起動
cd ..
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build

# 起動確認
docker compose -f docker-compose.prod.yml ps
```

---

## 推奨される手順

### 最も簡単な方法: オプション1 + オプション3の組み合わせ

1. **Session Managerで接続**（オプション1）
2. **GitHubからpull**（オプション3）
3. **デプロイスクリプトを実行**

この方法なら:
- ✅ SSHキーの問題を完全に回避
- ✅ 無料
- ✅ 確実に動作
- ✅ 今後のデプロイも簡単

---

## デプロイ後の確認

```bash
# サービスの状態確認
docker compose -f docker-compose.prod.yml ps

# ログ確認
docker compose -f docker-compose.prod.yml logs -f

# アプリケーションの動作確認
curl https://app.trendio.jp/
curl https://app.trendio.jp/instagram-connect
```

---

## 次のステップ

どの方法を試しますか？

1. **オプション1（推奨）**: Session Managerを使用
2. **オプション2**: 新しいSSHキーを作成
3. **オプション3**: GitHubリポジトリ経由

選択した方法に応じて、詳細な手順をサポートします。
