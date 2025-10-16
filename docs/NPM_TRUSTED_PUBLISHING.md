# npm Trusted Publishing with OIDC

このドキュメントでは、npm Trusted Publishing を使用して OIDC (OpenID Connect) による認証で npm パッケージを公開する方法を説明します。

## 概要

npm Trusted Publishing は、長期的なアクセストークンを使用せずに、CI/CD ワークフローから直接 npm パッケージを安全に公開できる機能です。OIDC を使用することで、以下のメリットがあります:

- **セキュリティの向上**: 長期的な npm トークンを保存・管理・ローテーションする必要がなくなります
- **短期的な認証情報**: 各公開は、流出や再利用ができない、ワークフロー固有の短期的な認証情報を使用します
- **自動的な Provenance**: Trusted Publishing を使用すると、npm CLI はデフォルトで provenance attestations を公開します

## 必要条件

- npm CLI v11.5.1 以降
- GitHub Actions のクラウドホスト型ランナー (セルフホスト型ランナーは現時点では未対応)
- npmjs.com のアカウントとパッケージの公開権限

## npmjs.com での設定手順

### 1. パッケージ設定ページへアクセス

1. [npmjs.com](https://www.npmjs.com/) にログインします
2. 公開したいパッケージのページに移動します (既に公開されている場合)
   - 新しいパッケージの場合は、最初の公開前に設定できます

### 2. Trusted Publisher の追加

1. パッケージ設定ページで「Publishing」または「Trusted Publishers」セクションを探します
2. 「Add Trusted Publisher」または「Configure Trusted Publisher」をクリックします
3. **GitHub Actions** を選択します
4. 以下の情報を入力します:

   | フィールド | 値 | 説明 |
   |----------|-----|------|
   | **Provider** | GitHub Actions | CI/CD プロバイダーを選択 |
   | **Organization/User** | `koizuka` | GitHub のユーザー名または組織名 |
   | **Repository** | `generate-icons` | リポジトリ名 |
   | **Workflow** | `release.yml` | ワークフローファイル名 |
   | **Environment** | (空欄または指定) | GitHub Environment を使用する場合のみ指定 |

5. 「Add」または「Save」をクリックして設定を保存します

### 3. 設定の確認

設定が完了すると、Trusted Publishers のリストに以下のような情報が表示されます:

```
Provider: GitHub Actions
Repository: koizuka/generate-icons
Workflow: release.yml
```

## GitHub Actions ワークフローの設定

このリポジトリの `.github/workflows/release.yml` は既に OIDC Trusted Publishing に対応しています。

### 重要な設定項目

#### 1. Permissions の設定

```yaml
permissions:
  id-token: write  # OIDC トークンの生成に必要
  contents: read   # リポジトリの読み取りに必要
```

`id-token: write` 権限により、GitHub Actions が OIDC トークンを生成できるようになります。

#### 2. npm publish コマンド

```yaml
- run: npm publish --provenance --access public
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

- `--provenance`: パッケージの provenance attestations を自動的に生成します
- `--access public`: パブリックパッケージとして公開します (スコープ付きパッケージの場合)

**注意**: Trusted Publishing を使用する場合、`NODE_AUTH_TOKEN` は不要になります。ただし、移行期間中は両方の認証方法をサポートすることができます。

## 移行手順

### ステップ 1: npmjs.com で Trusted Publisher を設定

上記の「npmjs.com での設定手順」に従って、Trusted Publisher を追加します。

### ステップ 2: ワークフローの更新

既に `.github/workflows/release.yml` は OIDC に対応しているため、追加の変更は不要です。

### ステップ 3: テスト公開

1. GitHub でリリースを作成します
2. GitHub Actions のワークフローが自動的に実行されます
3. npm に正常に公開されることを確認します

### ステップ 4: トークンの削除 (オプション)

Trusted Publishing が正常に動作することを確認したら、以下を行うことができます:

1. GitHub Secrets から `NPM_TOKEN` を削除
2. npmjs.com で古いアクセストークンを無効化
3. ワークフローから `NODE_AUTH_TOKEN` の設定を削除

## トラブルシューティング

### エラー: "OIDC token validation failed"

- npmjs.com の Trusted Publisher 設定が正しいか確認してください
  - Organization/User 名
  - Repository 名
  - Workflow ファイル名
- ワークフローに `permissions: id-token: write` が設定されているか確認してください

### エラー: "npm CLI version not supported"

- npm CLI v11.5.1 以降を使用していることを確認してください
- ワークフローの Node.js バージョンを 20.x 以降に更新してください

### セルフホスト型ランナーを使用している場合

現時点では、Trusted Publishing はクラウドホスト型ランナー (GitHub-hosted runners) のみをサポートしています。セルフホスト型ランナーのサポートは将来のリリースで予定されています。

## 参考資料

- [npm Trusted Publishers 公式ドキュメント](https://docs.npmjs.com/trusted-publishers/)
- [GitHub Changelog - npm trusted publishing with OIDC](https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/)
- [npm Provenance Attestations](https://docs.npmjs.com/generating-provenance-statements/)

## セキュリティ上の利点

### 従来の方法 (アクセストークン)

- ❌ 長期的なトークンの管理が必要
- ❌ トークンの漏洩リスク
- ❌ 定期的なローテーションが必要
- ❌ GitHub Secrets での保管が必要

### Trusted Publishing (OIDC)

- ✅ トークンの保存が不要
- ✅ 短期的な認証情報のみ使用
- ✅ ワークフロー固有の認証
- ✅ 自動的な provenance 生成
- ✅ 漏洩のリスクが大幅に軽減

## まとめ

npm Trusted Publishing with OIDC を使用することで、パッケージ公開のセキュリティを大幅に向上させることができます。設定は簡単で、npmjs.com での Trusted Publisher の設定と、GitHub Actions ワークフローでの permissions 設定のみで完了します。
