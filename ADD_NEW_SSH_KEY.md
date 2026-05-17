# 新しいSSHキーを追加（確実版）

## Session Managerで以下を実行してください

### ステップ1: ec2-userに切り替え

```bash
sudo su - ec2-user
```

### ステップ2: 以下のコマンドを**全部まとめて**コピー&ペーストして実行

```bash
# .sshディレクトリを作成
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 新しい公開鍵を追加（上書き）
cat > ~/.ssh/authorized_keys << 'EOF'
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDNZhQJtpFKw0YvuugxGvHmwhDOdLOxdQUCLHSr//cfW3SOV5//bzE+xk/xsvmNZqhyuwRWYrjD22k33GO84KwoRCUA6a5v7I1mD9Jj1r6ud56Q57IiWGWb85EweLZF8IlQvrVsMCKOdvrCpZw1tha6a2FWfiyG4sIXW9IFO7zLmARnF/zBrLob7bxd9g5e9UGiSyBaRbO9byEb7uUpDXqmfK3/l1KcKnvCZA3PLyOTu+ndK2OKroTAHpQsObGl5tPMMSXWqLFUrw7VxCd1cMKAaYzmImfmqsCdzEbUc8dBUZHK+nXdMeL9hucUB+eocAbyYRDSAF0it8cFGFGSOctXFPjD7Pqxlz0FlUS20R9AqJWhaNmnx9L7Wn9+a7R6bPIV7TK5GWbp8j0zGWGMLweTGH4WJP7jQvs0uZO5xzMHYCzoPjMORSP8QKvKm7fQd+pZIuXuF8ItkI5fwFbnu8N9nh44nMBzCRp8yL6/c9afkI5Fb3etlEyPNcI5WQISf2NJUx989/dmYfooTb2D3OwQYb6sSedHgIVovyK1Czacth1YRQmhZvEWaSyhobQBv6eDCu47H6W8QaGWMQuR/Z+YRdi296Fi45veJ27wp5WY72GTC/k/vQlZyzEI8XzP5va16vpkT/QVumfDYo8e/XsS0Ggt5e7lPi2fKDxGCv2dyw== ec2-deploy-key
EOF

# パーミッションを設定
chmod 600 ~/.ssh/authorized_keys
chown -R ec2-user:ec2-user ~/.ssh

# 確認
echo "=========================================="
echo "SSH Key Setup Complete"
echo "=========================================="
echo ""
echo "authorized_keys content:"
cat ~/.ssh/authorized_keys
echo ""
echo "Permissions:"
ls -la ~/.ssh/
echo ""
echo "Owner:"
stat -c "%U:%G" ~/.ssh/authorized_keys
```

### ステップ3: 完了メッセージを確認

以下のような出力が表示されればOK：

```
==========================================
SSH Key Setup Complete
==========================================

authorized_keys content:
ssh-rsa AAAAB3NzaC1yc2EAAAA... ec2-deploy-key

Permissions:
drwx------ 2 ec2-user ec2-user ... .ssh
-rw------- 1 ec2-user ec2-user ... authorized_keys

Owner:
ec2-user:ec2-user
```

---

## 実行後

上記のコマンドを実行したら、**「SSH設定完了」と入力してください。**

私が新しいキー（`snsinsight-key3.pem`）でSSH接続をテストして、デプロイを実行します。

---

## 重要

- 新しいキーファイル: `C:\Users\user\snsinsight-key3.pem`
- このキーでSSH接続できるようになります
- 古いキー（`snsinsight-key2.pem`）は使用しません
