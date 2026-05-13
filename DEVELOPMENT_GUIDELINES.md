# 開発ガイドライン

このドキュメントは、プロジェクトの安定性を保ち、破壊的変更を防ぐためのガイドラインです。

## 1. 環境変数の管理

### 環境変数ファイルの構造
```
.env                    # 開発環境用（Gitにコミットしない）
.env.production         # 本番環境用（Gitにコミットしない）
.env.example            # 環境変数のテンプレート（Gitにコミット）
.env.production.example # 本番環境のテンプレート（Gitにコミット）
```

### 必須の環境変数チェック
サーバー起動時に必須の環境変数が設定されているか確認する：

```typescript
// server/src/config/validateEnv.ts
const requiredEnvVars = [
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'XAI_API_KEY',
  'META_APP_ID',
  'META_APP_SECRET',
];

export function validateEnvironment() {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
}
```

## 2. エラーハンドリングの強化

### APIエンドポイントのエラーハンドリング
すべてのAPIエンドポイントで適切なエラーハンドリングを実装：

```typescript
app.post("/api/ai/generate-ideas", async (req, res, next) => {
  try {
    // 入力検証
    if (!req.body.industry || !req.body.goal) {
      return res.status(400).json({ 
        error: "validation_error",
        message: "Industry and goal are required" 
      });
    }

    // API呼び出し
    const ideas = await generateContentIdeas(
      req.body.industry, 
      req.body.goal, 
      req.body.freeInput
    );
    
    res.json({ ideas });
  } catch (error) {
    // エラーログ
    console.error("Generate Ideas Error:", error);
    
    // クライアントへのエラーレスポンス
    next(error);
  }
});
```

## 3. ロギングの実装

### 重要な処理のログ出力
```typescript
// 環境変数の読み込み
console.log(`📁 Loading environment from: ${envPath}`);
console.log(`🔑 XAI_API_KEY: ${process.env.XAI_API_KEY ? '✅ Set' : '❌ Not set'}`);

// API呼び出し
console.log(`🤖 Calling Grok API with:`, { industry, goal });

// エラー発生時
console.error(`❌ Error generating content:`, error);
```

## 4. バージョン管理のベストプラクティス

### コミット前のチェックリスト
- [ ] ローカルでテストして動作確認
- [ ] エラーが発生していないか確認
- [ ] 環境変数が正しく設定されているか確認
- [ ] 変更内容を明確なコミットメッセージで記録

### コミットメッセージの形式
```
<type>: <subject>

<body>

<footer>
```

**Type:**
- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: リファクタリング
- `docs`: ドキュメント更新
- `test`: テスト追加
- `chore`: ビルド、設定変更

**例:**
```
fix: Load environment variables based on NODE_ENV

- Add logic to load .env.production in production mode
- Add validation for XAI_API_KEY
- Add debug logging for environment variable loading

Fixes #123
```

## 5. デプロイ前のチェックリスト

### 本番環境デプロイ前
- [ ] ローカル環境で動作確認
- [ ] 環境変数が本番環境に設定されているか確認
- [ ] データベースマイグレーションが必要か確認
- [ ] ビルドエラーがないか確認
- [ ] 重要な機能が動作するか手動テスト

### デプロイ後
- [ ] サーバーログを確認
- [ ] エラーが発生していないか確認
- [ ] 主要機能が動作するか確認
- [ ] ロールバック手順を準備

## 6. 監視とアラート

### 推奨する監視項目
1. **サーバーの稼働状態**: アプリケーションが起動しているか
2. **エラーレート**: エラーの発生頻度
3. **レスポンスタイム**: APIのレスポンス時間
4. **外部API呼び出し**: Grok API、Meta API、TikTok APIの成功率

### 簡易的な監視スクリプト
```bash
#!/bin/bash
# health-check.sh

# サーバーのヘルスチェック
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)

if [ $response -eq 200 ]; then
  echo "✅ Server is healthy"
else
  echo "❌ Server is down (HTTP $response)"
  # アラート送信（例：メール、Slack通知）
fi
```

## 7. ドキュメントの維持

### 必須ドキュメント
1. **README.md**: プロジェクトの概要、セットアップ手順
2. **API.md**: APIエンドポイントの仕様
3. **DEPLOYMENT.md**: デプロイ手順
4. **TROUBLESHOOTING.md**: よくある問題と解決方法

### ドキュメント更新のタイミング
- 新機能追加時
- API変更時
- 環境変数追加時
- デプロイ手順変更時

## 8. バックアップとロールバック

### データベースバックアップ
```bash
# 毎日自動バックアップ
pg_dump -U $DB_USER -d $DB_NAME > backup_$(date +%Y%m%d).sql
```

### ロールバック手順
1. 前のバージョンのコミットハッシュを確認
2. `git revert <commit-hash>` または `git reset --hard <commit-hash>`
3. 再ビルドとデプロイ
4. データベースを前のバックアップから復元（必要な場合）

## 9. コードレビューのポイント

### レビュー時の確認事項
- [ ] エラーハンドリングが適切か
- [ ] 環境変数が正しく使用されているか
- [ ] ログ出力が適切か
- [ ] セキュリティ上の問題がないか
- [ ] パフォーマンスへの影響がないか

## 10. 定期的なメンテナンス

### 月次タスク
- [ ] 依存パッケージの更新確認
- [ ] セキュリティアップデートの適用
- [ ] ログファイルのクリーンアップ
- [ ] データベースのバックアップ確認

### 四半期タスク
- [ ] パフォーマンスの分析と最適化
- [ ] 不要なコードの削除
- [ ] ドキュメントの更新
- [ ] セキュリティ監査

---

## まとめ

これらのガイドラインに従うことで：
- ✅ 破壊的変更を早期に発見できる
- ✅ 問題発生時に迅速に対応できる
- ✅ コードの品質と安定性が向上する
- ✅ チーム開発がスムーズになる

**重要**: このガイドラインは生きたドキュメントです。プロジェクトの成長に合わせて更新してください。
