import type { InputField } from "../../models/types";
import { schemaFor, resetField } from "../shared";
export const fields: InputField[] = [
  ...([
    {
      key: "bonusIntervalGame",
      label: "ボーナス間 実G",
      help: "ボーナス履歴から。ループ間と別。",
      kind: "number",
      max: 100000,
    },
    {
      key: "trapSkipCount",
      label: "伝導者の罠連続スルー",
      help: "罠だけ。通常ボーナス回数と別。",
      kind: "number",
      max: 5,
    },
    {
      key: "loopIntervalGame",
      label: "炎炎ループ間 実G",
      help: "ループ履歴が判別できる場合のみ。",
      kind: "number",
      max: 100000,
    },
    {
      key: "currentGame",
      label: "現在通常 実G",
      help: "ボーナス間・ループ間へ自動転記しない。",
      kind: "number",
      max: 100000,
    },
  ] as InputField[]),
  resetField,
];
export const rawSchema = schemaFor(fields);
export const emptyRaw = () => rawSchema.parse({});
