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
      type: "charge_ended",
      label: "激走チャージ終了",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { chargeInterval: 0 },
      increment: [],
      basisEnded: false,
    },
    {
      type: "at_started",
      label: "AT開始",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { phase: "at", currentGame: 0 },
      increment: [],
      basisEnded: false,
    },
    {
      type: "at_ended",
      label: "AT終了：ヘルメット等を確認",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { phase: "followup", shorteningState: "unknown" },
      increment: [],
      basisEnded: false,
    },
    {
      type: "aoshima_loss",
      label: "青島VS波多野敗北を直接確認",
      help: "その場で確認した結果だけを記録。不明な回数は推測で加算しません。",
      set: { phase: "followup", shorteningState: "confirmed" },
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
