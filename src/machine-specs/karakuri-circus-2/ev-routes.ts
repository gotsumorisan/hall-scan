import type { EVRoute, MachineState } from "../../models/types";
import { rawSchema } from "./raw-schema";
// Attached specialist reference v1.0 §12. No interpolation or extra value for hints.
export const tables = {
  lcd: [
    [800, 835, 746, -62],
    [900, 2009, 1793, 1111],
    [1000, 3566, 3184, 2669],
    [1100, 5633, 5029, 4735],
  ],
  goddess: [
    [490, 611, 546, -286],
    [560, 1450, 1295, 553],
    [600, 2004, 1789, 1107],
    [700, 3675, 3282, 2778],
    [800, 5854, 5227, 4957],
  ],
  at: [
    [1500, 1200, 1072, -431],
    [1600, 1713, 1529, 81],
    [1700, 2333, 2083, 702],
    [1800, 3084, 2754, 1453],
    [2000, 5095, 4549, 3463],
  ],
};
function lookup(table: number[][], g: number | null, column: number) {
  if (g === null || column === 0) return null;
  return table.findLast((row) => g >= row[0])?.[column] ?? null;
}
export function evRoutes(state: MachineState): EVRoute[] {
  const r = rawSchema.parse(state.raw),
    c = state.context;
  const column =
    c.exchange === "equivalent"
      ? 1
      : c.exchange === "5.6"
        ? c.funding === "medals"
          ? 2
          : c.funding === "cash"
            ? 3
            : 0
        : 0;
  const standard = (
    id: string,
    label: string,
    g: number | null,
    line: number,
    table: number[][],
    goal: string,
  ): EVRoute => ({
    id,
    label,
    eligible: g !== null && g >= line && column > 0,
    evYen: lookup(table, g, column),
    basis: `専門リファレンス v1.0 §12 / 正式ライン ${line}G〜 / 設定1・第三者試算C`,
    goal,
  });
  const routes = [
    standard(
      "lcd",
      "通常液晶G",
      r.lcdGame,
      1000,
      tables.lcd,
      "次回の機械仕掛けの女神を消化。ATに入れば終了後の次状態を確認。",
    ),
    standard(
      "goddess",
      "女神間実G",
      r.goddessIntervalActualGame,
      700,
      tables.goddess,
      "次回の機械仕掛けの女神を消化して再判定。",
    ),
    standard(
      "at",
      "AT間実G",
      r.atIntervalActualGame,
      c.exchange === "5.6" && c.funding === "cash" ? 2000 : 1800,
      tables.at,
      "次回ATまで。AT終了後は幕間・PUSH・タッチ・次状態を確認。",
    ),
  ];
  if (r.goddessSkipCount !== null && r.goddessSkipCount >= 3) {
    const skips = r.goddessSkipCount;
    const g = r.goddessIntervalActualGame;
    const rows =
      skips === 4
        ? [
            [0, 4473],
            [300, 5837],
            [500, 7575],
            [600, 8857],
            [700, 10528],
          ]
        : [
            [0, -366],
            [300, 997],
            [500, 2735],
            [600, 4017],
            [700, 5688],
          ];
    routes.push({
      id: "skip",
      label: `女神${skips}スルー`,
      eligible:
        c.exchange === "equivalent" &&
        (skips === 4 || (g !== null && g >= 500)),
      evYen:
        c.exchange === "equivalent"
          ? lookup(rows, skips === 4 ? (g ?? 0) : g, 1)
          : null,
      basis: "専門リファレンス v1.0 §12.5・12.6 / 等価のみ / 第三者試算C",
      goal: "女神失敗後もスルー天井まで。次回AT終了後に次状態を確認。",
      ...(c.exchange !== "equivalent"
        ? { missingSource: "TODO_NEEDS_SOURCE: 非等価の女神スルー専用EV" }
        : {}),
    });
  }
  if (state.resolvedState.reset === "confirmed")
    routes.push({
      ...standard(
        "reset",
        "リセット確定液晶G",
        r.lcdGame,
        300,
        tables.lcd.map((row) => [row[0] - 700, ...row.slice(1)]),
        "短縮後の次回女神を消化して再判定。",
      ),
      resetOnly: true,
    });
  return routes;
}
