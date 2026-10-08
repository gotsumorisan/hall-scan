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
      type: "cz_failure",
      label: "通常CZ失敗",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { czIntervalLcdGame: 0, resetIntervalActualGame: null },
      increment: ["czHistory"],
      basisEnded: false,
    },
    {
      type: "arima_failure",
      label: "有馬失敗を直接確認",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { arimaFail: "confirmed", phase: "followup" },
      increment: [],
      basisEnded: false,
    },
    {
      type: "at_started",
      label: "AT開始",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: {
        phase: "at",
        atIntervalActualGame: 0,
        czIntervalLcdGame: 0,
        resetIntervalActualGame: null,
      },
      increment: [],
      basisEnded: false,
    },
    {
      type: "at_ended",
      label: "AT終了",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { phase: "followup", rebound: "unknown" },
      increment: [],
      basisEnded: false,
    },
    {
      type: "at_runthrough",
      label: "AT駆け抜けを直接確認",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { phase: "followup", runThrough: "confirmed" },
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
