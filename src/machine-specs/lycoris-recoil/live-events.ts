import type { MachineState } from "../../models/types";
import { applyStateEvent, commonEvents, type EventRule } from "../shared";
import { rawSchema, fields } from "./raw-schema";
export const eventRules: EventRule[] = [
  ...commonEvents.map((event) => ({
    ...event,
    fields: ["counters", "next_state_confirmed"].includes(event.type)
      ? fields
      : undefined,
  })),
  ...[
    {
      type: "normal_cz_failure",
      label: "通常CZ失敗",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { czIntervalGame: 0, phase: "followup" },
      increment: ["normalCzFails"],
      basisEnded: false,
    },
    {
      type: "upper_cz_failure",
      label: "上位CZ失敗",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { phase: "followup" },
      increment: ["upperCzFails"],
      basisEnded: false,
    },
    {
      type: "at_started",
      label: "AT開始",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { phase: "at", atIntervalGame: 0 },
      increment: [],
      basisEnded: false,
    },
    {
      type: "at_ended",
      label: "AT終了",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { phase: "followup" },
      increment: [],
      basisEnded: false,
    },
    {
      type: "upper_at_ended",
      label: "上位AT終了",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { phase: "followup", upperAtRebound: "confirmed" },
      increment: [],
      basisEnded: false,
    },
  ],
];
export function applyEvent(
  state: MachineState,
  type: string,
  payload: Record<string, unknown>,
) {
  return applyStateEvent(state, type, payload, rawSchema, eventRules);
}
