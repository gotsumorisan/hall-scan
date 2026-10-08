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
      type: "cycle_ended",
      label: "周期終了",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { cycleLcdGame: 0 },
      increment: ["cycleCount"],
      basisEnded: false,
    },
    {
      type: "at_started",
      label: "AT開始",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { phase: "at", atIntervalActualGame: 0 },
      increment: [],
      basisEnded: false,
    },
    {
      type: "at_ended",
      label: "AT終了：示唆を記録",
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
