# HALL SCAN

初心者がホール内で「見る場所 → 相談候補 → A/B/C/D → 実戦中の再判定 → 振り返り」を記録するモバイルWeb/PWA。からくりサーカス2の1機種だけを実装しています。

## 起動

GitHub Pages向けの自動公開workflowも実装済みです。公開設定は [GitHub Pages手順](docs/GITHUB_PAGES.md) を参照。Web版はHashRouterを使用し、各画面のURLは `#/live` などの形式になります。

この作業環境では依存インストール済みです。Windowsで `START_HALL_SCAN.cmd` をダブルクリック、またはこのfolder内で `./START_HALL_SCAN.cmd` を実行すると開発サーバーを起動できます。表示された http://127.0.0.1:5173 を開いてください。停止はCtrl+C。

Node.js 22.12以上（この環境では24.19）、pnpm 11を使用。

```sh
cd hall-scan
pnpm install --frozen-lockfile
pnpm dev
```

http://127.0.0.1:5173 を開きます。npmを使用する環境でも `npm install` / `npm run dev` で起動できますが、再現性のある依存インストールにはpnpmと同梱lockfileを使用してください。

```sh
pnpm test
pnpm build
pnpm test:e2e
pnpm preview
```

`test:e2e` はMicrosoft Edgeを使い、390×664相当の縦持ち画面で実行します。Edge未導入の環境では `playwright.config.ts` の `channel` を削除して、`pnpm exec playwright install chromium` を実行してください。テストは本番 `dist` を4173番ポートで配信し、Service Workerのオフライン復元も検証します。実機SafariのPWA検証は別途必要です。

## 最初の操作

1. TODAYで店舗名を記録する。
2. PATROLで「からくりサーカス2」の台番号を入力し、QUICKへ。
3. 見る場所・天井・相談ラインを確認し、SMART CHECKへ。
4. 実機の4カウンタと、交換・資金・時間の条件を入力する。不明は空欄／不明でよい。
5. 保存して判定。Cなら表示された1項目だけ確認。確認不能はB。AだけLIVEを開始できる。
6. LIVEで投資・実機イベントを記録して再判定。終了後は回収額を記録しREVIEWへ。
7. 店舗移動や巡回継続、または1日を終了する。候補なし・¥0でも終了可能。

テスト用のA入力例（実台への推奨ではなく検証用fixture）：液晶1000、女神間200、AT間500、女神スルー0、等価、現金、資金リスク照合済み、閉店23:59、取り切れ確認済み、当日解析確認済み。テストで使用した条件の宣言が、現実の情報を保証するものではありません。

## 構成

```text
src/
  app/                 Router・セッション購読
  pages/               TODAY / PATROL / QUICK / CHECK / LIVE / REVIEW / MORE
  components/          共通入力・判定カード・更新案内
  engine/
    decision/          A/B/C/D・Cの1項目制限・ルート選択
    live/              A限定開始・投資上限・着席根拠の保持
    state/             ID・日本の営業日・immutable snapshot
  machine-specs/
    registry.ts
    karakuri-circus-2/  schema / resolver / derived / patrol / EV / decision / events / guide / tests
  models/              共通契約・保存型
  persistence/         Dexie DB・transaction単位のRepository
  styles/              ダークテーマ・モバイルレイアウト
  tests/               共通fixture・IndexedDB test setup
e2e/                   ブラウザ全フロー・PWA検証
docs/                  設計・仕様解釈・出典・実装報告
public/                オリジナルのPWAアイコンのみ
```

## Decision Engine

UIに機種判定を置かず、`MachineSpec.evaluate()` が独立したルートと重要な不明項目を返します。共通Engineはreset confirmed以外の専用ルートを除外し、適用可能な正式候補から最大の**単独ルート**を採用。EVを合算しません。

添付専門資料 §12.6 の保守ライン：通常液晶1000G、女神間700実G、AT間等価/5.6持ち1800実G・5.6現金2000実G、等価女神3スルー+女神間500実G、等価4スルー0G、リセット確定液晶300G。EVは§12.2〜12.5の表から条件に一致する下限行を使用し、補間・外挿・モード加点は行いません。信頼度Cの参考値です。

ライン到達だけではAになりません。交換条件、資金、取り切れリスク、閉店時刻、当日情報の確認が必要。Cは `nextBestCheck` オブジェクト1個だけ。同一attemptで追加Cは出さず、他の重要不明が残ればB。LIVEはEntrySnapshotの着席根拠をルート終了まで保持し、短期的な負けだけでは撤回しません。確認した過大リスクと絶対投資上限は優先します。

## 保存

IndexedDB `hall-scan`、Dexie schema v2。DailySession / StoreVisitSession / MachineState / EntrySnapshot / DecisionSnapshot / LiveSession / LiveEvent / Review を別テーブルに保存。投資追加・LIVE開始・状態更新はtransactionで当日状態と一緒に保存し、複数タブ・連続操作でも30,000円超過を防ぎます。回収額を投資額から差し引きません。

起動時はactive LIVEのある日を優先して復元します。なければAsia/Tokyoの当日。終了済みの同日を再起動しても軍資金をリセットしません。schema / rules / spec の版を保存し、v1→v2のmigrationを実装。EntrySnapshotはadd専用APIで作成、読み込み時も再帰freeze。通常のUIから書き換えできません。ブラウザ内ストレージであり、開発者ツールからの改変を防ぐセキュリティ境界ではありません。

PWAは本番ビルドのapp shellをprecache。初回オンライン読み込み後はオフライン利用可能です。HTTPS上のSafariで「ホーム画面に追加」。LIVE中は更新ボタンを無効にして自動リロードを避けます。Google Fontsが取得できない場合もシステムフォントで動作します。reference-onlyの版権画像を配布物へ含めていません。

## 次の機種を追加

`MachineSpec` を満たす独立folderを追加し、registryへ登録します。機種ごとのrawカウンタ・証拠・天井・判定ルート・イベント・guide・テストを作ります。UI/共通Engineに機種ID分岐を追加する必要はありません。[詳細設計](docs/ARCHITECTURE.md)を参照。

## 今回の範囲と不足

残り9機種、設定狙いの分布推定、店舗の自動比較・Web解析自動取得、クラウド同期・バックアップインポートは未実装。非等価スルーEV、PUSH/スポットライトの金額、128G単独EV、資金切れ確率・消化時間分布は `TODO_NEEDS_SOURCE` として保存しています。資金・時間について数値を捏造せず、ユーザーが根拠を照合したかを明示入力し、不明ならAにしません。将来の計算モデルや実機Safari検証は [仕様解釈](docs/DECISIONS.md) と [実装報告](docs/IMPLEMENTATION_REPORT.md) を参照。
