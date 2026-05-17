# SSH接続のデバッグ

Session Managerで以下のコマンドを実行して、出力を教えてください：

```bash
# 現在のユーザーを確認
whoami

# ホームディレクトリを確認
pwd

# .sshディレクトリの確認
ls -la ~/.ssh/

# authorized_keysの内容を確認
cat ~/.ssh/authorized_keys

# authorized_keysの行数を確認
wc -l ~/.ssh/authorized_keys

# パーミッションの詳細確認
stat ~/.ssh/authorized_keys
```

---

## 確認すべきポイント

1. **whoami** の出力が `ec2-user` であること
2. **ls -la ~/.ssh/** で以下が表示されること：
   - `drwx------` (700) で `.ssh` ディレクトリ
   - `-rw-------` (600) で `authorized_keys` ファイル
   - 所有者が `ec2-user ec2-user`

3. **cat ~/.ssh/authorized_keys** で公開鍵が表示されること：
   - `ssh-rsa AAAAB3NzaC1yc2EAAAA...` で始まる行
   - 1行で表示される（改行なし）

4. **wc -l** の出力が `1` 以上であること

---

## もし問題がある場合

### ケース1: whoamiがec2-userでない

```bash
exit
sudo su - ec2-user
# 再度、公開鍵追加コマンドを実行
```

### ケース2: authorized_keysが空

```bash
# 公開鍵を再追加
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCzcUqTVWL/Pm8AG4C6aTgCDmI3zh1fTQpMF3fbTVNo3eUfbzOW06HH2Uvb/GmZCTSynrMEA4eDqn2Gv9dx47j6dyIYtkAMm03ChFD9q5rXX5yK4w9ohIclA+e7k0vBEBj/ynGcLGV5pG3gy3l/l89/GdukaldMyyQYrgvJh0SetJnm6YCGqCK2eJsuEtsDJcnqWMcPfSKpQUbhjXMaJ98nq97dB5KS6ieideuIfnXtH16f1bNVGs3cCWzILpmklHo94fRFTj+YaqHwX+7pRybZar11+OmGwKCkzUjtD2Va8o8YPOY64sTDMk7BRNWKBbGH7M6BF5fcSlEh5O8ivJop" > ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### ケース3: パーミッションが間違っている

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chown -R ec2-user:ec2-user ~/.ssh
```

---

上記のコマンドの出力を教えてください。
