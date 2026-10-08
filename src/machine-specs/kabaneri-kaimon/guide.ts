import type { InputField } from "../../models/types";
export { fields } from "./raw-schema";
export { eventRules as events } from "./live-events";
export const evidenceFields: InputField[] = [
  {
    key: "background",
    label: "サブ液晶背景",
    help: "桜・海門城は示唆。金額を加算しない。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "通常", label: "通常" },
      { value: "桜", label: "桜" },
      { value: "海門城", label: "海門城" },
    ],
  },
  {
    key: "hints",
    label: "輪廻くじ・示唆",
    help: "目撃した表示のみ。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "六根清浄", label: "六根清浄" },
      { value: "輪廻の果報", label: "輪廻の果報" },
      { value: "好機", label: "好機" },
      { value: "超好機", label: "超好機" },
    ],
  },
  {
    key: "blackSmoke",
    label: "黒煙り示唆",
    help: "確定ポイント数を推測しない。",
    kind: "select",
    options: [
      { value: "不明", label: "不明" },
      { value: "小", label: "小" },
      { value: "中", label: "中" },
      { value: "大", label: "大" },
    ],
  },
];
export const guide = {
  primary: [
    "ST間 実G",
    "現在通常G",
    "現在周期",
    "皮膜レベル",
    "表示CZポイント",
  ],
  ceilings: ["通常：ST間996G / 最大6周期", "短縮確定：596G / 最大4周期"],
  warnings: [
    "ST間Gと現在通常Gを分ける。",
    "短縮・海門城・黒煙りだけで0GからAにしない。",
  ],
  screening:
    "ST間 実G300以上は相談候補。特殊表示は数値不問でSMART CHECKへ。着席許可ではありません。",
  where: [
    "ST間 実G：データ履歴とST信号を照合。通常Gと分ける。",
    "現在通常G：現在の通常遊技表示。ST間へコピーしない。",
    "現在周期：サブ液晶で確認。",
    "皮膜レベル：サブ液晶の皮膜Lv。正確な内部ptではない。",
    "表示CZポイント：表示が明確な場合のみ。",
    "天井短縮の根拠：設定変更・ST駆け抜け・景之ST後を履歴で確認。朝一だけで確定しない。",
  ],
};
