import type { InputField } from "../../models/types";
import { schemaFor, resetField } from "../shared";
export const fields: InputField[] = [
  ...([
    {
      key: "stIntervalGame",
      label: "ST間 実G",
      help: "データ履歴とST信号を照合。通常Gと分ける。",
      kind: "number",
      max: 100000,
    },
    {
      key: "normalGame",
      label: "現在通常G",
      help: "現在の通常遊技表示。ST間へコピーしない。",
      kind: "number",
      max: 100000,
    },
    {
      key: "cycleCount",
      label: "現在周期",
      help: "サブ液晶で確認。",
      kind: "number",
      max: 6,
    },
    {
      key: "coatingLevel",
      label: "皮膜レベル",
      help: "サブ液晶の皮膜Lv。正確な内部ptではない。",
      kind: "number",
      max: 4,
    },
    {
      key: "czPoints",
      label: "表示CZポイント",
      help: "表示が明確な場合のみ。",
      kind: "number",
      max: 100000,
    },
    {
      key: "shorteningState",
      label: "天井短縮の根拠",
      help: "設定変更・ST駆け抜け・景之ST後を履歴で確認。朝一だけで確定しない。",
      kind: "select",
      options: [
        { value: "unknown", label: "不明" },
        { value: "confirmed", label: "confirmed" },
        { value: "possible", label: "possible" },
        { value: "contradicted", label: "contradicted" },
      ],
    },
  ] as InputField[]),
  resetField,
];
export const rawSchema = schemaFor(fields);
export const emptyRaw = () => rawSchema.parse({});
