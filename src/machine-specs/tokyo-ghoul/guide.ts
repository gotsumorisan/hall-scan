import type { InputField } from "../../models/types";
export { fields } from "./raw-schema";
export { eventRules as events } from "./live-events";
export const evidenceFields: InputField[] = [
  {
    key: "modeEvidence",
    label: "CZカード・モード示唆",
    help: "直接見たカードや表示のみ。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "通常A示唆", label: "通常A示唆" },
      { value: "通常B示唆", label: "通常B示唆" },
      { value: "通常C示唆", label: "通常C示唆" },
      { value: "チャンス示唆", label: "チャンス示唆" },
      { value: "天国準備示唆", label: "天国準備示唆" },
      { value: "天国示唆", label: "天国示唆" },
    ],
  },
  {
    key: "stage",
    label: "現在ステージ",
    help: "空き台で表示中のステージ。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "昼間", label: "昼間" },
      { value: "夕暮れ", label: "夕暮れ" },
      { value: "夜更け", label: "夜更け" },
      { value: "精神世界", label: "精神世界" },
    ],
  },
  {
    key: "invitation",
    label: "月山招待状",
    help: "確認だけの1G着席はしない。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "表示あり", label: "表示あり" },
      { value: "強メッセージ", label: "強メッセージ" },
    ],
  },
  {
    key: "eye",
    label: "赫眼アイキャッチ",
    help: "後追いで復元しない。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "目撃", label: "目撃" },
    ],
  },
];
export const guide = {
  primary: ["CZ間 液晶G", "AT間 実G", "確認済みCZ失敗回数", "表示喰ポイント"],
  ceilings: [
    "通常AT間：1200実G+α",
    "通常CZ間：最大600液晶G+α",
    "リセット確定CZ間：200G+α",
  ],
  warnings: [
    "CZ間液晶GとAT間実Gは独立。",
    "CZだけ・有馬失敗疑いだけでAにしない。",
  ],
  screening:
    "AT間 実G500以上は相談候補。特殊表示は数値不問でSMART CHECKへ。着席許可ではありません。",
  where: [
    "CZ間 液晶G：液晶右下。加算あり。AT間の実Gと統合しない。",
    "AT間 実G：MENU・遊技履歴でAT信号を照合。",
    "確認済みCZ失敗回数：履歴でCZと識別できるものだけ。",
    "表示喰ポイント：推定値を入力しない。",
    "AT駆け抜け確認：BITES・百足覚醒・隻眼の梟なしで1戦目終了を確認。",
    "引き戻し状態：AT後の画面・ステージで確認。",
    "有馬失敗確認：自分で目撃または明確な履歴。通常AT失敗と区別。",
  ],
};
