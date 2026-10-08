import type { InputField } from "../../models/types";
import { schemaFor, resetField } from "../shared";
export const fields: InputField[] = [
  ...([
    {
      key: "czIntervalLcdGame",
      label: "CZ間 液晶G",
      help: "液晶右下。加算あり。AT間の実Gと統合しない。",
      kind: "number",
      max: 100000,
    },
    {
      key: "atIntervalActualGame",
      label: "AT間 実G",
      help: "MENU・遊技履歴でAT信号を照合。",
      kind: "number",
      max: 100000,
    },
    {
      key: "czHistory",
      label: "確認済みCZ失敗回数",
      help: "履歴でCZと識別できるものだけ。",
      kind: "number",
      max: 100000,
    },
    {
      key: "ghoulPoint",
      label: "表示喰ポイント",
      help: "推定値を入力しない。",
      kind: "number",
      max: 100000,
    },
    {
      key: "runThrough",
      label: "AT駆け抜け確認",
      help: "BITES・百足覚醒・隻眼の梟なしで1戦目終了を確認。",
      kind: "select",
      options: [
        { value: "unknown", label: "不明" },
        { value: "confirmed", label: "confirmed" },
        { value: "possible", label: "possible" },
        { value: "contradicted", label: "contradicted" },
      ],
    },
    {
      key: "rebound",
      label: "引き戻し状態",
      help: "AT後の画面・ステージで確認。",
      kind: "select",
      options: [
        { value: "unknown", label: "不明" },
        { value: "confirmed", label: "confirmed" },
        { value: "possible", label: "possible" },
        { value: "contradicted", label: "contradicted" },
      ],
    },
    {
      key: "arimaFail",
      label: "有馬失敗確認",
      help: "自分で目撃または明確な履歴。通常AT失敗と区別。",
      kind: "select",
      options: [
        { value: "unknown", label: "不明" },
        { value: "confirmed", label: "confirmed" },
        { value: "possible", label: "possible" },
        { value: "contradicted", label: "contradicted" },
      ],
    },
  ] as InputField[]),
  {
    key: "resetIntervalActualGame",
    label: "リセット後 初回CZまでの実G",
    help: "リセット確定かつ初回CZ前。液晶加算を含まない実Gを履歴・自分の観測で確認。不明なら空欄。",
    kind: "number",
  },
  resetField,
];
export const rawSchema = schemaFor(fields);
export const emptyRaw = () => rawSchema.parse({});
