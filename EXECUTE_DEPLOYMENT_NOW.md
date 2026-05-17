# 🚀 今すぐデプロイを実行する手順

すべての準備が完了しました。以下の手順でAWS上に反映させます。

---

## ✅ 完了済み

- ✅ フロントエンドビルド完了
- ✅ GitHubにプッシュ完了
- ✅ デプロイスクリプト作成完了

---

## 📝 実行手順（5分で完了）

### ステップ1: AWS Session Managerに接続

1. **AWS Consoleを開く**
   - https://ap-northeast-1.console.aws.amazon.com/ec2/

2. **EC2インスタンスを選択**
   - 左メニューから「インスタンス」をクリック
   - `snsinsight-server` (54.168.247.161) を選択

3. **接続ボタンをクリック**
   - 右上の「接続」ボタンをクリック

4. **Session Managerタブを選択**
   - 「Session Manager」タブをクリック
   - 「接続」ボタンをクリック

5. **ブラウザ内ターミナルが開く**
   - 黒い画面が表示されます

---

### ステップ2: デプロイスクリプトを実行

ブラウザ内ターミナルで以下のコマンドを**1行ずつ**コピー＆ペーストして実行してください：

```bash
# ec2-userに切り替え
sudo su - ec2-user
```

```bash
# アプリディレクトリに移動
cd ~/app
```

```bash
# 最新のコードをpull
git pull origin main
```

```bash
# デプロイスクリプトを実行可能にする
chmod +x deploy-on-ec2.sh
```

```bash
# デプロイを実行
./deploy-on-ec2.sh
```

---

### ステップ3: デプロイ完了を確認

スクリプトが完了すると、以下のメッセージが表示されます：

```
==========================================
  Deployment Complete!
==========================================

Application URL: https://app.trendio.jp
Instagram Connect: https://app.trendio.jp/instagram-connect
```

---

## 🔍 動作確認

### 1. ブラウザで確認

以下のURLにアクセスして、Instagram OAuth フローが表示されることを確認：

- **メインページ**: https://app.trendio.jp
- **Instagram接続**: https://app.trendio.jp/instagram-connect

### 2. Instagram接続フローの確認

1. https://app.trendio.jp/instagram-connect にアクセス
2. 以下の画面が表示されるか確認：
   - ✅ イントロ画面（3ステップの説明）
   - ✅ 「Connect with Facebook」ボタン
   - ✅ 要件の説明（Facebook Business アカウント等）

---

## 🐛 トラブルシューティング

### エラー: "app directory not found"

```bash
# リポジトリをクローン
cd ~
git clone https://github.com/ito-hikari/Git2.git app
cd app
./deploy-on-ec2.sh
```

### エラー: "Permission denied"

```bash
# スクリプトに実行権限を付与
chmod +x deploy-on-ec2.sh
./deploy-on-ec2.sh
```

### Dockerコンテナが起動しない

```bash
# Dockerの状態確認
sudo systemctl status docker

# Dockerを起動
sudo systemctl start docker

# 再度デプロイ実行
./deploy-on-ec2.sh
```

### ログを確認したい

```bash
cd ~/app
docker compose -f docker-compose.prod.yml logs -f
```

Ctrl+C でログ表示を終了できます。

---

## 📊 デプロイ後の確認項目

### ✅ チェックリスト

- [ ] https://app.trendio.jp にアクセスできる
- [ ] https://app.trendio.jp/instagram-connect が表示される
- [ ] Instagram接続フローが正しく表示される
- [ ] 多段階UI（intro → connecting → select-page → select-instagram → complete）が実装されている
- [ ] OAuth権限（pages_show_list, instagram_manage_comments等）が設定されている

---

## 🎉 完了後

デプロイが完了したら、以下を確認してください：

1. **Instagram OAuth フローのテスト**
   - 実際にFacebookアカウントで接続テスト
   - ページ選択画面が表示されるか
   - Instagram Business アカウント選択画面が表示されるか

2. **Meta App Reviewの準備**
   - スクリーンレコーディングの準備
   - 権限の使用方法を明確に示せるか確認

---

## 💡 次のステップ

デプロイ完了後：

1. **動作確認**
   - すべての画面が正しく表示されるか
   - OAuth フローが正常に動作するか

2. **Meta App Reviewに提出**
   - スクリーンレコーディングを作成
   - レビュー申請を提出

---

## 📞 サポート

問題が発生した場合は、以下の情報を共有してください：

- エラーメッセージ
- 実行したコマンド
- ログの内容（`docker compose logs`）

---

**準備完了！上記の手順でデプロイを実行してください。**
