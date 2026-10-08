# 使用した資料

原本はworkspaceの `starter-pack/HALL_SCAN_CODEX_STARTER_PACK_v1.0_2026-10-07/` に展開。添付MANIFEST_SHA256.txtの59ファイルを照合し、すべて一致しました。配布assetsには参照画像を入れていません。

| 資料                                                              | 採用範囲                                                          |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| 00_README_FIRST.md                                                | 読み取り順・新規構築・画像扱い                                    |
| 01_CODEX_START_PROMPT.md                                          | 今回の範囲（からくり2のみ）・技術・テスト                         |
| HALL_SCAN_CODEX_HANDOFF_v1.0.md                                   | 最上位共通仕様・状態・ハードルール                                |
| 02_ASSET_MANIFEST.md                                              | 全画像reference-only・配布対象外                                  |
| Lパチスロ_からくりサーカス2_専門リファレンス_v1.0_正式版 (1).docx | §2のカウンタ、§4の証拠、§12のEV/正式ライン、§14〜16の入力と再判定 |
| current-sourceの引継ぎメモ v1.0.txt                               | 目的・資金・交換・閉店の確認原則                                  |
| legacy-prior-handoff                                              | 数値/実装として不採用                                             |

機種資料からテキスト抽出した完全な段落は `sources/karakuri-specialist-v1.0.txt` に保存。最上位仕様も `sources/HALL_SCAN_CODEX_HANDOFF_v1.0.md` にコピーしました。これらはpublicフォルダ外で、Viteの配布bundleへ含まれません。

技術APIの確認：

- [Dexie transactions](<https://dexie.org/docs/Dexie/Dexie.transaction()>)
- [Vite guide](https://vite.dev/guide/)
- [Vite PWA guide](https://vite-pwa-org.netlify.app/guide/)

資料の数値は2026-08-30基準で固定。実戦当日の解析更新の自動検証は未実装であり、画面でも確認事項として扱っています。
