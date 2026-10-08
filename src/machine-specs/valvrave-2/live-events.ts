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
      label: "CZ失敗",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { czIntervalGame: 0 },
      increment: [],
      basisEnded: false,
    },
    {
      type: "decisive_miss",
      label: "決戦BONUSでAT非当選",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { bonusAtIntervalGame: 0 },
      increment: ["decisiveBonusAtMissCount"],
      basisEnded: false,
    },
    {
      type: "revolution_bonus",
      label: "革命BONUS当選",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: {
        bonusAtIntervalGame: 0,
        decisiveBonusAtMissCount: 0,
        phase: "followup",
      },
      increment: [],
      basisEnded: false,
    },
    {
      type: "at_started",
      label: "AT開始",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { bonusAtIntervalGame: 0, decisiveBonusAtMissCount: 0, phase: "at" },
      increment: [],
      basisEnded: false,
    },
    {
      type: "at_ended",
      label: "AT終了：66G引き戻し確認",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { phase: "followup", rebound66: "unknown" },
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
