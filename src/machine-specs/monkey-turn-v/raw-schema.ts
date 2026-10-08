import type { InputField } from "../../models/types";
import { schemaFor, resetField } from "../shared";
export const fields: InputField[] = [
  ...([
    {
      key: "currentGame",
      label: "現在通常G",
      help: "G数表示。激走ptと分ける。",
      kind: "number",
      max: 100000,
    },
    {
      key: "gekisouPoint",
      label: "激走ポイント",
      help: "サブ液晶の現在pt。",
      kind: "number",
      max: 100000,
    },
    {
      key: "cycleCount",
      label: "現在周期",
      help: "周期は100G区切りではない。",
      kind: "number",
      max: 6,
    },
    {
      key: "chargeInterval",
      label: "激走チャージ間 実G",
      help: "チャージ履歴から明確に読める場合のみ。",
      kind: "number",
      max: 100000,
    },
    {
      key: "shorteningState",
      label: "天井短縮の根拠",
      help: "リセット・青島VS波多野敗北等を確認。",
      kind: "select",
      options: [
        { value: "unknown", label: "不明" },
        { value: "confirmed", label: "confirmed" },
        { value: "possible", label: "possible" },
        { value: "contradicted", label: "contradicted" },
      ],
    },
    {
      key: "exItem",
      label: "EX所持表示",
      help: "EX説明画面は所持ではない。",
      kind: "select",
      options: [
        { value: "unknown", label: "不明" },
        { value: "所持確認", label: "所持確認" },
        { value: "非所持確認", label: "非所持確認" },
      ],
    },
  ] as InputField[]),
  resetField,
];
export const rawSchema = schemaFor(fields);
export const emptyRaw = () => rawSchema.parse({});
