import type { MachineState } from "../models/types";
import { VERSIONS } from "../models/types";
import { karakuri } from "../machine-specs/karakuri-circus-2/spec";
export function machine(
  raw: Record<string, unknown> = {},
  context: Partial<MachineState["context"]> = {},
): MachineState {
  const r = karakuri.parse({
    ...karakuri.emptyRaw(),
    lcdGame: 1000,
    goddessIntervalActualGame: 200,
    atIntervalActualGame: 500,
    goddessSkipCount: 0,
    ...raw,
  });
  return {
    ...VERSIONS,
    id: "machine",
    dailyId: "2026-10-07",
    visitId: "visit",
    meta: { machineId: karakuri.id, machineName: karakuri.name, seat: "128" },
    raw: r,
    evidence: [],
    resolvedState: karakuri.resolve(r, []),
    derived: karakuri.derive(r),
    session: { attemptId: "attempt", checkUsed: false, revision: 0 },
    decision: null,
    live: null,
    snapshots: [],
    context: {
      exchange: "equivalent",
      funding: "cash",
      budgetRisk: "acceptable",
      timeRisk: "acceptable",
      closingTime: "23:59",
      sourceChecked: true,
      ...context,
    },
  };
}
