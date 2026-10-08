import type { MachineState } from "../../models/types";
import { routesFor, type RouteRule } from "../shared";
export const rules: RouteRule[] = [
  {
    id: "normal",
    resetCeiling: 596,
    label: "通常ST間",
    field: "stIntervalGame",
    threshold: [600, 650],
    ceiling: 996,
    goal: "ST当選から終了後の背景・前兆・次状態まで確認。",
    basis: "専門資料§11の媒体差を保守側で採用。通常600/650G。",
  },
  {
    id: "shortened",
    label: "短縮確認済みST間",
    field: "stIntervalGame",
    threshold: [150, 250],
    ceiling: 596,
    goal: "ST終了後に短縮・次状態を確認。",
    basis: "短縮確定150/250G。専用条件を満たす場合のみ。",
    requires: [{ field: "shorteningState", value: "confirmed" }],
  },
];
export const evRoutes = (state: MachineState) => routesFor(state, rules);
