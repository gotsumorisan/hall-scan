import type { InputField } from "../../models/types";
export { fields } from "./raw-schema";
export { eventRules as events } from "./live-events";
export const evidenceFields: InputField[] = [
  {
    key: "internalMode",
    label: "内部モード示唆",
    help: "表示・目撃した証拠だけ。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "通常", label: "通常" },
      { value: "強示唆", label: "強示唆" },
    ],
  },
  {
    key: "stage",
    label: "現在ステージ",
    help: "潜伏を推測で確定させない。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "通常", label: "通常" },
      { value: "特殊", label: "特殊" },
      { value: "潜伏示唆", label: "潜伏示唆" },
    ],
  },
];
export const guide = {
  primary: [
    "ボーナス間 実G",
    "伝導者の罠連続スルー",
    "炎炎ループ間 実G",
    "現在通常 実G",
  ],
  ceilings: [
    "ボーナス間：通常850G+α / reset確定650G+α",
    "炎炎ループ間：通常2000G+α / reset確定1500G+α",
  ],
  warnings: [
    "ボーナス間とループ間を分離。",
    "罠5スルー後は次回SPECIAL EP濃厚級。円換算は未提供。",
  ],
  screening:
    "ボーナス間 実G500以上は相談候補。特殊表示は数値不問でSMART CHECKへ。着席許可ではありません。",
  where: [
    "ボーナス間 実G：ボーナス履歴から。ループ間と別。",
    "伝導者の罠連続スルー：罠だけ。通常ボーナス回数と別。",
    "炎炎ループ間 実G：ループ履歴が判別できる場合のみ。",
    "現在通常 実G：ボーナス間・ループ間へ自動転記しない。",
  ],
};
