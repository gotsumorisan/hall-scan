import type { InputField } from "../../models/types";
export { fields } from "./raw-schema";
export { eventRules as events } from "./live-events";
export const evidenceFields: InputField[] = [
  {
    key: "stage",
    label: "ステージ・アイキャッチ",
    help: "現在表示か自分の目撃。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "通常", label: "通常" },
      { value: "特殊", label: "特殊" },
      { value: "強示唆", label: "強示唆" },
    ],
  },
  {
    key: "panel",
    label: "上位AT後の下パネル",
    help: "写真なしでも表示を記録。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "点滅", label: "点滅" },
      { value: "消灯", label: "消灯" },
      { value: "通常", label: "通常" },
    ],
  },
];
export const guide = {
  primary: [
    "AT間 実G",
    "CZ間 実G",
    "短縮天井の表示値",
    "スタンプ数",
    "通常CZ失敗回数",
    "上位CZ失敗回数",
  ],
  ceilings: ["通常AT間850G+α / CZ間600G+α", "短縮は対象と直接表示を確認"],
  warnings: [
    "固定のAラインは設けない。個別条件のEV資料が必要。",
    "通常CZ・上位CZの失敗を混ぜない。前兆を解決して再判定。",
  ],
  screening:
    "AT間 実G300以上は相談候補。特殊表示は数値不問でSMART CHECKへ。着席許可ではありません。",
  where: [
    "AT間 実G：MENUのAT間。CZ間と分ける。",
    "CZ間 実G：MENUのCZ間。",
    "短縮天井の表示値：表示の対象がATかCZかも確認。内部天井を推測しない。",
    "スタンプ数：12個で確定ではなく抽選。",
    "通常CZ失敗回数：上位CZ失敗と別。",
    "上位CZ失敗回数：通常CZへ加算しない。",
    "AT駆け抜け確認：詳細履歴で確認できた場合のみ。",
    "上位AT後の引き戻し：下パネルと液晶を確認。",
    "短縮表示の対象：どの天井が短縮されたか明確に。",
    "前兆表示：前兆中は解決してから次状態を確認。",
  ],
};
