# GitHub Pagesへの公開

GitHub Pages用のworkflowを `.github/workflows/pages.yml` に用意しています。mainへのpush時にテスト→実際の公開パスでbuild→distだけをPagesへdeployします。

リポジトリSettings → Pages → Build and deployment → SourceをGitHub Actionsに設定してください。公開先のリポジトリ名はworkflowで自動取得するため、名前変更やカスタムドメインにも対応します。

GitHub PagesにはSPAの任意パスへのrewriteがないためHashRouterを使用。URLは `https://<owner>.github.io/<repository>/#/live` の形になります。Viteのbase、manifest start_url/scope、PWAアイコン、Service Workerのfallbackを同じ公開パスへ揃えました。

ユーザー提供の専門資料原文を保存した `docs/sources/` はGitから除外し、参照画像もrepositoryへ入れていません。公開するのはアプリのソースと、ビルド済みdistです。実戦記録は訪問者ごとのIndexedDBに保存され、GitHubへ送信しません。

ローカルでプロジェクト配下の公開を再現する例：

```powershell
$env:HALL_SCAN_BASE='/hall-scan/'
pnpm build
$env:HALL_SCAN_E2E_URL='http://127.0.0.1:4173/hall-scan/'
pnpm test:e2e
```

公開先のoriginが変わると別のIndexedDBになり、ローカル開発時の記録は自動では移りません。

設定の根拠：[ViteのPages公開手順](https://vite.dev/guide/static-deploy.html#github-pages)、[GitHub Pagesのcustom workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
