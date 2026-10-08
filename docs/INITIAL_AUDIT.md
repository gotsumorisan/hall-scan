# 初期リポジトリ監査

2026-10-07、着手時のworkspaceは空。ユーザーZIPをstarter-packへ展開して読み取り、既存コードを変更せず新規 `hall-scan` folderに作成した。

| 監査項目                     | 着手時の結果                                                  |
| ---------------------------- | ------------------------------------------------------------- |
| フレームワーク・ビルド       | なし                                                          |
| routes                       | なし                                                          |
| state管理                    | なし                                                          |
| storage・persistence         | なし                                                          |
| 機種データ                   | 同梱の専門資料・handoffのみ                                   |
| 判定ロジック                 | ソースコードなし                                              |
| UI内business logic           | なし                                                          |
| 再利用component              | なし                                                          |
| 古いscreening/target/ceiling | legacy-prior-handoff参考資料、採用対象外                      |
| PWA/offline/recovery         | なし                                                          |
| tests                        | なし                                                          |
| 破壊リスク                   | 既存コード/保存DBなし。資料間の優先順位と数値混入が主な注意点 |

実装方針：現在handoffのデータ契約・色・ハードルールを再利用。legacy設計を採用対象から除外。移行すべき既存codeはない。共通モデル/Engine/Persistence/画面/からくり2 spec/tests/PWAを新規作成。残り9機種は今回作成しない。
