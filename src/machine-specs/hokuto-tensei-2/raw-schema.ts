import type { InputField } from "../../models/types";
import { schemaFor, resetField } from "../shared";
export const fields: InputField[] = [
  ...([
    {
      key: "abeshi",
      label: "現在あべし",
      help: "液晶のあべし。通常実Gと別。",
      kind: "number",
      max: 100000,
    },
    {
      key: "actualGame",
      label: "現在 実G",
      help: "あべしから換算しない。",
      kind: "number",
      max: 100000,
    },
    {
      key: "internalMode",
      label: "確認済みモード",
      help: "示唆だけでは確定モードを入力しない。",
      kind: "select",
      options: [
        { value: "unknown", label: "不明" },
        { value: "A", label: "A" },
        { value: "B", label: "B" },
        { value: "C", label: "C" },
        { value: "天国", label: "天国" },
      ],
    },
    {
      key: "tengekiFail",
      label: "天撃失敗確認",
      help: "赤あべしや台座の根拠を記録。",
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
