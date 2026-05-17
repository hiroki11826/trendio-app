# SSH接続を復旧する（簡単版）

## Session Managerで以下のコマンドをコピー&ペーストして実行

### ステップ1: ec2-userに切り替え

```bash
sudo su - ec2-user
```

### ステップ2: 以下のコマンドを**全部まとめて**コピー&ペーストして実行

```bash
# .sshディレクトリを作成（既に存在する場合はスキップ）
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 公開鍵を追加（既存の内容は保持）
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCzcUqTVWL/Pm8AG4C6aTgCDmI3zh1fTQpMF3fbTVNo3eUfbzOW06HH2Uvb/GmZCTSynrMEA4eDqn2Gv9dx47j6dyIYtkAMm03ChFD9q5rXX5yK4w9ohIclA+e7k0vBEBj/ynGcLGV5pG3gy3l/l89/GdukaldMyyQYrgvJh0SetJnm6YCGqCK2eJsuEtsDJcnqWMcPfSKpQUbhjXMaJ98nq97dB5KS6ieideuIfnXtH16f1bNVGs3cCWzILpmklHo94fRFTj+YaqHwX+7pRybZar11+OmGwKCkzUjtD2Va8o8YPOY64sTDMk7BRNWKBbGH7M6BF5fcSlEh5O8ivJop" >> ~/.ssh/authorized_keys

# パーミッションを設定
chmod 600 ~/.ssh/authorized_keys
chown -R ec2-user:ec2-user ~/.ssh

# 確認
echo "=== SSH設定完了 ==="
echo "authorized_keysの内容:"
cat ~/.ssh/authorized_keys
echo ""
echo "パーミッション:"
ls -la ~/.ssh/
```

### ステップ3: 完了メッセージを確認

以下のような出力が表示されればOK：

```
=== SSH設定完了 ===
authorized_keysの内容:
ssh-rsa AAAAB3NzaC1yc2EAAAA...

パーミッション:
drwx------ 2 ec2-user ec2-user ... .ssh
-rw------- 1 ec2-user ec2-user ... authorized_keys
```

---

## 完了後

上記のコマンドを実行したら、**このチャットに「完了」と入力してください。**

私がSSH接続をテストして、デプロイを実行します。

---

## トラブルシューティング

### エラー: "Permission denied"

```bash
# rootユーザーで実行してしまった場合
exit
sudo su - ec2-user
# 上記のステップ2を再実行
```

### 公開鍵が正しく追加されたか確認

```bash
cat ~/.ssh/authorized_keys | wc -l
```

少なくとも1行以上表示されればOK。
