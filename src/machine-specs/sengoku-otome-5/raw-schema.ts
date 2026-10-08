import type { InputField } from "../../models/types";
import { schemaFor, resetField } from "../shared";
export const fields: InputField[] = [
  ...([
    {
      key: "atIntervalActualGame",
      label: "AT間 実G",
      help: "MENUの実G。周期内液晶Gと別。",
      kind: "number",
      max: 100000,
    },
    {
      key: "cycleLcdGame",
      label: "周期内 液晶G",
      help: "リール左側。AT間へコピーしない。",
      kind: "number",
      max: 100000,
    },
    {
      key: "cycleCount",
      label: "現在周期",
      help: "現在周期を直接確認。",
      kind: "number",
      max: 100000,
    },
    {
      key: "cycleMode",
      label: "周期モード",
      help: "周期テーブルとは独立。",
      kind: "select",
      options: [
        { value: "unknown", label: "不明" },
        { value: "A", label: "A" },
        { value: "B", label: "B" },
        { value: "C", label: "C" },
        { value: "D", label: "D" },
      ],
    },
    {
      key: "cycleTable",
      label: "周期テーブル",
      help: "周期モードBとテーブルBを混同しない。",
      kind: "select",
      options: [
        { value: "unknown", label: "不明" },
        { value: "A", label: "A" },
        { value: "B", label: "B" },
        { value: "C", label: "C" },
        { value: "D", label: "D" },
      ],
    },
    {
      key: "strapCount",
      label: "ストラップ個数",
      help: "キャラと個数を一緒に記録。",
      kind: "number",
      max: 100000,
    },
    {
      key: "mikoPoint",
      label: "巫女ポイント",
      help: "0ptでCZ確定ではない。",
      kind: "number",
      max: 100000,
    },
  ] as InputField[]),
  resetField,
];
export const rawSchema = schemaFor(fields);
export const emptyRaw = () => rawSchema.parse({});
