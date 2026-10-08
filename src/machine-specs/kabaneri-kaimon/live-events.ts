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
      type: "st_started",
      label: "ST開始",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { phase: "at", stIntervalGame: 0 },
      increment: [],
      basisEnded: false,
    },
    {
      type: "st_ended",
      label: "ST終了：ボーナスあり",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: {
        phase: "followup",
        stIntervalGame: 0,
        normalGame: 0,
        shorteningState: "unknown",
      },
      increment: [],
      basisEnded: false,
    },
    {
      type: "st_runthrough",
      label: "ST駆け抜けを直接確認",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: {
        phase: "followup",
        stIntervalGame: 0,
        normalGame: 0,
        shorteningState: "confirmed",
      },
      increment: [],
      basisEnded: false,
    },
    {
      type: "keishi_ended",
      label: "景之ST終了を直接確認",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { phase: "followup", shorteningState: "confirmed" },
      increment: [],
      basisEnded: false,
    },
    {
      type: "shunjo_failure",
      label: "駿城失敗：ST間は引き継ぐ",
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
