import { z } from "zod";
import type { MachineState } from "../../models/types";
import { rawSchema } from "./raw-schema";
export function applyEvent(
  state: MachineState,
  type: string,
  payload: Record<string, unknown>,
) {
  const next = structuredClone(state),
    r = rawSchema.parse(next.raw);
  let basisEnded = false;
  const handlers: Record<string, () => void> = {
    counters: () => {
      const updates = rawSchema.partial().parse(payload);
      Object.assign(r, updates);
    },
    goddess_failure: () => {
      if (r.goddessSkipCount === 4)
        throw Error("5回目はAT直撃のため履歴を確認してください。");
      r.goddessSkipCount =
        r.goddessSkipCount === null ? null : r.goddessSkipCount + 1;
      r.goddessIntervalActualGame = 0;
      r.lcdGame = 0;
      basisEnded = ["lcd", "goddess", "reset"].includes(
        state.decision?.selectedRoute?.id ?? "",
      );
    },
    intermission_failure: () => {
      r.phase = "normal";
    },
    theater_failure: () => {
      r.phase = "normal";
    },
    at_started: () => {
      r.phase = "at";
      r.goddessSkipCount = 0;
      r.atIntervalActualGame = 0;
      r.goddessIntervalActualGame = 0;
      r.lcdGame = 0;
    },
    at_ended: () => {
      r.phase = "followup";
    },
    upper_at_ended: () => {
      r.phase = "followup";
    },
    one_shot_failure: () => {
      r.phase = "rebound";
      basisEnded = true;
    },
    next_state_confirmed: () => {
      r.phase = "normal";
      basisEnded = true;
    },
    loss_note: () => {
      z.object({ note: z.string().max(1000) }).parse(payload);
    },
  };
  if (!handlers[type]) throw Error("未対応のイベントです。");
  handlers[type]();
  next.raw = rawSchema.parse(r);
  return { state: next, phase: r.phase, basisEnded };
}
