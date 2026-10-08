import type { InputField } from "../../models/types";
export { fields } from "./raw-schema";
export { eventRules as events } from "./live-events";
export const evidenceFields: InputField[] = [
  {
    key: "strap",
    label: "ストラップのキャラ",
    help: "キャラと個数を別に保存。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "ヨシテル", label: "ヨシテル" },
      { value: "イエヤス", label: "イエヤス" },
      { value: "ノブナガ", label: "ノブナガ" },
      { value: "その他", label: "その他" },
    ],
  },
  {
    key: "cycleLight",
    label: "周期光吸い込み",
    help: "自分で見た表示。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "通常", label: "通常" },
      { value: "強", label: "強" },
    ],
  },
  {
    key: "eyecatch",
    label: "アイキャッチ",
    help: "後追いで推測しない。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "通常", label: "通常" },
      { value: "強", label: "強" },
    ],
  },
  {
    key: "endScreen",
    label: "AT終了画面",
    help: "自分で目撃した時だけ。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "通常", label: "通常" },
      { value: "強", label: "強" },
    ],
  },
  {
    key: "stage",
    label: "現在ステージ",
    help: "封印の塔などを記録。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "通常", label: "通常" },
      { value: "封印の塔", label: "封印の塔" },
      { value: "特殊", label: "特殊" },
    ],
  },
];
export const guide = {
  primary: [
    "AT間 実G",
    "周期内 液晶G",
    "現在周期",
    "ストラップ個数",
    "巫女ポイント",
  ],
  ceilings: ["通常AT間999実G+α", "リセット確定AT間650実G+α"],
  warnings: [
    "周期モードと周期テーブルを分ける。",
    "巫女0pt・ストラップ単独を金額化しない。",
  ],
  screening:
    "AT間 実G400以上は相談候補。特殊表示は数値不問でSMART CHECKへ。着席許可ではありません。",
  where: [
    "AT間 実G：MENUの実G。周期内液晶Gと別。",
    "周期内 液晶G：リール左側。AT間へコピーしない。",
    "現在周期：現在周期を直接確認。",
    "周期モード：周期テーブルとは独立。",
    "周期テーブル：周期モードBとテーブルBを混同しない。",
    "ストラップ個数：キャラと個数を一緒に記録。",
    "巫女ポイント：0ptでCZ確定ではない。",
  ],
};
