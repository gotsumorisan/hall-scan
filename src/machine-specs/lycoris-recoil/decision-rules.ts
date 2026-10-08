import type { MachineState, EVRoute } from "../../models/types";
import { evaluateState } from "../shared";
import { fields } from "./raw-schema";
import { evRoutes } from "./ev-routes";
import { patrol } from "./patrol-rules";
export function evaluate(state: MachineState) {
  const routes: EVRoute[] = evRoutes(state);
  routes.push({
    id: "individual",
    label: "特殊条件の個別審査",
    eligible: false,
    evYen: null,
    basis: "§5：固定Aラインを作らない",
    goal: "個別EV資料を確認",
    missingSource: "TODO_NEEDS_SOURCE: 通常・短縮・上位状態ごとの条件付きEV",
  });
  return evaluateState(
    state,
    fields,
    routes,
    patrol(state.raw) === "candidate",
  );
}
