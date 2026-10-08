import type { MachineState } from "../../models/types";
import { routesFor, type RouteRule } from "../shared";
export const rules: RouteRule[] = [
  {
    id: "normal",
    resetCeiling: 650,
    label: "通常AT間",
    field: "atIntervalActualGame",
    threshold: [560, 650],
    ceiling: 999,
    goal: "AT終了画面・次周期・引き戻しを確認。",
    basis: "資料§12.2の+2,000円級概算。個別EV表は未提供。",
  },
];
export const evRoutes = (state: MachineState) => routesFor(state, rules);
