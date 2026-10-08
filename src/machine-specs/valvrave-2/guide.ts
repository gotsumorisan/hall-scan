import type { InputField } from "../../models/types";
export { fields } from "./raw-schema";
export { eventRules as events } from "./live-events";
export const evidenceFields: InputField[] = [
  {
    key: "internalMode",
    label: "内部モード示唆",
    help: "目撃した示唆のみ。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "通常", label: "通常" },
      { value: "上位示唆", label: "上位示唆" },
    ],
  },
  {
    key: "marieEvidence",
    label: "マリエ示唆",
    help: "AT確定として扱わない。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "目撃", label: "目撃" },
    ],
  },
  {
    key: "markKind",
    label: "マギウスマーク種類",
    help: "表示とフェイクの結果を分ける。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "通常", label: "通常" },
      { value: "強", label: "強" },
      { value: "フェイク確認", label: "フェイク確認" },
    ],
  },
];
export const guide = {
  primary: [
    "ボーナス・AT間 実G",
    "CZ間 実G",
    "現在周期",
    "現在周期ポイント",
    "マギウスマーク数",
    "決戦BONUS連続AT非当選",
  ],
  ceilings: [
    "通常ボーナス/AT間1500G / reset確定1000G",
    "CZ間999G / 周期通常6・reset3",
  ],
  warnings: [
    "決戦3連続AT非当選→次回革命BONUS濃厚級。AT確定ではない。",
    "マークは内部ptそのものではない。",
  ],
  screening:
    "ボーナス・AT間 実G700以上は相談候補。特殊表示は数値不問でSMART CHECKへ。着席許可ではありません。",
  where: [
    "ボーナス・AT間 実G：遊技履歴。CZ間とは別。",
    "CZ間 実G：CZ履歴から確認。",
    "現在周期：通常最大6周期。",
    "現在周期ポイント：前周期ptと混ぜない。",
    "マギウスマーク数：表示中の個数。内部規定ptではない。",
    "決戦BONUS連続AT非当選：革命BONUS・AT単発を混ぜない。",
    "66G引き戻し区間：実際の表示・履歴で確認。",
  ],
};
