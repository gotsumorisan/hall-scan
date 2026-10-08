import type { InputField } from "../../models/types";
import { schemaFor, resetField } from "../shared";
export const fields: InputField[] = [
  ...([
    {
      key: "currentPoint",
      label: "現在表示ポイント",
      help: "現在ptは内部の規定ptではない。",
      kind: "number",
      max: 100000,
    },
    {
      key: "bonusNoAtCount",
      label: "確認済みAT非当選ボーナス数",
      help: "履歴で識別できる場合だけ。",
      kind: "number",
      max: 100000,
    },
    {
      key: "reboundState",
      label: "引き戻し状態",
      help: "AT終了後の表示を確認。",
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
