import type { MachineState } from "../../models/types";
import { routesFor, type RouteRule } from "../shared";
export const rules: RouteRule[] = [
  {
    id: "at",
    label: "通常AT間",
    field: "atIntervalActualGame",
    threshold: [650, 800],
    ceiling: 1200,
    goal: "AT終了後の引き戻し・次状態を確認。",
    basis: "専門資料§9の通常設定1概算。AT後即ヤメ等の前提。",
  },
  {
    id: "reset",
    label: "リセット確定CZ間",
    field: "resetIntervalActualGame",
    requires: [{ field: "czHistory", value: 0 }],
    threshold: [100, 120],
    ceiling: 200,
    goal: "CZ/ATの当選・終了後に次状態を確認。",
    basis: "専門資料§10.4、設定1・非前兆、喰pt非考慮。",
    resetOnly: true,
    ev: [2240, 2186],
  },
];
export const evRoutes = (state: MachineState) => routesFor(state, rules);
