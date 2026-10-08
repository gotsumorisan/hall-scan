import type { MachineState } from "../../models/types";
import { routesFor, type RouteRule } from "../shared";
export const rules: RouteRule[] = [
  {
    id: "bonus",
    resetCeiling: 650,
    label: "通常ボーナス間",
    field: "bonusIntervalGame",
    threshold: [600, 650],
    ceiling: 850,
    goal: "ボーナス当選・罠・ループ結果と次状態を確認。",
    basis: "資料§10.8通常+2,000円級目安。",
  },
  {
    id: "reset",
    label: "リセット確定ボーナス間",
    field: "bonusIntervalGame",
    threshold: [450, 500],
    ceiling: 650,
    goal: "ボーナス当選後の次状態を確認。",
    basis: "資料§10.8リセット確定専用概算。",
    resetOnly: true,
  },
];
export const evRoutes = (state: MachineState) => routesFor(state, rules);
