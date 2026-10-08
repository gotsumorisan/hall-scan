import type { MachineState } from "../../models/types";
import { check } from "../../engine/decision";
import { rawSchema } from "./raw-schema";
import { evRoutes } from "./ev-routes";
export function evaluate(state: MachineState) {
  const r = rawSchema.parse(state.raw),
    routes = evRoutes(state);
  const missing = [];
  if (
    r.goddessSkipCount === 3 &&
    r.goddessIntervalActualGame === null &&
    !routes.some((x) => x.eligible)
  )
    missing.push(
      check(
        "goddessIntervalActualGame",
        "女神間の実ゲーム数を確認できますか？",
        "液晶下部「台データ」→遊技履歴。幕間失敗を含めず、明確に読める場合のみ入力。",
      ),
    );
  if (
    !routes.some((x) => x.eligible) &&
    r.lcdGame === null &&
    r.goddessIntervalActualGame === null &&
    r.atIntervalActualGame === null &&
    r.goddessSkipCount !== 4
  )
    missing.push(
      check(
        "lcdGame",
        "液晶ゲーム数を確認できますか？",
        "リール左側の液晶G。実ゲーム数と混同しない。",
      ),
    );
  return {
    routes,
    missing,
    hasPotential:
      missing.length > 0 ||
      routes.some((x) => x.eligible || x.missingSource || (x.evYen ?? 0) > 0) ||
      (r.lcdGame ?? 0) >= 600 ||
      (r.goddessIntervalActualGame ?? 0) >= 500 ||
      (r.goddessSkipCount ?? 0) >= 3,
  };
}
