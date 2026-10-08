import type {
  DailySession,
  Decision,
  EntrySnapshot,
  LiveSession,
  MachineSpec,
  MachineState,
} from "../../models/types";
import { decide } from "../decision";
export function assertCanStart(daily: DailySession, decision: Decision) {
  if (daily.ended) throw Error("この日は終了しています。");
  if (daily.activeLiveSessionId) throw Error("進行中のLIVEがあります。");
  if (daily.dailyInvestment >= 30000) throw Error("投資上限に達しています。");
  if (decision.grade !== "A") throw Error("A以外ではLIVEを開始できません。");
}
export function investmentAfter(current: number, amount: number) {
  if (!Number.isSafeInteger(amount) || amount <= 0)
    throw Error("追加投資は正の整数で入力してください。");
  if (current + amount > 30000)
    throw Error("当日の総投資30,000円を超える追加投資はできません。");
  return current + amount;
}
export function reevaluate(
  spec: MachineSpec,
  state: MachineState,
  live: LiveSession,
  entry: EntrySnapshot,
  daily: DailySession,
): Decision {
  const latest = decide(spec, state, daily.dailyInvestment);
  if (
    latest.grade === "D" &&
    (daily.dailyInvestment >= 30000 ||
      state.context.budgetRisk === "unsafe" ||
      state.context.timeRisk === "unsafe")
  )
    return latest;
  if (live.entryBasisActive)
    return {
      ...structuredClone(entry.decision),
      reasons: [
        ...entry.decision.reasons,
        "着席時のルートが継続中。短期の負けやハマリは撤回理由にしません。",
      ],
      action:
        live.phase === "followup"
          ? "終了後の表示・引き戻し・次状態を確認し、対応するイベントを記録。"
          : entry.decision.action,
    };
  return latest;
}
