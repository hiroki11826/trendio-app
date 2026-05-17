# 手動デプロイガイド

SSH接続に問題がある場合の代替デプロイ方法です。

## 現在の状況

✅ **完了済み**:
- フロントエンドのビルド完了 (`project-6120693/out/`)
- デプロイパッケージ準備完了 (`deploy-optimized.tar.gz` - 93.64 MB)

❌ **問題**:
- SSH接続エラー: `Permission denied (publickey)`

## 解決方法

### オプション1: AWS Systems Manager Session Manager を使用

1. **AWS Console** → **Systems Manager** → **Session Manager**
2. インスタンス `snsinsight-server` を選択
3. **Start session** をクリック
4. ブラウザ内のターミナルで以下を実行:

```bash
# ホームディレクトリに移動
cd ~

# 既存のアプリディレクトリをバックアップ
sudo mv /home/ec2-user/app /home/ec2-user/app-backup-$(date +%Y%m%d)

# 新しいディレクトリを作成
mkdir -p /home/ec2-user/app
cd /home/ec2-user/app
```

その後、ローカルからファイルをアップロード（次のステップ参照）

### オプション2: AWS S3 経由でデプロイ

#### ステップ1: ローカルでS3にアップロード

```powershell
# AWS CLIがインストールされている場合
aws s3 cp deploy-optimized.tar.gz s3://your-bucket-name/deploy-optimized.tar.gz
```

#### ステップ2: EC2からダウンロード

AWS Console → Systems Manager → Session Manager でEC2に接続後:

```bash
cd /home/ec2-user/app
aws s3 cp s3://your-bucket-name/deploy-optimized.tar.gz .
tar -xzf deploy-optimized.tar.gz
./deploy-on-ec2.sh
```

### オプション3: GitHubリポジトリ経由

#### ステップ1: ビルドファイルをコミット

```powershell
# .gitignoreを一時的に無効化してビルドファイルをコミット
git add -f project-6120693/out
git add server
git commit -m "chore: Add built files for deployment"
git push origin main
```

#### ステップ2: EC2でpull

AWS Console → Systems Manager → Session Manager でEC2に接続後:

```bash
cd /home/ec2-user/app
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
```

### オプション4: SSH接続を修正

#### 問題の可能性:

1. **キーペアの不一致**: EC2インスタンスに関連付けられているキーペアと、ローカルのキーファイルが一致していない
2. **キーファイルの破損**: キーファイルが正しくダウンロードされていない
3. **セキュリティグループ**: SSH (ポート22) が許可されていない

#### 確認手順:

1. **AWS Console** → **EC2** → **インスタンス** → `snsinsight-server`
2. **詳細** タブで **キーペア名** を確認
3. **セキュリティ** タブで **セキュリティグループ** を確認
   - インバウンドルールに `SSH (22)` が含まれているか
   - ソースが `0.0.0.0/0` または自分のIPアドレスか

4. キーペアを再ダウンロード:
   - **AWS Console** → **EC2** → **キーペア**
   - 既存のキーペアは再ダウンロードできないため、新しいキーペアを作成する必要がある場合があります

## 推奨される方法

**最も簡単**: オプション1 (AWS Systems Manager Session Manager)
- SSHキー不要
- ブラウザから直接接続
- IAMロールがあれば使用可能

**最も確実**: オプション3 (GitHubリポジトリ経由)
- バージョン管理されている
- ロールバックが容易
- チーム開発に適している

## 次のステップ

1. 上記のいずれかの方法を選択
2. デプロイを実行
3. 動作確認:
   ```bash
   curl https://app.trendio.jp/instagram-connect
   ```

## サポートが必要な場合

どの方法を試すか教えてください。手順を詳しく説明します。
