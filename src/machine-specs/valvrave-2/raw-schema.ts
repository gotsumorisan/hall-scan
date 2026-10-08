import type { InputField } from "../../models/types";
import { schemaFor, resetField } from "../shared";
export const fields: InputField[] = [
  ...([
    {
      key: "bonusAtIntervalGame",
      label: "ボーナス・AT間 実G",
      help: "遊技履歴。CZ間とは別。",
      kind: "number",
      max: 100000,
    },
    {
      key: "czIntervalGame",
      label: "CZ間 実G",
      help: "CZ履歴から確認。",
      kind: "number",
      max: 100000,
    },
    {
      key: "cycleCount",
      label: "現在周期",
      help: "通常最大6周期。",
      kind: "number",
      max: 6,
    },
    {
      key: "cyclePoint",
      label: "現在周期ポイント",
      help: "前周期ptと混ぜない。",
      kind: "number",
      max: 100000,
    },
    {
      key: "magiusMarks",
      label: "マギウスマーク数",
      help: "表示中の個数。内部規定ptではない。",
      kind: "number",
      max: 100000,
    },
    {
      key: "decisiveBonusAtMissCount",
      label: "決戦BONUS連続AT非当選",
      help: "革命BONUS・AT単発を混ぜない。",
      kind: "number",
      max: 3,
    },
    {
      key: "rebound66",
      label: "66G引き戻し区間",
      help: "実際の表示・履歴で確認。",
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
