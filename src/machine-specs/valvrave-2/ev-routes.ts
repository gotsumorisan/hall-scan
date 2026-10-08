import type { MachineState } from "../../models/types";
import { routesFor, type RouteRule } from "../shared";
export const rules: RouteRule[] = [
  {
    id: "normal",
    resetCeiling: 1000,
    label: "通常ボーナス・AT間",
    field: "bonusAtIntervalGame",
    threshold: [900, 1000],
    ceiling: 1500,
    goal: "当選後の結果・引き戻し66G・次状態を確認。",
    basis: "資料§7.21設定1公開シミュレーション下限掲載行。",
    ev: [2403, 2021],
  },
  {
    id: "reset",
    label: "リセット確定ボーナス・AT間",
    field: "bonusAtIntervalGame",
    threshold: [500, 600],
    ceiling: 1000,
    goal: "当選後の結果・次状態を確認。",
    basis: "資料§7.21リセット確定専用。",
    resetOnly: true,
    ev: [2243, 2213],
  },
];
export const evRoutes = (state: MachineState) => routesFor(state, rules);
