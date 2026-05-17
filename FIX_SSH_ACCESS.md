# SSH接続を修復する方法

## 問題の原因

SSH接続が突然できなくなった理由は以下のいずれかです：

1. **EC2インスタンスが再起動/再作成された**
   - 新しいインスタンスには古いSSHキーが登録されていない
   
2. **authorized_keysファイルが変更された**
   - 何らかの理由で`~/.ssh/authorized_keys`が変更/削除された

3. **キーペアの不一致**
   - ローカルの秘密鍵とEC2の公開鍵が一致していない

## 🎯 最も簡単な解決方法

### オプション1: AWS Systems Manager Session Manager（推奨）

**SSHキー不要で今すぐアクセス可能**

#### 手順：

1. **AWS Consoleにログイン**
   - https://ap-northeast-1.console.aws.amazon.com/ec2/

2. **EC2インスタンスを選択**
   - インスタンス一覧から `snsinsight-server` (54.168.247.161) を選択
   - 右上の **接続** ボタンをクリック

3. **Session Managerタブを選択**
   - 「Session Manager」タブをクリック
   - **接続** ボタンをクリック

4. **ブラウザ内ターミナルが開く**
   ```bash
   # ec2-userに切り替え
   sudo su - ec2-user
   
   # 現在のSSHキーを確認
   cat ~/.ssh/authorized_keys
   ```

5. **新しい公開鍵を追加**（次のステップで説明）

---

### オプション2: 新しいSSHキーペアを作成して追加

#### ステップ1: ローカルで新しいキーペアを生成

```powershell
# 新しいキーペアを生成
ssh-keygen -t rsa -b 4096 -f C:\Users\user\snsinsight-key3.pem -N ""

# 公開鍵を表示（コピーする）
Get-Content C:\Users\user\snsinsight-key3.pem.pub
```

#### ステップ2: Session ManagerでEC2に接続

1. AWS Console → EC2 → インスタンス選択 → **接続** → **Session Manager**
2. ブラウザ内ターミナルで以下を実行：

```bash
# ec2-userに切り替え
sudo su - ec2-user
cd ~

# .sshディレクトリを確認/作成
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 現在のauthorized_keysをバックアップ
cp ~/.ssh/authorized_keys ~/.ssh/authorized_keys.backup 2>/dev/null || true

# 新しい公開鍵を追加（ステップ1でコピーした内容を貼り付け）
echo "ssh-rsa AAAA... your-public-key-here" >> ~/.ssh/authorized_keys

# パーミッションを設定
chmod 600 ~/.ssh/authorized_keys

# 確認
cat ~/.ssh/authorized_keys
```

#### ステップ3: 新しいキーでSSH接続をテスト

```powershell
ssh -i C:\Users\user\snsinsight-key3.pem ec2-user@54.168.247.161
```

---

### オプション3: 既存のキーの公開鍵を再追加

現在のキーファイル (`snsinsight-key2.pem`) が有効なので、その公開鍵をEC2に再追加します。

#### ステップ1: ローカルで公開鍵を取得

```powershell
# 公開鍵を生成して表示
ssh-keygen -y -f C:\Users\user\snsinsight-key2.pem
```

出力例：
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCzcUqTVWL/Pm8AG4C6aTgC...
```

この出力全体をコピーしてください。

#### ステップ2: Session ManagerでEC2に接続

1. AWS Console → EC2 → インスタンス選択 → **接続** → **Session Manager**
2. ブラウザ内ターミナルで以下を実行：

```bash
# ec2-userに切り替え
sudo su - ec2-user
cd ~

# .sshディレクトリを確認
ls -la ~/.ssh/

# authorized_keysの内容を確認
cat ~/.ssh/authorized_keys

# 公開鍵を追加（ステップ1でコピーした内容を貼り付け）
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCzcUqTVWL/Pm8AG4C6aTgC..." >> ~/.ssh/authorized_keys

# パーミッションを確認
chmod 600 ~/.ssh/authorized_keys
ls -la ~/.ssh/authorized_keys
```

#### ステップ3: SSH接続をテスト

```powershell
ssh -i C:\Users\user\snsinsight-key2.pem ec2-user@54.168.247.161
```

---

## 🔍 トラブルシューティング

### authorized_keysファイルが存在しない場合

```bash
# ec2-userとして
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### パーミッションエラーの場合

```bash
# 正しいパーミッションを設定
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chown -R ec2-user:ec2-user ~/.ssh
```

### Session Managerが使えない場合

EC2インスタンスにSSM Agentがインストールされていない、またはIAMロールが設定されていない可能性があります。

**代替方法**: AWS EC2 Instance Connect

1. AWS Console → EC2 → インスタンス選択
2. **接続** → **EC2 Instance Connect** タブ
3. **接続** ボタンをクリック

---

## 📝 デプロイスクリプトの更新

SSH接続が復旧したら、デプロイスクリプトのキーパスを更新してください：

```powershell
# deploy-optimized.ps1 の2行目を更新
$KEY_PATH = "$env:USERPROFILE\snsinsight-key3.pem"  # 新しいキーを使う場合
```

---

## ✅ 確認手順

SSH接続が復旧したら：

```powershell
# 1. 接続テスト
ssh -i C:\Users\user\snsinsight-key2.pem ec2-user@54.168.247.161 "echo 'SSH connection successful'"

# 2. デプロイスクリプトを実行
.\deploy-optimized.ps1
```

---

## 💡 推奨される対応

**今すぐ実行**:
1. Session ManagerでEC2に接続（オプション1）
2. 既存キーの公開鍵を再追加（オプション3）
3. SSH接続をテスト
4. デプロイを実行

この方法なら、新しいキーを作成する必要がなく、既存の設定をそのまま使えます。

---

## 次のステップ

SSH接続が復旧したら、すぐにデプロイを実行できます：

```powershell
.\deploy-optimized.ps1
```

デプロイパッケージは準備完了しているので、SSH接続さえ復旧すれば5-10分でデプロイ完了します。
