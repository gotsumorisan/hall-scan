import type { MachineState } from "../../models/types";
import { routesFor, type RouteRule } from "../shared";
export const rules: RouteRule[] = [
  {
    id: "normal",
    resetCeiling: 1280,
    label: "通常あべし",
    field: "abeshi",
    threshold: [900, 975],
    ceiling: 1536,
    goal: "AT当選後の天撃・終了後の次状態を確認。",
    basis: "資料§9.8通常状態の概算。",
    requires: [{ field: "tengekiFail", value: "contradicted" }],
  },
];
export const evRoutes = (state: MachineState) => routesFor(state, rules);
