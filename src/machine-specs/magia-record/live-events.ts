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
      type: "bonus_no_at",
      label: "ボーナスAT非当選",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { currentPoint: 0, phase: "followup" },
      increment: ["bonusNoAtCount"],
      basisEnded: true,
    },
    {
      type: "at_started",
      label: "AT開始",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { currentPoint: 0, bonusNoAtCount: 0, phase: "at" },
      increment: [],
      basisEnded: false,
    },
    {
      type: "at_ended",
      label: "AT終了",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { phase: "followup", reboundState: "unknown" },
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
