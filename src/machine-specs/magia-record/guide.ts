import type { InputField } from "../../models/types";
export { fields } from "./raw-schema";
export { eventRules as events } from "./live-events";
export const evidenceFields: InputField[] = [
  {
    key: "kegareEvidence",
    label: "穢れ示唆",
    help: "下限を示す証拠。履歴だけでMAXにしない。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "小", label: "小" },
      { value: "中", label: "中" },
      { value: "大", label: "大" },
      { value: "黒セリフ", label: "黒セリフ" },
    ],
  },
  {
    key: "soulGemEyecatch",
    label: "ソウルジェムアイキャッチ",
    help: "OR条件。全て同時成立と扱わない。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "目撃", label: "目撃" },
    ],
  },
  {
    key: "magicalGirlModeEvidence",
    label: "魔法少女モード示唆",
    help: "黒江は穢れ量そのものではない。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "黒江", label: "黒江" },
      { value: "その他", label: "その他" },
    ],
  },
  {
    key: "stage",
    label: "現在ステージ",
    help: "表示中のステージ。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "みかづき荘", label: "みかづき荘" },
      { value: "調整屋", label: "調整屋" },
      { value: "その他", label: "その他" },
    ],
  },
];
export const guide = {
  primary: ["現在表示ポイント", "確認済みAT非当選ボーナス数"],
  ceilings: ["通常最大950pt+α", "reset確定最大699pt+α級"],
  warnings: [
    "現在pt・穢れ・AT非当選回数を別管理。",
    "穢れ示唆を円換算・ボーナス履歴でMAX断定しない。",
  ],
  screening:
    "現在表示ポイント600以上は相談候補。特殊表示は数値不問でSMART CHECKへ。着席許可ではありません。",
  where: [
    "現在表示ポイント：現在ptは内部の規定ptではない。",
    "確認済みAT非当選ボーナス数：履歴で識別できる場合だけ。",
    "引き戻し状態：AT終了後の表示を確認。",
  ],
};
