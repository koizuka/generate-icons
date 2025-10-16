# npm release action を OIDC 方式に更新

## 変更内容

- GitHub Actions ワークフローに OIDC 認証用の `permissions` を追加
- `npm publish` に `--provenance` フラグを追加
- yarn から npm へ移行

## npmjs.com での設定手順

このPRをマージする前に、npmjs.com で以下の設定が必要です:

1. https://www.npmjs.com/ にログイン
2. `generate-icons` パッケージのページへ移動
3. 設定 (Settings) → Publishing access → Trusted publishers
4. "Add trusted publisher" をクリック
5. 以下を入力:
   - **Provider**: GitHub Actions
   - **GitHub Account**: `koizuka`
   - **Repository name**: `generate-icons`
   - **Workflow name**: `release.yml`
   - **Environment name**: (空欄)
6. "Add" をクリック

設定後、リリースを作成すると自動的に npm に公開されます。

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
