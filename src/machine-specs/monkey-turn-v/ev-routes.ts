import type { MachineState } from "../../models/types";
import { routesFor, type RouteRule } from "../shared";
export const rules: RouteRule[] = [
  {
    id: "normal",
    resetCeiling: 495,
    label: "通常G数",
    field: "currentGame",
    threshold: [500, 550],
    ceiling: 795,
    goal: "AT終了後のヘルメット・EX・次状態を確認。",
    basis: "現行資料§12.2の500/550Gを採用。専門資料§13の下限掲載行のEV。",
    ev: [2036, 2355],
  },
  {
    id: "shortened",
    label: "短縮確認済みG数",
    field: "currentGame",
    threshold: [150, 250],
    ceiling: 495,
    goal: "AT終了後に短縮・次状態を再確認。",
    basis: "専門資料§13：非前兆・設定1・32G/50枚、モード等不問。",
    requires: [{ field: "shorteningState", value: "confirmed" }],
    ev: [2036, 2355],
  },
];
export const evRoutes = (state: MachineState) => routesFor(state, rules);
