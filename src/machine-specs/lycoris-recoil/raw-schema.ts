import type { InputField } from "../../models/types";
import { schemaFor, resetField } from "../shared";
export const fields: InputField[] = [
  ...([
    {
      key: "atIntervalGame",
      label: "AT間 実G",
      help: "MENUのAT間。CZ間と分ける。",
      kind: "number",
      max: 100000,
    },
    {
      key: "czIntervalGame",
      label: "CZ間 実G",
      help: "MENUのCZ間。",
      kind: "number",
      max: 100000,
    },
    {
      key: "shortCeilingDisplay",
      label: "短縮天井の表示値",
      help: "表示の対象がATかCZかも確認。内部天井を推測しない。",
      kind: "number",
      max: 100000,
    },
    {
      key: "stamps",
      label: "スタンプ数",
      help: "12個で確定ではなく抽選。",
      kind: "number",
      max: 12,
    },
    {
      key: "normalCzFails",
      label: "通常CZ失敗回数",
      help: "上位CZ失敗と別。",
      kind: "number",
      max: 100000,
    },
    {
      key: "upperCzFails",
      label: "上位CZ失敗回数",
      help: "通常CZへ加算しない。",
      kind: "number",
      max: 100000,
    },
    {
      key: "runThrough",
      label: "AT駆け抜け確認",
      help: "詳細履歴で確認できた場合のみ。",
      kind: "select",
      options: [
        { value: "unknown", label: "不明" },
        { value: "confirmed", label: "confirmed" },
        { value: "possible", label: "possible" },
        { value: "contradicted", label: "contradicted" },
      ],
    },
    {
      key: "upperAtRebound",
      label: "上位AT後の引き戻し",
      help: "下パネルと液晶を確認。",
      kind: "select",
      options: [
        { value: "unknown", label: "不明" },
        { value: "confirmed", label: "confirmed" },
        { value: "possible", label: "possible" },
        { value: "contradicted", label: "contradicted" },
      ],
    },
    {
      key: "shortCeilingTarget",
      label: "短縮表示の対象",
      help: "どの天井が短縮されたか明確に。",
      kind: "select",
      options: [
        { value: "unknown", label: "不明" },
        { value: "AT", label: "AT" },
        { value: "CZ", label: "CZ" },
      ],
    },
    {
      key: "premonition",
      label: "前兆表示",
      help: "前兆中は解決してから次状態を確認。",
      kind: "select",
      options: [
        { value: "unknown", label: "不明" },
        { value: "あり", label: "あり" },
        { value: "なし", label: "なし" },
      ],
    },
  ] as InputField[]),
  resetField,
];
export const rawSchema = schemaFor(fields);
export const emptyRaw = () => rawSchema.parse({});
