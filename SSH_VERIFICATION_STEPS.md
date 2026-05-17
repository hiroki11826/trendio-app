# SSH接続の確認手順

## Session Managerで以下を確認してください

```bash
# 1. ec2-userに切り替わっているか確認
whoami
# 出力: ec2-user であるべき

# 2. ホームディレクトリにいるか確認
pwd
# 出力: /home/ec2-user であるべき

# 3. .sshディレクトリのパーミッション確認
ls -la ~/.ssh/
# 出力例:
# drwx------ 2 ec2-user ec2-user 4096 ... .ssh
# -rw------- 1 ec2-user ec2-user  XXX ... authorized_keys

# 4. authorized_keysの内容を確認
cat ~/.ssh/authorized_keys
# 公開鍵が含まれているか確認

# 5. 公開鍵の行数を確認
wc -l ~/.ssh/authorized_keys
# 少なくとも1行以上あるべき

# 6. パーミッションを再設定
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chown -R ec2-user:ec2-user ~/.ssh

# 7. 再度確認
ls -la ~/.ssh/
```

## 正しい公開鍵の形式

公開鍵は以下の形式である必要があります：

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCzcUqTVWL/Pm8AG4C6aTgCDmI3zh1fTQpMF3fbTVNo3eUfbzOW06HH2Uvb/GmZCTSynrMEA4eDqn2Gv9dx47j6dyIYtkAMm03ChFD9q5rXX5yK4w9ohIclA+e7k0vBEBj/ynGcLGV5pG3gy3l/l89/GdukaldMyyQYrgvJh0SetJnm6YCGqCK2eJsuEtsDJcnqWMcPfSKpQUbhjXMaJ98nq97dB5KS6ieideuIfnXtH16f1bNVGs3cCWzILpmklHo94fRFTj+YaqHwX+7pRybZar11+OmGwKCkzUjtD2Va8o8YPOY64sTDMk7BRNWKBbGH7M6BF5fcSlEh5O8ivJop
```

- `ssh-rsa`で始まる
- スペースなし（1行）
- 改行なし

## もし公開鍵が正しく追加されていない場合

### 方法1: echoコマンドで追加

```bash
# 既存の内容を削除して新しく追加
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCzcUqTVWL/Pm8AG4C6aTgCDmI3zh1fTQpMF3fbTVNo3eUfbzOW06HH2Uvb/GmZCTSynrMEA4eDqn2Gv9dx47j6dyIYtkAMm03ChFD9q5rXX5yK4w9ohIclA+e7k0vBEBj/ynGcLGV5pG3gy3l/l89/GdukaldMyyQYrgvJh0SetJnm6YCGqCK2eJsuEtsDJcnqWMcPfSKpQUbhjXMaJ98nq97dB5KS6ieideuIfnXtH16f1bNVGs3cCWzILpmklHo94fRFTj+YaqHwX+7pRybZar11+OmGwKCkzUjtD2Va8o8YPOY64sTDMk7BRNWKBbGH7M6BF5fcSlEh5O8ivJop" > ~/.ssh/authorized_keys

# パーミッション設定
chmod 600 ~/.ssh/authorized_keys
```

### 方法2: viエディタで編集

```bash
vi ~/.ssh/authorized_keys
```

1. `i`キーを押して挿入モード
2. 公開鍵を貼り付け
3. `Esc`キーを押す
4. `:wq`と入力してEnter（保存して終了）

### 方法3: catコマンドで追加

```bash
cat > ~/.ssh/authorized_keys << 'EOF'
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCzcUqTVWL/Pm8AG4C6aTgCDmI3zh1fTQpMF3fbTVNo3eUfbzOW06HH2Uvb/GmZCTSynrMEA4eDqn2Gv9dx47j6dyIYtkAMm03ChFD9q5rXX5yK4w9ohIclA+e7k0vBEBj/ynGcLGV5pG3gy3l/l89/GdukaldMyyQYrgvJh0SetJnm6YCGqCK2eJsuEtsDJcnqWMcPfSKpQUbhjXMaJ98nq97dB5KS6ieideuIfnXtH16f1bNVGs3cCWzILpmklHo94fRFTj+YaqHwX+7pRybZar11+OmGwKCkzUjtD2Va8o8YPOY64sTDMk7BRNWKBbGH7M6BF5fcSlEh5O8ivJop
EOF

chmod 600 ~/.ssh/authorized_keys
```

## 最終確認

```bash
# 1. ファイルの内容を確認
cat ~/.ssh/authorized_keys

# 2. パーミッションを確認
ls -la ~/.ssh/authorized_keys
# 出力: -rw------- 1 ec2-user ec2-user XXX ... authorized_keys

# 3. 所有者を確認
stat ~/.ssh/authorized_keys
# Owner: ec2-user であるべき
```

## トラブルシューティング

### sshdログを確認

```bash
sudo tail -50 /var/log/secure
```

このログにSSH接続の失敗理由が記録されています。

### SELinuxの確認（Amazon Linuxの場合）

```bash
# SELinuxの状態確認
getenforce

# もし"Enforcing"の場合、一時的に無効化
sudo setenforce 0

# SSH接続をテスト後、再度有効化
sudo setenforce 1
```

---

## 次のステップ

上記の確認を行った後、ローカルから再度SSH接続をテストしてください：

```powershell
ssh -i C:\Users\user\snsinsight-key2.pem ec2-user@54.168.247.161
```

接続できたら、すぐにデプロイを実行できます！
