import type { InputField } from "../../models/types";
export { fields } from "./raw-schema";
export { eventRules as events } from "./live-events";
export const evidenceFields: InputField[] = [
  {
    key: "abeshiColor",
    label: "あべし表示色",
    help: "赤表示と通常Gを混ぜない。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "白", label: "白" },
      { value: "赤", label: "赤" },
    ],
  },
  {
    key: "denshoEvidence",
    label: "伝承示唆",
    help: "あべし獲得優遇。AT直結とは扱わない。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "弱", label: "弱" },
      { value: "強", label: "強" },
    ],
  },
];
export const guide = {
  primary: ["現在あべし", "現在 実G"],
  ceilings: [
    "A1536 / B896 / C576 / 天国128あべし",
    "reset確定A最深1280あべし級",
  ],
  warnings: [
    "あべしを実Gへ換算しない。",
    "伝承・赤あべしは個別審査。通常概算と混ぜない。",
  ],
  screening:
    "現在あべし600以上は相談候補。特殊表示は数値不問でSMART CHECKへ。着席許可ではありません。",
  where: [
    "現在あべし：液晶のあべし。通常実Gと別。",
    "現在 実G：あべしから換算しない。",
    "確認済みモード：示唆だけでは確定モードを入力しない。",
    "天撃失敗確認：赤あべしや台座の根拠を記録。",
  ],
};
