import type { MachineState } from "../../models/types";
import { routesFor, type RouteRule } from "../shared";
export const rules: RouteRule[] = [
  {
    id: "normal",
    resetCeiling: 699,
    label: "通常現在pt",
    field: "currentPoint",
    threshold: [750, 800],
    ceiling: 950,
    goal: "ボーナス当選まで。AT結果・終了後の次状態を確認。",
    basis: "資料§8.13ボーナス当選までの概算。特殊状態を加算しない。",
  },
  {
    id: "reset",
    label: "リセット確定現在pt",
    field: "currentPoint",
    threshold: [500, 550],
    ceiling: 699,
    goal: "ボーナス当選とAT結果・次状態を確認。",
    basis: "資料§8.13約250pt浅い概算。",
    resetOnly: true,
  },
];
export const evRoutes = (state: MachineState) => routesFor(state, rules);
