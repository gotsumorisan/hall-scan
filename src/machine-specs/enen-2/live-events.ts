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
      type: "trap_failure",
      label: "伝導者の罠失敗",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: {},
      increment: ["trapSkipCount"],
      basisEnded: false,
    },
    {
      type: "bonus_started",
      label: "ボーナス当選",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { bonusIntervalGame: 0, currentGame: 0, phase: "followup" },
      increment: [],
      basisEnded: true,
    },
    {
      type: "loop_started",
      label: "炎炎ループ開始",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { loopIntervalGame: 0, trapSkipCount: 0, phase: "at" },
      increment: [],
      basisEnded: false,
    },
    {
      type: "loop_ended",
      label: "炎炎ループ終了",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { phase: "followup" },
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
