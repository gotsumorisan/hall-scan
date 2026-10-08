import type { InputField } from "../../models/types";
export { fields } from "./raw-schema";
export { eventRules as events } from "./live-events";
export const evidenceFields: InputField[] = [
  {
    key: "normalModeEvidence",
    label: "ヘルメットのロゴ",
    help: "ロゴは通常モード示唆。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "通常ロゴ", label: "通常ロゴ" },
      { value: "キラキラ", label: "キラキラ" },
      { value: "V", label: "V" },
    ],
  },
  {
    key: "rivalModeEvidence",
    label: "ヘルメット人物",
    help: "人物はライバルモード。ロゴと別。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "波多野", label: "波多野" },
      { value: "モノクロ波多野", label: "モノクロ波多野" },
      { value: "青島", label: "青島" },
      { value: "榎木", label: "榎木" },
      { value: "浜岡", label: "浜岡" },
      { value: "洞口", label: "洞口" },
      { value: "蒲生", label: "蒲生" },
    ],
  },
  {
    key: "forecast",
    label: "予想屋・舟券",
    help: "目撃した表示のみ。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "強示唆", label: "強示唆" },
      { value: "通常", label: "通常" },
    ],
  },
];
export const guide = {
  primary: ["現在通常G", "激走ポイント", "現在周期", "激走チャージ間 実G"],
  ceilings: ["通常：795G+α / 最大6周期", "短縮確定：495G+α / 最大4周期"],
  warnings: [
    "EX説明画面を所持と扱わない。",
    "人物・ロゴ・激走ptを分離。1G確認目的では着席しない。",
  ],
  screening:
    "現在通常G350以上は相談候補。特殊表示は数値不問でSMART CHECKへ。着席許可ではありません。",
  where: [
    "現在通常G：G数表示。激走ptと分ける。",
    "激走ポイント：サブ液晶の現在pt。",
    "現在周期：周期は100G区切りではない。",
    "激走チャージ間 実G：チャージ履歴から明確に読める場合のみ。",
    "天井短縮の根拠：リセット・青島VS波多野敗北等を確認。",
    "EX所持表示：EX説明画面は所持ではない。",
  ],
};
