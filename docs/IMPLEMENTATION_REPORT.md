# 初期実装の結果

完了日：2026-10-08（Asia/Tokyo）。新規Gitリポジトリ `hall-scan`、main branchを作成。その後GitHub Pagesへの公開を完了しました。この文書は初期1機種実装時の記録です。以降の10機種・バックアップ・店舗比較は[CONTINUATION_REPORT.md](CONTINUATION_REPORT.md)を参照。

## 1 作成した構成

Vite / React / TypeScript / React Router / Dexie / IndexedDB / Zod / Vitest / React Testing Library / Playwright / vite-plugin-pwa。機種分岐をUIへ持ち込まず、MachineSpec registryから共通Engineへ注入。独立したschema、resolver、derived、patrol、EV、decision、live-events、guide、testsをからくり2folderに配置。

## 2 実装済み

- TODAY→PATROL→QUICK→SMART CHECK→A/B/C/D→AのみLIVE→状態更新・再判定→REVIEW。
- 機種固有4カウンタの独立管理、PUSH/spotlightのEvidence保存。
- 正式A候補ライン、交換条件別EV、reset confirmed専用ルート、単独ルート採用。
- Cは1項目・確認不能B・同一attemptのC再発防止。
- A生成時のimmutable EntrySnapshot、DecisionSnapshot履歴。
- LIVE開始の再検証、1日1本のactive LIVE、短期ノイズで根拠を破棄しない再判定。
- 女神だけのスルー加算、AT・幕間・一劇などの状態イベント、ルート終了で最新状態を再評価。
- 全店舗の総投資30,000円上限、transaction内で並列投資を制限。
- 8種類の記録のIndexedDB保存、店舗移動後の投資維持、LIVEと営業日のreload復元。
- schema/rules/spec版保持、v1→v2 migration、古いルール版の着席拒否。
- ダークテーマ、390px縦持ちレイアウト、candidate青とA緑の分離。
- PWA precache、オフラインreload、ホーム画面アイコン、LIVE中の更新抑止。
- 収支と意思決定品質を分けたREVIEW、仮説→反証→副作用→採用/保留/却下。
- 候補なし・投資0円での1日終了。

## 3 初期実装時点の未実装と検証範囲

以下は初期実装時点の記録です。追加9機種、店舗比較・当日確認、バックアップは後続で実装済みです。現状はCONTINUATION_REPORT.mdを参照してください。初期段階では残り9機種、店舗の自動比較・当日Web調査、設定分布と小役統計、5回先モード示唆の残存価値計算、クラウド同期、バックアップ入出力は未実装。参照画像はbundleに含めず、画像なしで成立。公開ホスティングは後続作業でGitHub Pagesへ公開済みです。

未提供のEV・資金切れ分布・消化時間分布はTODO_NEEDS_SOURCE。資金と閉店の安全性は、ユーザーが資料・現状を照合したことを明示入力する設計であり、数値モデルによる自動審査は未実装。

実機iPhone Safariでのインストール、長期間のストレージ保持、実ホール入力の使いやすさは未検証。ブラウザ自動テストはMicrosoft EdgeのiPhone 13相当viewportを使用しました。

## 4 テスト結果

| 検証                  | 結果                                       |
| --------------------- | ------------------------------------------ |
| TypeScript `tsc -b`   | 成功                                       |
| Vitest / RTL          | 4 files、60 tests passed                   |
| Playwright            | 6 tests passed                             |
| Vite production build | 成功                                       |
| PWA                   | sw.js、manifest、13 precache entriesを生成 |
| ZIP整合性             | MANIFESTの59 entries、SHA-256すべて一致    |
| モバイル画面          | TODAYを画像で確認、横はみ出しなし          |

60件の内訳：共通ハードルール20、からくり2 spec23、Repository/IndexedDB16、表示1。並列投資の拒否時に余分なイベントが残らないことも確認。

ブラウザ6件：全フロー＋reload＋再判定＋店舗移動、C確認不能、¥0終了、上限拒否/到達、オフラインLIVE復元、モバイル幅。全フローでは幕間失敗後のA維持、女神1回狙い終了後のD、D状態での投資ボタン無効化も確認。

ビルド時の非致命的な通知：Zod依存内のPUREコメント位置についてRollupが通知、単一メインchunkは約505kB（gzip約159kB）。ビルド・起動・PWAテストに支障はありません。

## 5 仕様上の判断

既存コードがないため新規作成。10機種全実装という一般handoffの最終目標に対して、今回の明示指示を優先して1機種に限定。handoffにない具体的な正式ラインは同梱専門資料§12.6から採用。ルートの統合式がないため、単独の最大適格ルートを選択。投資と閉店の必要な定量モデルがないため、架空値を使わず明示確認へ。

詳しくは [DECISIONS.md](DECISIONS.md)、採用資料は [SOURCES.md](SOURCES.md)。

## 6 次の9機種

各機種をMachineSpec契約に沿ったfolderへ追加し、カウンタ/証拠/EV/イベント/guide/spec testsを実装、registryへ登録。共通UIとEngineはそのまま利用可能。機種ごとの公開根拠と正式ラインを先に確定し、1機種ずつvertical sliceテストを追加。詳細は [ARCHITECTURE.md](ARCHITECTURE.md)。
